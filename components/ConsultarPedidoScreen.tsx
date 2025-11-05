import React from 'react';

interface ConsultarPedidoScreenProps {
  onBack: () => void;
}

const ConsultarPedidoScreen: React.FC<ConsultarPedidoScreenProps> = ({ onBack }) => {
  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Consultar Pedido</h1>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
          Voltar
        </button>
      </div>
      <div className="text-center py-8 text-gray-400">
        <p>Funcionalidade de consulta de pedido em desenvolvimento.</p>
        <p className="text-sm mt-2">Esta tela é um placeholder para resolver um erro de carregamento.</p>
      </div>
    </div>
  );
};

export default ConsultarPedidoScreen;
