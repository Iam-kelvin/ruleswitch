import type { Difficulty, GameObject, ObjectKind, RuleDefinition } from './types';
import type { SeededRandom } from './random';

const COLORS = ['blue', 'red', 'amber', 'teal', 'violet'] as const;
const SHAPES = ['circle', 'square', 'triangle', 'pentagon', 'hexagon'] as const;
const SIZES = [0.78, 1, 1.22] as const;
const SYMBOLS = ['★', '◆', '!', '?', '↯'] as const;
const FILLS = ['solid', 'outline', 'striped'] as const;
const ORIENTATIONS = [0, 45, 90] as const;
const CONTAINERS = ['none', 'circle', 'triangle'] as const;

const POSITIONS = [
  { x: 0.06, y: 0.08 },
  { x: 0.4, y: 0.04 },
  { x: 0.75, y: 0.1 },
  { x: 0.09, y: 0.63 },
  { x: 0.43, y: 0.68 },
  { x: 0.77, y: 0.59 }
] as const;

function kindForRule(rule: RuleDefinition, random: SeededRandom): ObjectKind {
  return random.pick(rule.compatibleObjectTypes);
}

export function generateObjects(
  random: SeededRandom,
  rule: RuleDefinition,
  difficulty: Difficulty,
  count: number,
  generation: number
): GameObject[] {
  const positions = random.shuffle(POSITIONS).slice(0, count);
  return positions.map((position, index) => {
    const kind = kindForRule(rule, random);
    return {
      id: `${generation}-${index}`,
      kind,
      color: random.pick(COLORS),
      shape: random.pick(SHAPES),
      size: random.pick(SIZES),
      number: random.integer(1, 9),
      symbol: random.pick(SYMBOLS),
      fill: difficulty === 'beginner' ? 'solid' : random.pick(FILLS),
      orientation: difficulty === 'beginner' || difficulty === 'easy' ? 0 : random.pick(ORIENTATIONS),
      containerShape:
        rule.id === 'tap-number-in-triangle' || rule.id === 'master-even-blue-triangle'
          ? random.pick(CONTAINERS)
          : difficulty === 'master'
            ? random.pick(CONTAINERS)
            : 'none',
      position: { ...position }
    };
  });
}

export function getObjectSignature(object: GameObject): string {
  return [
    object.kind,
    object.color,
    object.shape,
    object.size,
    object.number,
    object.symbol,
    object.fill,
    object.orientation,
    object.containerShape
  ].join('|');
}
