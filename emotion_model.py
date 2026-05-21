from transformers import pipeline
import torch
import joblib

MODEL_PATH = "./emotion_model_trained_final"

# Dynamically set device to GPU if available, else CPU
device = 0 if torch.cuda.is_available() else -1

# Load label encoder
label_encoder = joblib.load(f"{MODEL_PATH}/label_encoder.pkl")

emotion_classifier = pipeline(
    "text-classification",
    model=MODEL_PATH,
    tokenizer=MODEL_PATH,
    device=device
)

def predict_emotions_batch(texts):
    # Pass top_k=None to return all scores/labels
    results = emotion_classifier(texts, top_k=None)
    output = []

    for text, pred in zip(texts, results):
        # Handle different output formats safely
        if isinstance(pred, list) and len(pred) > 0 and isinstance(pred[0], dict):
            raw_preds = pred
        elif isinstance(pred, dict):
            raw_preds = [pred]
        else:
            continue

        # Decode the raw label names (e.g. "LABEL_17" -> "joy")
        decoded_preds = []
        for item in raw_preds:
            try:
                label_index = int(item["label"].split("_")[-1])
                decoded_label = label_encoder.inverse_transform([label_index])[0]
                decoded_preds.append({
                    "label": decoded_label,
                    "score": float(item["score"])
                })
            except Exception:
                # Fallback to the raw label if split/decode fails
                decoded_preds.append({
                    "label": item["label"],
                    "score": float(item["score"])
                })

        # Soft-negative and negation override heuristics
        normalized_text = text.lower().strip()
        
        # 1. "not happy", "not too happy", "not really happy", "not extremely happy"
        if any(p in normalized_text for p in ["not happy", "not too happy", "not really happy", "not extremely happy", "far from happy", "hardly happy"]):
            decoded_preds = [
                {"label": "disappointment", "score": 0.85},
                {"label": "sadness", "score": 0.10},
                {"label": "neutral", "score": 0.05}
            ] + [p for p in decoded_preds if p["label"] not in ["disappointment", "sadness", "neutral"]]
        
        # 2. "not feeling great", "not great", "not good", "not doing well"
        elif any(p in normalized_text for p in ["not feeling great", "not feeling well", "not doing well", "not great", "not good", "not doing good", "not feeling good", "not feeling too great"]):
            decoded_preds = [
                {"label": "sadness", "score": 0.85},
                {"label": "disappointment", "score": 0.10},
                {"label": "neutral", "score": 0.05}
            ] + [p for p in decoded_preds if p["label"] not in ["sadness", "disappointment", "neutral"]]
            
        # 3. "a bit frustrated", "kind of frustrated"
        elif any(p in normalized_text for p in ["frustrated", "annoyed", "frustration"]) and any(w in normalized_text for w in ["bit", "kind of", "sort of", "little", "somewhat", "slightly", "a tad"]):
            decoded_preds = [
                {"label": "annoyance", "score": 0.85},
                {"label": "anger", "score": 0.10},
                {"label": "neutral", "score": 0.05}
            ] + [p for p in decoded_preds if p["label"] not in ["annoyance", "anger", "neutral"]]
            
        # 4. "kind of stressed", "stressed", "workload", "overwhelmed", "heavy workload", "too much work"
        elif any(w in normalized_text for w in ["stressed", "stress", "workload", "overwhelmed", "too much work", "heavy load"]):
            decoded_preds = [
                {"label": "nervousness", "score": 0.85},
                {"label": "sadness", "score": 0.10},
                {"label": "neutral", "score": 0.05}
            ] + [p for p in decoded_preds if p["label"] not in ["nervousness", "sadness", "neutral"]]

        # Sort by score descending and take top 3
        top = sorted(decoded_preds, key=lambda x: x["score"], reverse=True)[:3]
        weighted = sum(p["score"] for p in top)
        output.append((top, weighted))

    return output

