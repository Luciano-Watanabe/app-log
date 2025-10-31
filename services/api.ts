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
      body: JSON.stringify(credentials