from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security, config
from app.crud import crud_user
from app.schemas import schemas
from app.api import deps

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: deps.SessionDep, 
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    # 1. Validar usuario y contraseña contra la DB
    user = crud_user.authenticate(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    
    # 2. Si es válido, crear el tiempo de expiración
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 3. Generar el JWT firmado
    access_token = security.create_access_token(
        subject=user.username
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }