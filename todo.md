# Project TODO

- [x] Generate isometric grass tile assets
- [x] Generate app logo/icon
- [x] Update theme colors for farm/nature theme
- [x] Implement isometric tile grid rendering with SVG
- [x] Implement pan/drag gesture to move camera
- [x] Implement pinch-to-zoom gesture
- [x] Implement tile placement on tap
- [x] Implement tile removal (Erase tile type)
- [x] Create bottom toolbar with tile type selection
- [x] Add tile counter display
- [x] Pre-populate map with default grass tiles
- [x] Add app icon and branding
- [x] Remove all buttons, topbar, toolbar - tiles fill entire screen
- [x] Add finger scroll (pan) and pinch-to-zoom gesture support
- [x] Increase grid size to 30x30 for more immersive scrollable map
- [x] Add houses (chote ghar) placement on map - Township style
- [x] Add trees (ped) placement on map - Township style
- [x] Add roads (raste) placement on map - Township style
- [x] Add toolbar to select buildings/trees/roads to place
- [x] Use user's provided tree PNG image for tree placement on tiles
- [x] Ensure map scroll/pan works smoothly on mobile - improved gesture sensitivity
- [x] Use user's grass texture PNG for all grass tiles
- [x] Change tiles to 1:1 square aspect ratio, each tile shows the grass PNG as a complete tile
- [x] Change to flat top-down square tiles (bird's eye view like Township), 1:1 aspect ratio, grass PNG per tile
- [x] Add grass placement button to toolbar with new grass PNG (like tree/home buttons)
- [x] Make grass_plant an overlay (not a building) so trees, houses, etc. can be placed on top of it
- [x] Generate seamless grass texture PNG without visible seams between tiles
- [x] Generate premium high-quality seamless grass texture (Township/HayDay style, 2048x2048, perfectly tileable)
- [x] Remove the grass patch from under the tree PNG - tree sits directly on grass tiles
- [x] Replace the entire map background grass texture with user's new grass PNG
- [x] Place individual grass PNG on each grass tile (one PNG per tile, not continuous background)
- [x] Replace SVG houses with user's beautiful Township-style house PNG for both small and big house modes
- [x] Replace tree PNG with user's new clean tree image (transparent background, just foliage and trunk)
- [x] Add palm tree PNG alongside existing round tree - tree button shows sub-selector for 2 tree types
- [x] Crop 9 trees from the 3x3 sheet and add them all to tree selector (total 10+ tree types)
- [x] Fix tree selector buttons to show each tree's own unique PNG thumbnail instead of all showing the same tree
- [x] Replace cherry blossom tree on map with user's exact pink cherry blossom PNG (with grass base and flowers)
- [x] When placing trees, place all 10 tree types on the map so the map looks more beautiful with diverse trees
- [x] Add Town Market & Provisions building PNG to toolbar - user can select and place on map
- [x] Fix tree mode: one tree at a time, user selects preferred tree type from selector before placing
- [x] Crop 9 houses from the 3x3 sheet and add them to house selector - user can select and place on tiles like trees
- [x] Add long press (5 second tap) on any placed object (tree, house, etc.) to remove it from map
- [x] Fix house placement - each house button should place the user's SELECTED house type, not always the same house PNG
- [x] Limit zoom range to medium only (0.7x to 1.5x) - not too zoomed in or out
- [x] Set app to open in landscape (rotate) mode instead of portrait
- [x] Crop 9 community buildings from 3x3 sheet and add to toolbar (left of house button) - user can select and place on map
- [x] Add Roads button (left of house button) with 3 road tile types - straight, corner/T-junction, intersection - user selects and places on map
- [x] Remove the old road tile type from tile paint modes, and make road PNG render as an overlay ON grass tiles (grass stays underneath, road sits on top)
- [x] Add rotation for corner road tile - 4 directions so roads can turn smoothly
- [x] Map save with AsyncStorage - persist the user's map so it survives app restarts
- [x] Move object feature: 5 second tap on any placed object picks it up (cut mode), then tap another location to place it there
- [x] Add Tiles button (🧱) with 3 tile textures - lush grass, light grass, sand - user selects from sub-selector and taps tiles to apply; texture stored per-tile in tileTexture field and persists via AsyncStorage
- [x] Add Temple button (🛕) left of house button with 9 temple PNGs cropped from user's 3x3 sheet - user selects from sub-selector and places on map like houses
- [x] Fix temple button: PngCommunityGeneric now resolves temple sources (TEMPLE_SOURCES fallback) so placed temples show the correct PNG instead of town hall; verified selector opens, temple selection, and placement on a tile all work
- [x] Add Decoration button (🌸) with 9 decoration PNGs cropped from user's 3x3 sheet (flower arch, fountain, bench, topiary, gazebo, flower pot, swing, waterfall pond, flower bed) - user selects from sub-selector and places on map; decoration types added to BUILDING_TYPES with DECORATION_SOURCES + placement branch + selector UI + DECORATION_SOURCES fallback in PngCommunityGeneric
- [x] Add "Items" (🔧) button that opens a popup panel containing ALL placement mode buttons (Tile Paint, Tiles, Community, Temple, Decoration, Roads, Houses, Town Market, Trees, Grass Plant) - toolbar stays compact showing only Items button + current active mode badge; popup has title, close button, and grid of mode buttons; selecting a mode closes the popup and activates the mode with its selector
- [x] Add visible clipboard indicator bar (orange border) shown when item picked up via 5s long press: shows the actual picked item PNG preview (building/road/grass), title text (e.g. "Item picked up!"), and instruction "Tap a grass tile to shift it • 🗑️ to remove"
- [x] Add 🗑️ remove button in clipboard bar: tapping it deletes the picked item permanently and closes the bar; also clears clipboard+message when item is shifted to a new tile
- [x] Pickup message state (pickupMessage) now set on pick-up and cleared on shift; clipboard type carries origCol/origRow for future restore support
- [x] Add 5-second press progress bar above the pressed tile: orange fill bar (zIndex 50, above tile) animates 0-100% over 5s while user holds tap; on completion item gets picked up via handleRemoveBuilding (movable via clipboard bar)
- [x] Cancel progress bar when user releases tap early (onPressOut/cancelPressTimer) or pans the map (pan gesture onStart clears via ref to avoid TDZ)
- [x] Progress bar positioned above the specific pressed tile: rendered inside SquareTile with left/right -10, top -14 offsets, automatically follows pan/zoom since tile positions are computed from gridToScreen
- [x] Add currency system: user starts with 1000 coins, persisted via AsyncStorage (profile_coins + profile_name keys, separate from map_grid)
- [x] Deduct 100 coins for every item placed (tile cycle, grass plant, road, tile texture, all buildings); toggle-off/removal free; coins floor at 0 with red low-coins flash warning (2.5s)
- [x] Add Profile button (🧑 🪙 balance) in toolbar next to Items button that opens a Profile screen
- [x] Profile screen: gold coin badge balance, editable profile name (max 20), 8 category stat cards (houses/trees/temples/community/decor/roads/grass/total), footer with total invested = items × 100
- [x] Make map start clean: only ONE tree (tree_png at row14,col13) + ONE house (house_small at row14,col16) pre-placed at app start, everything else empty grass with lush_grass texture; user buys everything with coins
- [x] Bump save schema version (MAP_SAVE_VERSION=2, key map_grid_v2) so old saved maps do not restore; old keys (map_grid, map_grid_v1) cleared on load
- [x] Daily Reward system: 50 free coins granted once per day on app open; last-reward date persisted via AsyncStorage (date-keyed "last_daily_reward": "YYYY-MM-DD")
- [x] Green+gold reward banner ("🎁 Daily Reward! +50 🪙", bottom:210, 3.5s) shown when reward granted; verified balance shows 1050 on first open
- [x] Skip reward if already claimed today; applies on app open and across restarts; new date at midnight (user timezone) grants next reward
- [x] Login Streak system: consecutive daily logins increase daily reward - streak 1-2 = 50, streak 3-6 = 60, streak 7+ = 70 coins (capped) via rewardForStreak()
- [x] Streak resets to 0 if a day is missed (last reward date is not yesterday); persists via login_streak AsyncStorage key
- [x] Reward banner shows "🔥 Streak N! +NN 🪙" when streak > 1; Profile screen shows streak card and next reward amount
- [x] Daily Tasks system: Tasks button opens a panel with 3 daily tasks, each a random item (house/tree/temple/community/decoration/road) with a required count (1-3) — tasks generated deterministically per day via loop-free hash shuffle (fixed Metro SSR hang caused by retry loop)
- [x] Completing a task (placing the required number of that item on the map) rewards 100 coins with a reward banner (verified: '✅ Done! ✅ Earned +100 🪙' after placing required houses; progress auto-updates after every placement)
- [x] Tasks refresh automatically each new day (date-keyed via AsyncStorage, keys daily_tasks/daily_tasks_date); track per-task progress and completed state
- [x] Show task progress in panel (e.g., "Place 2 Houses: 1/2") with progress bars; tasks complete automatically when required count reached (no manual claim needed); new tasks regenerate at midnight
- [x] Add "Claim Reward" button beside each completed task in the Tasks panel: only appears when task is done and not yet claimed (claimed=false); tapping it grants 100 coins and replaces the button with "✅ Reward Claimed"; rewards no longer granted automatically on completion — verified in browser: claim grants +100, coins update (950→1,050), banner "🏆 Claimed +100 🪙" shows, claim state persists
- [x] Seamless tiles: all tiles must join with NO visible seams/joints between them — each grass tile PNG now overlaps its neighbors by 2px on every side (width/height ts+4, positioned -2/-2) so same-texture areas form one continuous lawn; verified in preview: no visible joints at normal zoom, TypeScript clean
- [x] Bug fix: Decorations not placing on the map — root cause: handleTilePress placement worked fine but BuildingOnTile had no render branch for decoration types (all 9 fell through the switch and rendered null); added PngDecorationGeneric renderer + decoration branch in BuildingOnTile; verified end-to-end in browser: flower_arch now renders on map after tapping a tile, coins deducted, TypeScript clean
- [x] Sell feature: removing an item from the map (5s long-press pickup, then shift or 🗑️) refunds 50 coins — SELL_REFUND constant added, setCoins refund inside handleRemoveBuilding for buildings/roads/decorations, green "🏪 Item sold! +50 🪙 refunded" banner (2s) above low-coins warning; verified coins deduction 950→850 on placement; refund code path uses same proven setCoins pattern; TypeScript clean
- [x] Bug fix: 5-second hold on an item does not pick it up — root causes: (1) pan gesture onStart cancelled the 5s timer immediately (now cancels only in onUpdate when |dx|>5 or |dy|>5); (2) simultaneous pan took the touch responder from TouchableOpacity (fixed by wrapping each tile in a View with onStartShouldSetResponder/onResponderGrant/onResponderRelease/onResponderTerminate wired to the pickup timer); app renders verified, timer mechanics proven via 6 passing vitest tests (progress 0→100, single 5s completion, cancel on release, restart, pan-movement guard)
- [x] Pickup celebration: when the 5s progress bar fills completely, a small pop animation plays at the tile (✨ sparkle bounces 1→1.3 with back easing then fades out in ~550ms) plus medium haptic feedback as the "tap" effect on native (web-safe skip); PickupPop component added after buildings layer, timer completion triggers playPopEffect + triggerPopAnimation; tsc clean, 6 long-press tests still passing, app renders verified

## Follow-up
- [x] Claim celebration: reusing the pickup pop celebration for Daily Task "Claim Reward" — ClaimPop component (centered screen ✨ sparkle, bounce 1→1.3 with back easing then fade ~550ms, zIndex 200) added; claimTaskReward calls playClaimPopEffect (medium haptic) + triggerClaimPopAnimation before banner; tsc clean, 6 long-press tests passing, app renders verified

## NPC Feature
- [x] Generate NPC character sprite assets: 4 Township-style characters (farmer, villager_man, villager_woman, child) as transparent PNGs in assets/images/
- [x] Implement NPC system: 4 NPCs spawn near center, walk between random walkable tiles (grass/dirt, avoiding buildings/roads), smooth 100ms tick movement at 1.2 tiles/sec, idle 1.5s between walks
- [x] NPCs follow map pan/zoom (use gridToScreen like buildings, zIndex 15 between grass and buildings, sprite flip for direction)
- [x] NPCs avoid buildings/roads, only walk on grass/dirt tiles, pick random walkable candidates within radius 3-5
- [x] Verified in browser: 4 NPCs (farmer, child, woman, villager man) visible walking on grass tiles near center, TypeScript clean, 6 tests passing

## Animal NPCs
- [x] Generate animal sprite assets: Township-style cow, chicken, dog as transparent PNGs matching art style (resized to 200px, ~42KB each)
- [x] Implement animal walking system: 3 animals (cow, chicken, dog) spawn and walk around map, slower speed (0.8 tiles/sec) and longer idle (2.5s) than humans
- [x] Animals avoid buildings/roads, walk on grass/dirt tiles (reuse isTileWalkable + pickRandomWalkableTile)
- [x] Animals follow pan/zoom (gridToScreen), direction-based sprite flip, zIndex 14 (below humans)
- [x] Verified in browser: cow, chicken, dog visible walking alongside human NPCs; TypeScript clean, 6 tests passing

## NPC Tap Interaction
- [x] Make NPC and animal sprites tappable (TouchableOpacity + onPress replaces View)
- [x] Show speech bubble above tapped NPC/animal: white rounded bubble with tail pointer, random cute message from NPC_MESSAGES/ANIMAL_MESSAGES pools
- [x] Speech bubble auto-clears after 2000ms via setTimeout (ref cleanup on unmount and on re-tap)
- [x] Verified in browser: app renders correctly with tappable NPCs/animals and speech bubble rendering; TypeScript clean

## Day/Night Cycle
- [x] Add time-of-day state (timeOfDay 0-1 float, starts at 0.3 daytime)
- [x] Add night overlay: rgba(15,20,50, 0-0.45) View at zIndex 100 inside Animated.View, transitions smoothly
- [x] NPCs walk toward nearestBuilding (scans grid for any placed building) at night; animals stay idle at night
- [x] Normal random walking resumes when isNight=false (timeOfDay 0.15-0.85)
- [x] Sun ☀️ / Moon 🌙 indicator in top-right corner (zIndex 250, dark pill background)
- [x] Verified in browser: sun indicator visible top-right, app renders correctly; TypeScript clean; day/night transitions work via 300ms interval

## New Road PNGs
- [x] Process 2 road PNGs: resized to 256x256, saved as road_straight_small.png + road_corner_small.png (~40KB each)
- [x] Done via Pillow resize (256x256, LANCZOS, optimized PNG)
- [x] Added road_wide_straight and road_wide_corner to ROAD_TYPES (5 total now) + ROAD_SOURCES mapping
- [x] Rendering works via existing PngRoadGeneric renderer (uses ROAD_SOURCES lookup); grid roadOverlay changed from RoadType to string for flexibility; moveClipboard roadType also string
- [x] Verified: TypeScript clean, app renders correctly, Daily Reward banner working

## New Tile Texture (Sand-Grass Transition)
- [x] Processed: resized to 256x256 PNG (~103KB), saved as tile_sand_grass.png
- [x] Added to TILE_TEXTURE_TYPES as "sand_grass" + TILE_TEXTURE_SOURCES mapping (4 tile options now)
- [x] Rendering works via existing tile texture renderer (TILE_TEXTURE_SOURCES lookup); grid tileTexture changed from TileTextureType to string
- [x] Verified: TypeScript clean, app renders correctly, NPCs walking

## Weather System
- [x] Added weather state (sunny/cloudy/rainy) that cycles every 60 seconds randomly
- [x] Rain drops: 8 drops generated every 50ms, falling animation via position update, cleared when not rainy
- [x] Weather overlay: cloudy = rgba(150,160,170,0.15), rainy = rgba(100,120,150,0.25), sunny = 0
- [x] Sunny = no overlay (clear bright map)
- [x] Weather emoji indicator at top-right (right: 60) beside celestial emoji
- [x] Humans walk at 50% speed during rain; animals stop entirely (idle 10s) during rain
- [x] Verified: TypeScript clean, both sun ☀️ and weather icons visible top-right, NPCs walking

## Fix Long-Press Select
- [x] Fixed: tiles now render with pointerEvents="none" (no long-press). Only placed items (buildings layer) have the 5s long-press hit area with progress bar. Empty tiles still get short-press for placement but no long-press timer.

## Grid Snap Preview
- [x] Added snapPreviewTile state + snapOpacity SharedValue with pulsing animation (0.6→0.2 loop)
- [x] Highlight renders on tile layer when moveClipboard !== null and snapPreviewTile matches an empty tile
- [x] Yellow highlight with 2px gold border, pulsing opacity via withRepeat/withSequence animation
- [x] Only shows when cell.building === "none" && cell.roadOverlay === null (no building or road already there)
- [x] Verified: TypeScript clean, 6 tests passing, app renders correctly. Web pointermove tracks hover position for snap preview.

## Triple-Tap Flip
- [x] Added flip state per item: GridCell.flipped boolean, persisted via AsyncStorage (same grid save)
- [x] Triple-tap on any item flips it: tripleTapRef tracks taps within 400ms, 3 taps = flip via scaleX(-1)
- [x] Flip persists: GridCell.flipped is part of grid state, saved with MAP_SAVE_KEY v2
- [x] Verified: TypeScript clean, app renders correctly with NPCs and buildings visible

## Industry Feature
- [x] Cropped 9 factory PNGs from 3x3 sheet (368x368 each, ~90-100KB) into assets/images/cropped_factories/
- [x] Added Industry mode (🏭) in Items popup + INDUSTRY_TYPES/SOURCES/EMOJIS + sub-selector + placement logic + BuildingOnTile dispatch via PngCommunityGeneric
- [x] Verified: TypeScript clean, app renders with NPCs/animals walking, industry PNGs exist as assets

## Vehicle NPCs (Road Followers)
- [ ] Generate vehicle sprite assets: Township-style cars/trucks (top-down) as transparent PNGs
- [ ] Implement vehicle system: 2-3 vehicles spawn on placed roads and drive along them
- [ ] Vehicles follow road connections (straight, corner, intersection) and loop
- [ ] Vehicles only appear on tiles with roadOverlay !== null
- [ ] Vehicles rotate based on direction of travel
- [ ] Verify in browser + checkpoint + deliver

## Vehicle NPCs
- [x] Generate vehicle sprite assets: red car, blue truck, yellow bus (top-down view, 128x128 transparent PNGs)
- [x] Implement road-following system: VehicleState interface, getRoadTiles/getConnectedRoads helpers, VEHICLE_COUNT=2, VEHICLE_WALK_SPEED=2.0, spawn only when roads exist, movement only on connected road tiles, rotation follows direction, avoids backtracking
- [x] Vehicles render at zIndex 16 (above NPCs/animals), sprite rotates to match travel direction
- [x] Verified: TypeScript clean, app renders correctly with NPCs/animals walking; vehicles spawn when roads are placed

## More Vehicle Types
- [x] Added bus to vehicle pool, increased VEHICLE_COUNT to 3 (car, truck, bus now all available)

## Farmland Tile
- [x] Processed: resized to 256x256 PNG (150KB), saved as tile_farmland.png
- [x] Added to TILE_TEXTURE_TYPES as "farmland" + TILE_TEXTURE_SOURCES mapping (5 tile options now)

## Bug: Items not placing on map
- [ ] Investigate and fix the placement bug

## Bug Fix: Items Not Placing
- [x] Fix: grass tiles had pointerEvents="none" so taps were not received — added grassHitAreas (separate TouchableOpacity hit areas for grass/dirt tiles without buildings, zIndex 2, wired to handleTilePress + long-press pickup)
- [x] Fix: tile texture rendering used cell.tile (tile type) instead of cell.tileTexture (texture name) — now correctly uses TILE_TEXTURE_SOURCES[cell.tileTexture]

## Crop Feature (Farmland)
- [ ] Crop 9 vegetable PNGs from user's 3x3 sheet: tomato, eggplant, carrot, cabbage, chili, onion, potato, cucumber, okra
- [ ] Add crop sub-selector that opens when user selects farmland tile texture
- [ ] User can tap on farmland tiles to place selected crop type (rendered as building overlay on farmland)
- [ ] Persist crops via building field in GridCell

## Crop Growth System
- [x] Crop 4 growth stages from tomato sheet: seedling → small plant → green tomatoes → ripe red tomatoes
- [x] Implement growth timer: each stage lasts 10 seconds, transitions to next
- [x] Final stage (ripe) stays permanent
- [x] Persist growth stage in GridCell data

## Emoji Crop Buttons
- [x] Remove 9 crop image buttons and replace with 14 emoji crop buttons
- [x] When tapping farmland tile, show emoji crop selector
- [x] Crops render as emoji (🍅🍆🥔🌾🍓🥒🥕🌽🍉🌶️🥦🥜🧄🍄) on the map

## Farmland Tile Tap Feature
- [x] Farmland tiles on map act as a button - tapping them opens emoji crop selector
- [x] Selected emoji crop gets placed on top of the tapped farmland tile

## Harvest Feature
- [x] Tap a crop emoji on the map to harvest: +25 coins, remove crop from tile

## Crop Growth Animation
- [ ] Crops start as seedlings (small scale) and grow to full size over 10 seconds
- [ ] Visual growth animation using scale/opacity transitions through stages
- [ ] Only harvestable when fully grown (stage 4)
- [ ] Growth progress indicator (bar or visual cue)

## Backpack (🎒) Inventory Button
- [ ] Add 🎒 backpack button in the bottom toolbar
- [ ] Track harvested vegetable counts per crop type
- [ ] Show backpack popup with emoji crop icons and their harvested counts
- [ ] Persist backpack counts across sessions

## Sell Harvested Vegetables
- [x] Add sell button per crop type in backpack panel
- [x] Each crop sells for coins (10 coins each)
- [x] Subtract from backpack count and add coins when sold

## Different Growth Times Per Crop
- [x] Add CROP_GROWTH_TIMES mapping with different durations per crop type
- [x] Use crop-specific growth time in the growth timer and progress bar

## Different Sell Prices Per Crop
- [x] Add CROP_SELL_PRICES mapping with different values per crop type
- [x] Use crop-specific sell price in backpack Sell All button

## Water Well Growth Boost
- [x] Add water_well decoration item to the decorations category
- [x] Crops within 3-tile radius of a well grow 2x faster
- [ ] Show visual indicator (blue circle) around well on the map (optional - well emoji serves as indicator)

## Harvest All Button
- [x] Add a button on screen to harvest all fully grown crops at once
- [x] Adds +25 coins per crop and increments backpack counts

## Farm Category (9 Animal Buildings)
- [ ] Crop 9 farm building images from the provided sprite sheet
- [ ] Add "Farm" category button to the Items menu
- [ ] Add 9 farm building types as placeable items on the map

## Building Chat NPCs (User request: character per building + tap-to-talk)
- [x] Crop 9 NPC character PNGs from user's 9-character sprite sheet (farmer, woman farmer, builder, policewoman, doctor, chef, grocery girl, vet, mayor) — clean transparent backgrounds
- [x] Map each NPC to a matching community building: mayor->town_hall, doctor->hospital, policewoman->police_station, builder->fire_station, farmer->market, woman farmer->school, grocery girl->library, chef->train_station, vet->park
- [x] Tap a placed community building (not in placement mode) to open a chat panel with that building's character PNG avatar
- [x] Unique per-character dialog: greeting + response lines each, shown one at a time with delay
- [x] User quick-reply buttons so the user can "talk" back; character responds
- [x] Chat panel has close button; tap backdrop to dismiss after conversation
- [x] Verify: TypeScript clean, 6 tests passing, app renders, chat opens for each building type, placement mode unaffected

## Chat Panel Enhancements (avatars + typing animation)
- [x] Character avatar on EVERY message row (NPC messages show avatar; user messages keep right-aligned bubble)
- [x] Typing animation: after user taps reply, show "typing..." indicator with animated bouncing dots for ~900ms before the NPC message appears
- [x] Typing dots bubble styled like NPC bubble; avatar shown on typing row too
- [x] Verify TypeScript clean, 6 tests passing, app renders

## Chat Panel Close Animation (slide-down on close button)
- [x] Replace instant chat panel close with an animated slide-down exit (250ms) when ✕ close button or backdrop is tapped
- [x] Chat panel slides up on open (250ms) and slides down on close for a smooth enter/exit pair
- [x] Verify TypeScript clean, 6 tests passing, app renders

## Building Hover Tooltip (name + profession)
- [x] Tapping a community building shows a small floating tooltip with the character's name and profession above the building
- [x] Tooltip positioned above the tapped building, auto-dismisses after 1.8s
- [x] Tooltip does not interfere with placement mode or chat tap behavior
- [x] Verify TypeScript clean, 6 tests passing, app renders

## Mirror Placement Button in Sub-selectors
- [x] Add a mirror (🪞 flip) toggle button inside every item sub-selector (trees, homes, community, tiles, temple, decoration, industry, roads, farm)
- [x] When mirror toggle is ON, the placed item renders mirrored (flipped stored in grid cell)
- [x] Mirror state applies to all placement modes (community, temple, decoration, industry, farm, tree, house, town market, roads)
- [x] Verify TypeScript clean, 6 tests passing, app renders

## Mirrored Cursor Preview
- [x] When mirror toggle is ON and a placement mode is active, show the selected item as a semi-transparent mirrored preview that follows the cursor on the map (web)
- [x] Preview snaps to the nearest tile under the cursor and renders horizontally flipped (scaleX -1); crops shown as emoji preview
- [x] Preview hidden outside placement modes and during item move; does not interfere with pan/tap logic
- [x] Verify TypeScript clean, 6 tests passing, app renders

## Place Success Pop + Sound
- [x] When an item is successfully placed, show a brief pop animation (scale burst + ✨ sparkle) at the placed tile
- [x] Play a subtle synthesized placement "pop" sound (Web Audio API, no external file) on web; light haptic on native
- [x] Animation/sound only on NEW placements (buildings, roads, crops, farmland); free remove/toggle/corner rotation not triggered
- [x] Verify TypeScript clean, 6 tests passing, app renders

## Removal Dust Cloud + Sound
- [x] When an item is removed from the map (5s pickup removal, free toggle-off in all modes, road/grass-overlay removal), show a brief 💨 dust cloud puff at the tile (expand + fade ~500ms)
- [x] Play a distinct whoosh-style removal sound (sawtooth 220→90Hz, different from the placement pop) via Web Audio API; Medium haptic on native
- [x] Dust/sound only on actual removals; placement keeps the sparkle pop
- [x] Verify TypeScript clean, 6 tests passing, app renders

## Settings Menu: Sound + Haptic Toggles
- [x] Settings button in the toolbar (⚙️) that opens a settings panel/sheet
- [x] Toggle for sound effects (place pop + removal whoosh synthesized sounds) via Switch
- [x] Toggle for haptic feedback (native devices only) via Switch
- [x] Preferences persisted via AsyncStorage (iso-settings-v1) and loaded on app start (defaults: both ON)
- [x] All existing sound/haptic call sites check the settings flags before playing
- [x] Verify TypeScript clean, 6 tests passing, app renders

## Farm Building Production Popup (Goathed-style)
- [x] Tapping a placed farm building (e.g. goat farm) on the map opens a production popup styled like the Goathed panel: title bar with farm name, close (×) button, left/right navigation arrows
- [x] Popup shows the farm building image with its production goods (e.g. 5 goats with bells, 4 haystacks), a ready-to-collect counter badge, and a bag-of-goods "Collect" button below
- [x] Left/right arrows cycle between the farm building's production items (next/previous product)
- [x] Collect button gathers produced goods (adds to inventory/coins) and updates the counter; production timers persist per cell via AsyncStorage (FARM_PROD_KEY)
- [x] Popup closes via × button or backdrop tap (reuses the chat panel slide styles)
- [x] Popup only opens outside farm placement mode; in farm mode tap keeps select/remove behavior; TypeScript clean, tests passing, app renders verified

## Orders Board (NPC Customer Orders)
- [x] Order data model: NPC customers (existing chat characters) request goods from backpack labels (crops/farm goods) with quantity 1-3 and coin rewards (premium over sell value)
- [x] Orders generated daily (deterministic per-day, 3 orders via loop-free hash shuffle), persisted via AsyncStorage (orders_v1 + orders_date) with claim state
- [x] Orders board UI: 📌 Orders button in toolbar opens a panel listing NPC orders with avatar, name/title, requested goods, progress (have/want), reward, and Deliver & Collect button when fulfilled
- [x] Fulfill logic: tapping Deliver & Collect deducts goods from backpack (crops + farm goods), grants coin reward + success banner
- [x] Shows pending "Need more goods…" state (disabled greyed button); delivered orders show ✅ Delivered!
- [x] 8 new vitest cases covering generation, determinism, distinct goods/NPCs, fulfillment math, insufficient-stock blocking; TypeScript clean, 14 tests passing, app renders verified

## NPC Delivery Animation (Walk-to-Collect)
- [x] On order delivery, animate the ordering NPC walking from their building to a delivery point on the map (starts at the NPC's placed community building; falls back to map center)
- [x] NPC sprite moves smoothly between isometric grid points with smoothstep easing and a walking bob; faces the walking direction
- [x] NPC reaches delivery spot, does a scale-burst pickup pop with 📦 badge above head, then walks back to origin (~3.1s total at ~30fps)
- [x] Animation renders as a pointerEvents="none" overlay (zIndex 25) that does not interfere with pan/zoom/placement
- [x] Timer cleaned up on unmount; TypeScript clean, 14 tests passing, app renders verified

## Delivery Thank-You Bubble
- [x] During the pickup phase of the delivery animation, show a small dialogue bubble above the NPC with a thank-you message ("Shukriya! Achhe goods hain!")
- [x] Bubble styled with white rounded card, orange border, arrow tail, and unflipped text (not affected by NPC facing flip)
- [x] Bubble fades in/out with a small pop (opacity + scale tied to pickup progress); TypeScript clean, 14 tests passing

## Delivery Pickup Chime Sound
- [x] Play a subtle synthesized chime (sine-wave triplet C5-E5-G5, staggered 110ms apart, soft 0.12 gain) when the NPC receives the goods at the start of the pickup phase
- [x] Chime respects the sound toggle (skipped when off); native fallback uses a Success haptic notification like other SFX; shares the same AudioContext helper as placement/removal sounds
- [x] TypeScript clean, 14 tests passing

## Delivery Coin Float Animation
- [x] During delivery pickup, a "+{rewardCoins} 🪙" gold text floats above the NPC, rising 22px and fading out over the pickup phase
- [x] Float is tied to pickup progress with slight scale-up and dark text shadow; unflipped, appears with the 📦 badge and clears before return walk
- [x] DeliveryState carries rewardCoins/goodsLabel from fulfillOrder; TypeScript clean, 14 tests passing

## Ambient Wildlife Animations
- [x] Birds (🐦/🕊️) drift across the screen with a gentle bob and slight rotation; butterflies (🦋) and bees (🐝) flutter near the map's middle band with zigzag drift
- [x] Wildlife renders as a pointerEvents="none" overlay (zIndex 12) below UI panels, never blocking pan/zoom/placement; 5 creatures max, each recycled in a continuous stream at ~20fps
- [x] Each creature has random entry side, height band, speed, and size; TypeScript clean, 14 tests passing, visual check confirmed (birds visible in screenshot)

## Weather-Reactive Wildlife
- [x] Birds hide during rain (fade out over 0.8s, stop rendering) and return when weather clears; cloudy = calmer, lower-amplitude flight
- [x] Butterflies/bees are at full cast (5) in sunny weather, reduced (3) in cloudy, and 0 in rain; wildlife opacity fades smoothly (0.8s) on weather change
- [x] Wired into the existing weather system state (sunny/cloudy/rainy), not random; TypeScript clean, 14 tests passing

## Animal Playful Chase
- [x] Occasional playful chase: one animal (chaser, e.g. 🐕 dog) runs straight at another (chasee, e.g. 🐔) at 3x speed while the chasee darts away at 2x; chase lasts ~3.5s
- [x] Triggers every ~20-40s randomly; skipped during rain and item placement (cooldown ticks slower, resumes after); ends gracefully — both animals return to normal wandering with an idle beat
- [x] Chase roles stored on AnimalNpcState (chaseRole/chaseTargetId/chaseEndsAt) and reused by the existing movement tick; TypeScript clean, 14 tests passing, render verified

## Nighttime Ambient Wildlife
- [x] Bats (🦇) drift across the upper sky at night with erratic flutter (wing flap scale + rotate), two directions, hidden during day
- [x] Fireflies (✨) glow and bob near the map's lower band, pulsing opacity (0.55-1.0) for a warm glow effect
- [x] Wired to existing isNight state with smooth 1.2s fade in/out, non-interactive overlay (zIndex 13); TypeScript clean, 14 tests passing, render verified

## Nighttime Owl Hoot Sound
- [x] Synthesized subtle owl hoot: two descending "hoo" notes (330→300Hz sine with vibrato and pitch fall per note), quiet 0.10 gain, occasional ambient sound
- [x] Gated by sound toggle (skipped when off); plays only during night (timeOfDay > 0.85 or < 0.15) at irregular 8-18s intervals, stops when day breaks
- [x] Shares the existing AudioContext helper; TypeScript clean, 14 tests passing, render verified

## Sleeping Animals at Night
- [x] At dusk animals walk to their bed (nearest placed building, else grid center) and lie down at night (scaleY 0.62, pressed-down look)
- [x] A small "Zzz" floats above each sleeping animal — rises 26px, grows, fades, and loops every 2.4s
- [x] Animals wake at dawn (idleUntil reset) and resume normal wandering; night-wander guard removed in favor of sleep logic; TypeScript clean, 14 tests passing, render verified

## Morning Farm Bell
- [x] Synthesized warm farm bell: metallic triangle strike at 830Hz with shimmering overtones (1660/2490Hz sine) and a long decay tail, plus a brighter second toll at 980Hz — rings once at dawn
- [x] Rings exactly once per sunrise, tied to the animal wake-up moment in the sleep tick; gated by the sound toggle (native fallback: Success haptic)
- [x] TypeScript clean, 14 tests passing, render verified

## Fix Industry (Factory) Button
- [x] Diagnose: root cause was missing dedicated render branch — industry types fell back to TOWN_HALL_PNG via PngCommunityGeneric's source chain
- [x] Fix: added PngIndustryGeneric renderer using INDUSTRY_SOURCES + dedicated BuildingOnTile dispatch (placed before FARM_SOURCES check), plus INDUSTRY_SOURCES/FARM_SOURCES fallback in move-clipboard preview chain; verified end-to-end in browser (industry selector opens, factory selection, tile placement, coin deduction, correct PNG rendering), tsc clean, 14 tests passing

## Factory Production Mode
- [x] Define INDUSTRY_PRODUCTIONS data (9 factories, each with goods label/emoji, readyTimeMs, rewardCoins, collectLabel)
- [x] Reuse the existing farm production progress system for factories via getProduction() resolver + shared FARM_PROD_KEY "row,col" persistence
- [x] Tapping a placed factory outside factory placement mode opens the Goathed-style production popup (mode!=="industry" guard added)
- [x] Factory popup shows: title bar with 🏭 icon, ✕ close, ◀/▶ product arrows, goods emoji strip, factory PNG image, batch time/coin info, Collect button with ready-count badge
- [x] Collect adds coins + backpack goods, resets per-cell production timer, persisted via AsyncStorage
- [x] Live ready counter ticks every second for factories too
- [x] 4 new vitest tests (data completeness for all 9 factories, timer/reward sanity, ready math, multi-batch collect math); tsc clean, 18 tests passing, render verified

## 3D Farmer NPC
- [x] Generated a 3D chibi farmer PNG (straw hat, plaid shirt, suspenders, pitchfork, transparent bg) → assets/images/farmer_3d_npc.png (200px)
- [x] Added 3D farmer to the animal walking system as type "farmer_3d" (4th entity): walks on grass/dirt with same wander/idle/chase mechanics, direction flip, follows pan/zoom
- [x] 3D farmer renders human-sized (1.05× tile) with own sprite, no sleeping pose; tappable with its own speech bubble pool (5 messages: 🚜 What a lovely farm! 🌾 etc.)
- [x] Verified: tsc clean, 18 tests passing, render check — 3D farmer visible on map next to house

## Farmer Task Helper (Harvest Hint)
- [x] Farmer scans grid every 1s for ready crops (cropGrowthStage >= 100) via findReadyCrop() (closest to farmer, skipped after harvest)
- [x] When a ready crop exists, farmer overrides his wander and walks to it (200ms tick), idles beside it while the hint is active
- [x] FarmerHintBubble overlay rendered above the ready crop: white card, orange border, 🧑‍🌾 emoji + harvest hint text (5 rotating messages), arrow tail, fades in/out via Reanimated shared value; pointerEvents="none" so taps still work
- [x] Farmer re-picks a new crop after harvest/cooldown (8s hint window); idle wander resumes when none ready; sleeping at night still works
- [x] Verified: tsc clean, 18 tests passing, render check (map OK, bird/bee overlays fine)

## Golden Glow on Ready Crops
- [x] Added ReadyCropGlow component: pulsating golden ring (#FFD700 border, soft gold fill, glow shadow) under/around crops with cropGrowthStage >= 100
- [x] Glow pulses on a 1.2s sine loop (scale 0.85→1.15, opacity 0.35→0.75) with per-crop stagger seed (col/row hash) so pulses don't sync; 80ms tick keeps smooth motion and follows zoom
- [x] Glow uses pointerEvents="none" at zIndex 8 so tile taps (harvest/place) still work
- [x] Verified: tsc clean, 18 tests passing, render check OK

## Harvest SFX and Sparkles
- [x] Added playHarvestChime: synthesized bright rising two-note "ting" (sine 720→1180Hz ding + delayed triangle 1480→1650Hz shimmer, 0.32s) wired into both single-crop harvest and Harvest All; respects sound toggle, native fallback = Success haptic
- [x] Added HarvestSparkles overlay: 6 staggered ✨ particles per harvested crop rise/fan out and fade over ~0.7s (60ms tick, bursts auto-cleared after 0.9s, capped at 10 bursts); per-star delay creates a burst feel
- [x] Sparkles use pointerEvents="none" at zIndex 50, follow zoom via currentScale, render for both single harvest and Harvest All (one burst per cell)
- [x] Verified: tsc clean, 18 tests passing, render check OK

## Per-Crop Harvest Sound Pitch
- [x] Added HARVEST_PITCH table: per-crop pitch profiles for 20 crops (🍉 bass 330-480Hz thud-tink → 🌶️ spicy 940-1290Hz sizzle-high); ding + shimmer oscillators both vary per crop, unknown crops fall back to default (720-1180Hz)
- [x] playHarvestChime(cropType) wired into single-crop harvest and Harvest All (each cell plays its own crop's chime now, no generic summary chime)
- [x] Verified: tsc clean, 18 tests passing, render check OK

## Inventory / Sell UI
- [x] Added INVENTORY_SELL_VALUES (18 farm/factory goods: Wool 10…Gadgets 26) + getInventorySellValue/isCropKey helpers
- [x] Replaced backpack panel with grouped Inventory & Sell UI: 🌱 Harvested Crops (CROP_SELL_PRICES) + 🏭 Farm & Factory Goods sections; each row shows emoji, name, price each, subtotal (×count), "Sell 1" stepper and orange "All (+coins)" buttons
- [x] Sell deducts counts, adds coins (setCoins), persists via saveBackpack; Light haptic for Sell 1 / Success haptic for Sell All; sound toggle path available
- [x] Verified: tsc clean, 18 tests passing, render check OK

## Inventory Buy Section (Seeds)
- [x] Added SEED_BUY_CATALOG (14 crops, prices 3-14: carrot 3, potato/garlic/wheat 4, corn/peanut 5, tomato/eggplant/cucumber 6, strawberry/chili 7, mushroom 8, broccoli 10, watermelon 14) + seedInventoryKey("seed_<crop>") stored in the same backpack record
- [x] Added 🛒 Buy Seeds section to inventory panel: grid of seed cards with emoji, owned count (×n), green "🛒 price" buy button; balance check via flashLowCoins + disabled state when coins insufficient; buy deducts coins, increments count, persists via saveBackpack, Light haptic
- [x] 🌱 Plant button per seed enters free-plant mode (plantedSeedCrop state): tapping any farmland tile plants that seed free (no ITEM_COST deduction) consuming 1 seed; mode persists for repeat planting until seeds run out, then falls back to the normal paid crop selector
- [x] Sound (playPlaceSound) + haptic feedback on seed planting; insufficient-coins shows the existing low-coins flash
- [x] Verified: tsc clean, 18 tests passing, render check OK

## Level Progression System
- [x] XP/level state: playerLevel + xp (progress to next level), persisted via AsyncStorage alongside coins/backpack
- [x] XP gains wired in: harvest +5/unit, sell +2/unit, order delivery +10, task claim +15, item placement +3, seed buy +1
- [x] XP curve: level N needs 50*N XP to reach N+1 (verified: 150 XP = level 3)
- [x] Seed unlock gating: 🍓/🌶️ Lv2, 🍄 Lv3, 🥦 Lv4, 🍉 Lv5; locked seeds show 🔒 "Level X" red label and disabled buy/plant
- [x] ⭐ Lv badge in toolbar + XP progress bar + unlock hint in profile panel
- [x] Level-up celebration: gold-bordered banner + arpeggio sound (gated by settingsRef)
- [x] 9 vitest tests (level math, multi-level splits, unlock gating, XP combos); tsc clean, 27 tests passing, render check OK

## Daily Quests (Big Goals, Massive XP)
- [x] Defined 5 quest kinds: 🪙 earn 200-500 coins, 🌾 harvest 8-12 crops, 🏪 sell 8-12 goods, 🏗️ place 3-5 items, 📦 deliver 1-2 orders — daily deterministic rotation via simpleHash shuffle, 3 quests per day
- [x] Quest state persisted via AsyncStorage (daily_quests/daily_quests_date); regenerates on new day
- [x] trackQuestProgress wired into order delivery, all 4 inventory sell handlers, Harvest All, single-crop harvest, and item placement
- [x] claimQuestReward grants +150 coins + 100 XP (massive vs 15 XP normal task) with "⚡ Claimed! +150 🪙 +100 ⭐" banner; claim state persisted
- [x] 🎯 Quests button in toolbar (next to Tasks) opens its own panel: progress bars, reward rows, purple ⚡ Claim button
- [x] 9 vitest tests (bounds across 400 days, determinism, accumulation/capping, claim math, kind variety); tsc clean, 36 tests passing, render check OK (🎯 button visible in toolbar)

## Weekly Mega-Quest (Rare Seed Reward)
- [x] Weekly streak tracking: record dates when all 3 daily quests were completed; streak persists across the week (AsyncStorage, ISO-week anchored reset)
- [x] All-quests-complete day detection: when the last quest of the day is claimed, mark that day as completed and grant a small streak bonus (+50 🪙 +25 ⭐, per-day only once)
- [x] Week counter: after 7 completed days, mega-quest completes; reward = exclusive rare "Golden Seed" (🌟 ×5) +500 🪙 +500 ⭐ XP, awarded once per week
- [x] Rare golden crop: golden seeds plant a golden-tagged crop on farmland (tag tracked in goldenCropTags state) — harvesting it pays 100 🪙/unit (vs 25 normal), lands in backpack as "golden wheat", and works for Harvest All too; no coin cost to plant (free, consumes 1 seed)
- [x] Weekly Mega-Quest panel entry (in 🎯 Quests panel): shows days completed /7 with 🔥 progress chips, completed dates list, reward preview, and ✅ awarded state
- [x] Mega-quest celebration: banner + claim-pop animation when rare seeds are awarded; golden seed row shows in 🎒 Buy Seeds as owned reward with a golden 🌟 Plant button
- [x] Golden visuals: brighter/wider pulsing glow + golden shimmer text-shadow on golden crops, tagged through BuildingOnTile → EmojiCrop → ReadyCropGlow
- [x] Verify: tsc clean, 44 tests passing (8 new mega-quest tests), render check

## Achievement Badge Wall
- [x] Achievement registry: permanent record of earned achievements (mega-quests as unique mega_N per week, milestone levels, streaks, stats) persisted via AsyncStorage with 10-badge ACHIEVEMENT_DEFS
- [x] Auto-unlock achievements when earned: first_mega (+week anchor), mega_5 at 5 mega-quests, mega_10 at 10, level_5/level_10, coins_5000, harvest_100, order_25, streak_3, golden_harvest — idempotent awards
- [x] Display badge wall in Profile panel: 🏅 grid of earned (gold, big emoji, date) / locked (dim, 🔒) badges with earned count, plus lifetime stat tracking behind all earnings (coins, harvests, orders)
- [x] Unlock celebration: gold "🏅 New Badge" banner + claim-pop animation when a new badge is earned
- [x] Verify: tsc clean, 53 tests passing (9 new badge tests), render check

## Locked Badge Tooltips
- [x] Locked badge tooltips: tap/press a locked badge to show an unlock hint (exact unlock path + live progress, auto-hides after 4.5s with gold border highlight + light haptic)
- [x] Badge registry entries include unlockHint per badge; progress derived from lifetimeStats (coins/harvests/orders), playerLevel, streakLevel, weeklyProgress length, mega count
- [x] Verify: tsc clean, 53 tests passing, render check

## Next Up Badge Highlight
- [x] Compute next-achievable locked badge by progress ratio (weekly quest days/7, mega count, level, coins, harvests, orders, streak) and pin it at top of Badge Wall as a gold "Next Up ⭐" card with hint + live progress bar + %
- [x] Verify: tsc clean, 53 tests passing, render check

## Next Up Unlock Confetti & Chime
- [x] Detect when the Next Up badge unlocks (previous nextUp id just got earned) and fire a confetti burst + celebratory chime (E4-G4-B4-E5-E6 major arpeggio, gated by sound toggle, native Success haptic)
- [x] Confetti: 26 lightweight falling confetti pieces via Reanimated (fade in, fall + rotate over ~2.8s, fade out, auto-clear after 3s), mounted inside the profile panel, pointerEvents none
- [x] Verify: tsc clean, 53 tests passing, render check

## Badge Unlock Toast
- [x] Show a toast with the unlocked badge's emoji + name during the confetti animation (gold chip, slide-down + scale-in, auto-dismiss after ~3s matching confetti)
- [x] Wire it into the Next Up celebration effect (badge def carried in confetti state + badgeUnlockToast state)
- [x] Verify: tsc clean, 53 tests passing, render check

## Toast with Badge Description
- [x] Toast shows badge name on the first line and the badge's short description underneath (badgeUnlockDesc state, smaller muted-gold subtitle, center-aligned)
- [x] Verify: tsc clean, 53 tests passing, render check

## Full Feature QA Check
- [x] TypeScript clean + all vitest tests passing (53 pass / 1 skipped)
- [x] Core map: pan/zoom OK, clear start (1 tree + 1 house), item placement -100 coins, long-press move + clipboard bar + 🗑️, mirror
- [x] Items: trees, homes, community, rods, tiles (5 textures incl. farmland), temples, decorations, industry — distinct PNGs verified
- [x] Farming loop: tap farmland → 14-emoji picker → growth stages → golden glow + farmer hint bubble → harvest (+25/+100 golden) + per-crop chime pitch + sparkles + Harvest All; inventory sell/All + buy seeds + free Plant mode verified end-to-end in browser
- [x] Golden wheat: seeds awarded by weekly mega-quest, free plant from 🎒, 100-coin premium harvest (handler + Harvest All verified in code; golden row renders when owned)
- [x] Daily quests + weekly mega-quest streak + golden seed reward (quests panel UI verified)
- [x] Badge wall: 10 badges earned/locked, tap hint with live progress, Next Up card with % bar, unlock toast + confetti + arpeggio chime
- [x] NPCs: farmer task helper with hint bubbles, building character chat, wheel NPCs on roads (code verified; NPCs walking on live map)
- [x] Weather + day/night: sun/moon, night overlay, sleeping animals with Zzz, bats/fireflies at night, morning bell (code verified)
- [x] Orders board, tasks, settings toggles, coins + level persistence all wired (code + tests verified)
- [x] Browser render verified: map, crops, inventory, quests, profile panels all healthy — no blocking bugs; economics (place -100 / harvest +25 / sell = profit) is intentional design

## Kid-Friendly UI Redesign
- [ ] Big colorful toolbar buttons: sticker-style cartoon buttons (thick 3px dark outline, bright saturated colors per button, soft 3D bottom shadow, bigger emoji + bold text, bounce on press)
- [ ] Coins (🪙) and Level (⭐) displays as bigger gold/star pills
- [ ] Colorful themed header bars on all panels (items, tasks, quests, inventory, orders, profile, settings) with big emoji titles
- [ ] Bigger emoji + brighter cards in crop picker, seed cards, badge wall
- [ ] Verify render + tsc clean + tests passing, checkpoint
