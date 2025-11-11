import React, { useState, useEffect } from 'react';
import { getTempoDeVida, getRelatorioDiaADia } from '../services/api';
import { TempoDeVidaItem, RelatorioDiaADiaItem } from '../types';
import Spinner from './Spinner';

interface RelatoriosScreenProps {
  onBack: () => void;
  username: string | null;
}

type ActiveReport = 'menu' | 'tempoDeVida' | 'diaADia';

const RelatoriosScreen: React.FC<RelatoriosScreenProps> = ({ onBack, username }) => {
  const [activeReport, setActiveReport] = useState<ActiveReport>('menu');
  const [tempoDeVidaData, setTempoDeVidaData] = useState<TempoDeVidaItem[]>([]);
  const [diaADiaData, setDiaADiaData] = useState<RelatorioDiaADiaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeReport === 'tempoDeVida') {
          const tempoDeVidaData = await getTempoDeVida();
          setTempoDeVidaData(tempoDeVidaData);
        } else if (activeReport === 'diaADia') {
          const relatorioData = await getRelatorioDiaADia();
          setDiaADiaData(relatorioData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (activeReport !== 'menu') {
      fetchData();
    }
  }, [activeReport]);

  const handleBackClick = () => {
    if (activeReport !== 'menu') {
      setActiveReport('menu');
      setTempoDeVidaData([]);
      setDiaADiaData([]);
      setError(null);
    } else {
      onBack();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Handle dates already in DD/MM/YYYY format by returning them as is.
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) {
        return dateString;
    }

    // Handle dates in YYYY-MM-DD format (potentially with time)
    if (dateString.includes('-')) {
        try {
            const datePart = dateString.split('T')[0];
            const [year, month, day] = datePart.split('-');
            if(day && month && year) {
                return `${day}/${month}/${year}`;
            }
        } catch (error) {
            return 'Data Inválida';
        }
    }
    
    // Fallback for unrecognized formats
    return dateString;
  }

  const getDiasRestantesCellStyle = (dias: number) => {
    if (dias < 30) {
      return 'bg-red-800/50 text-red-300 font-bold';
    }
    if (dias < 90) {
      return 'bg-yellow-800/50 text-yellow-300 font-bold';
    }
    return 'text-green-300';
  };
  
  const getTitle = () => {
    switch(activeReport) {
      case 'tempoDeVida':
        return 'Relatório - Tempo de Vida do Produto';
      case 'diaADia':
        return 'Relatório - Tarefas Dia a Dia';
      case 'menu':
      default:
        return 'Relatórios';
    }
  };

  const renderTempoDeVidaReport = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>;
    }
    if (error) {
      return <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>;
    }
    if (tempoDeVidaData.length === 0) {
      return <p className="text-center py-8 text-gray-400">Nenhum dado encontrado para o relatório de tempo de vida.</p>;
    }
    return (
      <div className="overflow-x-auto rounded-lg max-h-[65vh]">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Produto</th>
              <th scope="col" className="px-6 py-3 text-center">Dias Rest.</th>
              <th scope="col" className="px-6 py-3">Validade</th>
              <th scope="col" className="px-6 py-3">Lote</th>
              <th scope="col" className="px-6 py-3">apto_id</th>
              <th scope="col" className="px-6 py-3 text-right">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {tempoDeVidaData.map(item => (
              <tr key={`${item.codprod}-${item.lote}`} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4 font-medium text-white">{item.codprod} - {item.descricao}</td>
                <td className={`px-6 py-4 text-center ${getDiasRestantesCellStyle(item.dias_restantes)}`}>{item.dias_restantes}</td>
                <td className="px-6 py-4">{formatDate(item.dtvalid)}</td>
                <td className="px-6 py-4">{item.lote}</td>
                <td className="px-6 py-4">{item.apto_id}</td>
                <td className="px-6 py-4 text-right">{item.qtd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderDiaADiaReport = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>;
    }
    if (error) {
      return <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>;
    }
    if (diaADiaData.length === 0) {
      return <p className="text-center py-8 text-gray-400">Nenhum dado encontrado para o relatório do dia a dia.</p>;
    }
    return (
      <div className="overflow-x-auto rounded-lg max-h-[65vh]">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Descrição</th>
              <th scope="col" className="px-6 py-3">Nome de Guerra</th>
              <th scope="col" className="px-6 py-3 text-right">Total Minutos</th>
            </tr>
          </thead>
          <tbody>
            {diaADiaData.map((item, index) => (
              <tr key={`${item.descricao}-${index}`} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4 font-medium text-white">{item.descricao}</td>
                <td className="px-6 py-4">{item.nome_guerra}</td>
                <td className="px-6 py-4 text-right">{item.total_minutos.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMenu = () => {
      const reportItems = [
        { name: 'Tempo de Vida', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M12 14h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2h2Z"/><path d="M12 22a2.85 2.85 0 0 1-2-5 2.85 2.85 0 0 1 4 0 2.85 2.85 0 0 1-2 5Z"/></svg>, report: 'tempoDeVida' as ActiveReport },
        { name: 'Dia a Dia', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>, report: 'diaADia' as ActiveReport },
      ];
      
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {reportItems.map((item) => (
                <button
                    key={item.name}
                    onClick={() => setActiveReport(item.report)}
                    className="bg-gray-700/50 hover:bg-gray-700 p-4 rounded-lg text-center flex flex-col items-center justify-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={item.name}
                >
                    <div className="text-blue-400 mb-2">{item.icon}</div>
                    <span className="text-white font-medium text-sm">{item.name}</span>
                </button>
            ))}
        </div>
      );
  }

  const renderContent = () => {
    switch (activeReport) {
        case 'menu':
            return renderMenu();
        case 'tempoDeVida':
            return renderTempoDeVidaReport();
        case 'diaADia':
            return renderDiaADiaReport();
        default:
            return renderMenu();
    }
  }

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-x-3">
            <h1 className="text-2xl font-bold text-white">{getTitle()}</h1>
            {username && <span className="px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-full">{username}</span>}
        </div>
        <button onClick={handleBackClick} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
          Voltar
        </button>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default RelatoriosScreen;