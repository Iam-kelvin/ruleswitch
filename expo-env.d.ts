/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_POSTHOG_KEY?: string;
    EXPO_PUBLIC_POSTHOG_HOST?: string;
    EXPO_PUBLIC_SENTRY_DSN?: string;
  }
}
