from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from emotion_model import predict_emotions_batch
from drift_detector import emotion_map, calculate_drift_vectorized
from escalation import escalation_status
import uvicorn
import numpy as np

import os

app = FastAPI(title="Real-Time Emotion Drift Detection")

# Configure CORS with environment fallback for production web hosting
allowed_origins_env = os.environ.get("CORS_ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store timeline of messages globally
timeline = []

class Message(BaseModel):
    text: str

class PredictEmotionRequest(BaseModel):
    message: str

@app.post("/predict-emotion")
def predict_emotion(request: PredictEmotionRequest):
    global timeline
    # Predict emotions using the model
    emotions, weighted_score = predict_emotions_batch([request.message])[0]
    
    # Append to global timeline
    timeline.append({"message": request.message, "emotions": emotions, "score": weighted_score})

    # Calculate drift and risk metrics
    drift_score = calculate_drift_vectorized(timeline)
    status = escalation_status(timeline)
    
    # Get top emotion
    top_emotion_label = emotions[0]["label"]
    top_emotion_score = emotions[0]["score"]
    
    # Map to boolean escalation requirement
    escalation_required = (status == "HIGH RISK")

    return {
        "emotion": top_emotion_label,
        "confidence": round(top_emotion_score, 4),
        "drift_score": round(drift_score, 3),
        "risk_level": status,
        "escalation_required": escalation_required
    }

@app.post("/predict")
def predict(message: Message):
    global timeline
    emotions, weighted_score = predict_emotions_batch([message.text])[0]
    timeline.append({"message": message.text, "emotions": emotions, "score": weighted_score})

    drift_score = calculate_drift_vectorized(timeline)
    status = escalation_status(timeline)

    top_emotions = [(e['label'], round(e['score'],2)) for e in emotions]

    return {
        "message": message.text,
        "top_emotions": top_emotions,
        "weighted_score": round(weighted_score, 3),
        "drift_score": round(drift_score, 3),
        "escalation_status": status
    }

@app.get("/timeline")
def get_timeline():
    global timeline
    return {"timeline": timeline}

@app.post("/reset")
def reset_timeline():
    global timeline
    timeline = []
    return {"status": "timeline reset"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
