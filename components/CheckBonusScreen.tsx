import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getBonusDetails, checkBonusItem, cancelBonusCheck, finalizeBonusCheck } from '../services/api';
import { BonusDetails } from '../types';
import Spinner from './Spinner';

interface CheckBonusScreenProps {
  onBack: () => void;
  numbonus: string | null;
  username: string | null;
}

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isProcessing: boolean;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel, isProcessing, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-300 mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} disabled={isProcessing} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg transition duration-200">
            {cancelText}
          </button>
          <button onClick={onConfirm} disabled={isProcessing} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg transition duration-200 flex items-center justify-center min-w-[140px]">
            {isProcessing ? <Spinner className="w-5 h-5" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
);


const CheckBonusScreen: React.FC<CheckBonusScreenProps> = ({ onBack, numbonus, username }) => {
  const [numbonusInput, setNumbonusInput] = useState('');
  const [bonusDetails, setBonusDetails] = useState<BonusDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [codauxiliarInput, setCodauxiliarInput] = useState('');
  const [pesoInput, setPesoInput] = useState('');
  const [loteInput, setLoteInput] = useState('');
  const [validadeInput, setValidadeInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [checkMessage, setCheckMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);


  const productInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);
  const bonusInputRef = useRef<HTMLInputElement>(null);
  
  const fetchBonusDetails = useCallback(async (bonusId: string, isRefresh = false) => {
    if (!bonusId) return;

    if (!isRefresh) {
      setLoading(true);
      setError(null);
      setBonusDetails(null);
      setCheckMessage(null);
      setIsFinalized(false);
    }

    try {
      const data = await getBonusDetails(bonusId);
      setBonusDetails(data);
      if (!isRefresh) {
        setTimeout(() => productInputRef.current?.focus(), 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (numbonus) {
      setNumbonusInput(numbonus);
      fetchBonusDetails(numbonus);
    } else {
      bonusInputRef.current?.focus();
    }
  }, [numbonus, fetchBonusDetails]);

  const handleFetchBonus = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBonusDetails(numbonusInput);
  };

  const handleCheckItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codauxiliarInput || !pesoInput || !loteInput || !validadeInput || !bonusDetails) return;

    setIsChecking(true);
    setCheckMessage(null);
    try {
      const peso = parseFloat(pesoInput);
      const response = await checkBonusItem(bonusDetails.numbonus, codauxiliarInput, peso, loteInput, validadeInput);
      
      setCheckMessage({ type: 'success', text: response.retorno });
      await fetchBonusDetails(String(bonusDetails.numbonus), true);

      // Reset inputs and focus for next scan
      setCodauxiliarInput('');
      setPesoInput('');
      setLoteInput('');
      setValidadeInput('');
      productInputRef.current?.focus();

    } catch (err) {
      setCheckMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred.' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleFinalizeCheck = async () => {
    if (!bonusDetails) return;

    setIsFinalizing(true);
    setCheckMessage(null);
    setError(null);
    try {
        const response = await finalizeBonusCheck(bonusDetails.numbonus);
        setCheckMessage({ type: 'success', text: response.retorno });
        setIsFinalized(true);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred during finalization.';
        setCheckMessage({ type: 'error', text: errorMessage });
    } finally {
        setIsFinalizing(false);
    }
  };
  
  const handleCancelCheck = async () => {
    if (!bonusDetails) return;

    setIsCancelling(true);
    setCheckMessage(null);
    setError(null);
    try {
        const response = await cancelBonusCheck(bonusDetails.numbonus);
        setCheckMessage({ type: 'success', text: response.retorno });
        await fetchBonusDetails(String(bonusDetails.numbonus), true);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred during cancellation.';
        setCheckMessage({ type: 'error', text: errorMessage });
    } finally {
        setIsCancelling(false);
        setShowCancelConfirm(false); // Close modal on finish
    }
  };


  const handleReset = () => {
    setNumbonusInput('');
    setBonusDetails(null);
    setLoading(false);
    setError(null);
    setCodauxiliarInput('');
    setPesoInput('');
    setLoteInput('');
    setValidadeInput('');
    setCheckMessage(null);
    setIsFinalized(false);
    setTimeout(() => bonusInputRef.current?.focus(), 100);
  }

  const allItemsChecked = bonusDetails?.items.every(item => (item.qtconf ?? 0) >= item.qtentrada);

  return (
    <>
      {showCancelConfirm && (
        <ConfirmationModal
          title="Confirmar Cancelamento"
          message="Tem certeza que deseja cancelar a conferência deste bônus? Todas as quantidades conferidas serão zeradas. Esta ação não pode ser desfeita."
          onConfirm={handleCancelCheck}
          onCancel={() => setShowCancelConfirm(false)}
          isProcessing={isCancelling}
          confirmText="Sim, Cancelar"
          cancelText="Voltar"
        />
      )}
      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-x-3">
                <h1 className="text-2xl font-bold text-white">Conferência de Bônus</h1>
                {username && <span className="px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-900/50 rounded-full">{username}</span>}
            </div>
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
            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg flex flex-wrap justify-between items-center gap-4">
              <div>
                  <p className="text-sm text-gray-400">Bônus</p>
                  <p className="text-2xl font-bold text-white">{bonusDetails.numbonus}</p>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                      onClick={handleFinalizeCheck}
                      disabled={!allItemsChecked || isFinalizing || isFinalized}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-lg transition duration-300 text-sm flex items-center justify-center min-w-[120px]"
                  >
                      {isFinalizing ? <Spinner /> : 'Finalizar'}
                  </button>
                  <button 
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={isFinalized}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-lg transition duration-300 text-sm flex items-center"
                  >
                      Cancelar Conferência
                  </button>
                  <button onClick={handleReset} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300 text-sm">
                      Trocar Bônus
                  </button>
              </div>
            </div>
            
            <form onSubmit={handleCheckItem} className="mb-6 p-4 bg-gray-700/50 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                  disabled={isFinalized}
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
                  disabled={isFinalized}
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="lote" className="block text-sm font-medium text-gray-300 mb-2">Nº Lote</label>
                <input
                  id="lote"
                  type="text"
                  value={loteInput}
                  onChange={(e) => setLoteInput(e.target.value)}
                  placeholder="Número do lote"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isFinalized}
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="validade" className="block text-sm font-medium text-gray-300 mb-2">Dt. Validade</label>
                <input
                  id="validade"
                  type="date"
                  value={validadeInput}
                  onChange={(e) => setValidadeInput(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isFinalized}
                />
              </div>
              <button type="submit" disabled={isChecking || isFinalized} className="md:col-span-1 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                {isChecking ? <Spinner /> : 'Conferir'}
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
                      const qtConfValue = item.qtconf ?? 0;
                      const qtEntradaValue = item.qtentrada;

                      let rowClassName = 'bg-gray-800 hover:bg-gray-700/50';
                      let textClassName = 'text-gray-300'; // Default for 0 (not checked)
                      
                      if (qtConfValue > 0) {
                          if (qtConfValue > qtEntradaValue) {
                              // Red: conferred > expected
                              rowClassName = 'bg-red-800/50';
                              textClassName = 'text-red-300';
                          } else if (qtConfValue < qtEntradaValue) {
                              // Yellow: 0 < conferred < expected
                              rowClassName = 'bg-yellow-800/50';
                              textClassName = 'text-yellow-300';
                          } else { // qtConfValue === qtEntradaValue
                              // Green: conferred === expected
                              rowClassName = 'bg-green-800/50';
                              textClassName = 'text-green-300';
                          }
                      }

                      return (
                          <tr key={item.codprod} className={`border-b border-gray-700 ${rowClassName}`}>
                            <td className="px-6 py-4 font-medium text-white">{item.codprod} - {item.descricao}</td>
                            <td className="px-6 py-4 text-right">{qtEntradaValue}</td>
                            <td className={`px-6 py-4 text-right font-bold ${textClassName}`}>{qtConfValue}</td>
                          </tr>
                      );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null }
      </div>
    </>
  );
};

export default CheckBonusScreen;