import { LoginCredentials, LoginResponse, NotaEntrada, BonusDetails, CheckBonusItemResponse, OpenBonus, Filial, ProdutoCheckIn, Pedido } from '../types';

const handleApiError = async (response: Response, failureMessage: string): Promise<Error> => {
    let errorDetails = `Status: ${response.status} ${response.statusText}.`;
    try {
        const errorBodyText = await response.text();
        if (errorBodyText) {
            // Append the raw text response for complete debugging context.
            errorDetails += ` Response: ${errorBodyText}`;
        }
    } catch (e) {
        // Could not read response body, stick with status text.
    }
    return new Error(`${failureMessage} ${errorDetails}`);
};

const getBaseUrl = (): string => {
    const baseUrl = localStorage.getItem('apiBaseUrl');
    if (!baseUrl) {
        throw new Error('API Base URL is not configured.');
    }
    return baseUrl;
}

const getCodfunc = (): string => {
    const codfunc = localStorage.getItem('codfunc');
    if (!codfunc) {
        throw new Error('User code (codfunc) not found. Please log in again.');
    }
    return codfunc;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const baseUrl = getBaseUrl();
  const loginUrl = `${baseUrl}/login`;

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw await handleApiError(response, 'Login failed.');
    }

    const data: LoginResponse = await response.json();
    if (data && data.status) {
        // Assuming status contains the employee code (codfunc)
        localStorage.setItem('codfunc', data.status);
    } else {
        throw new Error('Login response did not contain a valid status (codfunc).');
    }
    return data;
  } catch (error) {
    if (error instanceof Error) {
        throw new Error(`Network or other error during login: ${error.message}`);
    }
    throw new Error('An unknown error occurred during login.');
  }
};

export const getNotasEntrada = async (): Promise<NotaEntrada[]> => {
    const response = await fetch(`${getBaseUrl()}/notas_entrada?codfunc=${getCodfunc()}`);
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch entry notes.');
    const data = await response.json();
    return data.items || [];
}

export const createBonus = async (numtransent: number): Promise<{ retorno: string }> => {
    const response = await fetch(`${getBaseUrl()}/criar_bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numtransent, codfunc: getCodfunc() }),
    });
    if (!response.ok) throw await handleApiError(response, 'Failed to create bonus.');
    return response.json();
}

export const getOpenBonuses = async (numbonus?: string): Promise<OpenBonus[]> => {
    const url = new URL(`${getBaseUrl()}/bonus_abertos`);
    url.searchParams.append('codfunc', getCodfunc());
    if (numbonus) {
        url.searchParams.append('numbonus', numbonus);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch open bonuses.');
    const data = await response.json();
    return data.items || [];
}

export const getBonusDetails = async (numbonus: string): Promise<BonusDetails> => {
    const response = await fetch(`${getBaseUrl()}/bonus_detalhes?numbonus=${numbonus}&codfunc=${getCodfunc()}`);
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch bonus details.');
    const data = await response.json();
    // API returns a single object, not in an 'items' array.
    return data;
}

export const checkBonusItem = async (numbonus: number, codauxiliar: string, qt: number): Promise<CheckBonusItemResponse> => {
    const response = await fetch(`${getBaseUrl()}/conferir_item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numbonus, codauxiliar, qt, codfunc: getCodfunc() }),
    });
    if (!response.ok) throw await handleApiError(response, 'Failed to check bonus item.');
    return response.json();
}

export const finalizeBonusCheck = async (numbonus: number): Promise<{ retorno: string }> => {
    const response = await fetch(`${getBaseUrl()}/finalizar_conferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numbonus, codfunc: getCodfunc() }),
    });
    if (!response.ok) throw await handleApiError(response, 'Failed to finalize bonus check.');
    return response.json();
}

export const cancelBonusCheck = async (numbonus: number): Promise<{ retorno: string }> => {
    const response = await fetch(`${getBaseUrl()}/cancelar_conferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numbonus, codfunc: getCodfunc() }),
    });
    if (!response.ok) throw await handleApiError(response, 'Failed to cancel bonus check.');
    return response.json();
}

export const getFiliais = async (): Promise<Filial[]> => {
    const response = await fetch(`${getBaseUrl()}/filiais`);
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch filiais.');
    const data = await response.json();
    return data.items || [];
}

export const getProdutosCheckIn = async (codfilial: string): Promise<ProdutoCheckIn[]> => {
    const response = await fetch(`${getBaseUrl()}/check-in/${codfilial}`);
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch products for check-in.');
    const data = await response.json();
    return data.items || [];
}

export const getPedido = async (numped: string): Promise<Pedido> => {
    const response = await fetch(`${getBaseUrl()}/pedido/${numped}`);
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch order details.');
    const data = await response.json();
    if (data.items && data.items.length > 0) {
        return data.items[0];
    }
    // Throw a more specific error if the array is empty, which means not found.
    throw new Error('Pedido não encontrado.');
}