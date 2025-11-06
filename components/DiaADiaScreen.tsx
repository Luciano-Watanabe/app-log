import React, { useState, useEffect } from 'react';
import { getTarefasDiaADia, executarTarefaDiaADia } from '../services/api';
import { DiaADiaTarefa } from '../types';
import Spinner from './Spinner';

interface DiaADiaScreenProps {
  onBack: () => void;
}

const DiaADiaScreen: React.FC<DiaADiaScreenProps> = ({ onBack }) => {
  const [tarefas, setTarefas] = useState<DiaADiaTarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executingTaskId, setExecutingTaskId] = useState<number | null>(null);
  const [executionResult, setExecutionResult] = useState<{ id: number, message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchTarefas = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTarefasDiaADia();
        setTarefas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchTarefas();
  }, []);

  const handleExecute = async (tarefa: DiaADiaTarefa) => {
    setExecutingTaskId(tarefa.tarefa_id);
    setExecutionResult(null);
    try {
      const response = await executarTarefaDiaADia(tarefa.rotina);
      setExecutionResult({ id: tarefa.tarefa_id, message: response.retorno, type: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setExecutionResult({ id: tarefa.tarefa_id, message, type: 'error' });
    } finally {
      setExecutingTaskId(null);
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>;
    }
    if (error) {
      return <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>;
    }
    if (tarefas.length === 0) {
      return <p className="text-center py-8 text-gray-400">Nenhuma tarefa encontrada para hoje.</p>;
    }
    return (
      <ul className="space-y-3">
        {tarefas.map(tarefa => (
          <li key={tarefa.tarefa_id} className="w-full bg-gray-700/80 p-4 rounded-lg text-left transition duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-bold text-lg text-white">{tarefa.descricao}</p>
              {executionResult && executionResult.id === tarefa.tarefa_id && (
                  <p className={`text-sm mt-2 ${executionResult.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {executionResult.message}
                  </p>
              )}
            </div>
            <button
              onClick={() => handleExecute(tarefa)}
              disabled={executingTaskId === tarefa.tarefa_id}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-sm py-2 px-4 rounded-lg transition duration-200 flex-shrink-0 min-w-[120px] flex justify-center items-center"
            >
              {executingTaskId === tarefa.tarefa_id ? <Spinner /> : 'Executar'}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dia a Dia</h1>
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

export default DiaADiaScreen;
