import React, { useState, useEffect, useCallback } from 'react';
import { getFiliais, getProdutosCheckIn } from '../services/api';
import { Filial, ProdutoCheckIn } from '../types';
import Spinner from './Spinner';

interface StorageScreenProps {
  onBack: () => void;
  username: string | null;
}

const StorageScreen: React.FC<StorageScreenProps> = ({ onBack, username }) => {
  const [view, setView] = useState<'SELECT_FILIAL' | 'SELECT_PRODUTOS'>('SELECT_FILIAL');

  // Filial selection state
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [selectedFilial, setSelectedFilial] = useState<string>('');
  const [loadingFiliais, setLoadingFiliais] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Product selection state
  const [produtos, setProdutos] = useState<ProdutoCheckIn[]>([]);
  // Use a unique ID string for selection state to handle duplicate codprods.
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  useEffect(() => {
    const fetchFiliais = async () => {
      setLoadingFiliais(true);
      setError(null);
      try {
        const data = await getFiliais();
        setFiliais(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao buscar filiais.');
      } finally {
        setLoadingFiliais(false);
      }
    };
    fetchFiliais();
  }, []);

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
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
        // Handles formats like "4/29/2026"
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const [month, day, year] = parts;
            const formattedDay = day.padStart(2, '0');
            const formattedMonth = month.padStart(2, '0');
            return `${formattedDay}/${formattedMonth}/${year}`;
        }
        return dateString; // Return original if format is unexpected
    } catch (error) {
        return dateString; // Return original on error
    }
  };


  const renderFilialSelection = () => {
    if (loadingFiliais) {
      return <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>;
    }
    if (filiais.length === 0 && !error) {
      return <p className="text-center py-8 text-gray-400">Nenhuma filial encontrada.</p>;
    }
    return (
      <div className="space-y-6">
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
        {error && <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg mt-4">{error}</p>}
        <button
          onClick={handleSelectFilial}
          disabled={!selectedFilial || loadingProdutos}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          {loadingProdutos ? <Spinner /> : 'Avançar'}
          {!loadingProdutos && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>}
        </button>
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
      <div>
         <div className="mb-4 flex justify-end">
            <button
                onClick={handleSelectAllToggle}
                disabled={produtos.length === 0}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold text-sm py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {areAllSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
            </button>
         </div>
         <div className="overflow-x-auto rounded-lg max-h-[55vh] pr-2">
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
        <div className="mt-6">
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

  const getTitle = () => {
    if (view === 'SELECT_FILIAL') {
      return 'Armazenamento - Selecione a Filial';
    }
    const filial = filiais.find(f => f.codigo === selectedFilial);
    return `Armazenamento - Filial ${filial?.codigo || ''}`;
  }

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-x-3">
            <h1 className="text-2xl font-bold text-white">{getTitle()}</h1>
            {username && <span className="px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-full">{username}</span>}
        </div>
        <button onClick={view === 'SELECT_PRODUTOS' ? handleBackToFilialSelection : onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
          Voltar
        </button>
      </div>
      
      <div>
        {view === 'SELECT_FILIAL' ? renderFilialSelection() : renderProdutoSelection()}
      </div>

    </div>
  );
};

export default StorageScreen;