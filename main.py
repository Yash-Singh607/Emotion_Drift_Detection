from transformers import pipeline
import joblib
import torch

MODEL_PATH = "emotion_model_trained_final"

# Load label encoder
label_encoder = joblib.load(f"{MODEL_PATH}/label_encoder.pkl")

# Dynamically set device to GPU if available, else CPU
device = 0 if torch.cuda.is_available() else -1

# Force safe output format
emotion_classifier = pipeline(
    task="text-classification",
    model=MODEL_PATH,
    tokenizer=MODEL_PATH,
    device=device
)


def predict_emotions_batch(texts):
    predictions = emotion_classifier(
        texts,
        top_k=None  # always return all labels
    )

    results = []

    for pred in predictions:

        # 🛑 HANDLE DIFFERENT OUTPUT FORMATS SAFELY

        # Case 1: pred is a list of dicts (correct case)
        if isinstance(pred, list) and isinstance(pred[0], dict):

            sorted_preds = sorted(pred, key=lambda x: x["score"], reverse=True)[:3]

        # Case 2: pred is a dict (single label returned)
        elif isinstance(pred, dict):

            sorted_preds = [pred]

        # Case 3: pred is string (unexpected case)
        else:
            continue

        decoded = []

        for item in sorted_preds:
            label_index = int(item["label"].split("_")[-1])
            decoded_label = label_encoder.inverse_transform([label_index])[0]

            decoded.append({
                "label": decoded_label,
                "score": float(item["score"])
            })

        results.append(decoded)

    return results
