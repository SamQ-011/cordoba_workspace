from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.models import Creditor, SearchMiss
import re
from app.api import deps
from app.schemas import schemas

router = APIRouter()

# --- 1. CONFIGURACIÓN Y LÓGICA DE LIMPIEZA (Migrado de Streamlit) ---
IGNORED_TOKENS = {"CREDITOR", "ACCOUNT", "BALANCE", "DEBT", "AMOUNT", "TOTAL"}

def sanitize_input(raw_text: str) -> str:
    """
    Limpia el texto sucio pegado desde Excel/Web.
    Ej: "CHASE BANK - $500.00" -> "CHASE BANK"
    """
    # 1. Separar por tabulaciones o espacios múltiples
    parts = re.split(r'\t|\s{2,}', raw_text)
    base_text = parts[0].strip()
    
    # 2. Cortar si encuentra montos ($ o dígitos) para quedarse solo con el nombre
    match = re.search(r'(\d|\$)', base_text)
    if match:
        base_text = base_text[:match.start()].strip()
        
    # 3. Quitar espacios extra
    return re.sub(r'\s+', ' ', base_text)

# --- 2. MODELOS DE RESPUESTA ESPECÍFICOS PARA ESTE MOTOR ---
class BatchRawRequest(BaseModel):
    raw_text: str  # El texto sucio tal cual viene del copy-paste

class BatchResultItem(BaseModel):
    input: str     # Lo que el sistema detectó (Ej: "CHASE")
    code: str      # El código oficial en BD (Ej: "CHASE")
    name: str      # El nombre oficial (Ej: "JPMORGAN CHASE BANK")

class BatchResponse(BaseModel):
    found: List[BatchResultItem]
    unknown: List[str]

# --- 3. ENDPOINTS ---

@router.get("/", response_model=List[schemas.CreditorOut])
def read_creditors(
    db: deps.SessionDep,
    q: str = Query(None, min_length=2),
):
    """
    Búsqueda Manual en Tiempo Real (Autocompletado).
    Busca por coincidencia parcial en Abreviación o Nombre.
    """
    if not q:
        return []
    
    query_str = f"%{q}%"
    results = db.query(Creditor).filter(
        (Creditor.abreviation.ilike(query_str)) | 
        (Creditor.name.ilike(query_str))
    ).limit(20).all()
    
    return results

@router.post("/batch", response_model=BatchResponse)
def process_batch(
    db: deps.SessionDep,
    payload: BatchRawRequest,
):
    """
    MOTOR INTELIGENTE: Procesa texto crudo, limpia, busca y clasifica.
    Devuelve { found: [...], unknown: [...] }
    """
    lines = payload.raw_text.split('\n')
    valid_hits = []
    unknowns = []
    processed_codes = set() # Para evitar duplicados en la misma búsqueda

    # A. Pre-procesamiento (Limpieza)
    clean_inputs = []
    input_map = {} # Guardamos qué input generó qué código limpio

    for line in lines:
        cleaned = sanitize_input(line).upper()
        # Filtros de calidad
        if cleaned and cleaned not in IGNORED_TOKENS and len(cleaned) >= 2:
            clean_inputs.append(cleaned)
            input_map[cleaned] = line.strip() # Guardamos referencia original si quieres
    
    if not clean_inputs:
        return {"found": [], "unknown": []}

    # B. Búsqueda Optimizada (Una sola consulta SQL gigante con IN)
    # Buscamos coincidencias exactas en la abreviación
    matches = db.query(Creditor).filter(Creditor.abreviation.in_(clean_inputs)).all()
    
    # Crear mapa rápido {CODIGO_DB: OBJETO_DB}
    db_map = {c.abreviation: c for c in matches}

    # C. Clasificación de Resultados
    for code in clean_inputs:
        if code in processed_codes: 
            continue # Ya procesamos este código en esta vuelta
        
        if code in db_map:
            # ¡EUREKA! Encontrado
            creditor = db_map[code]
            valid_hits.append({
                "input": code,
                "code": creditor.abreviation,
                "name": creditor.name
            })
        else:
            # 404: No existe
            unknowns.append(code)
        
        processed_codes.add(code)

    return {"found": valid_hits, "unknown": unknowns}

@router.post("/report-miss", response_model=schemas.SearchMissOut)
def report_missing_code(
    db: deps.SessionDep,
    miss_in: schemas.SearchMissCreate,
):
    """
    Guarda un código que no fue encontrado para que el Admin lo revise.
    """
    new_miss = SearchMiss(
        abreviation=miss_in.abreviation,
        cordoba_id=miss_in.cordoba_id
    )
    db.add(new_miss)
    db.commit()
    db.refresh(new_miss)
    return new_miss