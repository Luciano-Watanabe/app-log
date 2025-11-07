import React, { useState, useEffect, useMemo } from 'react';
import { getPedidos } from '../services/api';
import { Pedido } from '../types';
import Spinner from './Spinner';

interface ConsultarPedidoScreenProps {
  onBack: () => void;
  username: string | null;
}

const PedidoDetailsModal: React.FC<{ pedido: Pedido; onClose: () => void }> = ({ pedido, onClose }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';

        // Se a data já estiver no formato DD/MM/YYYY, retorne diretamente.
        if (dateString.includes('/')) {
            return dateString;
        }

        try {
            // Caso contrário, formate a partir do formato YYYY-MM-DD...
            const datePart = dateString.split('T')[0];
            const [year, month, day] = datePart.split('-');
            if (day && month && year) {
                return `${day}/${month}/${year}`;
            }
            // Se a formatação falhar, retorna a data original para inspeção.
            return dateString;
        } catch {
            // Em caso de erro, retorna a data original.
            return dateString;
        }
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
                <div><strong className="text-gray-400 block">Data Emissão:</strong> {formatDate(pedido.data)}</div>
                <div><strong className="text-gray-400 block">Status:</strong> {pedido.posicao}</div>
                <div><strong className="text-gray-400 block">Praça:</strong> {pedido.praca}</div>
                <div><strong className="text-gray-400 block">Dt. Faturamento:</strong> {formatDate(pedido.dtfat)}</div>
                <div><strong className="text-gray-400 block">Início Separação:</strong> {formatDate(pedido.dtinicio)}</div>
                <div><strong className="text-gray-400 block">Fim Separação:</strong> {formatDate(pedido.dtfim)}</div>
                <div className="sm:col-span-2"><strong className="text-gray-400 block">Valor:</strong> <span className="text-green-400 font-semibold">{formatCurrency(pedido.valor)}</span></div>
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


const ConsultarPedidoScreen: React.FC<ConsultarPedidoScreenProps> = ({ onBack, username }) => {
  const [allPedidos, setAllPedidos] = useState<Pedido[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  
  const [searchInput, setSearchInput] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');
  const [pracaFilter, setPracaFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const positionOptions = useMemo(() => {
    const positions = new Set(allPedidos.map(p => p.posicao).filter(Boolean));
    return Array.from(positions).sort();
  }, [allPedidos]);

  const salespersonOptions = useMemo(() => {
    const salespeople = new Set(allPedidos.map(p => p.vendedor).filter(Boolean));
    return Array.from(salespeople).sort();
  }, [allPedidos]);


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

  useEffect(() => {
    const lowercasedFilter = searchInput.toLowerCase();
    const lowercasedPracaFilter = pracaFilter.toLowerCase();
    const filtered = allPedidos.filter(pedido => {
      const matchesSearch = pedido.numped.toString().includes(lowercasedFilter);
      const matchesPosition = positionFilter ? pedido.posicao === positionFilter : true;
      const matchesSalesperson = salespersonFilter ? pedido.vendedor === salespersonFilter : true;
      const matchesPraca = pracaFilter ? (pedido.praca || '').toLowerCase().includes(lowercasedPracaFilter) : true;
      return matchesSearch && matchesPosition && matchesSalesperson && matchesPraca;
    });
    setFilteredPedidos(filtered);
  }, [searchInput, positionFilter, salespersonFilter, pracaFilter, allPedidos]);

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const getStatusBadge = (posicao?: string) => {
    if (!posicao) return null;
    const lowerPosicao = posicao.toLowerCase();
    let colorClasses = 'bg-gray-600 text-gray-200'; // default

    if (lowerPosicao.includes('liberado')) colorClasses = 'bg-green-600 text-white';
    else if (lowerPosicao.includes('bloqueado')) colorClasses = 'bg-red-600 text-white';
    else if (lowerPosicao.includes('faturado')) colorClasses = 'bg-blue-600 text-white';
    else if (lowerPosicao.includes('pendente')) colorClasses = 'bg-yellow-500 text-yellow-900';
    else if (lowerPosicao.includes('cancelado')) colorClasses = 'bg-red-800 text-red-100';
    
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
            {posicao}
        </span>
    );
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
        {filteredPedidos.map(pedido => (
          <li key={pedido.numped} className="w-full bg-gray-700/80 hover:bg-gray-700 p-4 rounded-lg text-left transition duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex-grow">
              <p className="font-bold text-lg text-white">
                Pedido: {pedido.numped}
                {pedido.praca && <span className="text-gray-400 font-normal text-base ml-2">({pedido.praca})</span>}
              </p>
              <p className="text-sm text-gray-300 truncate max-w-xs">{pedido.cliente}</p>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="text-left sm:text-right mr-4">
                    <p className="text-sm font-semibold text-green-400">{formatCurrency(pedido.valor)}</p>
                    <div className="mt-1">{getStatusBadge(pedido.posicao)}</div>
                </div>
                <button
                    onClick={() => setSelectedPedido(pedido)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-lg transition duration-200 flex-shrink-0"
                >
                    Detalhes
                </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };
  
  return (
    <>
      {selectedPedido && <PedidoDetailsModal pedido={selectedPedido} onClose={() => setSelectedPedido(null)} />}
      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-x-3">
                <h1 className="text-2xl font-bold text-white">Consultar Pedido</h1>
                {username && <span className="px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-full">{username}</span>}
            </div>
          <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
            Voltar
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="number"
            placeholder="Filtrar por nº do pedido..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Filtrar por praça..."
            value={pracaFilter}
            onChange={(e) => setPracaFilter(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <select 
            value={positionFilter} 
            onChange={e => setPositionFilter(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || positionOptions.length === 0}
          >
            <option value="">Todas as Posições</option>
            {positionOptions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
          <select 
            value={salespersonFilter}
            onChange={e => setSalespersonFilter(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || salespersonOptions.length === 0}
          >
            <option value="">Todos os Vendedores</option>
            {salespersonOptions.map(vendedor => <option key={vendedor} value={vendedor}>{vendedor}</option>)}
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