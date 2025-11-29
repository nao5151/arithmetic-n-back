export type Problem = {
  a: number;
  b: number;
  expression: string;
  answer: number;
};

type GenerateOptions = {
  lastProblem?: Problem;
  lastAnswer?: number;
  rng?: () => number;
};

// 1〜9のみ使用（0は出さない）
const DIGITS = Array.from({ length: 9 }, (_, i) => i + 1);

const pickDigit = (rng: () => number) =>
  DIGITS[Math.floor(rng() * DIGITS.length)];

export const createProblem = (options: GenerateOptions = {}): Problem => {
  const { lastProblem, lastAnswer, rng = Math.random } = options;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const a = pickDigit(rng);
    const b = pickDigit(rng);
    const answer = (a + b) % 10;
    const expression = `${a} + ${b}`;

    const isSameExpression =
      lastProblem && a === lastProblem.a && b === lastProblem.b;
    const shareOperand =
      lastProblem && (a === lastProblem.a || b === lastProblem.b);
    const isSameAnswer = lastAnswer !== undefined && answer === lastAnswer;

    const isSameDigits = a === b; // ゲーム仕様: 同じ数字同士の式は出さない

    if (!isSameExpression && !shareOperand && !isSameAnswer && !isSameDigits) {
      return { a, b, answer, expression };
    }
  }

  // フォールバック（ほぼ到達しない想定）
  let a = pickDigit(rng);
  let b = pickDigit(rng);
  if (lastProblem) {
    while (a === lastProblem.a) a = pickDigit(rng);
    while (b === lastProblem.b) b = pickDigit(rng);
  }
  while (a === b) {
    b = pickDigit(rng);
  }
  const answer = (a + b) % 10;
  if (lastAnswer !== undefined && answer === lastAnswer) {
    return createProblem({ lastProblem, lastAnswer, rng });
  }
  return { a, b, answer, expression: `${a} + ${b}` };
};

export const evaluateNBack = (
  input: number,
  answerHistory: number[],
  nBack: number,
) => {
  const targetIndex = answerHistory.length - nBack;
  if (targetIndex < 0) {
    return { ready: false as const, expected: null, correct: false };
  }

  const expected = answerHistory[targetIndex];
  return { ready: true as const, expected, correct: input === expected };
};

export const calcAccuracyPercent = (correct: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};
