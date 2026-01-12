from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_log
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.LogOut)
def create_log(
    *,
    db: deps.SessionDep,
    log_in: schemas.LogCreate,
    current_user: deps.models.User = Depends(deps.get_current_user)
):
   return crud_log.create_audit_log(
        db, 
        log_in=log_in, 
        agent_name=current_user.username,
        current_user_id=current_user.id
    )

@router.get("/me", response_model=List[schemas.LogOut])
def read_my_logs(
    db: deps.SessionDep,
    current_user: deps.models.User = Depends(deps.get_current_user)
):
    """Obtiene el historial reciente del agente logueado."""
    return crud_log.get_my_logs(db, agent_name=current_user.username)