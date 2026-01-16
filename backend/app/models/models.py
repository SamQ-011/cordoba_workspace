from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import pytz

# Definimos la zona horaria para consistencia
def get_utc_now():
    return datetime.now(pytz.utc)

class User(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False) # [cite: 24]
    name = Column(String, nullable=False)
    password = Column(String, nullable=False) # Hash bcrypt [cite: 24]
    role = Column(String, default="Agent") # Admin o Agent [cite: 13]
    active = Column(Boolean, default=True)

class Log(Base):
    __tablename__ = "Logs"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now) # [cite: 25]
    user_id = Column(Integer, ForeignKey("Users.id"))
    agent = Column(String) # Username del agente 
    customer = Column(String)
    cordoba_id = Column(String, index=True)
    result = Column(String) # Completed / Not Completed 
    comments = Column(Text)
    affiliate = Column(String)
    info_until = Column(String)
    client_language = Column(String)
    transfer_status = Column(String) # [cite: 25]

class Creditor(Base):
    __tablename__ = "Creditors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    abreviation = Column(String, index=True) # 

class SearchMiss(Base):
    __tablename__ = "Search_Misses"

    id = Column(Integer, primary_key=True, index=True)
    abreviation = Column(String)
    cordoba_id = Column(String)
    created_at = Column(DateTime, default=get_utc_now) # 

class Update(Base):
    __tablename__ = "Updates"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String) # Fecha simple [cite: 31]
    title = Column(String)
    message = Column(Text)
    category = Column(String) # Info, Warning, Critical [cite: 31]
    active = Column(Boolean, default=True)

class UpdateRead(Base):
    __tablename__ = "Updates_Reads"

    id = Column(Integer, primary_key=True, index=True)
    update_id = Column(Integer, ForeignKey("Updates.id"))
    username = Column(String)
    read_at = Column(DateTime, default=get_utc_now) 