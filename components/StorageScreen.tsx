import React, { useState, useEffect, useCallback } from 'react';
import { getFiliais, getProdutosCheckIn, getArmazenamentosEmExecucao, getArmazenamentoDetalhe } from '../services/api';
import { Filial, ProdutoCheckIn, ArmazenamentoExecucao, ArmazenamentoDetalhe } from '../types';
import Spinner from './Spinner';

interface StorageScreenProps {
  onBack: () => void;
  username: string | null;
}

type StorageView = 'SELECT_FILIAL' | 'SELECT_PRODUTOS' | 'VIEW_ARMAZENAMENTO';

const StorageScreen: React.FC<StorageScreenProps> = ({ onBack, username }) => {
  const [view, setView] = useState<StorageView>('SELECT_FILIAL');

  // Filial selection state
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [selectedFilial, setSelectedFilial] = useState<string>('');
  const [loadingFiliais, setLoadingFiliais] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Armazenamento em execução state
  const [armazenamentos, setArmazenamentos] = useState<ArmazenamentoExecucao[]>([]);
  const [loadingArmazenamentos, setLoadingArmazenamentos] = useState(true);

  // Armazenamento detail view state
  const [viewedArmazenamento, setViewedArmazenamento] = useState<{ detalhe: ArmazenamentoDetalhe; nome_guerra: string } | null>(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);


  // Product selection state
  const [produtos, setProdutos] = useState<ProdutoCheckIn[]>([]);
  // Use a unique ID string for selection state to handle duplicate codprods.
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingFiliais(true);
      setLoadingArmazenamentos(true);
      setError(null);
      try {
        const [filiaisData, armazenamentosData] = await Promise.all([
          getFiliais(),
          getArmazenamentosEmExecucao()
        ]);
        setFiliais(filiaisData);
        setArmazenamentos(armazenamentosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao buscar dados iniciais.');
      } finally {
        setLoadingFiliais(false);
        setLoadingArmazenamentos(false);
      }
    };
    if (view === 'SELECT_FILIAL') {
      fetchInitialData();
    }
  }, [view]);

  const handleSelectFilial = async () => {
    if (!selectedFilial) return;
    setLoadingProdutos(true);
    setError(null);
    try {
      const data = await getProdutosCheckIn(selectedFilial);
      if (data.length === 0) {
        setError('Nenhum produto encontrado para armazenamento nesta filial.');
      } else {
        setProdutos(data);
        setView('SELECT_PRODUTOS');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar produtos.');
    } finally {
      setLoadingProdutos(false);
    }
  };

  const handleViewArmazenamento = async (item: ArmazenamentoExecucao) => {
    setLoadingDetalhe(true);
    setError(null);
    try {
      const detalhe = await getArmazenamentoDetalhe(item.id);
      setViewedArmazenamento({ detalhe, nome_guerra: item.nome_guerra });
      setView('VIEW_ARMAZENAMENTO');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar detalhes do armazenamento.');
    } finally {
      setLoadingDetalhe(false);
    }
  };

  // Creates a unique identifier for a product row based on codprod, lote, and dtvalid.
  const makeUniqueId = (produto: ProdutoCheckIn): string => {
    return `${produto.codprod}-${produto.lote}-${produto.dtvalid}`;
  };

  // Toggles selection for an individual product based on its unique ID.
  const handleToggleProduct = useCallback((uniqueId: string) => {
    setSelectedProducts(prevSelected =>
      prevSelected.includes(uniqueId)
        ? prevSelected.filter(id => id !== uniqueId)
        : [...prevSelected, uniqueId]
    );
  }, []);
  
  const handleConfirmStorage = () => {
    // Placeholder for the actual storage logic
    alert(`Confirmado armazenamento para ${selectedProducts.length} produto(s).`);
  };

  const handleBackToFilialSelection = () => {
    setView('SELECT_FILIAL');
    setError(null);
    setProdutos([]);
    setSelectedProducts([]);
    setViewedArmazenamento(null);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    // This function handles both 'MM/DD/YYYY' and 'YYYY-MM-DD...' formats
    try {
      if (dateString.includes('T')) {
          const datePart = dateString.split('T')[0];
          const [year, month, day] = datePart.split('-');
          return `${day}/${month}/${year}`;
      }
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const [month, day, year] = parts;
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
      }
      return dateString;
    } catch (error) {
        return dateString;
    }
  };

  const renderFilialSelection = () => {
    if (loadingFiliais || loadingDetalhe) {
      return <div className="flex justify-center items-center p-8 flex-grow"><Spinner className="w-10 h-10" /></div>;
    }
    if (filiais.length === 0 && !error) {
      return <p className="text-center py-8 text-gray-400 flex-grow flex items-center justify-center">Nenhuma filial encontrada.</p>;
    }
    return (
      <div className="flex flex-col flex-grow min-h-0">
        <div className="space-y-6 flex-shrink-0">
            <div>
            <label htmlFor="filial-select" className="block text-sm font-medium text-gray-300 mb-2">
                Selecione a Filial
            </label>
            <div className="relative">
                <select
                id="filial-select"
                value={selectedFilial}
                onChange={(e) => {
                    setSelectedFilial(e.target.value);
                    setError(null);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                >
                <option value="" disabled>Selecione uma filial...</option>
                {filiais.map((filial) => (
                    <option key={filial.codigo} value={filial.codigo}>
                    {`${filial.codigo} - ${filial.nomefilial}`}
                    </option>
                ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
            </div>
            {error && !selectedFilial && <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg mt-4">{error}</p>}
            <button
            onClick={handleSelectFilial}
            disabled={!selectedFilial || loadingProdutos}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
            {loadingProdutos ? <Spinner /> : 'Avançar'}
            {!loadingProdutos && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>}
            </button>
        </div>

        <div className="mt-8 flex flex-col flex-grow min-h-0">
            <h2 className="text-xl font-bold text-white mb-4 border-t border-gray-700 pt-6 flex-shrink-0">Armazenamentos em Execução</h2>
            {loadingArmazenamentos ? (
              <div className="flex justify-center items-center p-4 flex-grow"><Spinner /></div>
            ) : armazenamentos.length > 0 ? (
              <div className="flex-grow overflow-y-auto pr-2">
                <ul className="space-y-3">
                  {armazenamentos.map(item => (
                    <li key={item.id}>
                      <button onClick={() => handleViewArmazenamento(item)} className="w-full bg-gray-700/80 hover:bg-gray-700 p-4 rounded-lg text-left transition duration-200 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-lg text-white capitalize">{(item.acao || '').toLowerCase()} #{item.id}</p>
                            <p className="text-sm text-gray-300">Usuário: {item.nome_guerra}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-sm text-gray-400">{formatDate(item.dt_criacao)}</p>
                             <span className={`px-2 py-1 mt-1 inline-block text-xs font-semibold rounded-full ${item.status === 0 ? 'bg-yellow-500 text-yellow-900' : 'bg-gray-600 text-gray-200'}`}>
                              {item.status === 0 ? 'Em execução' : `Status: ${item.status}`}
                            </span>
                          </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : error && selectedFilial ? (
                 <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg mt-4 flex-grow flex items-center justify-center">{error}</p>
            ) : (
                <div className="text-center py-4 text-gray-400 flex-grow flex items-center justify-center">
                    <p>Nenhum armazenamento em execução encontrado.</p>
                </div>
            ) }
        </div>
      </div>
    );
  };

  const renderProdutoSelection = () => {
    const allUniqueIds = produtos.map(makeUniqueId);
    const areAllSelected = allUniqueIds.length > 0 && allUniqueIds.every(id => selectedProducts.includes(id));

    const handleSelectAllToggle = () => {
      if (areAllSelected) {
        setSelectedProducts([]);
      } else {
        setSelectedProducts(allUniqueIds);
      }
    };

    return (
      <div className="flex flex-col flex-grow min-h-0">
         <div className="mb-4 flex justify-end flex-shrink-0">
            <button
                onClick={handleSelectAllToggle}
                disabled={produtos.length === 0}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold text-sm py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {areAllSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
            </button>
         </div>
         <div className="flex-grow overflow-y-auto pr-2">
            <ul className="space-y-3">
                {produtos.map(produto => {
                    const uniqueId = makeUniqueId(produto);
                    return (
                        <li key={uniqueId}>
                          <label className="w-full bg-gray-700/80 hover:bg-gray-700 p-4 rounded-lg text-left transition duration-200 flex items-center gap-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedProducts.includes(uniqueId)}
                                onChange={() => handleToggleProduct(uniqueId)}
                                className="w-5 h-5 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 flex-shrink-0"
                            />
                            <div className="flex-grow">
                                <p className="font-bold text-white">{produto.codprod} - {produto.descricao}</p>
                                <p className="text-sm text-gray-300">Qtd: {produto.qtd} (Lote: {produto.lote} | Validade: {formatDate(produto.dtvalid)})</p>
                            </div>
                          </label>
                        </li>
                    );
                })}
            </ul>
        </div>
        <div className="mt-6 flex-shrink-0">
            <button
                onClick={handleConfirmStorage}
                disabled={selectedProducts.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
                Confirmar Armazenamento ({selectedProducts.length})
            </button>
        </div>
      </div>
    );
  }

  const renderArmazenamentoDetalhe = () => {
    if (!viewedArmazenamento) return null;
    const { detalhe, nome_guerra } = viewedArmazenamento;

    const getStatusInfo = (status: number) => {
        if (status === 0) {
            return { text: 'Em execução', className: 'bg-yellow-500 text-yellow-900' };
        }
        return { text: `Status ${status}`, className: 'bg-gray-600 text-gray-200' };
    };

    const statusInfo = getStatusInfo(detalhe.status);

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg animate-fade-in">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-gray-300">
                <div>
                  <strong className="text-gray-400 block">ID:</strong>
                  <span className="text-white font-semibold">#{detalhe.id}</span>
                </div>
                 <div>
                  <strong className="text-gray-400 block">Ação:</strong>
                  <span className="text-white font-semibold capitalize">{(detalhe.acao || '').toLowerCase()}</span>
                </div>
                <div>
                  <strong className="text-gray-400 block">Usuário:</strong>
                  <span className="text-white font-semibold">{nome_guerra}</span>
                </div>
                <div>
                  <strong className="text-gray-400 block">Status:</strong>
                  <span className={`px-2 py-1 mt-1 inline-block text-xs font-semibold rounded-full ${statusInfo.className}`}>
                      {statusInfo.text}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-400 block">Cód. Produto:</strong>
                  <span className="text-white font-semibold">{detalhe.codprod}</span>
                </div>
                <div>
                  <strong className="text-gray-400 block">Quantidade:</strong>
                  <span className="text-white font-semibold">{detalhe.qtd}</span>
                </div>
                <div>
                  <strong className="text-gray-400 block">End. Origem:</strong>
                  <span className="text-white font-semibold">{detalhe.end_orig}</span>
                </div>
                <div>
                  <strong className="text-gray-400 block">Lote:</strong>
                  <span className="text-white font-semibold">{detalhe.lote}</span>
                </div>
                 <div>
                  <strong className="text-gray-400 block">Validade:</strong>
                  <span className="text-white font-semibold">{formatDate(detalhe.dtvalid)}</span>
                </div>
             </div>
        </div>
    )
  }

  const getTitle = () => {
    if (view === 'SELECT_FILIAL') {
      return 'Armazenamento - Selecione a Filial';
    }
    if (view === 'VIEW_ARMAZENAMENTO' && viewedArmazenamento) {
        return `Detalhe Armazenamento #${viewedArmazenamento.detalhe.id}`;
    }
    const filial = filiais.find(f => f.codigo === selectedFilial);
    return `Armazenamento - Filial ${filial?.codigo || ''}`;
  }

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div className="flex items-center gap-x-3">
            <h1 className="text-2xl font-bold text-white">{getTitle()}</h1>
            {username && <span className="px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-full">{username}</span>}
        </div>
        <button onClick={view === 'SELECT_FILIAL' ? onBack : handleBackToFilialSelection} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
          Voltar
        </button>
      </div>
      
      <div className="flex-grow flex flex-col min-h-0">
        {view === 'SELECT_FILIAL' && renderFilialSelection()}
        {view === 'SELECT_PRODUTOS' && renderProdutoSelection()}
        {view === 'VIEW_ARMAZENAMENTO' && renderArmazenamentoDetalhe()}
      </div>

    </div>
  );
};

export default StorageScreen;