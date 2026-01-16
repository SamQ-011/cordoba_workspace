import pandas as pd
from sqlalchemy.orm import Session
from app.models import models
from app.schemas import schemas

def create_audit_log(db: Session, log_in: schemas.LogCreate, agent_name: str, current_user_id: int):
    """Crea un nuevo registro de auditoría en la base de datos."""
    db_log = models.Log(
        user_id=current_user_id, 
        agent=agent_name,
        customer=log_in.customer,
        cordoba_id=log_in.cordoba_id,
        result=log_in.result,
        comments=log_in.comments,
        affiliate=log_in.affiliate,
        info_until=log_in.info_until,
        client_language=log_in.client_language,
        transfer_status=log_in.transfer_status
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_my_logs(db: Session, agent_name: str, limit: int = 10):
    """Recupera las últimas notas del agente actual para el historial en el frontend."""
    return db.query(models.Log).filter(
        models.Log.agent == agent_name
    ).order_by(models.Log.created_at.desc()).limit(limit).all()

def get_logs_for_report(db: Session, start_date, end_date, target_agent: str):
    """
    Extrae y filtra los logs para la generación de reportes Excel.
    Replica la lógica de filtrado de admin_service.py.
    """
    # 1. Definimos el rango de fechas para cubrir el día completo
    start_str = f"{start_date} 00:00:00"
    end_str = f"{end_date} 23:59:59"
    
    query = db.query(models.Log).filter(
        models.Log.created_at >= start_str,
        models.Log.created_at <= end_str
    )
    
    # 2. Aplicamos filtros de agente según la selección del administrador
    if "TODOS" not in target_agent:
        # Búsqueda insensible a mayúsculas para mayor flexibilidad
        query = query.filter(models.Log.agent.ilike(target_agent))
    else:
        # Excluimos registros de prueba por defecto
        query = query.filter(models.Log.agent != 'test')
    
    # 3. Obtenemos los resultados y convertimos a DataFrame para el generador de Excel
    results = query.order_by(models.Log.created_at.desc()).all()
    
    if not results:
        return pd.DataFrame()
        
    # Convertimos los objetos SQLAlchemy a diccionarios planos
    data = []
    for r in results:
        # El método __dict__ de SQLAlchemy incluye una clave interna '_sa_instance_state' que removemos
        d = r.__dict__.copy()
        d.pop('_sa_instance_state', None)
        data.append(d)
        
    return pd.DataFrame(data)