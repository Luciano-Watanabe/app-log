import React, { useState, useEffect, useMemo } from 'react';
import { getNotasEntrada, createBonus } from '../services/api';
import { NotaEntrada } from '../types';
import Spinner from './Spinner';

interface CreateBonusScreenProps {
  onBack: () => void;
}

const CreateBonusScreen: React.FC<CreateBonusScreenProps> = ({ onBack }) => {
  const [notas, setNotas] = useState<NotaEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterNumnota, setFilterNumnota] = useState('');
  const [submittingNumtransent, setSubmittingNumtransent] = useState<number | null>(null);
  const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNotasEntrada();
        setNotas(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNotas();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterNumnota(e.target.value);
    setApiMessage(null);
  };

  const filteredNotas = useMemo(() => {
    const trimmedFilter = filterNumnota.trim();
    if (!trimmedFilter) {
      return [];
    }
    return notas.filter(nota => {
      return (nota.numnota?.toString() || '').trim() === trimmedFilter;
    });
  }, [notas, filterNumnota]);

  const handleCreateBonus = async (numtransent: number) => {
    setSubmittingNumtransent(numtransent);
    setApiMessage(null);
    try {
        const result = await createBonus(numtransent);
        setApiMessage({ type: 'success', text: result.message || 'Bônus criado com sucesso!' });
        setNotas(prevNotas => prevNotas.filter(nota => nota.numtransent !== numtransent));
    } catch (err) {
        if (err instanceof Error) {
            setApiMessage({ type: 'error', text: err.message });
        } else {
            setApiMessage({ type: 'error', text: 'Ocorreu um erro inesperado.' });
        }
    } finally {
        setSubmittingNumtransent(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
      });
    } catch (error) {
        return 'Invalid Date';
    }
  }

  const renderTableContent = () => {
    if (loading) {
        return <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>;
    }
    if (error) {
        return <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>;
    }

    const trimmedFilter = filterNumnota.trim();

    if (!trimmedFilter) {
        return <p className="text-center py-8 text-gray-400">Digite o Nº da Nota para buscar.</p>;
    }
    
    if (filteredNotas.length === 0) {
        return <p className="text-center py-8 text-gray-400">Nenhuma nota encontrada com este número.</p>;
    }

    return (
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3">Filial</th>
            <th scope="col" className="px-6 py-3">Nº Nota</th>
            <th scope="col" className="px-6 py-3">Dt. Entrada</th>
            <th scope="col" className="px-6 py-3">Fornecedor</th>
            <th scope="col" className="px-6 py-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotas.map(nota => (
            <tr key={nota.numtransent} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
              <td className="px-6 py-4">{nota.codfilial}</td>
              <td className="px-6 py-4">{nota.numnota}</td>
              <td className="px-6 py-4">{formatDate(nota.dtent)}</td>
              <td className="px-6 py-4 font-medium text-white">{nota.fornecedor}</td>
              <td className="px-6 py-4 text-center">
                <button 
                    onClick={() => handleCreateBonus(nota.numtransent)}
                    disabled={!!submittingNumtransent}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center min-w-[120px]"
                >
                    {submittingNumtransent === nota.numtransent ? <Spinner className="w-5 h-5"/> : 'Criar Bônus'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Criar Bônus - Notas de Entrada</h1>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
            <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
            Voltar
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-900/50 rounded-lg space-y-4">
        <div>
            <label htmlFor="filter-numnota" className="block text-sm font-medium text-gray-300 mb-2">
                Buscar por Nº da Nota
            </label>
            <input 
                id="filter-numnota"
                type="number" 
                name="numnota" 
                placeholder="Digite o número da nota" 
                value={filterNumnota} 
                onChange={handleFilterChange} 
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs" />
        </div>
        {apiMessage && (
            <div className={`p-3 rounded-lg text-sm ${apiMessage.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                {apiMessage.text}
            </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg">
        {renderTableContent()}
      </div>
    </div>
  );
};

export default CreateBonusScreen;
