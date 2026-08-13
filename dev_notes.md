# Dev Notes - Iso Tile Farm

## Current Task: Add Industry Feature
User wants an "Industry" button added inside the Items toolbar popup with 9 factory PNGs.
User can select a factory and place it on the map.

## Factory PNGs (cropped from 3x3 sheet)
Source: /home/ubuntu/upload/1786603288554.png (1103x1103, 3x3 grid)
Cropped to: /home/ubuntu/iso-tile-map/assets/images/cropped_factories/
Thumbnails: /home/ubuntu/iso-tile-map/assets/images/cropped_factories_thumbs/

Factory names (in order, row-major):
1. steel_factory - blue factory with smokestacks
2. oil_refinery - lava/molten metal factory
3. food_factory - red factory with leaf logo
4. recycling_plant - green recycling factory
5. dairy_factory - blue dairy with milk bottle logo
6. yarn_factory - purple yarn/textile factory
7. chemical_plant - chemical processing plant
8. wood_factory - green wood/lumber factory
9. tech_factory - white/blue tech/electronics factory

## Key Code Locations in IsometricMap.tsx
- Asset imports: ~line 78-94 (add factory requires after decoration imports)
- BUILDING_TYPES: ~line 393-412 (add industry types)
- INDUSTRY_TYPES + sources: ~line 460-475 (add after DECORATION_SOURCES)
- MODES: ~line 664 (add "industry")
- MODE_LABELS: ~line 700-712 (add industry: "🏭")
- Component state: ~line 1410-1425 (add selectedIndustryType, showIndustrySelector)
- Placement logic: ~line 2093-2145 (add industry mode branch)
- Items popup: ~line 2800-2849 (add Industry button)
- Sub-selector UI: ~line 2891-3112 (add Industry selector similar to decoration)
- BuildingOnTile: ~line 1201-1235 (add industry dispatch to PngCommunityGeneric or new renderer)

## Existing Patterns to Follow
- Each category has: TYPES array, SOURCES map, EMOJIS map, *_TYPE_VALUES
- Sub-selector renders horizontal scrollable row of PNG thumbnails
- Toolbar popup has grid of mode buttons, each toggles selector + sets mode
- Placement costs 100 coins per item
- All renderers accept `flipped` prop with scaleX(-1)
