
import React, { useState, useCallback } from 'react';
import SettingsScreen from './components/SettingsScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import CreateBonusScreen from './components/CreateBonusScreen';
import { Screen } from './types';

const App: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState<string | null>(() => localStorage.getItem('apiBaseUrl'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

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
    setBaseUrl(null);
    setIsLoggedIn(false);
    setCurrentScreen('home');
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    setCurrentScreen('home');
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentScreen('home');
  }, []);
  
  const handleNavigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
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
            return <HomeScreen onLogout={handleLogout} onChangeUrl={handleChangeUrl} onNavigate={handleNavigate} />;
        case 'createBonus':
            return <CreateBonusScreen onBack={() => handleNavigate('home')} />;
        default:
            return <HomeScreen onLogout={handleLogout} onChangeUrl={handleChangeUrl} onNavigate={handleNavigate} />;
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
