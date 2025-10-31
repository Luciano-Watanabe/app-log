import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getBonusDetails, checkBonusItem } from '../services/api';
import { BonusDetails, BonusItem } from '../types';
import Spinner from './Spinner';

interface CheckBonusScreenProps {
  onBack: () => void;
  numbonus: string | null;
}

const CheckBonusScreen: React.FC<CheckBonusScreenProps> = ({ onBack, numbonus }) => {
  const [numbonusInput, setNumbonusInput] = useState('');
  const [bonusDetails, setBonusDetails] = useState<BonusDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [codauxiliarInput, setCodauxiliarInput] = useState('');
  const [pesoInput, setPesoInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const productInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);
  const bonusInputRef = useRef<HTMLInputElement>(null);
  
  const fetchBonusDetails = useCallback(async (bonusId: string) => {
    if (!bonusId) return;
    setLoading(true);
    setError(null);
    setBonusDetails(null);
    setCheckMessage(null);
    try {
      const data = await getBonusDetails(bonusId);
      setBonusDetails(data);
      setTimeout(() => productInputRef.current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (numbonus) {
      setNumbonusInput(numbonus);
      fetchBonusDetails(numbonus);
    } else {
       // Focus the bonus input if no bonus is passed
      bonusInputRef.current?.focus();
    }
  }, [numbonus, fetchBonusDetails]);

  const handleFetchBonus = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBonusDetails(numbonusInput);
  };

  const handleCheckItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codauxiliarInput || !pesoInput || !bonusDetails) return;

    setIsChecking(true);
    setCheckMessage(null);
    try {
      const peso = parseFloat(pesoInput);
      const response = await checkBonusItem(bonusDetails.numbonus, codauxiliarInput, peso);

      setBonusDetails(prevDetails => {
          if (!prevDetails) return null;
          
          const updatedItems = prevDetails.items.map(item => {
              // Match by auxiliary code (if available) or product code
              if (item.codauxiliar === codauxiliarInput || String(item.codprod) === codauxiliarInput) {
                  return { ...item, qtconferida: response.qtconferida };
              }
              return item;
          });
          return { ...prevDetails, items: updatedItems };
      });

      setCheckMessage({ type: 'success', text: response.retorno });

      // Reset inputs and focus for next scan
      setCodauxiliarInput('');
      setPesoInput('');
      productInputRef.current?.focus();

    } catch (err) {
      setCheckMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred.' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setNumbonusInput('');
    setBonusDetails(null);
    setLoading(false);
    setError(null);
    setCodauxiliarInput('');
    setPesoInput('');
    setCheckMessage(null);
    setTimeout(() => bonusInputRef.current?.focus(), 100);
  }

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Conferência de Bônus</h1>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
          Voltar
        </button>
      </div>

      {!bonusDetails && !loading ? (
        <form onSubmit={handleFetchBonus} className="space-y-4">
          <div>
            <label htmlFor="numbonus" className="block text-sm font-medium text-gray-300 mb-2">Número do Bônus</label>
            <input
              ref={bonusInputRef}
              id="numbonus"
              type="number"
              value={numbonusInput}
              onChange={(e) => setNumbonusInput(e.target.value)}
              placeholder="Digite ou bipe o número do bônus"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
            {loading ? <Spinner /> : 'Buscar Bônus'}
          </button>
          {error && <p className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg">{error}</p>}
        </form>
      ) : null}

      {loading && <div className="flex justify-center items-center p-8"><Spinner className="w-10 h-10" /></div>}

      {bonusDetails ? (
        <div>
          <div className="mb-6 p-4 bg-gray-900/50 rounded-lg flex justify-between items-center">
            <div>
                <p className="text-sm text-gray-400">Bônus</p>
                <p className="text-2xl font-bold text-white">{bonusDetails.numbonus}</p>
            </div>
            <button onClick={handleReset} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300 text-sm">
                Trocar Bônus
            </button>
          </div>
          
          <form onSubmit={handleCheckItem} className="mb-6 p-4 bg-gray-700/50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="codauxiliar" className="block text-sm font-medium text-gray-300 mb-2">Produto (BIP)</label>
              <input
                ref={productInputRef}
                id="codauxiliar"
                type="text"
                value={codauxiliarInput}
                onChange={(e) => setCodauxiliarInput(e.target.value)}
                placeholder="Bipe o código do produto"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="peso" className="block text-sm font-medium text-gray-300 mb-2">Peso (kg)</label>
              <input
                ref={weightInputRef}
                id="peso"
                type="number"
                step="0.001"
                value={pesoInput}
                onChange={(e) => setPesoInput(e.target.value)}
                placeholder="Peso da balança"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button type="submit" disabled={isChecking} className="md:col-span-1 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
              {isChecking ? <Spinner /> : 'Conferir Item'}
            </button>
          </form>

          {checkMessage && (
            <div className={`p-3 rounded-md text-sm text-center mb-4 ${checkMessage.type === 'success' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
              {checkMessage.text}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg max-h-96">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">Produto</th>
                  <th scope="col" className="px-6 py-3 text-right">Qtd. Prevista</th>
                  <th scope="col" className="px-6 py-3 text-right">Qtd. Conferida</th>
                </tr>
              </thead>
              <tbody>
                {bonusDetails.items.map(item => {
                    const isComplete = item.qtconferida >= item.qt;
                    return (
                        <tr key={item.codprod} className={`border-b border-gray-700 ${isComplete ? 'bg-green-800/50' : 'bg-gray-800 hover:bg-gray-700/50'}`}>
                        <td className="px-6 py-4 font-medium text-white">{item.codprod} - {item.produto}</td>
                        <td className="px-6 py-4 text-right">{item.qt}</td>
                        <td className={`px-6 py-4 text-right font-bold ${isComplete ? 'text-green-300' : 'text-yellow-300'}`}>{item.qtconferida}</td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null }
    </div>
  );
};

export default CheckBonusScreen;
