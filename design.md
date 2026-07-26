# Iso Tile Farm — Design Document

## Overview
A mobile app featuring an isometric 2D grass tile map inspired by Township's farming game style. Users can pan, zoom, and place/remove isometric grass tiles on a grid to build their farm landscape.

## Color Palette
- **Primary (Brand):** `#4CAF50` (vibrant grass green)
- **Accent:** `#2E7D32` (deep forest green)
- **Background:** `#1B5E20` (dark green for canvas area)
- **Water/Sea:** `#2C3E50` (dark teal for surrounding water)
- **Tile Normal:** `#66BB6A` (bright grass green)
- **Tile Shadow:** `#388E3C` (darker grass)
- **Tile Highlight:** `#A5D6A7` (light grass edge)
- **UI Chrome:** `#1A1A2E` (dark navy)
- **UI Accent:** `#FFC107` (amber for buttons/highlights)
- **Rock/Stone:** `#78909C` (blue-grey for decorative rocks)
- **Flower/Wild:** `#FF9800` (orange for wild flowers/grass tufts)

## Screen List

### 1. Map Screen (Home/Index)
The main screen where the isometric tile grid is displayed and interactive.

**Primary Content & Functionality:**
- Full-screen isometric canvas with a grid of grass tiles
- Pan gesture (drag to move camera)
- Pinch-to-zoom gesture
- Tap to select/place/remove tiles
- Floating toolbar at bottom with tile type selection
- Reset/Clear button
- Tile counter display

**Layout:**
- Full-screen canvas occupying entire viewport
- Bottom toolbar bar with tile type selector (grass, water, rock, flower)
- Top bar with tile count and clear button
- Center: isometric tile grid

### 2. Tile Type Palette (Bottom Sheet/Toolbar)
A horizontal scrollable toolbar at the bottom of the screen.

**Primary Content:**
- Grass tile (default green)
- Water tile (blue)
- Rock/Stone tile (grey)
- Wild flower tuft tile (orange accent)
- Empty/Remove tile

## Key User Flows

1. **Open App → See Map**: User opens app and sees a pre-populated isometric grass tile map
2. **Pan Map**: User drags finger to pan around the tile grid
3. **Zoom Map**: User pinches to zoom in/out on the map
4. **Select Tile Type**: User taps a tile type in the bottom toolbar
5. **Place Tile**: User taps on the isometric grid to place the selected tile type
6. **Remove Tile**: User selects "remove" mode and taps to clear tiles

## Isometric Grid Design

- Grid size: 15x15 tiles (extensible)
- Each tile is a diamond/rhombus shape rendered as an isometric square
- Tiles have a 3D depth effect (visible top + left/right faces)
- Grass tiles have a flat green top with grass texture
- Surrounding area is dark water/sea color

## Tile Variants (to generate as assets)

1. **grass_flat.png** — flat green grass tile (isometric top face)
2. **grass_depth.png** — grass tile with 3D depth (top + side faces)
3. **water_tile.png** — blue water tile
4. **rock_tile.png** — grey stone tile
5. **flower_tile.png** — grass tile with wild flowers/grass tufts
6. **dirt_tile.png** — brown dirt/path tile
