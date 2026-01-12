import sys
import os
from sqlalchemy import text

# Configurar path
sys.path.append(os.getcwd())

print("1. Iniciando diagnóstico...")

try:
    from app.core.database import SessionLocal
    from app.models import models
    from app.core.security import verify_password, create_access_token
    print("2. Importaciones exitosas.")
except Exception as e:
    print(f"❌ Error importando módulos: {e}")
    sys.exit(1)

def test_flow():
    db = SessionLocal()
    username = "atito" # El usuario que sabemos que existe
    
    # --- PRUEBA 1: CONEXIÓN DB ---
    print("\n--- PRUEBA 1: Base de Datos ---")
    try:
        # Intentamos una query cruda primero
        result = db.execute(text("SELECT version();")).fetchone()
        print(f"✅ Conexión SQL exitosa: {result[0]}")
    except Exception as e:
        print(f"❌ Error Fatal DB: {e}")
        return

    # --- PRUEBA 2: ORM MAPPING ---
    print("\n--- PRUEBA 2: Mapeo de Usuario ---")
    try:
        user = db.query(models.User).filter(models.User.username == username).first()
        if user:
            print(f"✅ Usuario encontrado: {user.username}")
            print(f"   - Hash cargado: {user.password[:15]}...")
            print(f"   - Rol: {user.role}")
            print(f"   - Activo: {user.active}")
        else:
            print(f"⚠️ Usuario '{username}' no encontrado (Revisa el nombre en Supabase).")
            return
    except Exception as e:
        print(f"❌ Error Mapeo ORM: {e}")
        print("   (Posible causa: Las columnas 'role' o 'active' no existen en la tabla real de Supabase)")
        return

    # --- PRUEBA 3: ENCRIPTACIÓN (BCRYPT) ---
    print("\n--- PRUEBA 3: Verificación de Password ---")
    try:
        # Usaremos una contraseña incorrecta a propósito para ver si la librería responde
        # Si 'truena' aquí, es problema de librería. Si devuelve False, funciona.
        dummy_pass = "Prueba123"
        print(f"   Intentando verificar '{dummy_pass}' contra el hash...")
        es_valido = verify_password(dummy_pass, user.password)
        print(f"✅ Librería Bcrypt responde. Resultado: {es_valido}")
    except Exception as e:
        print(f"❌ Error BCRYPT (CRÍTICO): {e}")
        print("   SOLUCIÓN: 'pip uninstall bcrypt' -> 'pip install bcrypt'")
        return

    # --- PRUEBA 4: GENERACIÓN JWT ---
    print("\n--- PRUEBA 4: Creación de Token ---")
    try:
        token = create_access_token(subject=user.username)
        print(f"✅ Token generado: {token[:20]}...")
    except Exception as e:
        print(f"❌ Error JWT: {e}")
        return

    print("\n🎉 DIAGNÓSTICO FINAL: Todo parece funcionar lógicamente.")

if __name__ == "__main__":
    test_flow()