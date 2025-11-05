import React, { useState, useEffect, useMemo } from 'react';
import { getPedidos } from '../services/api';
import { Pedido } from '../types';
import Spinner from './Spinner';

interface ConsultarPedidoScreenProps {
  onBack: () => void;
}

const PedidoDetailsModal: React.FC<{ pedido: Pedido; onClose: () => void }> = ({ pedido, onClose }) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const datePart = dateString.split('T')[0];
        const parts = datePart.split('-');

        // Handle invalid or null-like dates (e.g., "0000-00-00")
        if (parts.length !== 3 || parts[0] === '0000') {
            return 'N/A';
        }

        const [year, month, day] = parts.map(Number);
        
        // Create a UTC date to avoid timezone-related off-by-one errors.
        const date = new Date(Date.UTC(year, month - 1, day));
        
        if (isNaN(date.getTime())) {
            return 'Data Inválida';
        }
        
        return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
    };

    const formatCurrency = (value: number) => {
        if (typeof value !== 'number') return 'N/A';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Detalhes do Pedido</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-300">
                <div><strong className="text-gray-400 block">Nº Pedido:</strong> <span className="text-white font-semibold">{pedido.numped}</span></div>
                <div><strong className="text-gray-400 block">Data:</strong> {formatDate(pedido.data)}</div>
                <div><strong className="text-gray-400 block">Posição:</strong> {pedido.posicao}</div>
                <div><strong className="text-gray-400 block">Data Fat.:</strong> {formatDate(pedido.dtfat || '')}</div>
                <div><strong className="text-gray-400 block">Status:</strong> <span className="font-semibold text-yellow-300">{pedido.status}</span></div>
                <div><strong className="text-gray-400 block">Início Separação:</strong> {formatDate(pedido.dtinicio || '')}</div>
                <div><strong className="text-gray-400 block">Fim Separação:</strong> {formatDate(pedido.dtfim || '')}</div>
                <div className="sm:col-span-2 pt-2 border-t border-gray-700"><strong className="text-gray-400 block">Valor:</strong> <span className="text-green-400 font-semibold">{formatCurrency(pedido.valor)}</span></div>
                <div className="sm:col-span-2"><strong className="text-gray-400 block">Cliente:</strong> {pedido.cliente}</div>
                <div className="sm:col-span-2"><strong className="text-gray-400 block">Vendedor:</strong> {pedido.vendedor}</div>
            </div>
        </div>
         <div className="mt-6 text-right">
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-200">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};


const ConsultarPedidoScreen: React.FC<ConsultarPedidoScreenProps> = ({ onBack }) => {
  const [allPedidos, setAllPedidos] = useState<Pedido[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedPosicao, setSelectedPosicao] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPedidos();
        setAllPedidos(data);
        setFilteredPedidos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const posicoesUnicas = useMemo(() => {
    const posicoes = allPedidos.map(p => p.posicao).filter(Boolean);
    return [...new Set(posicoes)].sort();
  }, [allPedidos]);

  useEffect(() => {
    const lowercasedFilter = searchInput.toLowerCase();
    const filtered = allPedidos.filter(pedido => {
      const numpedMatch = pedido.numped.toString().includes(lowercasedFilter);
      const posicaoMatch = selectedPosicao ? pedido.posicao === selectedPosicao : true;
      return numpedMatch && posicaoMatch;
    });
    setFilteredPedidos(filtered);
  }, [searchInput, selectedPosicao, allPedidos]);

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-');

    // Handle invalid or null-like dates (e.g., "0000-00-00")
    if (parts.length !== 3 || parts[0] === '0000') {
        return null;
    }
    
    const [year, month, day] = parts.map(Number);
    
    // Create a UTC date to avoid timezone-related off-by-one errors.
    const date = new Date(Date.UTC(year, month - 1, day));
    
    if (isNaN(date.getTime())) {
        return null;
    }
    
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>;
    }
    if (error) {
      return <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>;
    }
    if (filteredPedidos.length === 0) {
      return <p className="text-center py-8 text-gray-400">Nenhum pedido encontrado com os critérios de busca.</p>;
    }
    return (
      <ul className="space-y-3">
        {filteredPedidos.map(pedido => {
          const dtfatFormatted = formatDate(pedido.dtfat);
          return (
            <li key={pedido.numped} className="w-full bg-gray-700/80 hover:bg-gray-700 p-4 rounded-lg text-left transition duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-grow">
                <p className="font-bold text-lg text-white">Pedido: {pedido.numped}</p>
                <p className="text-sm text-gray-300 truncate max-w-xs">{pedido.cliente}</p>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto">
                  <div className="text-left sm:text-right mr-4">
                      <p className="text-sm font-semibold text-green-400">{formatCurrency(pedido.valor)}</p>
                      <div className="flex items-center justify-start sm:justify-end gap-2 mt-1">
                         <p className="text-xs text-gray-400">
                           {pedido.posicao}
                           {dtfatFormatted && ` | ${dtfatFormatted}`}
                         </p>
                         <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">{pedido.status}</span>
                      </div>
                  </div>
                  <button
                      onClick={() => setSelectedPedido(pedido)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-lg transition duration-200 flex-shrink-0"
                  >
                      Detalhes
                  </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };
  
  return (
    <>
      {selectedPedido && <PedidoDetailsModal pedido={selectedPedido} onClose={() => setSelectedPedido(null)} />}
      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-3xl animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Consultar Pedido</h1>
          <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
            Voltar
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Filtrar por número do pedido..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <select
            value={selectedPosicao}
            onChange={(e) => setSelectedPosicao(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || posicoesUnicas.length === 0}
          >
            <option value="">Todas as Posições</option>
            {posicoesUnicas.map(posicao => (
              <option key={posicao} value={posicao}>{posicao}</option>
            ))}
          </select>
        </div>

        <div className="min-h-[300px] max-h-[60vh] overflow-y-auto pr-2">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default ConsultarPedidoScreen;