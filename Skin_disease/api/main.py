from fastapi import *
import uvicorn
from io import BytesIO
from PIL import Image
import numpy as np
import tensorflow as tf
from keras import *
from starlette.middleware.cors import CORSMiddleware
import cv2



app=FastAPI()
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
MODEL = tf.keras.models.load_model("C:/Code/Skin_disease/saved_model/1")
CLASS_NAMES = ["Hair Loss Photos Alopecia and other Hair Diseases",
 "Herpes HPV and other STDs Photos"]
@app.get("/ping")
async def ping():
   return "Hello, im alive"
def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
     
    return image 
@app.post("/predict")
async def predict(
   file:UploadFile = File(...) 
   
):
   image = read_file_as_image(await file.read())
   image = cv2.resize(image, (256, 256))
   img_batch = np.expand_dims(image,0)
   predictions = MODEL.predict(img_batch)
   predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
   confidence = np.max(predictions[0])
   print(predicted_class,confidence)
   return{
      "class":predicted_class,
      "confidence":float(confidence)
       }
   
if __name__=="__main__":
   uvicorn.run(app, host='localhost',port=8089) 