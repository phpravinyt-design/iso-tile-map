# Vehicle NPC Implementation Notes

## Vehicle Assets (already created)
- `/home/ubuntu/iso-tile-map/assets/images/vehicle_car_small.png` (red car, 128x128, 15KB)
- `/home/ubuntu/iso-tile-map/assets/images/vehicle_truck_small.png` (blue truck, 128x128, 9KB)
- `/home/ubuntu/iso-tile-map/assets/images/vehicle_bus_small.png` (yellow bus, 128x128, 9KB)

## Key Code Locations in IsometricMap.tsx
- NPC requires: line ~125-133
- NPC_SOURCES/ANIMAL_SOURCES: line ~136-148
- NpcState interface: line ~175
- AnimalNpcState interface: line ~187
- isTileWalkable: line ~199
- pickRandomWalkableTile: line ~210
- NpcSprite renderer: line ~229
- AnimalSprite renderer: line ~259
- NPC_COUNT/NPC_WALK_SPEED: line ~151-153
- ANIMAL_COUNT/ANIMAL_WALK_SPEED: line ~170-172
- NPC spawn init: line ~1733-1752
- Animal spawn init: line ~1754-1773
- Movement tick: line ~1776-1875
- npcSprites memo: line ~2352-2356
- animalSprites memo: line ~2358-2363
- Render section: buildings then npcs then animals

## GridCell structure
```ts
{ tile: "grass", building: BuildingType, grassOverlay: false, roadOverlay: string | null, roadRotation: 0, tileTexture: "lush_grass", flipped: false }
```

## Road types
- roadOverlay: "road_straight" | "road_corner" | "road_intersection" | "road_wide_straight" | "road_wide_corner" | null
- roadRotation: 0 (only corners rotate)

## Vehicle System Design
- Vehicles only move on tiles where roadOverlay !== null
- Find connected road tiles (adjacent N/S/E/W)
- Move between connected road tiles
- Rotate sprite based on direction (0=up, 90=right, 180=down, 270=left)
- Spawn only if roads exist on map
- 2 vehicles: 1 car + 1 truck
