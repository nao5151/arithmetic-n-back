import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  calcAccuracyPercent,
  createProblem,
  evaluateNBack,
  type Problem,
} from '../core/nback';
import type { Phase } from './gameTypes';

type AnsweringArgs = {
  phase: Phase;
  nBack: number;
  currentProblem: Problem | null;
  answerHistory: number[];
  setCurrentProblem: Dispatch<SetStateAction<Problem | null>>;
  setAnswerHistory: Dispatch<SetStateAction<number[]>>;
};

/**
 * 回答入力のサニタイズ、判定、フィードバック表示、stats 集計を行うフック。
 * UI は inputValue/feedback を表示し、handleInputChange を onChange に渡すだけでよい。
 */
export const useAnswering = ({
  phase,
  nBack,
  currentProblem,
  answerHistory,
  setCurrentProblem,
  setAnswerHistory,
}: AnsweringArgs) => {
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, total: 0 });
  const feedbackTimerRef = useRef<number | null>(null);
  const statsRef = useRef(stats);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const clearInputFeedback = useCallback(() => {
    clearFeedbackTimer();
    setInputValue('');
    setFeedback(null);
  }, [clearFeedbackTimer]);

  const resetAnswering = useCallback(() => {
    clearInputFeedback();
    setStats({ correct: 0, wrong: 0, total: 0 });
  }, [clearInputFeedback]);

  const handleAnswer = useCallback(
    (value: number) => {
      if (!currentProblem || phase !== 'play') return;
      const judgement = evaluateNBack(value, answerHistory, nBack);
      const isCorrect = judgement.ready ? judgement.correct : false;

      setStats((prev) => {
        const total = prev.total + 1;
        const correct = prev.correct + (isCorrect ? 1 : 0);
        const wrong = total - correct;
        return { correct, wrong, total };
      });

      setAnswerHistory((prev) => [...prev, currentProblem.answer]);
      const nextProblem = createProblem({
        lastProblem: currentProblem,
        lastAnswer: currentProblem.answer,
      });
      setCurrentProblem(nextProblem);
      setInputValue(String(value));
      setFeedback(isCorrect ? 'correct' : 'wrong');

      clearFeedbackTimer();
      feedbackTimerRef.current = window.setTimeout(() => {
        setFeedback(null);
        setInputValue('');
      }, 300);
    },
    [
      answerHistory,
      clearFeedbackTimer,
      currentProblem,
      nBack,
      phase,
      setAnswerHistory,
      setCurrentProblem,
    ],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      if (phase !== 'play') {
        clearInputFeedback();
        return;
      }
      const digitsOnly = value.replace(/\D/g, '');
      const latest = digitsOnly.slice(-1); // 直近の入力1文字だけを扱う
      setInputValue(latest);
      setFeedback(null);
      if (latest.length === 1) {
        handleAnswer(Number(latest));
      }
    },
    [clearInputFeedback, handleAnswer, phase],
  );

  const liveAccuracy = useMemo(() => {
    if (stats.total === 0) return null;
    return calcAccuracyPercent(stats.correct, stats.total);
  }, [stats]);

  const getStatsSnapshot = useCallback(() => statsRef.current, []);

  return {
    inputValue,
    feedback,
    stats,
    liveAccuracy,
    handleInputChange,
    resetAnswering,
    clearInputFeedback,
    getStatsSnapshot,
  };
};
