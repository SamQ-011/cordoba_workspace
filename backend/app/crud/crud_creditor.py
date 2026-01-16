from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import models
from app.schemas import schemas

def get_creditors(db: Session, query: str = None, limit: int = 100):
    """Busca acreedores por nombre o abreviación."""
    db_query = db.query(models.Creditor)
    if query:
        # Replicamos el 'ILIKE' que tenías en el MVP
        search = f"%{query}%"
        db_query = db_query.filter(
            or_(
                models.Creditor.name.ilike(search),
                models.Creditor.abreviation.ilike(search)
            )
        )
    return db_query.limit(limit).all()

def get_creditors_by_batch(db: Session, codes: list[str]):
    """Busca una lista exacta de abreviaciones."""
    # El operador .in_ de SQLAlchemy es extremadamente rápido
    return db.query(models.Creditor).filter(models.Creditor.abreviation.in_(codes)).all()

def report_search_miss(db: Session, miss_in: schemas.SearchMissCreate):
    """Registra un código que el agente no encontró."""
    db_miss = models.SearchMiss(
        abreviation=miss_in.abreviation,
        cordoba_id=miss_in.cordoba_id
    )
    db.add(db_miss)
    db.commit()
    db.refresh(db_miss)
    return db_miss

# --- app/crud/crud_creditor.py ---
def create_creditor(db: Session, creditor_in: schemas.CreditorCreate):
    db_creditor = models.Creditor(**creditor_in.model_dump())
    db.add(db_creditor)
    db.commit()
    db.refresh(db_creditor)
    return db_creditor

def update_creditor(db: Session, creditor_id: int, creditor_in: schemas.CreditorUpdate):
    db_creditor = db.query(models.Creditor).filter(models.Creditor.id == creditor_id).first()
    if db_creditor:
        for field, value in creditor_in.model_dump(exclude_unset=True).items():
            setattr(db_creditor, field, value)
        db.commit()
        db.refresh(db_creditor)
    return db_creditor

def delete_search_miss(db: Session, miss_id: int):
    """Reemplaza a dismiss_search_miss del admin_service anterior"""
    db_miss = db.query(models.SearchMiss).filter(models.SearchMiss.id == miss_id).first()
    if db_miss:
        db.delete(db_miss)
        db.commit()
    return True