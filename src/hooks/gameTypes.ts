export type ResultSummary = {
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
};

export type Phase = 'start' | 'warmup' | 'play' | 'result';
