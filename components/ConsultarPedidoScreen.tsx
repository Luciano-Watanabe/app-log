import React, { useState } from 'react';
import { getPedido } from '../services/api';
import { Pedido } from '../types';
import Spinner from './Spinner';

interface ConsultarPedidoScreenProps {
  onBack: () => void;
}

const ConsultarPedidoScreen: React.FC<ConsultarPedidoScreenProps> = ({ onBack }) => {
  const [numpedInput, setNumpedInput] = useState('');
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numpedInput.trim()) return;
    
    setLoading(true);
    setError(null);
    setPedido(null);

    try {
      const data = await getPedido(numpedInput.trim());
      setPedido(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      // API might return 'YYYY-MM-DDTHH:mm:ss'
      const date = new Date(dateString.split('T')[0]);
      // Adjust for timezone issues if date is parsed as UTC
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return new Intl.DateTimeFormat('pt-BR').format(new Date(date.getTime() + userTimezoneOffset));
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Consultar Pedido</h1>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
          Voltar
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="number"
          placeholder="Digite o número do pedido..."
          value={numpedInput}
          onChange={(e) => setNumpedInput(e.target.value)}
          className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={loading}
        />
        <button 
            type="submit" 
            disabled={loading || !numpedInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center min-w-[120px]"
        >
          {loading ? <Spinner className="w-5 h-5"/> : 'Buscar'}
        </button>
      </form>

      <div className="min-h-[200px]">
        {loading && <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>}
        
        {error && <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>}
        
        {pedido && (
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Detalhes do Pedido</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-300">
                <div><strong className="text-gray-400 block">Nº Pedido:</strong> <span className="text-white font-semibold">{pedido.numped}</span></div>
                <div><strong className="text-gray-400 block">Data:</strong> {formatDate(pedido.data)}</div>
                <div><strong className="text-gray-400 block">Posição:</strong> {pedido.posicao}</div>
                <div><strong className="text-gray-400 block">Valor:</strong> <span className="text-green-400 font-semibold">{formatCurrency(pedido.valor)}</span></div>
                <div className="sm:col-span-2"><strong className="text-gray-400 block">Cliente:</strong> {pedido.cliente}</div>
                <div className="sm:col-span-2"><strong className="text-gray-400 block">Vendedor:</strong> {pedido.vendedor}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultarPedidoScreen;