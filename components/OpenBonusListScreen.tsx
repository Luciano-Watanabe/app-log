import React, { useState, useEffect, useCallback } from 'react';
import { getOpenBonuses } from '../services/api';
import { OpenBonus } from '../types';
import Spinner from './Spinner';

interface OpenBonusListScreenProps {
  onBack: () => void;
  onSelectBonus: (numbonus: string) => void;
  username: string | null;
}

const OpenBonusListScreen: React.FC<OpenBonusListScreenProps> = ({ onBack, onSelectBonus, username }) => {
  const [bonuses, setBonuses] = useState<OpenBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const fetchBonuses = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOpenBonuses(searchTerm);
      setBonuses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBonuses(''); // Fetch all on initial load
  }, [fetchBonuses]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBonuses(searchInput.trim());
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
        return 'Invalid Date';
    }
  }

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>;
    }
    if (error) {
      return <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>;
    }
    if (bonuses.length === 0) {
      return <p className="text-center py-8 text-gray-400">Nenhum bônus em aberto encontrado.</p>;
    }
    return (
      <ul className="space-y-3">
        {bonuses.map(bonus => (
          <li key={bonus.numbonus}>
            <button
              onClick={() => onSelectBonus(String(bonus.numbonus))}
              className="w-full bg-gray-700/80 hover:bg-gray-700 p-4 rounded-lg text-left transition duration-200 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-lg text-white">Bônus: {bonus.numbonus}</p>
                <p className="text-sm text-gray-300">{bonus.fornecedor}</p>
              </div>
              <div className="text-right">
                 <p className="text-sm text-gray-400">{formatDate(bonus.dtbonus)}</p>
                 <span className="text-blue-400 font-semibold text-sm mt-1">Conferir</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-x-3">
            <h1 className="text-2xl font-bold text-white">Conferir Bônus</h1>
            {username && <span className="px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-full">{username}</span>}
        </div>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
          Voltar
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <input
          type="number"
          placeholder="Pesquisar por número do bônus..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          Buscar
        </button>
      </form>
      
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {renderContent()}
      </div>
    </div>
  );
};

export default OpenBonusListScreen;