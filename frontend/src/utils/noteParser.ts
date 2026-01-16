export interface ParsedData {
  cordoba_id: string;
  raw_name_guess: string;
  marketing_company: string;
  language: string;
}

// Función Maestra de Parsing (Migrada de tu Python)
export const parseCRMText = (rawText: string): ParsedData => {
  const data: ParsedData = {
    cordoba_id: '',
    raw_name_guess: '',
    marketing_company: '',
    language: 'English' // Valor por defecto
  };

  if (!rawText) return data;

  // --- 1. ID EXTRACTION ---
  // Busca "Customer ID" seguido de CORDOBA-XXXX o solo CORDOBA-XXXX
  const idMatch = rawText.match(/Customer ID\s*(CORDOBA-\d+)/i) || rawText.match(/(CORDOBA-\d+)/);
  if (idMatch) {
    data.cordoba_id = idMatch[1];
  }

  // --- 2. NAME EXTRACTION ---
  // Tomamos las líneas, quitamos espacios y filtramos vacías
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
  
  if (lines.length > 0) {
    let cleanName = lines[0]; // Asumimos que el nombre está en la primera línea
    
    // Limpieza agresiva (Regex traducidos de tu Python)
    cleanName = cleanName.replace(/\s*Purchaser\s+\d+\s+Eligible.*/i, '');
    cleanName = cleanName.replace(/Co-Applicant:.*/i, '');
    
    // Convertir a Title Case (Ej: "JUAN PEREZ" -> "Juan Perez")
    data.raw_name_guess = cleanName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  // --- 3. AFFILIATE EXTRACTION ---
  // Lista de patrones para detectar la compañía
  const affiliatePatterns = [
    /Affiliate Marketing Company\s*(.*)/i,
    /Marketing Company\s*(.*)/i,
    /Assigned Company\s*(.*)/i
  ];

  for (const pattern of affiliatePatterns) {
    const match = rawText.match(pattern);
    // match[1] es el grupo capturado (lo que está dentro del paréntesis)
    if (match && match[1].trim().length > 1) {
      data.marketing_company = match[1].trim();
      break; // Encontramos uno, dejamos de buscar
    }
  }

  // --- 4. LANGUAGE EXTRACTION ---
  const langMatch = rawText.match(/Language:\s*(\w+)/i);
  if (langMatch) {
    data.language = langMatch[1];
  }

  return data;
};