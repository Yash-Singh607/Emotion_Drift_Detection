import os
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from torch.optim import AdamW
from tqdm import tqdm
import joblib

# ---------------------------
# 1. LOAD DATA
# ---------------------------

print("📂 Loading dataset...")

files = [
    "data/full_dataset/goemotions_1.csv",
    "data/full_dataset/goemotions_2.csv",
    "data/full_dataset/goemotions_3.csv"
]

df = pd.concat([pd.read_csv(f) for f in files])

emotion_cols = [
    'admiration','amusement','anger','annoyance','approval','caring','confusion',
    'curiosity','desire','disappointment','disapproval','disgust','embarrassment',
    'excitement','fear','gratitude','grief','joy','love','nervousness','optimism',
    'pride','realization','relief','remorse','sadness','surprise','neutral'
]

df["label"] = df[emotion_cols].idxmax(axis=1)
df = df[["text", "label"]].dropna()

# 🚀 LIMIT DATA FOR FAST CPU TRAINING
df = df.sample(n=5000, random_state=42)

print(f"✅ Using {len(df)} samples for training")

# Encode labels
le = LabelEncoder()
df["label"] = le.fit_transform(df["label"])

train_texts, val_texts, train_labels, val_labels = train_test_split(
    df.text,
    df.label,
    test_size=0.1,
    stratify=df.label,
    random_state=42
)

# ---------------------------
# 2. TOKENIZER & DATASET
# ---------------------------

tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")

print("⚡ Pre-tokenizing train and validation sets in memory...")
train_encodings = tokenizer(
    train_texts.tolist(),
    truncation=True,
    padding="max_length",
    max_length=64
)

val_encodings = tokenizer(
    val_texts.tolist(),
    truncation=True,
    padding="max_length",
    max_length=64
)

class EmotionDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels.tolist()

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

train_ds = EmotionDataset(train_encodings, train_labels)
val_ds = EmotionDataset(val_encodings, val_labels)

train_loader = DataLoader(train_ds, batch_size=16, shuffle=True)  # 🔥 increased batch_size from 8 to 16 for better speed


# ---------------------------
# 3. MODEL SETUP
# ---------------------------

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("🤖 Loading model...")

model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=len(le.classes_)
).to(device)

# 🔥 FREEZE DISTILBERT FOR SPEED
for param in model.distilbert.parameters():
    param.requires_grad = False

optimizer = AdamW(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=5e-4
)

# ---------------------------
# 4. TRAINING LOOP
# ---------------------------

epochs = 1   # 🔥 1 epoch is enough for demo

print("\n🚀 Starting Training...\n")

for epoch in range(epochs):
    model.train()
    loop = tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs}")

    for batch in loop:
        batch = {k: v.to(device) for k, v in batch.items()}

        outputs = model(**batch)
        loss = outputs.loss

        loss.backward()
        optimizer.step()
        optimizer.zero_grad(set_to_none=True)

        loop.set_postfix(loss=f"{loss.item():.4f}")

# ---------------------------
# 5. SAVE FINAL MODEL
# ---------------------------

save_path = "emotion_model_trained_final"

os.makedirs(save_path, exist_ok=True)

model.save_pretrained(save_path)
tokenizer.save_pretrained(save_path)
joblib.dump(le, os.path.join(save_path, "label_encoder.pkl"))

print("\n✅ Training Complete!")
print("📁 Model saved to:", save_path)
