<h1 align="center">Epiderma-Shield</h1>
An AI-powered web application for early skin disease detection — helping users identify dermatological conditions from images using a deep learning model served via a REST API.

[![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)](https://python.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?logo=tensorflow)](https://tensorflow.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-17.0-61DAFB?logo=react)](https://reactjs.org)
[![Gradio](https://img.shields.io/badge/Gradio-HuggingFace-yellow?logo=huggingface)](https://huggingface.co)
[![Accuracy](https://img.shields.io/badge/Accuracy-98.44%25-brightgreen)](https://doi.org/10.22214/ijraset.2025.72462)
[![DOI](https://img.shields.io/badge/DOI-10.22214%2Fijraset.2025.72462-blue)](https://doi.org/10.22214/ijraset.2025.72462)

[Live Demo](https://huggingface.co/spaces/adarshgupta1200/Epiderma-Shield) • [Architecture](#system-architecture) • [Getting Started](#getting-started) • [Research Paper](#research-publication)


## Project Overview
Skin diseases affect millions globally, yet early diagnosis remains inaccessible for many due to the cost and availability of dermatologists. Delayed detection can lead to worsening conditions and in some cases life-threatening outcomes. **Epiderma Shield** bridges this gap by providing an AI-assisted diagnostic tool that classifies skin conditions from dermatoscopic images in real time, making preliminary screening fast and accessible.


## Key Results

| Metric | Value |
|---|---|
| Model Accuracy | **98.44%** |
| Dataset Size | 640+ dermatoscopic images |
| CNN Layers | 6 |
| Training Epochs | 45 |
| API Framework | Flask (REST) |
| Frontend | React.js |
| Public Demo | Gradio on Hugging Face Spaces |

---

## System Architecture

### Local System (Full Stack)

```
Browser (localhost:3000)
        │
        │  Upload skin image
        ▼
React.js Frontend
        │
        │  POST /predict-gradcam  (multipart/form-data)
        ▼
FastAPI Backend (localhost:8089)
        │
        ├── Preprocessing (Resize 256×256 → Normalize)
        │
        ├── 6-layer CNN Model (TensorFlow + Keras)
        │       └── Prediction: class + confidence
        │
        ├── Grad-CAM (GRAD_MODEL sub-model)
        │       └── Heatmap overlaid on original image (base64 PNG)
        │
        └── Gemini 2.5 Flash (Google AI Studio API)
                └── Plain-English explanation + medical disclaimer
        │
        │  JSON Response
        ▼
React.js displays:
  ├── Original image
  ├── Prediction table (label + confidence %)
  ├── Grad-CAM heatmap with colour legend
  └── AI explanation card
```

### Hugging Face Spaces (Gradio)

```
User uploads image (Gradio UI)
        ▼
Gradio predict() function
        ├── CNN inference (saved_model signatures)
        ├── Grad-CAM (GradientTape on input tensor)
        └── Heatmap overlay
        ▼
Gradio displays:
  ├── Prediction label with confidence
  └── Grad-CAM heatmap
```

---

## Features

- **Real-time classification** from uploaded dermatoscopic images
- **Grad-CAM heatmap** showing which skin regions drove the prediction
- **Gemini LLM explanation** in plain English after every prediction
- **98.44% accuracy** on a 640+ image dermatoscopy dataset
- **Public Gradio demo** on Hugging Face Spaces — no setup needed
- **FastAPI backend** with auto-generated Swagger docs at `/docs`
- **Confidence score** returned with every prediction

---

## Dataset
- **Source:** [DERMNET](https://www.kaggle.com/datasets/shubhamgoel27/dermnet)
- **Total Images:** 640+ dermatoscopic images
- **Type:** Dermoscopy images for "Hair Loss Photos Alopecia and other Hair Diseases" and "Herpes HPV and other STDs"
- **Preprocessing:** Image resizing, normalisation, and noise cleaning


## Model Architecture
- **Type:** Convolutional Neural Network (CNN)
- **Layers:** 6 convolutional layers
- **Framework:** TensorFlow + Keras
- **Epochs:** 45
- **Optimisation:** Hyperparameter tuning + noisy data cleaning → 98.44% accuracy

**Grad-CAM implementation** — a `GRAD_MODEL` sub-model is built at startup by extracting the last Conv2D layer. During inference, `tf.GradientTape` records gradients of the predicted class score with respect to the conv layer's feature maps. These gradients are globally average-pooled into per-channel weights, multiplied by the activations, summed, ReLU'd, and upsampled to the original image size.

---

| Layer | Tool | Purpose |
|-------|------|---------|
| Model Training | TensorFlow + Keras | CNN architecture and training |
| Explainability | Grad-CAM (GradientTape) | Heatmap generation |
| LLM Explanation | Google Gemini 2.5 Flash | Plain-English result explanation |
| Data Processing | Pandas + NumPy | Cleaning and preprocessing |
| Model Evaluation | Scikit-learn | Accuracy, precision, recall |
| Backend / API | FastAPI | Async REST API |
| API Testing | Postman + Swagger UI | Endpoint validation |
| Frontend | React.js + Material UI | Image upload and results display |
| Public Demo | Gradio + Hugging Face Spaces | Browser-based demo |
| Secret Management | python-dotenv | Secure API key loading |

---

## Getting Started

### Prerequisites

```bash
# Backend
pip install tensorflow fastapi uvicorn python-multipart pillow numpy opencv-python google-genai python-dotenv

# Frontend
cd frontend && npm install
```

### Clone the Repository

```bash
git clone https://github.com/adarsh288/Epiderma-Shield.git
cd Epiderma-Shield
```

### Configure your Gemini API Key

Create `api/.env`:
```
GEMINI_API_KEY=your_key_from_aistudio.google.com
```

Get a free key at **aistudio.google.com → Get API Key → Create API Key**.

### Run the FastAPI Backend

```bash
cd api
uvicorn main:app --host localhost --port 8089 --reload
```

API starts at `http://localhost:8089`
Auto-generated docs at `http://localhost:8089/docs`

### Run the React Frontend

```bash
cd frontend
npm start
```

Frontend starts at `http://localhost:3000`

### Configure Frontend API URL

In `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8089
```

---

## API Reference

### POST `/predict-gradcam`

Accepts a skin image and returns a classification, Grad-CAM heatmap, and LLM explanation.

**Request:**
```
POST http://localhost:8089/predict-gradcam
Content-Type: multipart/form-data
Body: file (jpg/png)
```

**Response:**
```json
{
  "class": "Hair Loss Photos Alopecia and other Hair Diseases",
  "confidence": 0.9736,
  "gradcam_image": "<base64 encoded PNG>",
  "explanation": "Alopecia refers to partial or complete hair loss..."
}
```

### POST `/predict`

Original lightweight endpoint — returns class and confidence only, no heatmap or explanation.

### GET `/ping`

Health check endpoint.
```json
"Hello, I'm alive"
```

---


## Project Screenshots

<img width="1672" height="941" alt="Screenshot 2026-06-13 194719" src="https://github.com/user-attachments/assets/a4296f9a-a3c3-474a-aea9-aed797590aa9" />
<img width="1782" height="933" alt="Screenshot 2026-06-13 195025" src="https://github.com/user-attachments/assets/16a97b92-6459-408d-adb0-24acf58a3b46" />




## Research Publication
This project is backed by a peer-reviewed research paper published in **IJRASET (2025).**

> 📎 DOI: [doi.org/10.22214/ijraset.2025.72462](https://doi.org/10.22214/ijraset.2025.72462)


## Future Improvements
- [ ] Expand dataset to cover more skin condition classes
- [ ] Add patient history tracking for multi-visit analysis
- [ ] Build a mobile-friendly version for field use
- [ ] Add multilingual LLM explanations
- [ ] Integrate severity scoring alongside classification

## Medical Disclaimer

> Epiderma Shield is an educational and research tool. It is **not a medical device** and its outputs should **not be used as a substitute for professional medical diagnosis or advice**. Always consult a qualified dermatologist or healthcare professional for any skin-related concerns.


