# Day/Night Cycle Implementation Notes

## State variables added:
- timeOfDay: 0-1 float, starts at 0.3 (daytime)
- isNight: boolean, true when timeOfDay > 0.85 || < 0.15
- nightOpacity: 0-0.45, calculated from timeOfDay
- celestialEmoji: ☀️ or 🌙

## Timer:
- Interval every 300ms, increments timeOfDay by 0.001 (full cycle ~5 min)

## NPC night behavior:
- At night, NPCs walk toward nearest building (nearestBuilding callback)
- Animals stay idle at night (5s idle)
- During day, normal random walking

## Render additions:
- Night overlay: absolute View with rgba(15,20,50, nightOpacity) at zIndex 100
- Sun/Moon indicator: top-right corner, zIndex 250

## Cleanup needed:
- Remove nearestBuilding from useEffect deps (it's inside the interval closure)
- Actually nearestBuilding is used inside the interval, so it should be in deps
- But it depends on `grid` which changes on placement - this could cause re-renders
- Better: use a ref for grid access inside the interval
