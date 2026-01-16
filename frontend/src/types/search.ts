export interface Creditor {
  id: number;
  name: string;
  abreviation: string;
}

export interface BatchFoundItem {
  input: string; // Lo que pegó el usuario (ej: "CHASE - $50")
  code: string;  // El código limpio (ej: "CHASE")
  name: string;  // El nombre oficial
}

export interface BatchResponse {
  found: BatchFoundItem[];
  unknown: string[];
}