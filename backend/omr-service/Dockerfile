# ==============================
# 1. Build Audiveris from source
# ==============================
FROM eclipse-temurin:17-jdk AS audiveris-builder

# Install dependencies for building Audiveris
RUN apt-get update && apt-get install -y \
    git \
    maven \
    tesseract-ocr \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

# Clone Audiveris source code
RUN git clone https://github.com/Audiveris/audiveris.git

WORKDIR /opt/audiveris

# Build Audiveris with Maven
RUN mvn -DskipTests -Dmaven.javadoc.skip=true clean install

# ==============================
# 2. Build OMR API service
# ==============================
FROM python:3.11-slim-bookworm

# Install Java runtime and dependencies
RUN apt-get update && apt-get install -y \
    default-jre \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Copy built Audiveris from builder stage
COPY --from=audiveris-builder /opt/audiveris /opt/audiveris

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads output processed

# Set environment variables
ENV AUDIVERIS_JAR=/opt/audiveris/target/audiveris-*.jar
ENV JAVA_PATH=java
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8001

# Run the API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
