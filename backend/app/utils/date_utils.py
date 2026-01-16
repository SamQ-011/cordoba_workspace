# --- app/utils/date_utils.py ---
from datetime import datetime, timedelta
import pytz

# Feriados bancarios EE.UU. 2026 (Lista Ajustada a "Empresa Operativa")
# Comentamos los feriados federales menores donde la empresa SÍ trabaja.
US_HOLIDAYS_2026 = {
    (1, 1),   # New Year's Day
    # (1, 19),  # Martin Luther King Jr. Day (Empresa trabaja)
    # (2, 16),  # Washington's Birthday (Presidents' Day) (Empresa trabaja)
    (5, 25),  # Memorial Day
    # (6, 19),  # Juneteenth (Empresa trabaja)
    (7, 4),   # Independence Day (Observed)
    (9, 7),   # Labor Day
    # (10, 12), # Columbus Day (Empresa trabaja)
    # (11, 11), # Veterans Day (Empresa trabaja)
    (11, 26), # Thanksgiving
    (12, 25)  # Christmas
}

TZ_ET = pytz.timezone('US/Eastern')

def is_holiday(date_obj) -> bool:
    """Verifica si una fecha es un feriado mayor (No Laborable)."""
    return (date_obj.month, date_obj.day) in US_HOLIDAYS_2026

def is_business_day(date_obj) -> bool:
    """
    Retorna True si es un día apto para contar como hábil.
    Regla: Lunes a Viernes y NO es feriado mayor.
    """
    # 0=Lunes ... 4=Viernes, 5=Sábado, 6=Domingo
    if date_obj.weekday() >= 5: 
        return False
    if is_holiday(date_obj):
        return False
    return True

def get_valid_start_date(date_obj):
    """
    Si 'hoy' es Sábado, Domingo o Feriado, busca el siguiente día hábil
    para empezar a contar desde ahí como 'Día 1'.
    """
    current = date_obj
    # Mientras NO sea día hábil, avanza al siguiente
    while not is_business_day(current):
        current += timedelta(days=1)
    return current

def calculate_forward_date(start_date_raw, target_count: int):
    """
    Calcula fecha futura contando días hábiles.
    Lógica: El 'start_date' validado cuenta como el Día #1.
    """
    # 1. Validar el día de inicio (Si hoy es sábado, empezamos a contar el lunes)
    current_date = get_valid_start_date(start_date_raw)
    
    # Ya estamos en el Día 1.
    days_counted = 1
    
    # 2. Bucle hasta llegar al objetivo (3 o 5)
    while days_counted < target_count:
        current_date += timedelta(days=1)
        
        if is_business_day(current_date):
            days_counted += 1
            
    return current_date

def calculate_max_submission_date(start_date, days_calendar=35):
    """
    35 Días Calendario.
    Si cae en fin de semana/feriado, RETROCEDE al último día hábil
    para asegurar que esté DENTRO del límite de 35 días.
    """
    target_date = start_date + timedelta(days=days_calendar)
    
    while not is_business_day(target_date):
        target_date -= timedelta(days=1)
        
    return target_date

def get_workspace_dates():
    """Genera las tres fechas clave para el Dashboard."""
    now_et = datetime.now(TZ_ET)
    
    # 1. Pago Estándar (3 Business Days)
    # Lógica: Hoy(1) -> Mañana(2) -> Pasado(3)
    standard_date = calculate_forward_date(now_et, 3)
    
    # 2. Pago California (5 Business Days)
    california_date = calculate_forward_date(now_et, 5)
    
    # 3. Fecha Límite (35 Días Calendario - Ajuste hacia atrás)
    max_date = calculate_max_submission_date(now_et, 35)
    
    return {
        "standard": standard_date,
        "california": california_date,
        "max_date": max_date
    }