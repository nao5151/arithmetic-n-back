import { useGame } from '../contexts/GameContext';

export const Result = () => {
  const { result, startGame, resetToStart } = useGame();
  if (!result) return null;

  return (
    <>
      <div className="start-button-area">
        <button className="primary start-button" onClick={startGame}>
          もう一度プレイ
        </button>
      </div>
      <section className="panel result">
        <h2>結果</h2>
        <div className="stats large">
          <div className="stat">
            <span className="label">正解</span>
            <strong>{result.correct}</strong>
          </div>
          <div className="stat">
            <span className="label">誤答</span>
            <strong>{result.wrong}</strong>
          </div>
          <div className="stat">
            <span className="label">精度</span>
            <strong>{result.total === 0 ? '-' : `${result.accuracy}%`}</strong>
          </div>
        </div>
      </section>
      <div className="back-area">
        <button className="ghost ghost-small" onClick={resetToStart}>
          スタート画面に戻る
        </button>
      </div>
    </>
  );
};
