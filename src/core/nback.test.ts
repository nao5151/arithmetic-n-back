import { describe, expect, it } from 'vitest';
import { calcAccuracyPercent, createProblem, evaluateNBack } from './nback';

describe('createProblem', () => {
  const times = 200;

  it('各項は 1〜9 の範囲で、同じ数字の組み合わせを返さない', () => {
    for (let i = 0; i < times; i += 1) {
      const problem = createProblem();
      expect(problem.a).toBeGreaterThanOrEqual(1);
      expect(problem.a).toBeLessThanOrEqual(9);
      expect(problem.b).toBeGreaterThanOrEqual(1);
      expect(problem.b).toBeLessThanOrEqual(9);
      expect(problem.a).not.toBe(problem.b);
    }
  });

  it('直前の問題と同じ式/片方のオペランド/同じ答えを避ける', () => {
    const lastProblem = { a: 1, b: 2, expression: '1 + 2', answer: 3 };
    const lastAnswer = 7;
    for (let i = 0; i < times; i += 1) {
      const next = createProblem({ lastProblem, lastAnswer });
      expect(next.expression).not.toBe(lastProblem.expression);
      expect(next.a).not.toBe(lastProblem.a);
      expect(next.b).not.toBe(lastProblem.b);
      expect(next.answer).not.toBe(lastAnswer);
    }
  });

  it('ランダムシードを指定しても制約を守る', () => {
    let seed = 42;
    const rng = () => {
      // 線形合同法で決定的な乱数を生成
      seed = (seed * 1664525 + 1013904223) % 2 ** 32;
      return seed / 2 ** 32;
    };

    const first = createProblem({ rng });
    const second = createProblem({
      lastProblem: first,
      lastAnswer: first.answer,
      rng,
    });

    expect(first.a).not.toBe(first.b);
    expect(second.expression).not.toBe(first.expression);
    expect(second.a).not.toBe(first.a);
    expect(second.b).not.toBe(first.b);
    expect(second.answer).not.toBe(first.answer);
  });
});

describe('evaluateNBack', () => {
  it('履歴が足りないときは ready=false を返す', () => {
    const result = evaluateNBack(5, [1], 2);
    expect(result.ready).toBe(false);
    expect(result.expected).toBeNull();
  });

  it('n-back の位置を正しく判定する', () => {
    const history = [3, 5, 7, 1];
    const result = evaluateNBack(5, history, 2); // 2問前は 7
    expect(result.ready).toBe(true);
    expect(result.expected).toBe(7);
    expect(result.correct).toBe(false);
    const correctResult = evaluateNBack(7, history, 2);
    expect(correctResult.correct).toBe(true);
  });
});

describe('calcAccuracyPercent', () => {
  it('total が 0 のときは 0 を返す', () => {
    expect(calcAccuracyPercent(0, 0)).toBe(0);
  });

  it('正答率を整数で丸めて返す', () => {
    expect(calcAccuracyPercent(1, 3)).toBe(33);
    expect(calcAccuracyPercent(2, 3)).toBe(67);
  });
});
