import React, { useState, useEffect } from 'react';
import { getFiliais } from '../services/api';
import { Filial } from '../types';
import Spinner from './Spinner';

interface StorageScreenProps {
  onBack: () => void;
}

const StorageScreen: React.FC<StorageScreenProps> = ({ onBack }) => {
  const [filiais, setFiliais] = useState<Filial[]>([]);
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
      <ul className="space-y-3">
        {filiais.map(filial => (
          <li key={filial.codfilial}>
            <button
              // onClick={() => onSelectFilial(filial.codfilial)} // Placeholder for next step
              className="w-full bg-gray-700/80 hover:bg-gray-700 p-4 rounded-lg text-left transition duration-200 flex justify-between items-center"
            >
              <div className="font-bold text-lg text-white">
                {`${filial.codfilial} (${filial.FILIAL})`}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </li>
        ))}
      </ul>
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

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {renderContent()}
      </div>
    </div>
  );
};

export default StorageScreen;