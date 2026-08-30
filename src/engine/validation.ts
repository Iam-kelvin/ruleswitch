import { getObjectSignature } from './objects';
import { getTargetObjects } from './rules';
import type { Challenge, ExpectedTarget, GameObject, RuleDefinition } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const SWIPE_ACTIONS = new Set(['swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown']);

function targetsFor(rule: RuleDefinition, objects: GameObject[]): ExpectedTarget[] {
  return getTargetObjects(rule, objects).map((object) => ({ objectId: object.id, action: rule.expectedAction }));
}

export function validateCandidate(rule: RuleDefinition, objects: GameObject[]): ValidationResult {
  const errors: string[] = [];
  if (!rule.id || !rule.displayText || !rule.instructionHint) errors.push('Rule metadata is incomplete.');
  if (objects.length < 2) errors.push('A challenge must contain a target and a distractor.');
  if (new Set(objects.map((object) => object.id)).size !== objects.length) errors.push('Object IDs must be unique.');
  if (new Set(objects.map(getObjectSignature)).size !== objects.length) errors.push('Visually identical objects are not allowed.');

  const targets = getTargetObjects(rule, objects);
  if (targets.length === 0) errors.push('The rule has no valid target.');
  if (targets.length >= objects.length) errors.push('The rule has no distractor.');

  if (rule.condition.type === 'comparison' && targets.length !== 1) {
    errors.push('Comparison rules must have exactly one visually defensible answer.');
  }

  if (rule.expectedAction.startsWith('swipe') && !SWIPE_ACTIONS.has(rule.expectedAction)) {
    errors.push('Swipe direction is ambiguous.');
  }

  if (rule.compatibleObjectTypes.length === 1) {
    const requiredKind = rule.compatibleObjectTypes[0]!;
    if (objects.some((object) => object.kind !== requiredKind)) errors.push('An object is incompatible with the rule.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateChallenge(challenge: Challenge): ValidationResult {
  const candidate = validateCandidate(challenge.rule, challenge.objects);
  const errors = [...candidate.errors];
  const calculated = targetsFor(challenge.rule, challenge.objects);
  const expected = [...challenge.expectedTargets].sort((a, b) => a.objectId.localeCompare(b.objectId));
  const actual = [...calculated].sort((a, b) => a.objectId.localeCompare(b.objectId));
  if (JSON.stringify(expected) !== JSON.stringify(actual)) errors.push('Stored target actions do not match rule logic.');
  return { valid: errors.length === 0, errors };
}
