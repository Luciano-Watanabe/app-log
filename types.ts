export interface LoginCredentials {
  usuario: string;
  senha?: string; // It's common for password to be optional during some validation phases.
}

export interface LoginResponse {
  status: string; // Status will now contain the employee code (codfunc).
}

export type Screen = 'home' | 'createBonus' | 'checkBonus' | 'openBonusList';

export interface NotaEntrada {
  codfilial: string;
  numnota: number;
  dtent: string;
  dtemissao: string;
  codfornec: number;
  fornecedor: string;
  numtransent: number;
}

export interface OpenBonus {
  numbonus: number;
  dtbonus: string;
  fornecedor: string;
}

// Interfaces for Bonus Checking
export interface BonusItem {
  codprod: number;
  produto: string;
  qt: number;
  qtconferida: number;
  codauxiliar?: string;
}

export interface BonusDetails {
  numbonus: number;
  items: BonusItem[];
}

export interface CheckBonusItemResponse {
  retorno: string;
  qtconferida?: number;
}