import { useSettings } from '../contexts/SettingsContext';
import { useGame } from '../contexts/GameContext';

const DURATIONS = [30, 60, 120, 180];

const formatDuration = (sec: number) =>
  sec % 60 === 0 ? `${sec / 60}分` : `${sec}秒`;

export const Start = () => {
  const { settings, updateSettings } = useSettings();
  const { history, startGame } = useGame();

  return (
    <>
      <div className="start-button-area">
        <button className="primary start-button" onClick={startGame}>
          スタート
        </button>
      </div>

      <section className="panel">
        <h2>設定</h2>
        <div className="form-grid">
          <label className="field">
            <span className="label">n-back</span>
            <div className="choice-row">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={
                    settings.nBack === n ? 'choice selected' : 'choice'
                  }
                  onClick={() => updateSettings({ nBack: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </label>

          <label className="field">
            <span className="label">プレイ時間</span>
            <div className="choice-row">
              {DURATIONS.map((sec) => (
                <button
                  key={sec}
                  className={
                    settings.durationSec === sec ? 'choice selected' : 'choice'
                  }
                  onClick={() => updateSettings({ durationSec: sec })}
                >
                  {formatDuration(sec)}
                </button>
              ))}
            </div>
          </label>
        </div>
      </section>

      {history.length > 0 && (
        <section className="panel">
          <h2>履歴</h2>
          <div className="history-list">
            <div className="history-head">
              <span>n-back</span>
              <span>プレイ時間</span>
              <span>正解数</span>
              <span>精度</span>
            </div>
            {history.map((item) => (
              <div key={item.playedAt} className="history-row">
                <span>{item.nBack}</span>
                <span>{formatDuration(item.durationSec)}</span>
                <span>{item.correct}</span>
                <span>{item.accuracy}%</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};
