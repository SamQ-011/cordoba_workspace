from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.models import models

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
from app.models import models # Asegúrate de importar tus modelos si no están

@router.get("/me", response_model=schemas.UserOut) # O schemas.UserPublic si quieres ocultar el password
def read_users_me(
    current_user: Annotated[models.User, Depends(deps.get_current_active_user)]
):
    """
    Endpoint para persistencia de sesión.
    Recibe el token, valida quién es el usuario y devuelve sus datos.
    """
    return current_user

@router.put("/me/password")
def update_password(
    password_in: schemas.UserPasswordUpdate,
    db: deps.SessionDep,
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Permite al usuario cambiar su propia contraseña.
    Valida la contraseña actual antes de aplicar el cambio.
    """
    # 1. Verificar que la contraseña actual sea correcta
    if not security.verify_password(password_in.current_password, current_user.password):
        raise HTTPException(
            status_code=400, 
            detail="La contraseña actual es incorrecta"
        )
    
    # 2. Encriptar la nueva contraseña
    hashed_password = security.get_password_hash(password_in.new_password)
    
    # 3. Guardar en BD
    current_user.password = hashed_password
    db.add(current_user)
    db.commit()
    
    return {"message": "Contraseña actualizada correctamente"}