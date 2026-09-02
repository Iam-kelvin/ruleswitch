import { DIFFICULTY_CONFIG, GAME_VERSION, getJourneyChapter } from './config';
import { generateObjects } from './objects';
import { createRandom } from './random';
import { getRulesForDifficulty, getTargetObjects } from './rules';
import type { Challenge, RuleCategory, RuleDefinition, SequenceOptions } from './types';
import { validateCandidate } from './validation';

const JOURNEY_ORDER: RuleCategory[] = ['tap', 'ignore', 'number', 'swipe', 'comparison', 'conditional', 'reversal'];

function eligibleRules(options: SequenceOptions): RuleDefinition[] {
  const byDifficulty = getRulesForDifficulty(options.difficulty);
  if (options.mode !== 'journey' || options.journeyLevel === undefined) return byDifficulty;
  const chapter = getJourneyChapter(options.journeyLevel);
  const unlockedCategories = JOURNEY_ORDER.slice(0, JOURNEY_ORDER.indexOf(chapter.category) + 1);
  const currentCategory = byDifficulty.filter((rule) => rule.category === chapter.category);
  const earlier = byDifficulty.filter((rule) => unlockedCategories.includes(rule.category));
  return options.journeyLevel % 5 === 0 ? earlier : currentCategory.length > 0 ? currentCategory : earlier;
}

function chooseNextRule(rules: RuleDefinition[], previous: RuleDefinition | null, randomValue: () => number): RuleDefinition {
  const choices = previous && rules.length > 1 ? rules.filter((rule) => rule.id !== previous.id) : rules;
  return choices[Math.floor(randomValue() * choices.length)]!;
}

export function generateSequence(options: SequenceOptions): Challenge[] {
  const random = createRandom(`${options.seed}|${GAME_VERSION}`);
  const rules = eligibleRules(options);
  if (rules.length === 0) throw new Error(`No compatible rules exist for ${options.difficulty}.`);
  const config = DIFFICULTY_CONFIG[options.difficulty];
  const challenges: Challenge[] = [];
  let activeRule: RuleDefinition | null = null;

  for (let index = 0; index < options.count; index += 1) {
    const isRuleSwitch = index > 0 && index % config.switchEvery === 0;
    if (index === 0 || isRuleSwitch) activeRule = chooseNextRule(rules, activeRule, random.next);
    if (!activeRule) throw new Error('Sequence could not select an active rule.');

    let objects = [] as ReturnType<typeof generateObjects>;
    let validationErrors: string[] = [];
    for (let attempt = 0; attempt < 250; attempt += 1) {
      objects = generateObjects(random, activeRule, options.difficulty, config.objectCount, index * 250 + attempt);
      const validation = validateCandidate(activeRule, objects);
      if (validation.valid) {
        validationErrors = [];
        break;
      }
      validationErrors = validation.errors;
    }
    if (validationErrors.length > 0) {
      throw new Error(`Could not generate challenge ${index}: ${validationErrors.join(' ')}`);
    }

    challenges.push({
      id: `${options.seed}:${index}`,
      index,
      rule: activeRule,
      objects,
      expectedTargets: getTargetObjects(activeRule, objects).map((object) => ({
        objectId: object.id,
        action: activeRule!.expectedAction
      })),
      isRuleSwitch,
      timeLimitMs: config.promptTimeMs
    });
  }

  return challenges;
}

export function dailySeed(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `daily:${year}-${month}-${day}`;
}

export function localDateKey(date = new Date()): string {
  return dailySeed(date).replace('daily:', '');
}
