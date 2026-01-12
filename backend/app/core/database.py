from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# El "engine" gestiona el pool de conexiones de forma eficiente
engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Esta es una "Dependencia" de FastAPI. 
# Asegura que la conexión se abra al iniciar la petición y se CIERRE al terminar.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()