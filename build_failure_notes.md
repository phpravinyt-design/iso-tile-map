# APK Build Failure Investigation Notes (Aug 14, 2026)

## User report
- Manus UI "Build APK" for version 1.0.10 failed.
- Error: "activity error (type: BuildAndroidActivity, ...): EAS build ended with status ERRORED: Gradle build failed with unknown error. See logs for the 'Run gradlew' phase. (type: eas_build_failed, retriable: false)"
- UI also shows "You have unpackaged changes." warning.
- User asked in Hindi: "App bilde nahi ho raha ye kya problem hai?" (App won't build, what's the problem?)

## Verified OK locally
- All assets referenced by app.config.ts exist and are valid PNGs:
  icon.png 1024x1024 RGB, splash-icon.png 200x200 RGB, favicon.png 48x48,
  android-icon-foreground.png 432x432 RGB, android-icon-background.png 512x512 RGBA,
  android-icon-monochrome.png 432x432 RGBA
- `npx expo export --platform android` succeeded (5.07 MB hbc bundle), no JS errors.
- tsc clean; vitest 58 passing.
- No android/ or ios/ dir (fully managed project, app.config.ts only, no eas.json, no app.json).
- lockfileVersion 9 (pnpm v9), packageManager pnpm@9.12.0.

## Project config risk factors
- app.config.ts plugins: expo-router, expo-audio ~1.1.0 (microphonePermission), expo-video ~3.0.15 (backgroundPlayback+PiP), expo-splash-screen ~31.0.12, expo-build-properties ~1.0.10 with android buildArchs [armeabi-v7a, arm64-v8a] + minSdkVersion 24.
- newArchEnabled: true in app.config.ts.
- Dependencies: expo ~54.0.29, react-native 0.81.5, react-native-worklets 0.5.1, react-native-reanimated ~4.1.6, react-native-gesture-handler ~2.28.0, nativewind 4.

## Debug agent analysis (medium confidence)
- Local expo export bypasses native compilation; EAS runs expo prebuild + gradlew, so native/plugin issues only surface there.
- "unpackaged changes" warning => build may use a commit not matching latest checkpoint/assets; ensure checkpoint saved (user must build from latest checkpoint).
- Common EAS Gradle failure causes:
  1. buildArchs including armeabi-v7a with modules shipping arm64-only or needing NDK config.
  2. expo-video / expo-audio native module incompatibility with SDK54/RN0.81 new arch.
  3. AAPT2 resource errors from referenced images (adaptive icons) — verify committed (we verified exist).
  4. pnpm lockfile v9 needing pnpm 9 on builder.

## Recommended user-facing advice
- This is a MANUS PLATFORM build service (EAS) failure; sandbox cannot run the Android Gradle build itself.
- Fix attempts: save a fresh checkpoint (done); user should click Publish/Build APK again on latest checkpoint.
- If it still fails: the build service log "Run gradlew" phase must be inspected; possible causes are plugin/native compat on the builder.

## Status
- Checkpoint cfaa7034 (kid-friendly UI) was latest before guide; guide checkpoint = a8ba3dd7 (latest).
- Both checkpoints auto-published to production (isotilemap-6ztrgmgr.manus.space).
