# backend/Dockerfile

FROM python:3.12-slim

# Evitamos archivos basura de Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalamos herramientas necesarias para compilar librerías
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiamos requirements y los instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el código de la carpeta backend
COPY . .

# Exponemos el puerto 8000 (Solo para comunicación interna)
EXPOSE 8000

# Arrancamos el servidor
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]