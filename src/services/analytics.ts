import PostHog from 'posthog-react-native';
import { reportError } from './errors';

export type AnalyticsEvent =
  | 'app_opened'
  | 'tutorial_started'
  | 'tutorial_completed'
  | 'round_started'
  | 'round_completed'
  | 'action_correct'
  | 'action_incorrect'
  | 'rule_changed'
  | 'rule_type'
  | 'difficulty_selected'
  | 'daily_started'
  | 'daily_completed'
  | 'time_attack_started'
  | 'time_attack_completed'
  | 'no_mistakes_started'
  | 'no_mistakes_ended'
  | 'achievement_unlocked';

let client: PostHog | null = null;

function getClient(): PostHog | null {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new PostHog(apiKey, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      disabled: false,
      flushAt: 10,
      flushInterval: 30_000
    });
  }
  return client;
}

export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean | null> = {}): void {
  try {
    getClient()?.capture(event, properties);
  } catch (error) {
    reportError(error, { service: 'analytics', event });
  }
}

export async function flushAnalytics(): Promise<void> {
  try {
    await getClient()?.flush();
  } catch (error) {
    reportError(error, { service: 'analytics', operation: 'flush' });
  }
}
