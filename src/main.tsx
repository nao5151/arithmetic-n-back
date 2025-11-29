import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
import App from './App.tsx';
import { GameProvider } from './contexts/GameContext';
import { SettingsProvider } from './contexts/SettingsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </SettingsProvider>
  </StrictMode>,
);
