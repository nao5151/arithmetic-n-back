import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  calcAccuracyPercent,
  createProblem,
  type Problem,
} from '../core/nback';
import type { Settings } from '../contexts/SettingsContext';
import type { Phase, ResultSummary } from './gameTypes';
import { useAnswering } from './useAnswering';
import { usePlayTimer } from './usePlayTimer';
import { useWarmupFlow } from './useWarmupFlow';

type UseGameStateOptions = {
  onFinish: (summary: ResultSummary) => void;
};

/**
 * ゲーム全体の状態を束ねるオーケストレーションフック。
 * - フェーズ遷移、ウォームアップ完了時の遷移、プレイ時間切れでの終了、結果集計を担う。
 * - UI はこの戻り値をそのままコンテキスト経由で消費するだけでよい。
 */
export const useGameState = (
  settings: Settings,
  { onFinish }: UseGameStateOptions,
) => {
  const [phase, setPhase] = useState<Phase>('start');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [answerHistory, setAnswerHistory] = useState<number[]>([]);
  const [result, setResult] = useState<ResultSummary | null>(null);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const {
    inputValue,
    feedback,
    stats,
    liveAccuracy,
    handleInputChange,
    resetAnswering,
    clearInputFeedback,
    getStatsSnapshot,
  } = useAnswering({
    phase,
    nBack: settings.nBack,
    currentProblem,
    answerHistory,
    setCurrentProblem,
    setAnswerHistory,
  });

  const finalizeGame = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const latest = getStatsSnapshot();
    const accuracy = calcAccuracyPercent(latest.correct, latest.total);
    const summary = { ...latest, accuracy };
    setResult(summary);
    setPhase('result');
    onFinishRef.current(summary);
  }, [getStatsSnapshot]);

  const { remainingTime, resetTime: resetPlayTime } = usePlayTimer(
    phase,
    settings.durationSec,
    finalizeGame,
  );

  const handleWarmupComplete = useCallback(
    (history: number[], lastProblem: Problem) => {
      clearInputFeedback();
      resetPlayTime(settings.durationSec);
      setAnswerHistory(history);
      setPhase('play');
      const nextProblem = createProblem({
        lastProblem,
        lastAnswer: lastProblem.answer,
      });
      setCurrentProblem(nextProblem);
    },
    [clearInputFeedback, resetPlayTime, setAnswerHistory, settings.durationSec],
  );

  const { warmupSecondsLeft, warmupProgress, resetWarmup } = useWarmupFlow({
    phase,
    settings,
    currentProblem,
    answerHistory,
    setCurrentProblem,
    setAnswerHistory,
    onWarmupComplete: handleWarmupComplete,
  });

  const resetToStart = useCallback(() => {
    finishedRef.current = false;
    resetWarmup();
    resetPlayTime(settings.durationSec);
    resetAnswering();
    setPhase('start');
    setCurrentProblem(null);
    setAnswerHistory([]);
    setResult(null);
  }, [resetAnswering, resetPlayTime, resetWarmup, settings.durationSec]);

  const startGame = useCallback(() => {
    finishedRef.current = false;
    resetWarmup();
    resetPlayTime(settings.durationSec);
    resetAnswering();
    const first = createProblem();
    setPhase('warmup');
    setCurrentProblem(first);
    setAnswerHistory([]);
    setResult(null);
  }, [resetAnswering, resetPlayTime, resetWarmup, settings.durationSec]);

  const turnNumber = useMemo(() => answerHistory.length + 1, [answerHistory]);

  return {
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
    result,
    startGame,
    resetToStart,
    handleInputChange,
  };
};
