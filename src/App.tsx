import { Game } from './components/Game';
import { Result } from './components/Result';
import { Start } from './components/Start';
import { useGame } from './contexts/GameContext';
import './App.css';

const App = () => {
  const { phase } = useGame();

  const renderScreen = () => {
    switch (phase) {
      case 'warmup':
      case 'play':
        return <Game />;
      case 'result':
        return <Result />;
      case 'start':
      default:
        return <Start />;
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1 className="title">計算式 N-back</h1>
      </header>
      {renderScreen()}
    </div>
  );
};

export default App;
