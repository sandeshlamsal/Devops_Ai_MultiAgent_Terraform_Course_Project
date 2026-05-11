FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY agents/  ./agents/
COPY models/  ./models/
COPY utils/   ./utils/
COPY config.py .

ENV PYTHONPATH=/app

CMD ["python", "-m", "agents.worker"]
