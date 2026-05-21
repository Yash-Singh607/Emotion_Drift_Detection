import torch
import torch.nn.functional as F
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import joblib

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load trained model
model = DistilBertForSequenceClassification.from_pretrained(
    "emotion_model_trained_final"
).to(device)

tokenizer = DistilBertTokenizerFast.from_pretrained(
    "emotion_model_trained_final"
)

label_encoder = joblib.load("emotion_model_trained_final/label_encoder.pkl")

model.eval()

print("\n✅ Emotion Detection System Ready!")
print("Type 'exit' to quit.\n")

while True:
    text = input("Enter your message: ")

    if text.lower() == "exit":
        print("👋 Exiting...")
        break

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)
        top_probs, top_indices = torch.topk(probs, 3)

    print("\n🎯 Top Emotions:")
    for prob, idx in zip(top_probs[0], top_indices[0]):
        emotion = label_encoder.inverse_transform([idx.item()])[0]
        print(f"{emotion} : {prob.item():.4f}")

    print("-" * 50)
