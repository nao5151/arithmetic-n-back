import { createContext, useContext } from 'react';
import { useGameHistory, type GameRecord } from '../hooks/useGameHistory';
import { useGameState } from '../hooks/useGameState';
import { useSettings } from './SettingsContext';
import type { ResultSummary } from '../hooks/gameTypes';

export type { ResultSummary, Phase } from '../hooks/gameTypes';

type GameContextValue = ReturnType<typeof useGameState> & {
  history: GameRecord[];
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

/**
 * ゲームの一時状態（フェーズ/タイマー/入力判定など）をまとめて提供する。
 * SettingsProvider とは分離しておくことで
 * - 設定は永続化される環境依存の状態、ゲームはセッション限定の一時状態というライフサイクル差を明示
 * - 設定変更時の再レンダー範囲を限定し、ゲームロジック側は設定値を読むだけ（書き換えない）という依存方向を一方向に保つ
 * といった意図を示す。
 */
export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettings();
  const { history, pushRecord } = useGameHistory();
  const game = useGameState(settings, {
    onFinish: (summary: ResultSummary) => {
      const record: GameRecord = {
        nBack: settings.nBack,
        durationSec: settings.durationSec,
        correct: summary.correct,
        wrong: summary.wrong,
        total: summary.total,
        accuracy: summary.accuracy,
        playedAt: Date.now(),
      };
      pushRecord(record);
    },
  });

  return (
    <GameContext.Provider value={{ history, ...game }}>
      {children}
    </GameContext.Provider>
  );
};

// Fast refresh対象のコンポーネントと併記するため許容
// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
