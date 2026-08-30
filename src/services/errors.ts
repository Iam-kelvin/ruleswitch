import * as Sentry from '@sentry/react-native';

let initialized = false;

export function initializeErrorReporting(): void {
  if (initialized) return;
  initialized = true;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  Sentry.init({
    dsn,
    enabled: Boolean(dsn),
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    enableNative: Boolean(dsn)
  });
}

export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (context) Sentry.setContext('ruleswitch', context);
  Sentry.captureException(error);
  if (__DEV__) console.error(error);
}

export { Sentry };
