import { LoginCredentials, LoginResponse, NotaEntrada, BonusDetails, CheckBonusItemResponse, OpenBonus, Filial, ProdutoCheckIn, Pedido, ProdutoEmbalagem, DiaADiaTarefa } from '../types';

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

const getCodfunc = (): number => {
    const codfuncStr = localStorage.getItem('codfunc');
    if (!codfuncStr) {
        throw new Error('User code (codfunc) not found. Please log in again.');
    }
    const codfuncNum = Number(codfuncStr);
    if (isNaN(codfuncNum)) {
        throw new Error(`Stored user code (codfunc) is not a valid number: "${codfuncStr}". Please log in again.`);
    }
    return codfuncNum;
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
        const codfunc = Number(data.status);
        if (!isNaN(codfunc) && codfunc > 0) {
            localStorage.setItem('codfunc', data.status);
        } else {
            // Treat status "0" or non-numeric as a failed login, even with a 200 OK response.
            throw new Error('Usuário ou senha inválidos.');
        }
    } else {
        throw new Error('Login response did not contain a valid status (codfunc).');
    }
    return data;
  } catch (error) {
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred during login.');
  }
};

export const getNotasEntrada = async (): Promise<NotaEntrada[]> => {
    const response = await fetch(`${getBaseUrl()}/notaentrada/?codfunc=${getCodfunc()}`);
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch entry notes.');
    const data = await response.json();
    return data.items || [];
}

export const createBonus = async (numtransent: number): Promise<{ retorno: string }> => {
    const response = await fetch(`${getBaseUrl()}/criarbonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numtransent, codfunc: getCodfunc() }),
    });
    if (!response.ok) throw await handleApiError(response, 'Failed to create bonus.');
    return response.json();
}

export const getOpenBonuses = async (numbonus?: string): Promise<OpenBonus[]> => {
    const url = new URL(`${getBaseUrl()}/bonus_abertos`);
    url.searchParams.append('codfunc', String(getCodfunc()));
    if (numbonus) {
        url.searchParams.append('numbonus', numbonus);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch open bonuses.');
    const data = await response.json();
    return data.items || [];
}

export const getBonusDetails = async (numbonus: string): Promise<BonusDetails> => {
    const response = await fetch(`${getBaseUrl()}/conferirbonus/${numbonus}`);
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch bonus details.');
    const data = await response.json();
    
    if (!data || !data.items) {
        return { numbonus: Number(numbonus), items: [] };
    }
    
    // The top-level numbonus can be taken from the first item or the input string.
    const bonusNumber = data.items.length > 0 ? data.items[0].numbonus : Number(numbonus);
    
    return {
        numbonus: bonusNumber,
        items: data.items,
    };
}

export const checkBonusItem = async (numbonus: number, ean: string, qtconf: number, numlote: string, dtvalidade: string): Promise<CheckBonusItemResponse> => {
    let formattedDate = dtvalidade;
    // The date from <input type="date"> is in 'YYYY-MM-DD' format.
    // We convert it to 'DD/MM/YYYY' for the API.
    if (dtvalidade && dtvalidade.includes('-')) {
        const [year, month, day] = dtvalidade.split('-');
        if (day && month && year) {
            formattedDate = `${day}/${month}/${year}`;
        }
    }

    const response = await fetch(`${getBaseUrl()}/conferirbonus/${numbonus}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ean, qtconf, numlote, dtvalidade: formattedDate }),
    });
    if (!response.ok) throw await handleApiError(response, 'Failed to check bonus item.');
    return response.json();
}

export const finalizeBonusCheck = async (numbonus: number): Promise<{ retorno: string }> => {
    const response = await fetch(`${getBaseUrl()}/conferirbonus/${numbonus}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codfunc: getCodfunc() }),
    });
    if (!response.ok) throw await handleApiError(response, 'Failed to finalize bonus check.');
    return response.json();
}

export const cancelBonusCheck = async (numbonus: number): Promise<{ retorno: string }> => {
    const response = await fetch(`${getBaseUrl()}/conferirbonus/${numbonus}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw await handleApiError(response, 'Failed to cancel bonus check.');

    // A successful DELETE might have no body (204 No Content)
    if (response.status === 204) {
        return { retorno: 'Conferência cancelada com sucesso.' };
    }
    
    // Or it might have a body with a success message (e.g. 200 OK)
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

export const getPedidos = async (): Promise<Pedido[]> => {
    const response = await fetch(`${getBaseUrl()}/pedido`);
    if (!response.ok) throw await handleApiError(response, 'Failed to fetch order list.');
    const data = await response.json();

    const rawPedidos: any[] = data.items || [];
    return rawPedidos.map(p => ({
        numped: p.numped,
        data: p.data,
        vendedor: p.nome,
        cliente: p.cliente,
        valor: p.vlatend,
        posicao: p.posicao,
        dtfat: p.dtfat,
        dtinicio: p.dtinicio,
        dtfim: p.dtfim,
    }));
}

export const getEmbalagemDetails = async (ean: string): Promise<ProdutoEmbalagem[]> => {
    const response = await fetch(`${getBaseUrl()}/embalagem/${ean}`);
    if (!response.ok) {
        if (response.status === 404) {
            // Treat "not found" as an empty result set, not an error.
            return [];
        }
        throw await handleApiError(response, 'Falha ao consultar embalagem.');
    }
    const data = await response.json();
    // The response has an 'items' property which is an array
    return data.items || [];
}

export const getTarefasDiaADia = async (): Promise<DiaADiaTarefa[]> => {
    const response = await fetch(`${getBaseUrl()}/dia-a-dia/${getCodfunc()}`);
    if (!response.ok) throw await handleApiError(response, 'Falha ao buscar tarefas do dia-a-dia.');
    const data = await response.json();
    return data.items || [];
}

export const executarTarefaDiaADia = async (descricao: string, status: string): Promise<{ retorno: string }> => {
    const response = await fetch(`${getBaseUrl()}/dia-a-dia/${getCodfunc()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao, status }),
    });
    if (!response.ok) throw await handleApiError(response, 'Falha ao executar a tarefa.');
    
    const responseText = await response.text();

    // If the response body is empty, which is common for successful POST/PUT/DELETE,
    // return a default success message as the operation was successful.
    if (!responseText) {
        return { retorno: 'Ação executada com sucesso.' };
    }

    try {
        // If there is a response body, try to parse it as JSON.
        return JSON.parse(responseText);
    } catch (e) {
        // If the server returns a non-empty, non-JSON response, it's an unexpected API behavior.
        // It's better to throw an error to make it clear that the response format is wrong.
        throw new Error(`Resposta inválida do servidor. Esperado JSON, mas recebido: ${responseText}`);
    }
}