import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { createProblem, type Problem } from '../core/nback';
import type { Settings } from '../contexts/SettingsContext';
import type { Phase } from './gameTypes';

const WARMUP_DURATION_MS = 3000;

type WarmupArgs = {
  phase: Phase;
  settings: Settings;
  currentProblem: Problem | null;
  answerHistory: number[];
  setCurrentProblem: Dispatch<SetStateAction<Problem | null>>;
  setAnswerHistory: Dispatch<SetStateAction<number[]>>;
  onWarmupComplete: (history: number[], lastProblem: Problem) => void;
};

/**
 * ウォームアップフェーズの進行を管理するフック。
 * - 一定時間ごとに問題を進め、nBack 回蓄積したら onWarmupComplete を呼び出す。
 * - カウントダウンとプログレス、リセット処理を提供する。
 */
export const useWarmupFlow = ({
  phase,
  settings,
  currentProblem,
  answerHistory,
  setCurrentProblem,
  setAnswerHistory,
  onWarmupComplete,
}: WarmupArgs) => {
  const [warmupIndex, setWarmupIndex] = useState(0);
  const [warmupSecondsLeft, setWarmupSecondsLeft] = useState(3);
  const [warmupProgress, setWarmupProgress] = useState(0);
  const warmupTimerRef = useRef<number | null>(null);
  const warmupCountdownRef = useRef<number | null>(null);
  const warmupRafRef = useRef<number | null>(null);

  const resetWarmup = useCallback(() => {
    if (warmupTimerRef.current) {
      window.clearTimeout(warmupTimerRef.current);
      warmupTimerRef.current = null;
    }
    if (warmupCountdownRef.current) {
      window.clearInterval(warmupCountdownRef.current);
      warmupCountdownRef.current = null;
    }
    if (warmupRafRef.current) {
      window.cancelAnimationFrame(warmupRafRef.current);
      warmupRafRef.current = null;
    }
    setWarmupIndex(0);
    setWarmupSecondsLeft(3);
    setWarmupProgress(0);
  }, []);

  useEffect(() => {
    if (phase !== 'warmup' || !currentProblem) return undefined;

    const timerId = window.setTimeout(() => {
      const newHistory = [...answerHistory, currentProblem.answer];
      const nextIndex = warmupIndex + 1;

      if (nextIndex >= settings.nBack) {
        setWarmupIndex(nextIndex);
        onWarmupComplete(newHistory, currentProblem);
      } else {
        const nextProblem = createProblem({
          lastProblem: currentProblem,
          lastAnswer: currentProblem.answer,
        });
        setAnswerHistory(newHistory);
        setWarmupIndex(nextIndex);
        setWarmupSecondsLeft(3);
        setCurrentProblem(nextProblem);
      }
    }, WARMUP_DURATION_MS);

    warmupTimerRef.current = timerId;
    return () => window.clearTimeout(timerId);
  }, [
    answerHistory,
    currentProblem,
    onWarmupComplete,
    phase,
    setAnswerHistory,
    setCurrentProblem,
    settings.nBack,
    warmupIndex,
  ]);

  useEffect(() => {
    if (phase !== 'warmup') {
      return undefined;
    }

    const id = window.setInterval(() => {
      setWarmupSecondsLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    warmupCountdownRef.current = id;
    return () => window.clearInterval(id);
  }, [phase, warmupIndex]);

  useEffect(() => {
    if (phase !== 'warmup') {
      return undefined;
    }

    const start = performance.now();
    let rafId: number;
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, (elapsed / WARMUP_DURATION_MS) * 100);
      setWarmupProgress(pct);
      if (pct < 100) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    rafId = window.requestAnimationFrame(tick);
    warmupRafRef.current = rafId;

    return () => window.cancelAnimationFrame(rafId);
  }, [phase, warmupIndex]);

  return { warmupSecondsLeft, warmupProgress, resetWarmup };
};
