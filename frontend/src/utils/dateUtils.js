const US_HOLIDAYS_2025 = ['01-01', '05-26', '09-01', '11-27', '12-25'];

const isBusinessDay = (date) => {
    const day = date.getDay();
    // 0 = Domingo, 6 = Sábado
    const isWeekend = day === 0 || day === 6;
    
    // Formato MM-DD para comparar con la lista
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${month}-${dayOfMonth}`;
    
    return !isWeekend && !US_HOLIDAYS_2025.includes(formattedDate);
};

export const calculateBusinessDate = (startDate, targetDays) => {
    // Creamos una copia para no modificar la fecha original
    let current = new Date(startDate);
    let counted = 0;

    // Bucle infinito seguro hasta encontrar los días requeridos
    while (counted < targetDays) {
        // LÓGICA CLAVE: Verificamos el día ANTES de sumar
        // Si hoy es hábil, cuenta como Día 1.
        if (isBusinessDay(current)) {
            counted++;
            // Si ya completamos el cupo, retornamos ESTA fecha (no la siguiente)
            if (counted === targetDays) {
                return new Date(current);
            }
        }
        
        // Pasamos al siguiente día calendario para evaluar
        current.setDate(current.getDate() + 1);
    }
    return current;
};

// Utilidad para formatear igual que en Python "%m/%d/%Y"
export const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
};