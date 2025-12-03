import { useEffect, useRef, type CSSProperties } from 'react';
import { useGame } from '../contexts/GameContext';
import { useSettings } from '../contexts/SettingsContext';

export const Game = () => {
  const {
    phase,
    currentProblem,
    turnNumber,
    warmupSecondsLeft,
    warmupProgress,
    remainingTime,
    inputValue,
    feedback,
    stats,
    liveAccuracy,
    handleInputChange,
    resetToStart,
  } = useGame();
  const { settings } = useSettings();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (phase === 'warmup' || phase === 'play') {
      const id = window.setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
        window.requestAnimationFrame(() => {
          panelRef.current?.scrollIntoView({
            block: 'start',
            behavior: 'smooth',
          });
        });
      }, 120);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [phase]);

  if (!currentProblem) return null;

  return (
    <>
      <section className="panel" ref={panelRef}>
        <div className="info-row">
          <div className="turn-indicator">
            <span className="turn-number">{turnNumber}問目</span>
            {phase === 'warmup' && (
              <div
                className="progress-circle"
                style={
                  {
                    '--progress': `${warmupProgress}%`,
                  } as CSSProperties
                }
              >
                <span className="progress-text">
                  {Math.max(1, warmupSecondsLeft)}
                </span>
              </div>
            )}
          </div>
          <span className="timer strong">
            残り <span className="timer-number">{remainingTime}</span> 秒
          </span>
        </div>

        <div className="problem-area">
          <div className="problem">
            <span className="expr-part">{currentProblem.a}</span>
            <span className="expr-op">+</span>
            <span className="expr-part">{currentProblem.b}</span>
          </div>
        </div>

        <div className="input-area">
          <label className="label">
            {phase === 'warmup'
              ? '答えを覚えてください'
              : `${settings.nBack}問前の答えを入力`}
          </label>
          <input
            ref={inputRef}
            autoFocus
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`answer-input ${feedback === 'correct' ? 'is-correct' : ''} ${feedback === 'wrong' ? 'is-wrong' : ''}`}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        </div>

        <div className="stats">
          <div className="stat">
            <span className="label">正解</span>
            <strong>{stats.correct}</strong>
          </div>
          <div className="stat">
            <span className="label">誤答</span>
            <strong>{stats.wrong}</strong>
          </div>
          <div className="stat">
            <span className="label">精度</span>
            <strong>{liveAccuracy !== null ? `${liveAccuracy}%` : '-'}</strong>
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
