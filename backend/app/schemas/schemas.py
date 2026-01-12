from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, date

# --- ESQUEMAS DE USUARIO ---
class UserBase(BaseModel):
    username: str
    name: str
    role: str = "Agent"

class UserCreate(UserBase):
    password: str # Solo se usa al crear/login

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    active: Optional[bool] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    active: bool
    # Esto permite que Pydantic lea datos de objetos SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMAS DE LOGS (NOTAS) ---
class LogBase(BaseModel):
    customer: str
    cordoba_id: str
    result: str
    affiliate: str
    info_until: str
    client_language: str
    comments: Optional[str] = None
    transfer_status: Optional[str] = None

class LogCreate(LogBase):
    pass

class LogOut(LogBase):
    id: int
    created_at: datetime
    agent: str
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMAS DE SEGURIDAD (TOKEN) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- ESQUEMAS DE ACREEDORES (BANCOS) ---
class CreditorBase(BaseModel):
    name: str
    abreviation: str

class BatchSearchRequest(BaseModel):
    items: List[str]

class CreditorCreate(CreditorBase):
    pass

class CreditorOut(CreditorBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMAS DE REPORTES (MISSES) ---
class SearchMissCreate(BaseModel):
    abreviation: str
    cordoba_id: str

class SearchMissOut(SearchMissCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UpdateBase(BaseModel):
    title: str
    message: str
    category: str  
    date: date

class UpdateCreate(UpdateBase):
    pass

class UpdateOut(UpdateBase):
    id: int
    active: bool
    model_config = ConfigDict(from_attributes=True)