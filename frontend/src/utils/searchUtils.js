const IGNORED_TOKENS = ["CREDITOR", "ACCOUNT", "BALANCE", "DEBT", "AMOUNT", "TOTAL"];

export const sanitizeInput = (rawText) => {
    if (!rawText) return "";
    
    // Split by tabs or multiple spaces (Excel/CRM format)
    let parts = rawText.split(/\t|\s{2,}/);
    let baseText = parts[0].trim();
    
    // Cut the string at the first digit or dollar sign
    const match = baseText.match(/(\d|\$)/);
    if (match) {
        baseText = baseText.substring(0, match.index).trim();
    }
    
    // Normalize spaces and convert to upper case
    const cleanText = baseText.replace(/\s+/g, ' ').toUpperCase();
    
    // Check against ignored tokens
    if (!cleanText || cleanText.length < 2 || IGNORED_TOKENS.includes(cleanText)) {
        return null;
    }
    return cleanText;
};