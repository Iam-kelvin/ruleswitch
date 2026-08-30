export const DIFFICULTIES = ['beginner', 'easy', 'normal', 'hard', 'expert', 'master'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const GAME_MODES = ['journey', 'daily', 'endless', 'timeAttack', 'noMistakes'] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const RULE_CATEGORIES = [
  'tap',
  'ignore',
  'number',
  'swipe',
  'comparison',
  'conditional',
  'reversal'
] as const;
export type RuleCategory = (typeof RULE_CATEGORIES)[number];

export type RuleFocus = 'color' | 'shape' | 'number' | 'position' | 'size' | 'conditional';
export type ActionType = 'tap' | 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown';
export type ObjectKind = 'shape' | 'number' | 'symbol';
export type ShapeName = 'circle' | 'square' | 'triangle' | 'pentagon' | 'hexagon';
export type ColorName = 'blue' | 'red' | 'amber' | 'teal' | 'violet';
export type FillStyle = 'solid' | 'outline' | 'striped';
export type ContainerShape = 'none' | 'circle' | 'triangle';

export interface GameObject {
  id: string;
  kind: ObjectKind;
  color: ColorName;
  shape: ShapeName;
  size: 0.78 | 1 | 1.22;
  number: number;
  symbol: '★' | '◆' | '!' | '?' | '↯';
  fill: FillStyle;
  orientation: 0 | 45 | 90;
  containerShape: ContainerShape;
  position: {
    x: number;
    y: number;
  };
}

export type PredicateCondition =
  | { type: 'color'; value: ColorName; negate?: boolean }
  | { type: 'shape'; value: ShapeName; negate?: boolean }
  | { type: 'numberParity'; value: 'even' | 'odd'; negate?: boolean }
  | { type: 'numberCompare'; operator: 'gt' | 'lt'; value: number; negate?: boolean }
  | { type: 'position'; value: 'above' | 'below'; negate?: boolean }
  | { type: 'container'; value: Exclude<ContainerShape, 'none'>; negate?: boolean }
  | { type: 'and'; conditions: PredicateCondition[] }
  | { type: 'andNot'; include: PredicateCondition; exclude: PredicateCondition };

export type RuleCondition =
  | { type: 'predicate'; predicate: PredicateCondition }
  | { type: 'comparison'; metric: 'size' | 'number' | 'centerDistance'; order: 'min' | 'max' };

export interface RuleDefinition {
  id: string;
  category: RuleCategory;
  minimumDifficulty: Difficulty;
  condition: RuleCondition;
  expectedAction: ActionType;
  displayText: string;
  instructionHint: string;
  compatibleObjectTypes: ObjectKind[];
  focus: RuleFocus;
}

export interface ExpectedTarget {
  objectId: string;
  action: ActionType;
}

export interface Challenge {
  id: string;
  index: number;
  rule: RuleDefinition;
  objects: GameObject[];
  expectedTargets: ExpectedTarget[];
  isRuleSwitch: boolean;
  timeLimitMs: number;
}

export interface SequenceOptions {
  seed: string;
  difficulty: Difficulty;
  mode: GameMode;
  count: number;
  journeyLevel?: number;
}

export interface UserAction {
  objectId: string;
  action: ActionType;
}

export interface SessionSummary {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  seed: string;
  journeyLevel?: number;
  startedAt: string;
  completedAt: string;
  score: number;
  attempts: number;
  correctActions: number;
  mistakes: number;
  accuracy: number;
  averageResponseTimeMs: number;
  bestResponseTimeMs: number | null;
  bestStreak: number;
  ruleSwitches: number;
  xpEarned: number;
  categoryResults: Partial<Record<RuleCategory, CategorySessionResult>>;
  focusResults: Partial<Record<RuleFocus, CategorySessionResult>>;
  newAchievementIds: string[];
  officialDaily: boolean;
}

export interface CategorySessionResult {
  attempts: number;
  correct: number;
  totalResponseTimeMs: number;
  bestResponseTimeMs: number | null;
}
