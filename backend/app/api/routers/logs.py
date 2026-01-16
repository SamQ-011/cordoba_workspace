from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import pytz
import re

from app.api import deps
from app.models.models import Log, User
from app.schemas import schemas

router = APIRouter()

# --- 1. OBTENER HISTORIAL DEL AGENTE ---
@router.get("/history", response_model=List[schemas.LogOut])
def get_agent_history(
    db: deps.SessionDep,
    current_user: User = Depends(deps.get_current_user),
    limit: int = 15
):
    """Devuelve las últimas notas creadas por el agente actual."""
    logs = db.query(Log)\
        .filter(Log.agent == current_user.username)\
        .order_by(Log.created_at.desc())\
        .limit(limit)\
        .all()
    return logs

# --- 2. GUARDAR NUEVA NOTA ---
@router.post("/", response_model=schemas.LogOut)
def create_log(
    log_in: schemas.LogCreate,
    db: deps.SessionDep,
    current_user: User = Depends(deps.get_current_user)
):
    """Guarda el log operativo en la base de datos."""
    
    # Sanitización de seguridad (ocultar tarjetas/cuentas)
    clean_comments = log_in.comments
    if clean_comments:
        clean_comments = re.sub(r'\b\d{4,}\b', '[####]', clean_comments)

    new_log = Log(
        user_id=current_user.id,
        agent=current_user.username,
        customer=log_in.customer,
        cordoba_id=log_in.cordoba_id,
        result=log_in.result,
        comments=clean_comments,
        affiliate=log_in.affiliate,
        info_until=log_in.info_until,
        client_language=log_in.client_language,
        transfer_status=log_in.transfer_status,
        created_at=datetime.now(pytz.utc)
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    return new_log