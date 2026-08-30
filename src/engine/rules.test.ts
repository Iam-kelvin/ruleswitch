import { describe, expect, it } from 'vitest';
import { getRuleById, getTargetObjects } from './rules';
import type { GameObject } from './types';

function object(overrides: Partial<GameObject>): GameObject {
  return {
    id: 'object',
    kind: 'number',
    color: 'blue',
    shape: 'circle',
    size: 1,
    number: 2,
    symbol: '★',
    fill: 'solid',
    orientation: 0,
    containerShape: 'none',
    position: { x: 0.5, y: 0.5 },
    ...overrides
  };
}

function targets(ruleId: string, objects: GameObject[]) {
  const rule = getRuleById(ruleId);
  if (!rule) throw new Error(`Missing test rule ${ruleId}`);
  return getTargetObjects(rule, objects).map((item) => item.id);
}

describe('rule evaluation', () => {
  it('evaluates tap and ignore rules without relying on display text', () => {
    const blue = object({ id: 'blue', color: 'blue' });
    const red = object({ id: 'red', color: 'red' });
    expect(targets('tap-blue', [blue, red])).toEqual(['blue']);
    expect(targets('avoid-red', [blue, red])).toEqual(['blue']);
  });

  it('evaluates number parity and comparisons exactly', () => {
    const two = object({ id: 'two', number: 2 });
    const seven = object({ id: 'seven', number: 7 });
    expect(targets('tap-even', [two, seven])).toEqual(['two']);
    expect(targets('tap-smallest-number', [seven, two])).toEqual(['two']);
  });

  it('requires every conditional property', () => {
    const valid = object({ id: 'valid', color: 'blue', shape: 'circle' });
    const wrongColor = object({ id: 'wrongColor', color: 'red', shape: 'circle' });
    const wrongShape = object({ id: 'wrongShape', color: 'blue', shape: 'square' });
    expect(targets('tap-blue-circles', [valid, wrongColor, wrongShape])).toEqual(['valid']);
  });

  it('supports unless logic', () => {
    const evenBlue = object({ id: 'evenBlue', number: 8, color: 'blue' });
    const evenRed = object({ id: 'evenRed', number: 8, color: 'red' });
    const oddBlue = object({ id: 'oddBlue', number: 7, color: 'blue' });
    expect(targets('tap-even-unless-red', [evenBlue, evenRed, oddBlue])).toEqual(['evenBlue']);
  });

  it('resolves comparison rules to the unique metric winner', () => {
    const near = object({ id: 'near', position: { x: 0.48, y: 0.51 } });
    const far = object({ id: 'far', position: { x: 0.9, y: 0.9 } });
    expect(targets('tap-closest-center', [far, near])).toEqual(['near']);
  });

  it('reverses predicates and swipe direction', () => {
    const blueCircle = object({ id: 'blueCircle', color: 'blue', shape: 'circle' });
    const redSquare = object({ id: 'redSquare', color: 'red', shape: 'square' });
    expect(targets('opposite-tap-blue', [blueCircle, redSquare])).toEqual(['redSquare']);
    expect(getRuleById('reverse-circle-left')?.expectedAction).toBe('swipeRight');
    expect(targets('reverse-circle-left', [blueCircle, redSquare])).toEqual(['blueCircle']);
  });

  it('keeps swipe directions unambiguous', () => {
    expect(getRuleById('swipe-circles-left')?.expectedAction).toBe('swipeLeft');
    expect(getRuleById('swipe-squares-right')?.expectedAction).toBe('swipeRight');
    expect(getRuleById('swipe-odd-up')?.expectedAction).toBe('swipeUp');
  });
});
