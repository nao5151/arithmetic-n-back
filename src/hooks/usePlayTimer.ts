import { useCallback, useEffect, useRef, useState } from 'react';
import type { Phase } from './gameTypes';

/**
 * プレイ中の残り時間をカウントダウンするフック。
 * - phase が play の間だけ interval を動かし、0 になったら onTimeUp を呼ぶ。
 * - resetTime で残り時間とタイマーをリセットできる。
 */
export const usePlayTimer = (
  phase: Phase,
  durationSec: number,
  onTimeUp: () => void,
) => {
  const [remainingTime, setRemainingTime] = useState(durationSec);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTime = useCallback(
    (nextDuration: number) => {
      clearTimer();
      setRemainingTime(nextDuration);
    },
    [clearTimer],
  );

  useEffect(() => {
    if (phase !== 'play') return undefined;

    const id = window.setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = id;
    return () => window.clearInterval(id);
  }, [phase, onTimeUp]);

  return { remainingTime, resetTime, clearTimer };
};
