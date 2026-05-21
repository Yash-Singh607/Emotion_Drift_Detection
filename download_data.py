import os
import pandas as pd
import requests

# Make sure folder exists
os.makedirs("data/full_dataset", exist_ok=True)

urls = [
    "https://storage.googleapis.com/gresearch/goemotions/data/full_dataset/goemotions_1.csv",
    "https://storage.googleapis.com/gresearch/goemotions/data/full_dataset/goemotions_2.csv",
    "https://storage.googleapis.com/gresearch/goemotions/data/full_dataset/goemotions_3.csv"
]

# Download files if not already present
for url in urls:
    filename = url.split("/")[-1]
    filepath = os.path.join("data/full_dataset", filename)
    if not os.path.exists(filepath):
        r = requests.get(url)
        with open(filepath, "wb") as f:
            f.write(r.content)
        print(f"Downloaded {filename}")
    else:
        print(f"{filename} already exists")

# Combine CSVs into one
df1 = pd.read_csv("data/full_dataset/goemotions_1.csv")
df2 = pd.read_csv("data/full_dataset/goemotions_2.csv")
df3 = pd.read_csv("data/full_dataset/goemotions_3.csv")

df = pd.concat([df1, df2, df3], ignore_index=True)
df.to_csv("data/full_dataset/goemotions_full.csv", index=False)
print("Combined dataset saved as goemotions_full.csv")
