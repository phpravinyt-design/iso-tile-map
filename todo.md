# Project TODO

- [x] Added Next Up unlock celebration: when the pinned Next Up badge unlocks, a 26-piece falling confetti burst (Reanimated, fade-in/fall+rotate/fade-out over ~3s, auto-clears, pointerEvents none, mounted inside the profile panel) plays alongside a bright E4→G4→B4→E5→E6 major arpeggio chime (gated by the sound toggle) and a Success haptic on native. Trigger detects the old Next Up badge just becoming earned. 53 tests passing, tsc clean.
- [x] Added a badge unlock toast to the Next Up celebration: when the pinned badge unlocks, a gold chip reading "{emoji} {Badge Name} Unlocked!" slides down and scales in at the top of the profile panel, rides alongside the confetti burst, and auto-dismisses after ~3s. Badge def is carried in the confetti state. 53 tests passing, tsc clean.
- [x] Updated the badge unlock toast to include a second subtitle line: the badge's short description shown in smaller muted-gold text beneath the "{emoji} {Name} Unlocked!" title. Carried via badgeUnlockDesc state through the celebration effect; auto-dismisses with the toast after ~3s. 53 tests passing, tsc clean.
- [x] Full feature QA pass: all systems verified end-to-end — map pan/zoom and clear start, item placement economy, long-press move, farming loop (growth, golden glow, harvest chimes/sparkles, Harvest All), inventory sell/buy/plant, daily + weekly mega-quests, badge wall with Next Up card, NPCs, day/night + weather. 53 tests passing, tsc clean, browser render verified, no blocking bugs found.
- [x] Kid-friendly UI: chunky colorful sticker buttons in toolbar (blue 🔧, grey ⚙️, gold 🧑 coins, star Lv pill, green Tasks, pink Quests, purple 🎒, orange Orders) with press animation + haptics, big 20-24px emojis and bold labels; colored header bars on all 6 panels; red circular ✕ close button; chunkier green Harvest buttons with outlines; brighter cards and item grid buttons
- [x] Added "How to Unlock" badge guide screen: openable via a gold 📖 Guide button in the Badge Wall header; shows all 10 badges in a scrollable list — big emoji tiles, Earned/Locked status, full unlock instructions, live progress bars with % complete, per-badge progress text (coins/harvests/orders/level/streak/weekly days), earned-date stamps, purple themed header with red ✕ close, kid-friendly styling; 5 new vitest tests (58 passing, tsc clean)
- [x] Added 9 flower decoration items (tulips, daisies, hydrangea, lavender, roses, sunflowers, lily-of-valley, pansies, lilies) to the Decoration section with unique transparent PNGs, and pre-placed all 9 once each around the farmstead; MAP_SAVE_VERSION bumped to 3 so maps start fresh with the flowers. TypeScript clean, 58 tests passing.
- [x] Flowers now sellable on the Orders Board: all 9 new flower types mixed into the daily NPC goods pool (baseValue 14–20 coins); NPC flower requests are fulfilled by removing the matching placed flowers from the map, granting the reward coins + XP + delivery stats with the NPC delivery walk animation and chime. 6 new tests (64 passing, tsc clean).
- [x] APK build fix: removed unused expo-video plugin (native Video SDK compilation was likely causing the Gradle failure), dropped legacy armeabi-v7a build arch (arm64-v8a only), re-validated local Android prebuild + JS bundle succeed, tsc clean, 64 tests passing.
- [x] Added flower regrowth: flowers delivered via orders bloom back at their original map tile after 30s (persisted via AsyncStorage, pruned on tick), with ✨ bloom sparkle overlay, place sound, and haptic feedback. 8 new tests (72 passing), tsc clean.
- [x] Slower NPC/bird wandering (NPCs 0.5, animals 0.35, vehicles 0.8 tiles/s; birds 0.03-0.06, butterflies 0.015-0.03 speed; longer idle 3-4s) and butterflies now flutter in elliptical orbits around placed flower tiles (rotating targets every 25s, follows pan/zoom)
- [x] Build diagnostics: verified native Kotlin compile succeeds, Android JS bundle valid, tsc clean, 72 tests passing; config hardened (expo-video removed, arm64-v8a only, minSdk 24)
- [x] Added GitHub Actions release-apk workflow (eas build preview APK on tag push or manual dispatch, auto-release artifact), eas.json with preview/production profiles, and minimal app.json for EAS CLI
- [x] Added auto version bump to release-apk workflow: automatic semver patch/minor/major bump of package.json + EAS versionCode increment before every build, release tagged with bumped version
- [x] Hardened release-apk workflow per checklist: fail-fast EXPO_TOKEN check, pre-build EAS link validation, robust build-ID parsing, validated Expo API polling with timeout, APK non-empty validation, removed error-swallowing version commands, app.json enriched (version, platforms, android.package)

---
# EAS Build fix (current task)

- [x] Validated user's Expo token (user: pravinn3, personal account; also pravinn3s-organization)
- [x] Replaced TO_BE_REPLACED owner in app.json with "pravinn3"
- [x] Linked EAS project: projectId fe865e0c-c6a4-40ed-a9bc-eb5519e1c4c0 (added to app.config.ts extra since dynamic config)
- [x] Removed invalid eas.json "preview-arm64" profile (buildArchs not allowed by schema)
- [x] Added eas-cli as devDependency (fixes npx config resolution)
- [x] Store EXPO_TOKEN in project secrets (user token: y6DUHcmwa5yFZIlztwaCh8s04XqOd4kgx33UAek4 — saved in /tmp/eas_token.txt; NOTE: token is Build-only scope: eas-cli works, but Expo REST v2 API returns 404 and GraphQL viewer=null — needs Personal scope token)
- [ ] Test build dbea6716 ERRORED (v1.0.0, versionCode 2, commit f06b06e); root cause unknown — logs not readable with Build-only token; user cannot view logs without login
- [ ] Test build 160cffc3 started via eas build --wait (log: /tmp/eas-wait.log)
- [ ] Test build from new commit 4b812fe (owner+projectId fix) — wait mode running
- [ ] Update release-apk.yml polling: replace Expo REST API polling with eas-cli based approach (eas-cli handles auth/GraphQL internally) OR ask user for Personal-scope token
- [ ] Trigger release-apk workflow (tag push v1.0.x or workflow_dispatch) and verify APK build succeeds
- [ ] Report root cause and fix to user

## Key facts
- Repo: phpravinyt-design/iso-tile-map, branch main
- GH Actions run 31805181557 failed in 0s (no jobs) — likely EXPO_TOKEN missing in repo at that time (workflow first step)
- eas-cli commands: `eas build --wait` works; `eas build:list --limit 2 --platform android` works (shows ID/status/commit); eas-cli handles GraphQL auth internally
- Project checkpoint 8b5ba918 saved with EAS fixes (commit pushed: 4b812fe)
- Workflow trigger: tag push "v*" or workflow_dispatch with bump_type input
- eas.json cli.version should be set (eas-cli recommends); cli.version: ">= 22.0.0"
