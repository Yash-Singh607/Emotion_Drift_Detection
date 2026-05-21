import numpy as np

emotion_map = {
    "joy": 0.1,
    "neutral": 0.2,
    "sadness": 0.5,
    "fear": 0.6,
    "anger": 0.9,
    "surprise": 0.3,
    "love": 0.0,
    "disappointment": 0.5,
    "annoyance": 0.8,
    "nervousness": 0.6
}

def calculate_drift(timeline, window=5):
    if not timeline:
        return 0.0

    recent = timeline[-window:]
    values = np.array([
        emotion_map.get(t["emotions"][0]["label"], 0.2)
        for t in recent
    ])

    return float(values.mean())

def calculate_drift_vectorized(timeline, window=5):
    if not timeline:
        return 0.0

    # Extract labels for the recent window
    recent = timeline[-window:]
    
    # Vectorized lookup mapping with a default fallback of 0.2
    labels = np.array([t["emotions"][0]["label"] for t in recent])
    
    # Map the numpy array using a vectorized map function or simple dictionary comprehension
    # Since numpy arrays can be processed fast, we map them using a lookup
    map_func = np.vectorize(lambda x: emotion_map.get(x, 0.2))
    values = map_func(labels)

    return float(values.mean())

