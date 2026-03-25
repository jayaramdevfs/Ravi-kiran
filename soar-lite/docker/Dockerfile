FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Optimize for Python performance and output logging
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/src
ENV FLASK_APP=src/dashboard/app.py

# Install application dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Integrate application source
COPY . .

# Initialize the security environment and seed data
RUN python scripts/run_pipeline.py

# Securely expose the management port
EXPOSE 5000

# Start the management console
CMD ["python", "src/dashboard/app.py"]
