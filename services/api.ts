import { LoginCredentials, LoginResponse, NotaEntrada, BonusDetails, CheckBonusItemResponse, OpenBonus, Filial } from '../types';

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

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const baseUrl = localStorage.getItem('apiBaseUrl');
  if (!baseUrl) {
    throw new Error('API Base URL is not configured.');
  }

  const loginUrl = `${baseUrl}/login`;

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        throw await handleApiError(response, 'Login failed.');
    }

    const data: LoginResponse = await response.json();

    if (!data.status || typeof data.status !== 'string') {
        throw new Error('Login failed: Invalid response from server. User code missing.');
    }

    const employeeCode = data.status.trim();
    
    // A valid employee code must be a non-empty string that represents a number.
    // If not, the API is likely returning an error message in the 'status' field.
    if (!employeeCode || isNaN(parseInt(employeeCode, 10))) {
        throw new Error(`Login failed: ${employeeCode || 'Invalid credentials or server error.'}`);
    }
    
    localStorage.setItem('codfunc', employeeCode);

    return data;
  } catch (error) {
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred during login.');
  }
};


export const getNotasEntrada = async (): Promise<NotaEntrada[]> => {
  const baseUrl = localStorage.getItem('apiBaseUrl');
  if (!baseUrl) {
    throw new Error('API Base URL is not configured.');
  }

  const url = `${baseUrl}/notaentrada/`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw await handleApiError(response, 'Failed to fetch data.');
    }

    const data = await response.json();
    return data.items || [];

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while fetching data.');
  }
};

export interface CreateBonusResponse {
  retorno: string;
}

export const createBonus = async (numtransent: number): Promise<CreateBonusResponse> => {
  const baseUrl = localStorage.getItem('apiBaseUrl');
  if (!baseUrl) {
    throw new Error('API Base URL is not configured.');
  }

  const codfunc = localStorage.getItem('codfunc');
  if (!codfunc) {
    throw new Error('Código do funcionário não encontrado. Por favor, faça login novamente.');
  }

  const url = `${baseUrl}/criarbonus`;
  const body = { numtransent: numtransent, codfunc: codfunc };

  // Log the request details for debugging purposes
  console.log('Sending createBonus request:', {
    url: url,
    method: 'POST',
    body: body
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Check for non-OK HTTP status codes (e.g., 4xx, 5xx).
    if (!response.ok) {
        throw await handleApiError(response, 'Failed to create bonus.');
    }
    
    // For any 2xx response, we treat it as a success and return the body.
    const responseText = await response.text();
    try {
        const data: CreateBonusResponse = JSON.parse(responseText);
        return data;

    } catch (e) {
        // This catches JSON parsing errors.
        const errorMessage = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to process server response. Details: ${errorMessage}. Raw Response: ${responseText}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while creating the bonus.');
  }
};

export const getOpenBonuses = async (numbonus?: string): Promise<OpenBonus[]> => {
    const baseUrl = localStorage.getItem('apiBaseUrl');
    if (!baseUrl) throw new Error('API Base URL is not configured.');

    const url = numbonus ? `${baseUrl}/conferirbonus/${numbonus}` : `${baseUrl}/conferirbonus`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw await handleApiError(response, 'Failed to fetch open bonuses.');
        }
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred while fetching open bonuses.');
    }
};

export const getBonusDetails = async (numbonus: string): Promise<BonusDetails> => {
  const baseUrl = localStorage.getItem('apiBaseUrl');
  if (!baseUrl) {
    throw new Error('API Base URL is not configured.');
  }
  const url = `${baseUrl}/conferirbonus/${numbonus}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw await handleApiError(response, 'Failed to fetch bonus details.');
    }
    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Bônus não encontrado ou não contém itens.');
    }
    
    return {
      numbonus: data.items[0].numbonus,
      items: data.items.map((item: any) => ({
        codprod: item.codprod,
        produto: item.descricao,
        qt: item.qtentrada,
        qtconferida: item.qtconf || 0,
      })),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while fetching bonus details.');
  }
};

export const checkBonusItem = async (numbonus: number, codauxiliar: string, peso: number): Promise<CheckBonusItemResponse> => {
    const baseUrl = localStorage.getItem('apiBaseUrl');
    if (!baseUrl) throw new Error('API Base URL is not configured.');

    const url = `${baseUrl}/conferirbonus/${numbonus}`;
    const body = {
        ean: codauxiliar,
        qtconf: peso
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw await handleApiError(response, 'Failed to check item.');
        }

        const data: CheckBonusItemResponse = await response.json();
        return data;

    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred during item check.');
    }
};

export const cancelBonusCheck = async (numbonus: number): Promise<CreateBonusResponse> => {
    const baseUrl = localStorage.getItem('apiBaseUrl');
    if (!baseUrl) throw new Error('API Base URL is not configured.');

    const url = `${baseUrl}/conferirbonus/${numbonus}`;
    
    try {
        const response = await fetch(url, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw await handleApiError(response, 'Failed to cancel bonus check.');
        }
        
        const responseText = await response.text();

        // Handle successful responses that have no JSON body (common for DELETE)
        if (!responseText) {
            return { retorno: 'Conferência cancelada com sucesso.' };
        }
        
        // If there's a response body, try to parse it as JSON.
        // If it fails, treat the plain text as the return message.
        try {
            return JSON.parse(responseText);
        } catch (e) {
            return { retorno: responseText };
        }

    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred while canceling bonus check.');
    }
};

export const finalizeBonusCheck = async (numbonus: number): Promise<CreateBonusResponse> => {
    const baseUrl = localStorage.getItem('apiBaseUrl');
    if (!baseUrl) throw new Error('API Base URL is not configured.');

    const codfunc = localStorage.getItem('codfunc');
    if (!codfunc) {
        throw new Error('Código do funcionário não encontrado. Por favor, faça login novamente.');
    }

    const url = `${baseUrl}/conferirbonus/${numbonus}`;
    
    const body = {
        numbonus: numbonus,
        codfunc: codfunc,
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw await handleApiError(response, 'Failed to finalize bonus check.');
        }
        
        const responseText = await response.text();

        if (!responseText) {
            return { retorno: 'Conferência finalizada com sucesso.' };
        }
        
        try {
            const data: CreateBonusResponse = JSON.parse(responseText);
            return data;
        } catch (e) {
            return { retorno: responseText };
        }

    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred while finalizing bonus check.');
    }
};

export const getFiliais = async (): Promise<Filial[]> => {
    const baseUrl = localStorage.getItem('apiBaseUrl');
    if (!baseUrl) throw new Error('API Base URL is not configured.');

    const url = `${baseUrl}/LISTAFILIAL`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw await handleApiError(response, 'Failed to fetch filiais.');
        }
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred while fetching filiais.');
    }
};