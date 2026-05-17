<h1 align="center">Epiderma-Shield</h1>
An AI-powered web application for early skin disease detection — helping users identify dermatological conditions from images using a deep learning model served via a REST API.

![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?style=flat-square&logo=tensorflow)
![Flask](https://img.shields.io/badge/Flask-REST%20API-black?style=flat-square&logo=flask)
![React](https://img.shields.io/badge/React.js-Frontend-61DAFB?style=flat-square&logo=react)
![Accuracy](https://img.shields.io/badge/Accuracy-98.44%25-brightgreen?style=flat-square)



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


## System Architecture

```
User uploads skin image (React.js frontend)
        ↓  HTTP POST /predict
Flask REST API receives image
        ↓
Preprocessing (Resize → Normalize)
        ↓
6-layer CNN Model (TensorFlow + Keras)
        ↓
{ "condition": "Herpes HPV and other STDs", "confidence": 96.00% }
        ↓  JSON Response
React.js displays result to user
```


## Features
- **Real-time skin disease classification** from uploaded images
- **6-layer CNN** trained on 640+ dermatoscopic images
- **Flask REST API** serving predictions over HTTP
- **React.js frontend** for a seamless user experience
- **Postman-validated endpoints** for reliable API responses
- **Confidence score** returned with every prediction


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


## Tools & Technologies
| Layer | Tool | Purpose |
|---|---|---|
| Model Training | TensorFlow + Keras | CNN architecture and training |
| Data Processing | Pandas + NumPy | Data cleaning and preprocessing |
| Model Evaluation | Scikit-learn | Accuracy, precision, recall metrics |
| Backend / API | Flask | REST API to serve predictions |
| API Testing | Postman | Endpoint validation and testing |
| Frontend | React.js | User interface for image upload and results |
| Version Control | Git + GitHub | Code management |


## Getting Started

### Prerequisites

```bash
# Backend dependencies
pip install tensorflow keras flask scikit-learn pandas numpy pillow flask-cors

# Frontend dependencies
cd client
npm install
```

### Clone the Repository

```bash
git clone https://github.com/adarsh288/Epiderma-Shield.git
cd Epiderma-Shield
```

### Run the Flask API

```bash
cd server
python app.py
```

API will start at `http://localhost:5000`

### Run the React Frontend

```bash
cd client
npm start
```

Frontend will start at `http://localhost:3000`

---

## 📡 API Reference

### `POST /predict`

Accepts a skin image and returns a disease classification with confidence score.

**Request:**
```
POST http://localhost:5000/predict
Content-Type: multipart/form-data

Body: image file (jpg/png)
```

**Response:**
```json
{
  "condition": "Herpes HPV and other STDs",
  "confidence": 96.00%,
  "status": "success"
}
```

### `GET /health`

Check if the API is running.

```json
{
  "status": "API is running"
}
```

---


## Project Screenshots

<img width="1919" height="846" alt="Screenshot 2025-04-12 073951" src="https://github.com/user-attachments/assets/ef1214dd-e278-49c9-a058-011031a0cdf7" />
<img width="1919" height="862" alt="Screenshot 2025-04-12 074029" src="https://github.com/user-attachments/assets/ad2a65bc-4b4e-41e7-a4d7-b90d1eb4e647" />


## Research Publication
This project is backed by a peer-reviewed research paper published in **IJRASET (2025).**

> 📎 DOI: [doi.org/10.22214/ijraset.2025.72462](https://doi.org/10.22214/ijraset.2025.72462)


## Future Improvements
- [ ] Deploy on Hugging Face Spaces for public access
- [ ] Expand dataset to cover more skin condition classes
- [ ] Add Grad-CAM heatmap to highlight affected skin regions
- [ ] Integrate patient history for multi-visit tracking
- [ ] Build a mobile-friendly version for field use


