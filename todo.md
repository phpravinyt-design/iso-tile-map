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
- [x] Crop 4 mountains (green waterfall, red rocky, snowy, green valley waterfall) from user's image into transparent PNGs (verified clean, ~768x512)
- [x] Add "Mountains" section button in Items toolbar with 4 mountain items (100 coins each)
- [x] Map placement works for mountains (flip, long-press move, remove, sound/pop animation like other items) — all code changes integrated in IsometricMap.tsx, tsc clean, 72 tests passing, profile stats + task category updated

## Implementation plan for mountains (details)
- Assets created (4 transparent PNGs, verified clean): assets/images/mountains/{mountain_green_waterfall,mountain_red_rocky,mountain_snowy,mountain_green_valley}.png (each ~768x512)
- Integration points in components/IsometricMap.tsx:
  1. require() PNG constants near line 86-97 (after DECORATION_*_PNG requires)
  2. TASK_ITEM_CATEGORIES add category "mountains" types: [...4 mountain types] (line ~926)
  3. BUILDING_TYPE list/sections near line 930 — add { category: "mountains", types: [...], label: "Mountain" }
  4. MOUNTAIN_TYPES const + type + MOUNTAIN_SOURCES + MOUNTAIN_EMOJIS (after DECORATION_EMOJIS ~1659) + MOUNTAIN_TYPE_VALUES
  5. MODES array add "mountain" (~2134), MODE_EMOJIS add mountain: "⛰️"
  6. handleTilePress: add mode === "mountain" placement logic (like decoration branch ~5716)
  7. renderBuildingAt: add MOUNTAIN_SOURCES check (~3093)
  8. preview source ~6344 else if (mode === "mountain")
  9. Toolbar switch ~7506: if (m === "mountain") setShowMountainSelector etc.
  10. Mountain sub-selector UI (~7949 decoration selector)
  11. countCategoryItems/profile stats categories add mountains ("⛰️ Mountains")
  12. itemStats computation ~3803-3830 add mountains count
- Existing selector state pattern: selectedDecorationType/setShowDecorationSelector — mirror for mountains: selectedMountainType, showMountainSelector

## Resize & rotate placed items (current task)

- [x] Add scale (resize) field to placed item state so each item remembers its size
- [x] Add rotation field (0/90/180/270) to placed item state
- [x] UI controls: after 5-sec long-press (movable state) show small resize and rotate buttons (clipboard bar: 🔄◀/▶ rotate, 🔼/🔽 resize levels 0.6-1.4)
- [x] Persist scale/rotation in saved map (MAP_SAVE_VERSION 4 + migration)
- [x] Apply scale/rotation to PNG renderer and flipped rendering (all renderers: tree/house/community/industry/farm/decoration/town market, BuildingOnTile)
- [x] Test, checkpoint, deliver (tsc clean, 72 tests passing, preview verified)

## Key facts for resize/rotate implementation (save before compaction)

Design: add `flipRotation: number` (0|90|180|270) + `itemScale: number` (0.6|0.8|1|1.2|1.4) fields to GridCell. Rotate replaces free rotate — user taps 🔄 to cycle 90°. Resize: ➕/➖ buttons to step through scale levels. Controls appear as a small floating panel at screen bottom when an item is in "move mode" (after 5s long-press), alongside existing move/delete affordances. Persist via existing AsyncStorage MAP_SAVE_KEY (JSON.stringify(grid)) — auto persists. Migration: normalize on load (flipRotation ?? 0, itemScale ?? 1, clamped).

Key code locations in components/IsometricMap.tsx:
- GridCell type def line ~2221
- MAP_SAVE_VERSION=3, key ~2232-2235 (bump to 4 for schema change, or migrate)
- createDefaultGrid ~2255-2276
- Load migration block ~3162-3192 (add flipRotation/itemScale defaults)
- Save effect ~3300-3303
- PngDecorationGeneric ~1880-1920 (add rotation/scale props; renderBuildingAt switch ~3115-3160 passes flipped)
- Generic renderers (community/temple ~1957, industry ~1985, farm ~2011, house ~2039): all pass flipped only — add optional rotation/itemScale props with defaults
- handleTilePress movement clipboard ~5698-5716 (moveClipboard carries buildingType/roadType — extend with flipRotation/itemScale; clear on drop)
- Long-press move mode: search "moveClipboard" and "Pick up" messages
- Toolbar/mode switch ~7533-7585

Note: mountains render via PngDecorationGeneric (mountain check ~3131). Roads already support rotation.
Plan: implement flipRotation only as "rotation 90° steps" + itemScale steps 0.7/1/1.3 to keep simple. UI: when any item picked up (move mode), bottom panel shows 🔄 Rotate and ⬆️⬇️ size buttons + 🗑️ drop/put. Also allow changing rotation/scale BEFORE placing? Simpler: only after long-press pickup. Controls overlay: fixed bottom bar visible while moveClipboard set.

## State so far (resize/rotate)

DONE:
- GridCell now has `flipRotation: number` and `itemScale: number` fields
- ITEM_SCALE_LEVELS = [0.6, 0.8, 1, 1.2, 1.4]; normalizeRotation/normalizeScale helpers added after line ~2220
- MAP_SAVE_VERSION bumped to 4; migration adds defaults + clears v1-v3 old keys
- createDefaultGrid cells include flipRotation: 0, itemScale: 1

TODO next:
1. moveClipboard state (line ~4111): add flipRotation?, itemScale? fields; populate in handleRemoveBuilding (cell.flipRotation, cell.itemScale)
2. Placement branches (3 places: mode "tile" ~5615, "grass_plant" ~5645, "community/temple/decoration/..." ~5720): restore cell.flipRotation/cell.itemScale on place
3. BuildingOnTile (line ~3119): add flipRotation, itemScale props; pass to PngTreeGeneric/PngHouseGeneric/PngCommunityGeneric/PngDecorationGeneric/PngIndustryGeneric/PngFarmGeneric/TownMarket (each renderer needs rotation/scale props; default rotation=0, itemScale=1). Transform: [{ rotate: `${rot}deg` }, { scaleX: flipped?-1:1 }, { scale: itemScale }]. Roads already rotate.
4. Render call site line ~6188: pass cell.flipRotation||0, cell.itemScale||1 to BuildingOnTile
5. Add resize/rotate controls in the clipboard indicator bar (~6616 styles.clipboardBar): ➖/➕ rotate buttons + resize stepper. Buttons: 🔄- (rotate -90), 🔄+ (rotate +90), ⬇️ (scale down), ⬆️ (scale up). Also add small on-item controls? Keep only in clipboard bar. Store on moveClipboard local preview state OR directly mutate grid cell at origCol/origRow before placing back.
   Simplest: keep a separate state `previewRotation`/`previewScale` in clipboard bar; on placement, write those values to the new cell.
6. handleTilePress deps array includes moveClipboard already.
7. Tests: run pnpm test + tsc; checkpoint.
