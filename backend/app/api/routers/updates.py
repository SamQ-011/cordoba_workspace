from fastapi import APIRouter, Depends
from typing import List
from app.api import deps
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.UpdateOut])
def read_active_updates(
    db: deps.SessionDep,
    current_user: models.User = Depends(deps.get_current_user)
):
    """Obtiene las noticias activas (como en el Centro de Novedades)."""
    return db.query(models.Update).filter(models.Update.active == True).all()

@router.post("/{update_id}/read")
def mark_as_read(
    update_id: int,
    db: deps.SessionDep,
    current_user: models.User = Depends(deps.get_current_user)
):
    """Registra que el agente leyó la noticia."""
    # Evitamos duplicados
    already_read = db.query(models.UpdateRead).filter(
        models.UpdateRead.update_id == update_id,
        models.UpdateRead.username == current_user.username
    ).first()
    
    if not already_read:
        new_read = models.UpdateRead(
            update_id=update_id,
            username=current_user.username
        )
        db.add(new_read)
        db.commit()
    return {"status": "success", "message": "Update marked as read"}