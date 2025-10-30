export interface LoginCredentials {
  usuario: string;
  senha?: string; // It's common for password to be optional during some validation phases.
}

export interface LoginResponse {
  status: string;
  // Potentially other fields like token, user info etc.
}

export type Screen = 'home' | 'createBonus';

export interface NotaEntrada {
  codfilial: string;
  numnota: number;
  dtent: string;
  dtemissao: string;
  codfornec: number;
  fornecedor: string;
  numtransent: number;
}
