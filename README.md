# RuleSwitch

RuleSwitch is a production-oriented, offline-first attention and mental-flexibility game built with Expo, React Native, TypeScript, and Expo Router. It runs on Android and as a responsive installable web app.

The player reacts to a visible rule, then resets their instinct whenever the rule changes. The rules engine supports tap, ignore, number, swipe, comparison, conditional, and reversal rules through structured definitions rather than screen-specific logic.

## Included gameplay

- Journey: 35 deterministic levels across seven chapters and six difficulty tiers
- Daily Switch: one offline deterministic sequence per local calendar day; the first result is official and replays never replace it
- Endless: open-ended play with a manual score finish
- Time Attack: a 60-second run where mistakes also cost two seconds
- No Mistakes: continues until the first wrong action or missed prompt
- Interactive four-step tutorial
- Procedural, validated targets and distractors
- Score, XP, level, action streaks, Daily streaks, per-rule stats, and 12 achievements
- Local settings for sound, music, haptics, theme, high contrast, reduced motion, and preferred difficulty
- Generated offline sound effects/music and colorblind-safe visual cues

## Requirements

- Node.js 20.19.4+ on the Node 20 line, Node.js 22.13+, or Node.js 24.3+
- npm 10 or newer
- JDK 17 for local Android builds
- Android Studio with Android SDK/Build Tools 36, NDK 27.1.12297006, and CMake 3.22.1
- An Expo/EAS account only when creating a hosted EAS build

This project uses Expo SDK 55 / React Native 0.83 because that stable SDK supports the checked-in environment. No iOS target is configured as a current product requirement.

## Setup

```bash
npm install
npm run assets
cp .env.example .env
```

The `.env` file is optional for local play. With no credentials, PostHog and Sentry stay disabled and the entire gameplay loop still works offline.

## Run

```bash
# Interactive Expo development server
npm start

# Android emulator or connected Android device
npm run android

# Browser
npm run web
```

The app requires no account or backend. Progress is stored in AsyncStorage on Android and the browser-backed AsyncStorage implementation on web.

## Test and validate

```bash
npm test
npm run typecheck
npm run lint

# All three checks in sequence
npm run validate
```

The automated suite covers rule evaluation, conditional and reversal logic, swipe direction, comparison rules, scoring, streak/progression updates, deterministic seeds, Daily seeds, persistence, achievements, and thousands of generated challenge validations across all difficulty tiers.

## Web/PWA build and deployment

```bash
npm run build:web
npm run preview:web
```

Expo exports the static site to `dist/`. Deploy that directory to any static host such as Cloudflare Pages, Netlify, Vercel static hosting, or an object-storage/CDN setup. Configure clean paths such as `/settings` to serve the matching `settings.html`, with `index.html` as the final navigation fallback. The build script copies the PWA manifest, then content-fingerprints and precaches every exported route and asset in the generated `dist/sw.js`. Installed clients receive a new cache automatically whenever exported content changes. A service worker requires HTTPS outside localhost.

### Coolify

No RuleSwitch API, database, account service, persistent volume, or server secret is required. The checked-in multi-stage `Dockerfile` performs the static Expo export and serves it through the checked-in Nginx configuration. This is preferable to a generic static preset in Coolify because it guarantees clean Expo Router paths, safe cache behavior for the service worker, immutable caching for fingerprinted bundles, and a health endpoint.

Create a Coolify **Dockerfile** application from this repository with:

- Dockerfile location: `/Dockerfile`
- Exposed/container port: `80`
- Health-check path: `/healthz`
- Health-check expected status: `200`
- Build command, start command, and persistent volumes: leave unset; the image defines them
- Domain: your chosen HTTPS domain; enable Coolify's automatic TLS certificate

Optional values must be marked as **build variables** in Coolify because Expo embeds `EXPO_PUBLIC_*` values during `docker build`. They are public client configuration, not secrets:

| Variable | Value |
| --- | --- |
| `EXPO_PUBLIC_POSTHOG_KEY` | Leave empty to disable analytics, or use the PostHog project key (normally starts with `phc_`) |
| `EXPO_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` for PostHog US, or your PostHog region/self-hosted ingest URL |
| `EXPO_PUBLIC_SENTRY_DSN` | Leave empty to disable crash uploads, or use the client DSN from the Sentry project settings |

Do not add `SENTRY_AUTH_TOKEN`, Android keystore passwords, or any other private credential to the web application's build arguments. For a resource-conscious Coolify deployment, allocate one build CPU and about 2 GB of build memory; the final Nginx container normally needs only a small fraction of that at runtime.

## Android builds

### Ready-to-install QA APK

The native build targets 64-bit ARM Android devices running Android 7.0 (API 24) or newer. A fresh checkout does not include `android/app/debug.keystore`; Expo prebuild or the release builder must create that ignored local development key first. Then create a release-mode APK signed with it for direct QA installation only:

```bash
cd android
RULESWITCH_ALLOW_DEBUG_RELEASE_SIGNING=true ./gradlew --no-daemon --max-workers=1 :app:assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`. This explicit debug-signing opt-in is suitable for device testing but must never be submitted to Google Play or treated as a long-lived production signing identity.

Install it on a connected device with USB debugging enabled:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Locally signed production APK

Generate and securely back up a private Android upload keystore outside the repository. Then set all four values below in the shell that runs Gradle (or use the matching lower-camel-case properties in a private `~/.gradle/gradle.properties`):

| Environment variable | Required value | Gradle property alternative |
| --- | --- | --- |
| `RULESWITCH_UPLOAD_STORE_FILE` | Absolute keystore path, or a path relative to `android/` | `ruleswitchUploadStoreFile` |
| `RULESWITCH_UPLOAD_STORE_PASSWORD` | Keystore password | `ruleswitchUploadStorePassword` |
| `RULESWITCH_UPLOAD_KEY_ALIAS` | Upload key alias | `ruleswitchUploadKeyAlias` |
| `RULESWITCH_UPLOAD_KEY_PASSWORD` | Upload key password | `ruleswitchUploadKeyPassword` |

Run `./gradlew --no-daemon --max-workers=1 :app:assembleRelease` from `android/`. The keystore and its passwords are deliberately absent from `.env.example`, Git, and the Docker image. If any signing value is provided, all four are required.

### Hosted builds

Install the EAS CLI and associate the app with a real EAS project before the first hosted build:

```bash
npm install --global eas-cli
eas login
eas init

# Internal APK
eas build --platform android --profile preview

# Play Store AAB
npm run build:android
```

`eas init` replaces the safe `SET_WITH_EAS_INIT` value in `app.json`; this real EAS project UUID is the only currently missing hosted-build value. EAS can manage the Android upload credential without committing a keystore. Android application ID is `com.ruleswitch.game`; change it before the first store submission if another owner controls that identifier.

The generated `android/` native project is included for local APK builds. Re-run prebuild after changing native Expo configuration, then review the generated changes:

```bash
npx expo prebuild --platform android
```

## Optional analytics and crash reporting

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_POSTHOG_KEY` and optionally `EXPO_PUBLIC_POSTHOG_HOST`
- `EXPO_PUBLIC_SENTRY_DSN`

Only non-sensitive game events and performance properties are captured. The app never identifies a guest. Sentry default PII collection is disabled.

Sentry event uploads work with only the public DSN, but readable production stack traces also require source maps. Source-map upload is not enabled in the current generic configuration because a real Sentry organization and project have not been supplied. When enabling it, configure the Sentry Expo build plugin for that organization/project and add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` as EAS secrets. Those values must not use the `EXPO_PUBLIC_` prefix and are not Coolify runtime values.

## Architecture

```text
src/app/          Expo Router screens and platform HTML shell
src/components/   Responsive, accessible presentation components
src/engine/       Pure rules, objects, validation, seeds, scoring, achievements
src/game/         Live session/timer/input orchestration
src/state/        Versioned persistence and progression updates
src/services/     PostHog, Sentry, audio/haptics, PWA, monetization boundary
scripts/          Deterministic generation of app icons and offline WAV assets
public/           PWA manifest and service worker
```

Gameplay does not import ad, analytics, persistence, or navigation code. The pure engine accepts a seed and version, produces deterministic challenges, calculates exact valid actions, and rejects invalid target/distractor sets before they reach a screen. This boundary also prepares later cloud saves, leaderboards, friend challenges, rewarded ads, interstitials between sessions, and Android Remove Ads billing without coupling those services to an active sequence.

## Data reset and privacy

Settings → Reset all progress clears the RuleSwitch AsyncStorage key, including progress, Daily results, achievements, and preferences. Settings → Privacy explains all locally stored fields and optional network behavior in the app.
