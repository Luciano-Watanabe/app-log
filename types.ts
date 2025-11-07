export interface LoginCredentials {
  usuario: string;
  senha?: string; // It's common for password to be optional during some validation phases.
}

export interface LoginResponse {
  status: string; // Status will now contain the employee code (codfunc).
}

export type Screen = 'home' | 'createBonus' | 'checkBonus' | 'openBonusList' | 'storage' | 'consultarPedido' | 'consultarEmbalagem' | 'diaADia';

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
  descricao: string;
  qtentrada: number;
  qtconf: number | null;
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

export interface Filial {
  codigo: string;
  nomefilial: string;
}

export interface ProdutoCheckIn {
  apto_id: number;
  codprod: number;
  descricao: string;
  qtd: number;
  numbonus: number;
  lote: string;
  dtvalid: string;
  codfilial: string;
}

export interface Pedido {
    numped: number;
    data: string;
    vendedor: string;
    cliente: string;
    valor: number;
    posicao: string;
    dtfat?: string;
    dtinicio?: string;
    dtfim?: string;
}

export interface ProdutoEmbalagem {
  codprod: number;
  descricao: string;
  codfab: string;
  ean_cad: number;
  dun_cad: number;
  codfilial: string;
  unidade: string;
  embalagem: string;
  ean_embalagem: number;
  estoque: number;
}

export interface DiaADiaTarefa {
  tarefa_id: number;
  descricao: string;
  rotina: string;
  status: string;
}