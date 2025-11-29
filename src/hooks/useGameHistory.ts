import { useCallback, useEffect, useState } from 'react';
export type GameRecord = {
  nBack: number;
  durationSec: number;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
  playedAt: number;
};

const HISTORY_KEY = 'nback-history';

/**
 * localStorage から履歴を読み込む（パース失敗時は空配列）。
 */
const loadHistory = (): GameRecord[] => {
  const raw =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(HISTORY_KEY)
      : null;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(e);
    return [];
  }
};

/**
 * ゲーム履歴を管理するフック。
 * - localStorage と同期し、最大10件まで保持する。
 * - 保存処理を呼び出し側から切り離し、App での責務を明確化。
 */
export const useGameHistory = () => {
  const [history, setHistory] = useState<GameRecord[]>(() => loadHistory());

  useEffect(() => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  /**
   * 新しい履歴を先頭に追加し、10件に切り詰める。
   */
  const pushRecord = useCallback((record: GameRecord) => {
    setHistory((prev) => [record, ...prev].slice(0, 10));
  }, []);

  return { history, pushRecord };
};
