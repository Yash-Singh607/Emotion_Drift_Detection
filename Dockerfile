# Base lightweight Python image
FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable stdout buffering
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HOME=/home/user
ENV PORT=7860

WORKDIR $HOME/app

# Install system dependencies needed for compiling pip wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set up a new user named "user" with UID 1000 to comply with Hugging Face Spaces
RUN useradd -m -u 1000 user && \
    chown -R user:user $HOME

# Switch to the non-root user
USER user
ENV PATH=$HOME/.local/bin:$PATH

# Copy requirements.txt first to utilize Docker layer caching
COPY --chown=user:user requirements.txt .

# Install dependencies, prioritizing CPU-only PyTorch to keep image lightweight (~1.5GB vs >4.5GB)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Copy only the FastAPI backend and trained ML model files (excludes frontend)
COPY --chown=user:user app.py .
COPY --chown=user:user emotion_model.py .
COPY --chown=user:user drift_detector.py .
COPY --chown=user:user escalation.py .
COPY --chown=user:user inference.py .
COPY --chown=user:user data_loader.py .
COPY --chown=user:user emotion_model_trained_final/ ./emotion_model_trained_final/

# Port 7860 is the default and required port for Hugging Face Spaces
EXPOSE 7860

# Start Uvicorn bound to dynamic cloud PORT environments (Hugging Face Spaces sets PORT=7860)
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860}"]

