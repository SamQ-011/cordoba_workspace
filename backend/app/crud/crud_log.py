from sqlalchemy.orm import Session
from app.models import models
from app.schemas import schemas

def create_audit_log(db: Session, log_in: schemas.LogCreate, agent_name: str, current_user_id: int):
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
    """Recupera las últimas notas del agente actual."""
    return db.query(models.Log).filter(
        models.Log.agent == agent_name
    ).order_by(models.Log.created_at.desc()).limit(limit).all()