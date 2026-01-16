from fastapi import APIRouter, Depends
from typing import List
from app.api import deps
from app.models import models
from app.schemas import schemas

router = APIRouter()

# --- 1. OBTENER NOTICIAS (CON ESTADO DE LECTURA) ---
@router.get("/", response_model=List[schemas.UpdateOut])
def read_active_updates(
    db: deps.SessionDep,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Obtiene las noticias activas y añade el campo 'read' (True/False)
    específico para el usuario actual.
    """
    # 1. Traer todas las noticias activas
    active_updates = db.query(models.Update).filter(models.Update.active == True).all()
    
    # 2. Traer los IDs que el usuario YA leyó
    # Consultamos solo la tabla de relación 'UpdateRead'
    read_records = db.query(models.UpdateRead.update_id)\
        .filter(models.UpdateRead.username == current_user.username)\
        .all()
    
    # Convertimos la lista de resultados a un Set para búsqueda rápida (O(1))
    # read_records viene como lista de tuplas [(1,), (5,), ...], extraemos el ID
    read_ids = {r.update_id for r in read_records}

    # 3. Inyectar el estado 'read' en cada objeto antes de enviarlo
    for update in active_updates:
        # Verificamos si el ID de la noticia está en el set de leídas
        is_read = update.id in read_ids
        
        # Asignamos el atributo dinámicamente para que el Schema lo recoja
        setattr(update, 'read', is_read)

    return active_updates

# --- 2. MARCAR COMO LEÍDA ---
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