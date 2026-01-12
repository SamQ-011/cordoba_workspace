from fastapi import APIRouter, Depends, Query
from typing import List
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_creditor
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.CreditorOut])
def read_creditors(
    db: deps.SessionDep,
    current_user: deps.get_current_user = Depends(), # Protegido por Token
    q: str = Query(None, min_length=2) # Requiere al menos 2 letras
):
    """Endpoint para el buscador manual y por lotes."""
    return crud_creditor.get_creditors(db, query=q)

@router.post("/batch", response_model=List[schemas.CreditorOut])
def search_creditors_batch(
    db: deps.SessionDep,
    request: schemas.BatchSearchRequest,
    current_user: deps.get_current_user = Depends()
):
    """Procesa una lista de abreviaciones (como el Tab de Lotes de Streamlit)."""
    # Limpiamos los códigos (quitar espacios, pasar a mayúsculas) antes de buscar
    clean_codes = [c.strip().upper() for c in request.items if len(c.strip()) > 1]
    return crud_creditor.get_creditors_by_batch(db, clean_codes)

@router.post("/report-miss", response_model=schemas.SearchMissOut)
def create_miss_report(
    db: deps.SessionDep,
    miss_in: schemas.SearchMissCreate,
    current_user: deps.get_current_user = Depends()
):
    """Endpoint para reportar códigos faltantes."""
    return crud_creditor.report_search_miss(db, miss_in)