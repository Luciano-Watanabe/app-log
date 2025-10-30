import { LoginCredentials, LoginResponse, NotaEntrada } from '../types';

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
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || JSON.stringify(errorBody);
        } catch (e) {
            // Ignore if response is not json
        }
      throw new Error(`Login failed. ${errorMessage}`);
    }

    const data: LoginResponse = await response.json();

    if (data.status !== 'OK') {
        throw new Error('Login failed: Invalid credentials or server error.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
        throw new Error(`Network error or server is not reachable. Details: ${error.message}`);
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
      let errorMessage = `Error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || JSON.stringify(errorBody);
      } catch (e) {
        // Ignore if response is not json
      }
      throw new Error(`Failed to fetch data. ${errorMessage}`);
    }

    const data = await response.json();
    return data.items || [];

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error or server is not reachable. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching data.');
  }
};

export interface CreateBonusResponse {
  status: string;
  message: string;
}

export const createBonus = async (numtransent: number): Promise<CreateBonusResponse> => {
  const baseUrl = localStorage.getItem('apiBaseUrl');
  if (!baseUrl) {
    throw new Error('API Base URL is not configured.');
  }

  const url = `${baseUrl}/criarbonus/${numtransent}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || JSON.stringify(errorBody);
        } catch (e) {
            // Ignore if response is not json
        }
      throw new Error(`Failed to create bonus. ${errorMessage}`);
    }

    const data: CreateBonusResponse = await response.json();

    if (data.status !== 'OK') {
        throw new Error(`Failed to create bonus: ${data.message || 'Server returned an error.'}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error or server is not reachable. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while creating the bonus.');
  }
};
