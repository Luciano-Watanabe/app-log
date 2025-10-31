import React, { useState, useEffect } from 'react';
import { getFiliais } from '../services/api';
import { Filial } from '../types';
import Spinner from './Spinner';

interface StorageScreenProps {
  onBack: () => void;
}

const StorageScreen: React.FC<StorageScreenProps> = ({ onBack }) => {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [selectedFilial, setSelectedFilial] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiliais = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFiliais();
        setFiliais(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchFiliais();
  }, []);

  const handleProceed = () => {
    // Placeholder for next navigation step
    if (selectedFilial) {
      alert(`Filial selecionada: ${selectedFilial}`);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>;
    }
    if (error) {
      return <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>;
    }
    if (filiais.length === 0) {
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
              onChange={(e) => setSelectedFilial(e.target.value)}
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
        <button
          onClick={handleProceed}
          disabled={!selectedFilial}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          Avançar
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Armazenamento - Selecione a Filial</h1>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
          Voltar
        </button>
      </div>
      
      <div>
        {renderContent()}
      </div>

    </div>
  );
};

export default StorageScreen;