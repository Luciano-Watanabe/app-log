import React, { useState } from 'react';
import { login } from '../services/api';
import Spinner from './Spinner';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
  onChangeUrl: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onChangeUrl }) => {
  const [usuario, setUsuario] = useState('usuário');
  const [senha, setSenha] = useState('senha');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ usuario, senha });
      onLoginSuccess(usuario);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-400 mt-2">Sign in to continue</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="usuario" className="block text-sm font-medium text-gray-300 mb-2">
                User
            </label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <input
                    id="usuario"
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
            </div>
        </div>
        <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-300 mb-2">
                Password
            </label>
            <div className="relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
            </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">{error}</p>}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          {isLoading ? <Spinner /> : 'Login'}
        </button>
      </form>
       <div className="mt-6 text-center">
        <button onClick={onChangeUrl} className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
          Change API URL
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;