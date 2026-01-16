from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, not_
from datetime import datetime, timedelta
import pytz

from app.api import deps
from app.models import models
from app.schemas import schemas
from app.utils import date_utils

router = APIRouter()

# Zonas horarias
TZ_ET = pytz.timezone('US/Eastern')

def get_date_range_utc(period: str):
    """
    Calcula la fecha de inicio en UTC basada en la hora de New York (ET).
    Esto es crucial porque los agentes trabajan en ET, pero la BD guarda en UTC.
    """
    now_et = datetime.now(TZ_ET)
    today_et = now_et.date()
    
    if period == "today":
        start_date = now_et.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        # Lunes de la semana actual
        start_date = (now_et - timedelta(days=now_et.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "month":
        # Día 1 del mes actual
        start_date = now_et.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        return None

    # Convertimos esa fecha ET a UTC para comparar con la base de datos
    return start_date.astimezone(pytz.utc)

def calculate_metrics(db: Session, user_id: int, start_date_utc: datetime) -> schemas.MetricsSet:
    """
    Realiza el conteo SQL eficiente.
    Reemplaza la lógica de Pandas de Streamlit.
    """
    # 1. Total de llamadas desde la fecha indicada
    total = db.query(models.Log).filter(
        models.Log.user_id == user_id,
        models.Log.created_at >= start_date_utc
    ).count()

    # 2. Ventas Completadas
    # Lógica replicada de Streamlit: Contiene 'Completed' Y NO contiene 'Not'
    completed = db.query(models.Log).filter(
        models.Log.user_id == user_id,
        models.Log.created_at >= start_date_utc,
        models.Log.result.ilike("%Completed%"),      # Case insensitive
        not_(models.Log.result.ilike("%Not%"))       # Excluir 'Not Completed'
    ).count()

    # 3. Tasa de Conversión
    rate = (completed / total * 100) if total > 0 else 0.0

    return schemas.MetricsSet(
        total_calls=total,
        completed_sales=completed,
        conversion_rate=round(rate, 1)
    )

@router.get("/information", response_model=schemas.WorkspaceDashboard)
def get_workspace_info(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Endpoint Maestro del Dashboard.
    Retorna Fechas de Pago, KPIs (Hoy/Semana/Mes) y Noticias.
    """
    
    # A. Fechas de Pago (Tu lógica existente en date_utils)
    bus_dates = date_utils.get_workspace_dates()
    payment_dates = schemas.PaymentDates(
        standard=bus_dates["standard"].strftime("%m/%d/%Y"),
        california=bus_dates["california"].strftime("%m/%d/%Y"),
        max_date=bus_dates["max_date"].strftime("%m/%d/%Y")
    )

    # B. Métricas de Rendimiento (KPIs)
    # Calculamos los 3 periodos
    start_today = get_date_range_utc("today")
    start_week = get_date_range_utc("week")
    start_month = get_date_range_utc("month")

    performance = schemas.PerformanceData(
        today=calculate_metrics(db, current_user.id, start_today),
        this_week=calculate_metrics(db, current_user.id, start_week),
        this_month=calculate_metrics(db, current_user.id, start_month)
    )

    # C. Noticias Activas (Updates)
    # Traemos las noticias activas, ordenadas por fecha descendente
    news_query = db.query(models.Update).filter(
        models.Update.active == True
    ).order_by(models.Update.date.desc()).all()
    
    # Mapeamos a la lista de esquemas
    news_list = [
        schemas.NewsItem(
            id=n.id,
            title=n.title,
            message=n.message,
            category=n.category,
            date=str(n.date)
        ) for n in news_query
    ]

    return schemas.WorkspaceDashboard(
        agent_name=current_user.name,
        role=current_user.role,
        payment_dates=payment_dates,
        performance=performance,
        news=news_list
    )