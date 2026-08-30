import { DIFFICULTIES, type Difficulty, type GameObject, type PredicateCondition, type RuleDefinition } from './types';

export const RULES: RuleDefinition[] = [
  {
    id: 'tap-blue',
    category: 'tap',
    minimumDifficulty: 'beginner',
    condition: { type: 'predicate', predicate: { type: 'color', value: 'blue' } },
    expectedAction: 'tap',
    displayText: 'TAP BLUE',
    instructionHint: 'Find the blue cue. Color initials keep it colorblind-safe.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'color'
  },
  {
    id: 'tap-circles',
    category: 'tap',
    minimumDifficulty: 'beginner',
    condition: { type: 'predicate', predicate: { type: 'shape', value: 'circle' } },
    expectedAction: 'tap',
    displayText: 'TAP CIRCLES',
    instructionHint: 'Shape matters. Color does not.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'shape'
  },
  {
    id: 'tap-above',
    category: 'tap',
    minimumDifficulty: 'easy',
    condition: { type: 'predicate', predicate: { type: 'position', value: 'above' } },
    expectedAction: 'tap',
    displayText: 'TAP ABOVE CENTER',
    instructionHint: 'Choose an object in the upper half.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'position'
  },
  {
    id: 'avoid-red',
    category: 'ignore',
    minimumDifficulty: 'beginner',
    condition: { type: 'predicate', predicate: { type: 'color', value: 'red', negate: true } },
    expectedAction: 'tap',
    displayText: 'AVOID RED · TAP ANOTHER',
    instructionHint: 'Red is a distractor. Tap anything valid instead.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'color'
  },
  {
    id: 'avoid-triangles',
    category: 'ignore',
    minimumDifficulty: 'easy',
    condition: { type: 'predicate', predicate: { type: 'shape', value: 'triangle', negate: true } },
    expectedAction: 'tap',
    displayText: 'IGNORE TRIANGLES',
    instructionHint: 'Tap a shape that is not a triangle.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'shape'
  },
  {
    id: 'tap-even',
    category: 'number',
    minimumDifficulty: 'easy',
    condition: { type: 'predicate', predicate: { type: 'numberParity', value: 'even' } },
    expectedAction: 'tap',
    displayText: 'TAP EVEN NUMBERS',
    instructionHint: '2, 4, 6, and 8 are valid.',
    compatibleObjectTypes: ['number'],
    focus: 'number'
  },
  {
    id: 'tap-odd',
    category: 'number',
    minimumDifficulty: 'normal',
    condition: { type: 'predicate', predicate: { type: 'numberParity', value: 'odd' } },
    expectedAction: 'tap',
    displayText: 'TAP ODD NUMBERS',
    instructionHint: '1, 3, 5, 7, and 9 are valid.',
    compatibleObjectTypes: ['number'],
    focus: 'number'
  },
  {
    id: 'avoid-below-five',
    category: 'number',
    minimumDifficulty: 'normal',
    condition: { type: 'predicate', predicate: { type: 'numberCompare', operator: 'lt', value: 5, negate: true } },
    expectedAction: 'tap',
    displayText: 'IGNORE NUMBERS BELOW 5',
    instructionHint: 'Tap 5 or higher.',
    compatibleObjectTypes: ['number'],
    focus: 'number'
  },
  {
    id: 'swipe-circles-left',
    category: 'swipe',
    minimumDifficulty: 'hard',
    condition: { type: 'predicate', predicate: { type: 'shape', value: 'circle' } },
    expectedAction: 'swipeLeft',
    displayText: 'SWIPE CIRCLES LEFT',
    instructionHint: 'Start on a circle and move left.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'shape'
  },
  {
    id: 'swipe-squares-right',
    category: 'swipe',
    minimumDifficulty: 'hard',
    condition: { type: 'predicate', predicate: { type: 'shape', value: 'square' } },
    expectedAction: 'swipeRight',
    displayText: 'SWIPE SQUARES RIGHT',
    instructionHint: 'Start on a square and move right.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'shape'
  },
  {
    id: 'swipe-odd-up',
    category: 'swipe',
    minimumDifficulty: 'hard',
    condition: { type: 'predicate', predicate: { type: 'numberParity', value: 'odd' } },
    expectedAction: 'swipeUp',
    displayText: 'SWIPE ODD NUMBERS UP',
    instructionHint: 'Choose an odd number and move upward.',
    compatibleObjectTypes: ['number'],
    focus: 'number'
  },
  {
    id: 'tap-largest',
    category: 'comparison',
    minimumDifficulty: 'normal',
    condition: { type: 'comparison', metric: 'size', order: 'max' },
    expectedAction: 'tap',
    displayText: 'TAP THE LARGEST',
    instructionHint: 'Compare every object before choosing.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'size'
  },
  {
    id: 'tap-smallest-number',
    category: 'comparison',
    minimumDifficulty: 'hard',
    condition: { type: 'comparison', metric: 'number', order: 'min' },
    expectedAction: 'tap',
    displayText: 'TAP THE SMALLEST NUMBER',
    instructionHint: 'Find the lowest number on the board.',
    compatibleObjectTypes: ['number'],
    focus: 'number'
  },
  {
    id: 'tap-closest-center',
    category: 'comparison',
    minimumDifficulty: 'hard',
    condition: { type: 'comparison', metric: 'centerDistance', order: 'min' },
    expectedAction: 'tap',
    displayText: 'TAP CLOSEST TO CENTER',
    instructionHint: 'Judge position, not appearance.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'position'
  },
  {
    id: 'tap-blue-circles',
    category: 'conditional',
    minimumDifficulty: 'normal',
    condition: {
      type: 'predicate',
      predicate: { type: 'and', conditions: [{ type: 'color', value: 'blue' }, { type: 'shape', value: 'circle' }] }
    },
    expectedAction: 'tap',
    displayText: 'TAP BLUE CIRCLES ONLY',
    instructionHint: 'Both color and shape must match.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'conditional'
  },
  {
    id: 'tap-even-unless-red',
    category: 'conditional',
    minimumDifficulty: 'hard',
    condition: {
      type: 'predicate',
      predicate: {
        type: 'andNot',
        include: { type: 'numberParity', value: 'even' },
        exclude: { type: 'color', value: 'red' }
      }
    },
    expectedAction: 'tap',
    displayText: 'TAP EVEN · UNLESS RED',
    instructionHint: 'Even is valid only when the color is not red.',
    compatibleObjectTypes: ['number'],
    focus: 'conditional'
  },
  {
    id: 'swipe-over-five-right',
    category: 'conditional',
    minimumDifficulty: 'hard',
    condition: { type: 'predicate', predicate: { type: 'numberCompare', operator: 'gt', value: 5 } },
    expectedAction: 'swipeRight',
    displayText: 'IF NUMBER > 5 · SWIPE RIGHT',
    instructionHint: 'Only numbers 6 through 9 qualify.',
    compatibleObjectTypes: ['number'],
    focus: 'conditional'
  },
  {
    id: 'tap-number-in-triangle',
    category: 'conditional',
    minimumDifficulty: 'expert',
    condition: {
      type: 'predicate',
      predicate: { type: 'and', conditions: [{ type: 'container', value: 'triangle' }, { type: 'numberCompare', operator: 'gt', value: 0 }] }
    },
    expectedAction: 'tap',
    displayText: 'TAP NUMBERS IN TRIANGLES',
    instructionHint: 'The outer container is part of the rule.',
    compatibleObjectTypes: ['number'],
    focus: 'conditional'
  },
  {
    id: 'opposite-tap-blue',
    category: 'reversal',
    minimumDifficulty: 'expert',
    condition: { type: 'predicate', predicate: { type: 'color', value: 'blue', negate: true } },
    expectedAction: 'tap',
    displayText: 'OPPOSITE · TAP BLUE',
    instructionHint: 'Do the opposite: tap an object that is not blue.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'color'
  },
  {
    id: 'reverse-circle-left',
    category: 'reversal',
    minimumDifficulty: 'expert',
    condition: { type: 'predicate', predicate: { type: 'shape', value: 'circle' } },
    expectedAction: 'swipeRight',
    displayText: 'REVERSE · CIRCLES LEFT',
    instructionHint: 'Reverse left to right.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'shape'
  },
  {
    id: 'reverse-ignore-triangles',
    category: 'reversal',
    minimumDifficulty: 'master',
    condition: { type: 'predicate', predicate: { type: 'shape', value: 'triangle' } },
    expectedAction: 'tap',
    displayText: 'REVERSE · IGNORE TRIANGLES',
    instructionHint: 'Reverse ignore to tap: choose a triangle.',
    compatibleObjectTypes: ['shape', 'number', 'symbol'],
    focus: 'shape'
  },
  {
    id: 'master-even-blue-triangle',
    category: 'conditional',
    minimumDifficulty: 'master',
    condition: {
      type: 'predicate',
      predicate: {
        type: 'and',
        conditions: [
          { type: 'numberParity', value: 'even' },
          { type: 'color', value: 'blue' },
          { type: 'container', value: 'triangle' }
        ]
      }
    },
    expectedAction: 'tap',
    displayText: 'EVEN + BLUE + IN TRIANGLE',
    instructionHint: 'All three conditions must match.',
    compatibleObjectTypes: ['number'],
    focus: 'conditional'
  }
];

export function evaluatePredicate(condition: PredicateCondition, object: GameObject): boolean {
  if (condition.type === 'and') return condition.conditions.every((part) => evaluatePredicate(part, object));
  if (condition.type === 'andNot') {
    return evaluatePredicate(condition.include, object) && !evaluatePredicate(condition.exclude, object);
  }

  let result: boolean;
  switch (condition.type) {
    case 'color':
      result = object.color === condition.value;
      break;
    case 'shape':
      result = object.shape === condition.value;
      break;
    case 'numberParity':
      result = condition.value === 'even' ? object.number % 2 === 0 : object.number % 2 === 1;
      break;
    case 'numberCompare':
      result = condition.operator === 'gt' ? object.number > condition.value : object.number < condition.value;
      break;
    case 'position':
      result = condition.value === 'above' ? object.position.y < 0.5 : object.position.y > 0.5;
      break;
    case 'container':
      result = object.containerShape === condition.value;
      break;
  }
  return condition.negate ? !result : result;
}

function comparisonMetric(rule: RuleDefinition, object: GameObject): number {
  if (rule.condition.type !== 'comparison') throw new Error(`Rule ${rule.id} is not a comparison rule.`);
  switch (rule.condition.metric) {
    case 'size':
      return object.size;
    case 'number':
      return object.number;
    case 'centerDistance':
      return Math.hypot(object.position.x - 0.5, object.position.y - 0.5);
  }
}

export function getTargetObjects(rule: RuleDefinition, objects: GameObject[]): GameObject[] {
  const condition = rule.condition;
  if (condition.type === 'predicate') {
    return objects.filter((object) => evaluatePredicate(condition.predicate, object));
  }

  const metrics = objects.map((object) => comparisonMetric(rule, object));
  const targetMetric = condition.order === 'min' ? Math.min(...metrics) : Math.max(...metrics);
  return objects.filter((object) => Math.abs(comparisonMetric(rule, object) - targetMetric) < 0.000001);
}

export function getRulesForDifficulty(difficulty: Difficulty): RuleDefinition[] {
  const maximumIndex = DIFFICULTIES.indexOf(difficulty);
  return RULES.filter((rule) => DIFFICULTIES.indexOf(rule.minimumDifficulty) <= maximumIndex);
}

export function getRuleById(id: string): RuleDefinition | undefined {
  return RULES.find((rule) => rule.id === id);
}
