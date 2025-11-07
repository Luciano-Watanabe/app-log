import React, { useState, useCallback } from 'react';
import SettingsScreen from './components/SettingsScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import CreateBonusScreen from './components/CreateBonusScreen';
import CheckBonusScreen from './components/CheckBonusScreen';
import OpenBonusListScreen from './components/OpenBonusListScreen';
import StorageScreen from './components/StorageScreen';
import ConsultarPedidoScreen from './components/ConsultarPedidoScreen';
import ConsultarEmbalagemScreen from './components/ConsultarEmbalagemScreen';
import DiaADiaScreen from './components/DiaADiaScreen';
import { Screen } from './types';

const App: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState<string | null>(() => localStorage.getItem('apiBaseUrl'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('codfunc') && !!localStorage.getItem('username'));
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [bonusToCheck, setBonusToCheck] = useState<string | null>(null);

  const handleSaveBaseUrl = useCallback((newUrl: string) => {
    if (newUrl.startsWith('http://') || newUrl.startsWith('https://')) {
        localStorage.setItem('apiBaseUrl', newUrl);
        setBaseUrl(newUrl);
    } else {
        alert('Please enter a valid URL starting with http:// or https://');
    }
  }, []);

  const handleChangeUrl = useCallback(() => {
    localStorage.removeItem('apiBaseUrl');
    localStorage.removeItem('codfunc');
    localStorage.removeItem('username');
    setBaseUrl(null);
    setUsername(null);
    setIsLoggedIn(false);
    setCurrentScreen('home');
  }, []);

  const handleLoginSuccess = useCallback((user: string) => {
    localStorage.setItem('username', user);
    setUsername(user);
    setIsLoggedIn(true);
    setCurrentScreen('home');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('codfunc');
    localStorage.removeItem('username');
    setUsername(null);
    setIsLoggedIn(false);
    setCurrentScreen('home');
  }, []);
  
  const handleNavigate = useCallback((screen: Screen) => {
    if (screen !== 'checkBonus') {
        setBonusToCheck(null);
    }
    setCurrentScreen(screen);
  }, []);

  const handleBonusSelect = useCallback((numbonus: string) => {
    setBonusToCheck(numbonus);
    setCurrentScreen('checkBonus');
  }, []);

  const renderContent = () => {
    if (!baseUrl) {
      return <SettingsScreen onSave={handleSaveBaseUrl} />;
    }
    if (!isLoggedIn) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} onChangeUrl={handleChangeUrl} />;
    }
    
    switch (currentScreen) {
        case 'home':
            return <HomeScreen onLogout={handleLogout} onChangeUrl={handleChangeUrl} onNavigate={handleNavigate} username={username} />;
        case 'createBonus':
            return <CreateBonusScreen onBack={() => handleNavigate('home')} username={username} />;
        case 'openBonusList':
            return <OpenBonusListScreen onBack={() => handleNavigate('home')} onSelectBonus={handleBonusSelect} username={username} />;
        case 'checkBonus':
            return <CheckBonusScreen onBack={() => handleNavigate(bonusToCheck ? 'openBonusList' : 'home')} numbonus={bonusToCheck} username={username} />;
        case 'storage':
            return <StorageScreen onBack={() => handleNavigate('home')} username={username} />;
        case 'consultarPedido':
            return <ConsultarPedidoScreen onBack={() => handleNavigate('home')} username={username} />;
        case 'consultarEmbalagem':
            return <ConsultarEmbalagemScreen onBack={() => handleNavigate('home')} username={username} />;
        case 'diaADia':
            return <DiaADiaScreen onBack={() => handleNavigate('home')} username={username} />;
        default:
            return <HomeScreen onLogout={handleLogout} onChangeUrl={handleChangeUrl} onNavigate={handleNavigate} username={username} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;