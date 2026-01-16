import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core import security

from app.api import deps
from app.models import models
from app.schemas import schemas
from app.crud import crud_user, crud_creditor, crud_log
from app.utils import excel_generator

router = APIRouter()

# --- ESTADÍSTICAS Y MONITOREO ---

@router.get("/stats")
def get_admin_stats(
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Estadísticas globales para los KPIs del Dashboard."""
    total_logs = db.query(models.Log).count()
    total_bancos = db.query(models.Creditor).count()
    
    # Ventas hoy (Filtro por fecha actual)
    sales_today = db.query(models.Log).filter(
        models.Log.result.contains("Completed"),
        func.date(models.Log.created_at) == func.current_date()
    ).count()
    
    return {
        "total_calls": total_logs,
        "total_banks": total_bancos,
        "sales_today": sales_today
    }

@router.get("/live-feed")
def get_live_feed(
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Últimas 10 acciones en tiempo real para el feed del administrador."""
    return db.query(models.Log).order_by(models.Log.created_at.desc()).limit(10).all()

# --- GESTIÓN DE USUARIOS ---

@router.get("/users", response_model=List[schemas.UserOut])
def read_all_users(
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Lista completa de usuarios para auditoría."""
    return db.query(models.User).all()

@router.patch("/users/{user_id}", response_model=schemas.UserOut)
def update_user_profile(
    user_id: int,
    user_in: schemas.UserUpdateAdmin,
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Permite al admin editar roles, nombres y estados de cuenta."""
    return crud_user.update_user_admin(db, user_id, user_in)

# --- GESTIÓN DE BANCOS Y REPORTES ---

@router.post("/creditors", response_model=schemas.CreditorOut)
def add_bank(
    creditor_in: schemas.CreditorCreate,
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Alta de nuevos acreedores en el sistema."""
    return crud_creditor.create_creditor(db, creditor_in)

@router.delete("/misses/{miss_id}")
def dismiss_miss(
    miss_id: int,
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Descarta reportes de bancos no encontrados realizados por agentes."""
    crud_creditor.delete_search_miss(db, miss_id)
    return {"status": "success"}

@router.post("/export-excel")
async def export_report(
    params: schemas.ReportRequest,
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Generación y descarga de reportes estratégicos, operativos y de calidad."""
    
    # 1. Extracción de datos filtrados mediante el CRUD
    df_export = crud_log.get_logs_for_report(
        db, 
        start_date=params.start_date, 
        end_date=params.end_date, 
        target_agent=params.target_agent
    )
    
    # 2. Mapeo de usernames a nombres reales para el reporte
    user_map = crud_user.get_user_map(db)
    
    # 3. Generación del binario Excel en memoria
    output = excel_generator.generate_excel_file(df_export, user_map, params.report_type)
    output.seek(0)
    
    filename = f"Reporte_{params.report_type}_{params.start_date}.xlsx"
    
    return StreamingResponse(
        output, 
        headers={'Content-Disposition': f'attachment; filename="{filename}"'}, 
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@router.post("/users", response_model=schemas.UserOut)
def create_new_user(
    user_in: schemas.UserCreate, # Usamos el esquema UserCreate que ya tiene password
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Crear un nuevo usuario (Agente o Admin)."""
    # Verificar duplicados
    existing = db.query(models.User).filter(models.User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    hashed_password = security.get_password_hash(user_in.password)
    new_user = models.User(
        username=user_in.username,
        name=user_in.name,
        password=hashed_password,
        role=user_in.role,
        active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# --- GESTIÓN DE NOTICIAS (Faltaba todo el CRUD Admin) ---

@router.post("/updates", response_model=schemas.UpdateOut)
def publish_update(
    update_in: schemas.UpdateCreate,
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Publicar una nueva noticia en el Dashboard."""
    new_update = models.Update(
        title=update_in.title,
        message=update_in.message,
        category=update_in.category,
        date=str(update_in.date), # Guardamos como string YYYY-MM-DD
        active=True
    )
    db.add(new_update)
    db.commit()
    db.refresh(new_update)
    return new_update

@router.patch("/updates/{update_id}/archive")
def archive_update(
    update_id: int,
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Archivar noticia (Borrado lógico)."""
    update = db.query(models.Update).filter(models.Update.id == update_id).first()
    if not update:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    update.active = False
    db.commit()
    return {"status": "archived"}