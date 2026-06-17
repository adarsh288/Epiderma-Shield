import os
from fastapi import FastAPI, File, UploadFile
import uvicorn
from io import BytesIO
from PIL import Image
import numpy as np
import tensorflow as tf
from starlette.middleware.cors import CORSMiddleware
import cv2
import base64
from google import genai
from dotenv import load_dotenv

_ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(_ENV_PATH)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
_PLACEHOLDER_KEY = "your_gemini_api_key_here"
if GEMINI_API_KEY and GEMINI_API_KEY != _PLACEHOLDER_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    GEMINI_API_KEY = None

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model once ───────────────────────────────────────────────────────────
MODEL = tf.keras.models.load_model("E:/Skin_disease/saved_model/1")

# ── Build Grad-CAM sub-model once at startup ──────────────────────────────────
# Find the last Conv2D layer
last_conv_layer_name = None
for layer in reversed(MODEL.layers):
    if isinstance(layer, tf.keras.layers.Conv2D):
        last_conv_layer_name = layer.name
        break

if last_conv_layer_name is None:
    raise RuntimeError("No Conv2D layer found in model.")

# Sub-model: input → (last conv output, final predictions)
GRAD_MODEL = tf.keras.models.Model(
    inputs=MODEL.inputs,
    outputs=[
        MODEL.get_layer(last_conv_layer_name).output,
        MODEL.output
    ]
)

print(f"[OK] Grad-CAM target layer: {last_conv_layer_name}")

CLASS_NAMES = [
    "Hair Loss Photos Alopecia and other Hair Diseases",
    "Herpes HPV and other STDs Photos"
]


# ── helpers ───────────────────────────────────────────────────────────────────

def read_file_as_image(data) -> np.ndarray:
    return np.array(Image.open(BytesIO(data)))


def generate_gradcam(image_array: np.ndarray, class_idx: int) -> np.ndarray:
    """
    True Grad-CAM using the last Conv2D layer of the model.
    GRAD_MODEL is built once at startup so no variables are garbage collected.
    """
    img_tensor = tf.cast(np.expand_dims(image_array, axis=0), tf.float32)

    with tf.GradientTape() as tape:
        conv_outputs, predictions = GRAD_MODEL(img_tensor, training=False)
        tape.watch(conv_outputs)
        loss = predictions[:, class_idx]

    # Gradients of class score w.r.t. conv feature maps
    grads = tape.gradient(loss, conv_outputs)        # (1, h, w, filters)

    # Global average pooling of gradients → importance weight per filter
    weights = tf.reduce_mean(grads, axis=(0, 1, 2)) # (filters,)

    # Weighted sum of conv outputs + ReLU
    conv_outputs = conv_outputs[0]                   # (h, w, filters)
    cam = tf.reduce_sum(weights * conv_outputs, axis=-1).numpy()  # (h, w)
    cam = np.maximum(cam, 0)

    # Normalise to [0, 1]
    cam_min, cam_max = cam.min(), cam.max()
    if cam_max - cam_min > 1e-8:
        cam = (cam - cam_min) / (cam_max - cam_min)

    # Upsample to input size
    cam = cv2.resize(cam, (image_array.shape[1], image_array.shape[0]))
    return cam.astype(np.float32)


def overlay_heatmap(image_array: np.ndarray, heatmap: np.ndarray, alpha: float = 0.4) -> np.ndarray:
    heatmap_uint8 = np.uint8(255 * heatmap)
    colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    colored = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)
    return (
        (1 - alpha) * image_array.astype(np.float32)
        + alpha * colored.astype(np.float32)
    ).clip(0, 255).astype(np.uint8)


def numpy_to_base64(image: np.ndarray) -> str:
    _, buffer = cv2.imencode(".png", cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buffer).decode("utf-8")


def generate_explanation(predicted_class: str, confidence: float) -> str | None:
    if not GEMINI_API_KEY:
        return None

    prompt = (
        f"You are a helpful medical assistant. A skin disease detection model "
        f"predicted the following result:\n"
        f"- Disease class: {predicted_class}\n"
        f"- Confidence score: {confidence:.2%}\n\n"
        f"Write a 4-5 sentence plain English explanation that covers:\n"
        f"1. What this disease/condition is in simple terms.\n"
        f"2. What the confidence level means for this prediction.\n"
        f"3. What the patient should do next (e.g. see a dermatologist).\n"
        f"Always end with a clear medical disclaimer stating this is not a "
        f"diagnosis and the patient should consult a qualified healthcare professional."
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text


# ── endpoints ─────────────────────────────────────────────────────────────────

@app.get("/ping")
async def ping():
    return "Hello, I'm alive"


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    image = cv2.resize(image, (256, 256))
    predictions = MODEL.predict(np.expand_dims(image, 0))
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = float(np.max(predictions[0]))
    return {"class": predicted_class, "confidence": confidence}


@app.post("/predict-gradcam")
async def predict_gradcam(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    image = cv2.resize(image, (256, 256))

    # Predict
    predictions = MODEL.predict(np.expand_dims(image, 0))
    class_idx = int(np.argmax(predictions[0]))
    predicted_class = CLASS_NAMES[class_idx]
    confidence = float(np.max(predictions[0]))

    # Grad-CAM
    heatmap = generate_gradcam(image, class_idx)
    overlay = overlay_heatmap(image, heatmap, alpha=0.4)

    explanation = None
    try:
        explanation = generate_explanation(predicted_class, confidence)
    except Exception as exc:
        print(f"[WARN] Gemini explanation failed: {exc}")

    return {
        "class": predicted_class,
        "confidence": confidence,
        "gradcam_image": numpy_to_base64(overlay),
        "explanation": explanation,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8089)
