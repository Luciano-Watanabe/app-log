import React, { useState, useRef, useEffect } from 'react';
import { getEmbalagemDetails } from '../services/api';
import { ProdutoEmbalagem } from '../types';
import Spinner from './Spinner';

interface ConsultarEmbalagemScreenProps {
  onBack: () => void;
  username: string | null;
}

const ConsultarEmbalagemScreen: React.FC<ConsultarEmbalagemScreenProps> = ({ onBack, username }) => {
  const [eanInput, setEanInput] = useState('');
  const [produtos, setProdutos] = useState<ProdutoEmbalagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const eanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    eanInputRef.current?.focus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eanInput.trim()) return;

    setLoading(true);
    setError(null);
    setProdutos([]);
    setSearched(true);
    try {
      const data = await getEmbalagemDetails(eanInput.trim());
      setProdutos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
      setEanInput('');
    }
  };

  const renderResult = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-8 flex-grow"><Spinner className="w-10 h-10" /></div>;
    }
    if (error) {
      return <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg flex-grow flex items-center justify-center">{error}</p>;
    }
    if (searched && produtos.length === 0 && !loading) {
      return <p className="text-gray-400 text-center p-4 flex-grow flex items-center justify-center">Nenhum produto encontrado para este EAN.</p>;
    }
    if (produtos.length > 0) {
      return (
        <div className="space-y-4 animate-fade-in">
          {produtos.map((produto) => (
            <div key={produto.codprod} className="bg-gray-900/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">{produto.descricao}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-gray-300">
                <div>
                  <strong className="text-gray-400 block">Cód. Produto:</strong>
                  <span className="text-white font-semibold">{produto.codprod}</span>
                </div>
                <div>
                  <strong className="text-gray-400 block">Estoque:</strong>
                  <span className="text-white font-semibold">{produto.estoque} {produto.unidade}</span>
                </div>
                <div>
                  <strong className="text-gray-400 block">Filial:</strong>
                  <span className="text-white font-semibold">{produto.codfilial}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <strong className="text-gray-400 block">Embalagem:</strong>
                  <span className="text-white font-semibold">{produto.embalagem}</span>
                </div>
                <div>
                  <strong className="text-gray-400 block">EAN:</strong>
                  <span className="text-white font-semibold">{produto.ean_embalagem}</span>
                </div>
                <div>
                  <strong className="text-gray-400 block">DUN:</strong>
                  <span className="text-white font-semibold">{produto.dun_cad || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <div className="flex-grow"></div>; // Placeholder to take up space when no search is performed
  };

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div className="flex items-center gap-x-3">
            <h1 className="text-2xl font-bold text-white">Consultar Embalagem</h1>
            {username && <span className="px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-full">{username}</span>}
        </div>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
          Voltar
        </button>
      </div>

      <form onSubmit={handleSearch} className="space-y-4 mb-6 flex-shrink-0">
        <div>
          <label htmlFor="ean" className="block text-sm font-medium text-gray-300 mb-2">EAN do Produto (EX: 7898949392033) </label>
          <input
            ref={eanInputRef}
            id="ean"
            type="text"
            value={eanInput}
            onChange={(e) => setEanInput(e.target.value)}
            placeholder="Digite ou bipe o EAN"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
          {loading ? <Spinner /> : 'Consultar'}
        </button>
      </form>

      <div className="flex-grow overflow-y-auto pr-2 flex flex-col">
        {renderResult()}
      </div>
    </div>
  );
};

export default ConsultarEmbalagemScreen;