import pandas as pd

def load_goemotions_csv():
    df = pd.read_csv("data/full_dataset/goemotions_full.csv")
    return df["text"].tolist()
