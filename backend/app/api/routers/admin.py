from fastapi import APIRouter, Depends
from sqlalchemy import func
from app.api import deps
from app.models import models

router = APIRouter()

@router.get("/stats")
def get_admin_stats(
    db: deps.SessionDep,
    current_admin: models.User = Depends(deps.get_current_active_admin)
):
    """Estadísticas globales para los KPIs del Dashboard."""
    total_logs = db.query(models.Log).count()
    total_bancos = db.query(models.Creditor).count()
    # Ventas hoy (Completed)
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
    """Últimas 10 acciones en tiempo real."""
    return db.query(models.Log).order_by(models.Log.created_at.desc()).limit(10).all()