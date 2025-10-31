import React, { useState, useEffect, useMemo } from 'react';
import { getNotasEntrada, createBonus } from '../services/api';
import { NotaEntrada } from '../types';
import Spinner from './Spinner';

interface CreateBonusScreenProps {
  onBack: () => void;
}

interface BonusCreationResult {
  numnota: number;
  status: 'success' | 'error';
  message: string;
}

const CreateBonusScreen: React.FC<CreateBonusScreenProps> = ({ onBack }) => {
  const [notas, setNotas] = useState<NotaEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for all filters
  const [filterNumnota, setFilterNumnota] = useState('');
  const [filterFornecedor, setFilterFornecedor] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [selectedNotas, setSelectedNotas] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bonusCreationResults, setBonusCreationResults] = useState<BonusCreationResult[]>([]);

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
    const { name, value } = e.target;
    
    switch (name) {
      case 'numnota':
        setFilterNumnota(value);
        break;
      case 'fornecedor':
        setFilterFornecedor(value);
        break;
      case 'startDate':
        setFilterStartDate(value);
        break;
      case 'endDate':
        setFilterEndDate(value);
        break;
    }

    setSelectedNotas([]);
    setBonusCreationResults([]);
  };

  const filteredNotas = useMemo(() => {
    const trimmedNota = filterNumnota.trim();
    const trimmedFornecedor = filterFornecedor.trim().toLowerCase();
    
    // Return empty array if no filters are active to avoid showing a huge list by default
    if (!trimmedNota && !trimmedFornecedor && !filterStartDate && !filterEndDate) {
      return [];
    }

    return notas.filter(nota => {
      if (trimmedNota) {
        if ((nota.numnota?.toString() || '').trim() !== trimmedNota) return false;
      }

      if (trimmedFornecedor) {
        if (!(nota.fornecedor || '').toLowerCase().includes(trimmedFornecedor)) return false;
      }

      if (filterStartDate) {
        // nota.dtent is 'YYYY-MM-DDTHH:mm:ss', input is 'YYYY-MM-DD'. String comparison works perfectly for this format.
        if ((nota.dtent || '').substring(0, 10) < filterStartDate) return false;
      }

      if (filterEndDate) {
        if ((nota.dtent || '').substring(0, 10) > filterEndDate) return false;
      }

      return true;
    });
  }, [notas, filterNumnota, filterFornecedor, filterStartDate, filterEndDate]);
  
  const handleSelectNota = (numtransent: number) => {
    setSelectedNotas(prevSelected => {
      if (prevSelected.includes(numtransent)) {
        return prevSelected.filter(id => id !== numtransent);
      } else {
        return [...prevSelected, numtransent];
      }
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = filteredNotas.map(nota => nota.numtransent);
      setSelectedNotas(allFilteredIds);
    } else {
      setSelectedNotas([]);
    }
  };

  const handleCreateMultipleBonuses = async () => {
    if (selectedNotas.length === 0) return;

    setIsSubmitting(true);
    setBonusCreationResults([]);
    
    const results: BonusCreationResult[] = [];
    const successfullyCreatedTransents: number[] = [];

    // Process sequentially to avoid overwhelming the server
    for (const numtransent of selectedNotas) {
        const nota = notas.find(n => n.numtransent === numtransent);
        try {
            const response = await createBonus(numtransent);
            results.push({
                numnota: nota?.numnota || 0,
                status: 'success',
                message: response.retorno || 'Mensagem não retornada pela API.',
            });
            successfullyCreatedTransents.push(numtransent);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha ao criar bônus.';
            results.push({
                numnota: nota?.numnota || 0,
                status: 'error',
                message: message
            });
        }
    }

    setBonusCreationResults(results);

    // Remove successful notes from the list after all requests are done
    if (successfullyCreatedTransents.length > 0) {
        setNotas(prevNotas => prevNotas.filter(nota => !successfullyCreatedTransents.includes(nota.numtransent)));
    }
    
    setSelectedNotas([]);
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      // Handles 'YYYY-MM-DDTHH:mm:ss' by splitting at 'T'
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      // Ensures correct date formatting regardless of timezone
      return `${day}/${month}/${year}`;
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
    
    const hasActiveFilters = filterNumnota.trim() || filterFornecedor.trim() || filterStartDate || filterEndDate;

    if (!hasActiveFilters) {
        return <p className="text-center py-8 text-gray-400">Utilize os filtros para buscar as notas de entrada.</p>;
    }
    
    if (filteredNotas.length === 0) {
        return <p className="text-center py-8 text-gray-400">Nenhuma nota encontrada com os filtros aplicados.</p>;
    }

    return (
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">
                <input 
                    id="checkbox-all" 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredNotas.length > 0 && selectedNotas.length === filteredNotas.length}
                    disabled={filteredNotas.length === 0}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2" 
                />
                <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
              </div>
            </th>
            <th scope="col" className="px-6 py-3">Filial</th>
            <th scope="col" className="px-6 py-3">Nº Nota</th>
            <th scope="col" className="px-6 py-3">Dt. Entrada</th>
            <th scope="col" className="px-6 py-3">Fornecedor</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotas.map(nota => (
            <tr key={nota.numtransent} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
              <td className="w-4 p-4">
                <div className="flex items-center">
                  <input 
                      id={`checkbox-table-${nota.numtransent}`} 
                      type="checkbox" 
                      checked={selectedNotas.includes(nota.numtransent)}
                      onChange={() => handleSelectNota(nota.numtransent)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
                  />
                  <label htmlFor={`checkbox-table-${nota.numtransent}`} className="sr-only">checkbox</label>
                </div>
              </td>
              <td className="px-6 py-4">{nota.codfilial}</td>
              <td className="px-6 py-4">{nota.numnota}</td>
              <td className="px-6 py-4">{formatDate(nota.dtent)}</td>
              <td className="px-6 py-4 font-medium text-white">{nota.fornecedor}</td>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
            Voltar
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-900/50 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="filter-numnota" className="block text-sm font-medium text-gray-300 mb-2">Nº da Nota</label>
            <input 
                id="filter-numnota"
                type="number" 
                name="numnota" 
                placeholder="Número da nota" 
                value={filterNumnota} 
                onChange={handleFilterChange} 
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" 
            />
          </div>
          <div>
            <label htmlFor="filter-fornecedor" className="block text-sm font-medium text-gray-300 mb-2">Fornecedor</label>
            <input 
                id="filter-fornecedor"
                type="text" 
                name="fornecedor" 
                placeholder="Nome do fornecedor" 
                value={filterFornecedor} 
                onChange={handleFilterChange} 
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <label htmlFor="filter-startDate" className="block text-sm font-medium text-gray-300 mb-2">Data Inicial</label>
            <input 
                id="filter-startDate"
                type="date" 
                name="startDate" 
                value={filterStartDate} 
                onChange={handleFilterChange} 
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <label htmlFor="filter-endDate" className="block text-sm font-medium text-gray-300 mb-2">Data Final</label>
            <input 
                id="filter-endDate"
                type="date" 
                name="endDate" 
                value={filterEndDate} 
                onChange={handleFilterChange} 
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        {selectedNotas.length > 0 && (
          <div className="pt-2">
            <button 
                onClick={handleCreateMultipleBonuses}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center min-w-[240px]"
            >
                {isSubmitting ? <Spinner /> : `Criar Bônus para ${selectedNotas.length} NF(s) selecionada(s)`}
            </button>
          </div>
        )}

        {bonusCreationResults.length > 0 && (
          <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
              <h3 className="text-lg font-semibold text-white mb-3">Retorno da API</h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {bonusCreationResults.map((result, index) => (
                      <li key={index} className={`p-3 rounded-md text-sm flex items-start ${result.status === 'success' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                          {result.status === 'success' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                          )}
                          <div>
                            <strong className="font-semibold">NF {result.numnota}:</strong> {result.message}
                          </div>
                      </li>
                  ))}
              </ul>
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