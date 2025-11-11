import React, { useState, useEffect } from 'react';
import { getTarefasDiaADia, executarTarefaDiaADia } from '../services/api';
import { DiaADiaTarefa } from '../types';
import Spinner from './Spinner';

interface DiaADiaScreenProps {
  onBack: () => void;
  username: string | null;
}

// Modal component for showing execution results
interface InfoModalProps {
  title: string;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ title, message, type, onClose }) => {
  const titleColor = type === 'success' ? 'text-green-400' : 'text-red-400';
  const buttonClasses = type === 'success' 
    ? 'bg-green-600 hover:bg-green-700' 
    : 'bg-red-600 hover:bg-red-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <h3 className={`text-xl font-bold ${titleColor} mb-4`}>{title}</h3>
        <p className="text-gray-300 mb-8 whitespace-pre-wrap">{message}</p>
        <div className="flex justify-end">
          <button 
            onClick={onClose} 
            className={`text-white font-bold py-2 px-5 rounded-lg transition duration-200 ${buttonClasses}`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};


interface ExecutionResult {
  message: string;
  type: 'success' | 'error';
}

const DiaADiaScreen: React.FC<DiaADiaScreenProps> = ({ onBack, username }) => {
  const [tarefas, setTarefas] = useState<DiaADiaTarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executingTaskId, setExecutingTaskId] = useState<number | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  const fetchTarefas = async () => {
    try {
      // Keep loading spinner only on initial load.
      if (!tarefas.length) {
          setLoading(true);
      }
      setError(null);
      const data = await getTarefasDiaADia();
      setTarefas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarefas();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExecute = async (tarefa: DiaADiaTarefa) => {
    setExecutingTaskId(tarefa.tarefa_id);
    try {
      const response = await executarTarefaDiaADia(tarefa.descricao, tarefa.status);
      setExecutionResult({ message: response.retorno, type: 'success' });
      // After successful execution, refresh the task list to get new statuses
      await fetchTarefas();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setExecutionResult({ message, type: 'error' });
    } finally {
      setExecutingTaskId(null);
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-8 flex-grow"><Spinner className="w-10 h-10" /></div>;
    }
    if (error) {
      return <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg flex-grow flex items-center justify-center">{error}</p>;
    }
    if (tarefas.length === 0) {
      return <p className="text-center py-8 text-gray-400 flex-grow flex items-center justify-center">Nenhuma tarefa encontrada para hoje.</p>;
    }
    return (
      <ul className="space-y-3">
        {tarefas.map(tarefa => (
          <li key={tarefa.tarefa_id} className="w-full bg-gray-700/80 p-4 rounded-lg text-left transition duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-bold text-lg text-white">{tarefa.descricao}</p>
            </div>
            <button
              onClick={() => handleExecute(tarefa)}
              disabled={executingTaskId === tarefa.tarefa_id}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-sm py-2 px-4 rounded-lg transition duration-200 flex-shrink-0 min-w-[120px] flex justify-center items-center"
            >
              {executingTaskId === tarefa.tarefa_id ? <Spinner /> : tarefa.status}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      {executionResult && (
        <InfoModal
          title={executionResult.type === 'success' ? 'Operação Concluída' : 'Erro na Operação'}
          message={executionResult.message}
          type={executionResult.type}
          onClose={() => setExecutionResult(null)}
        />
      )}
      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full h-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <div className="flex items-center gap-x-3">
                <h1 className="text-2xl font-bold text-white">Dia a Dia</h1>
                {username && <span className="px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-full">{username}</span>}
            </div>
          <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
            Voltar
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default DiaADiaScreen;