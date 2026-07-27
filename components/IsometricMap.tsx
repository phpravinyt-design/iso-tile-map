import { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Rect, Circle, Polygon, G } from "react-native-svg";
import { Image } from "expo-image";
import { Platform } from "react-native";

// Tree PNG asset
const TREE_PNG = require("@/assets/images/tree.png");

// Seamless grass texture PNG asset - used as the tile image (tileable, no seams)
const GRASS_TEXTURE = require("@/assets/images/grass_texture.png");

// Grass plant PNG asset - used as a building/object on tiles
const GRASS_PLANT_PNG = require("@/assets/images/grass_plant.png");

// --- Constants ---
// Flat top-down square tiles (1:1 aspect ratio) - Township style
const TILE_SIZE = 90;
const GRID_SIZE = 25;
const WATER_BG = "#1a2a3a";

// Tile types (ground)
const TILE_TYPES = ["grass", "water", "rock", "flower", "dirt", "road", "none"] as const;
type TileType = (typeof TILE_TYPES)[number];

// Building types (placed ON tiles)
const BUILDING_TYPES = ["house_small", "house_big", "tree_png", "none"] as const;
type BuildingType = (typeof BUILDING_TYPES)[number];

// Placement modes
const MODES = ["tile", "house_small", "house_big", "tree_png", "grass_plant"] as const;
type PlaceMode = (typeof MODES)[number];

const TILE_COLORS: Record<TileType, { base: string; detail: string; accent: string }> = {
  grass: { base: "#5cb85c", detail: "#4a9a4a", accent: "#7ec87e" },
  water: { base: "#3498db", detail: "#2980b9", accent: "#5dade2" },
  rock: { base: "#95a5a6", detail: "#7f8c8d", accent: "#bdc3c7" },
  flower: { base: "#6ab04c", detail: "#e74c3c", accent: "#f9ca24" },
  dirt: { base: "#b08968", detail: "#8d6e63", accent: "#ddb892" },
  road: { base: "#6b6b6b", detail: "#555555", accent: "#8a8a8a" },
  none: { base: WATER_BG, detail: WATER_BG, accent: WATER_BG },
};

const MODE_LABELS: Record<PlaceMode, string> = {
  tile: "🖌️",
  house_small: "🏠",
  house_big: "🏡",
  tree_png: "🌳",
  grass_plant: "🌿",
};

type GridCell = { tile: TileType; building: BuildingType; grassOverlay: boolean };

// Simple grid positioning (flat top-down, square tiles)
function gridToScreen(col: number, row: number, scale: number) {
  const cx = GRID_SIZE / 2 - 0.5;
  const cy = GRID_SIZE / 2 - 0.5;
  const x = (col - cx) * TILE_SIZE * scale;
  const y = (row - cy) * TILE_SIZE * scale;
  return { x, y };
}

function createDefaultGrid(): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowArr: GridCell[] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const cx = GRID_SIZE / 2 - 0.5;
      const cy = GRID_SIZE / 2 - 0.5;
      const dist = Math.abs(col - cx) + Math.abs(row - cy);
      if (dist > GRID_SIZE / 2 + 1) { rowArr.push({ tile: "none", building: "none", grassOverlay: false }); continue; }
      let tile: TileType = "grass";
      if ((col * 7 + row * 3) % 41 === 0) tile = "water";
      else if ((col * 5 + row * 2) % 37 === 0) tile = "rock";
      else if ((col * 3 + row * 5) % 31 === 0) tile = "flower";
      else if ((col * 2 + row * 7) % 43 === 0) tile = "dirt";
      let building: BuildingType = "none";
      if (tile === "grass" && (col * 11 + row * 7) % 53 === 0) {
        building = "tree_png";
      }
      if (tile === "grass" && building === "none" && (col * 13 + row * 11) % 67 === 0) {
        building = "house_small";
      }
      rowArr.push({ tile, building, grassOverlay: false });
    }
    grid.push(rowArr);
  }
  return grid;
}

// --- Flat Square Tile Component ---
function SquareTile({ col, row, cell, scale, onPress }: {
  col: number; row: number; cell: GridCell; scale: number; onPress: () => void;
}) {
  const pos = gridToScreen(col, row, scale);
  const colors = TILE_COLORS[cell.tile];
  const ts = TILE_SIZE * scale;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        position: "absolute",
        left: pos.x - ts / 2,
        top: pos.y - ts / 2,
        width: ts,
        height: ts,
        zIndex: 1,
      }}
    >
      {/* Tile rendering */}
      {cell.tile === "grass" ? (
        <Image
          source={GRASS_TEXTURE}
          style={{ width: ts, height: ts }}
          contentFit="cover"
          pointerEvents="none"
        />
      ) : (cell.tile === "none" ? null : (
        <Svg width={ts} height={ts}>
          {/* Tile background */}
          <Rect x={0} y={0} width={ts} height={ts} fill={colors.base} />
          {cell.tile === "water" && (
            <>
              <Polygon points={`${ts*0.1},${ts*0.3} ${ts*0.3},${ts*0.25} ${ts*0.25},${ts*0.35}`} fill={colors.accent} opacity={0.5} />
              <Polygon points={`${ts*0.6},${ts*0.6} ${ts*0.8},${ts*0.55} ${ts*0.75},${ts*0.65}`} fill={colors.accent} opacity={0.4} />
            </>
          )}
          {cell.tile === "rock" && (
            <>
              <Polygon points={`${ts*0.2},${ts*0.3} ${ts*0.4},${ts*0.25} ${ts*0.35},${ts*0.55} ${ts*0.15},${ts*0.5}`} fill={colors.accent} />
              <Polygon points={`${ts*0.55},${ts*0.45} ${ts*0.75},${ts*0.4} ${ts*0.7},${ts*0.65} ${ts*0.5},${ts*0.6}`} fill={colors.detail} />
            </>
          )}
          {cell.tile === "flower" && (
            <>
              <Circle cx={ts * 0.25} cy={ts * 0.35} r={ts * 0.06} fill="#e74c3c" />
              <Circle cx={ts * 0.25} cy={ts * 0.35} r={ts * 0.025} fill="#f1c40f" />
              <Circle cx={ts * 0.7} cy={ts * 0.55} r={ts * 0.05} fill="#e74c3c" />
              <Circle cx={ts * 0.7} cy={ts * 0.55} r={ts * 0.02} fill="#f1c40f" />
              <Circle cx={ts * 0.5} cy={ts * 0.25} r={ts * 0.04} fill="#f9ca24" />
            </>
          )}
          {cell.tile === "dirt" && (
            <>
              <Polygon points={`${ts*0.15},${ts*0.3} ${ts*0.25},${ts*0.2} ${ts*0.3},${ts*0.4} ${ts*0.2},${ts*0.35}`} fill={colors.detail} />
              <Polygon points={`${ts*0.6},${ts*0.5} ${ts*0.7},${ts*0.4} ${ts*0.75},${ts*0.55} ${ts*0.65},${ts*0.6}`} fill={colors.detail} />
            </>
          )}
          {cell.tile === "road" && (
            <>
              <Rect x={ts * 0.35} y={ts * 0.1} width={ts * 0.08} height={ts * 0.15} fill="#e8e8e8" opacity={0.7} />
              <Rect x={ts * 0.35} y={ts * 0.4} width={ts * 0.08} height={ts * 0.15} fill="#e8e8e8" opacity={0.7} />
              <Rect x={ts * 0.35} y={ts * 0.7} width={ts * 0.08} height={ts * 0.15} fill="#e8e8e8" opacity={0.7} />
            </>
          )}
        </Svg>
      ))}
    </TouchableOpacity>
  );
}

// --- SVG Building: Small House (top-down view) ---
function SmallHouse({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - ts * 0.6,
      top: pos.y - ts * 0.6,
      width: ts * 1.2,
      height: ts * 1.2,
      zIndex: 10,
      pointerEvents: "box-none",
    }}>
      <Svg width={ts * 1.2} height={ts * 1.2} viewBox={`0 0 ${ts * 1.2} ${ts * 1.2}`}>
        {/* House body */}
        <Rect x={ts * 0.15} y={ts * 0.2} width={ts * 0.7} height={ts * 0.8} fill="#d4a574" stroke="#a0522d" strokeWidth={1} rx={2} />
        {/* Roof */}
        <Polygon points={`${ts*0.1},${ts*0.2} ${ts*0.6},${ts*0.02} ${ts*0.9},${ts*0.2}`} fill="#c0392b" stroke="#922b21" strokeWidth={0.5} />
        {/* Door */}
        <Rect x={ts * 0.45} y={ts * 0.6} width={ts * 0.2} height={ts * 0.35} fill="#8B4513" rx={2} />
        <Circle cx={ts * 0.6} cy={ts * 0.78} r={ts * 0.02} fill="#f1c40f" />
        {/* Windows */}
        <Rect x={ts * 0.22} y={ts * 0.35} width={ts * 0.15} height={ts * 0.15} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
        <Rect x={ts * 0.62} y={ts * 0.35} width={ts * 0.15} height={ts * 0.15} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
        {/* Chimney */}
        <Rect x={ts * 0.7} y={ts * 0.05} width={ts * 0.12} height={ts * 0.2} fill="#8B4513" />
      </Svg>
    </View>
  );
}

// --- SVG Building: Big House (top-down view) ---
function BigHouse({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - ts * 0.65,
      top: pos.y - ts * 0.7,
      width: ts * 1.3,
      height: ts * 1.4,
      zIndex: 10,
      pointerEvents: "box-none",
    }}>
      <Svg width={ts * 1.3} height={ts * 1.4} viewBox={`0 0 ${ts * 1.3} ${ts * 1.4}`}>
        {/* House body */}
        <Rect x={ts * 0.1} y={ts * 0.3} width={ts * 0.85} height={ts * 1.05} fill="#f5e6c8" stroke="#c9a96e" strokeWidth={1} rx={2} />
        {/* Roof */}
        <Polygon points={`${ts*0.05},${ts*0.3} ${ts*0.525},${ts*0.1} ${ts*1.0},${ts*0.3}`} fill="#2c3e50" stroke="#1a252f" strokeWidth={0.5} />
        {/* Large door */}
        <Rect x={ts * 0.4} y={ts * 0.85} width={ts * 0.25} height={ts * 0.45} fill="#5d4037" rx={3} />
        <Circle cx={ts * 0.6} cy={ts * 1.08} r={ts * 0.025} fill="#f1c40f" />
        {/* Windows */}
        <Rect x={ts * 0.15} y={ts * 0.45} width={ts * 0.18} height={ts * 0.18} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
        <Rect x={ts * 0.72} y={ts * 0.45} width={ts * 0.18} height={ts * 0.18} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
        <Rect x={ts * 0.15} y={ts * 0.7} width={ts * 0.18} height={ts * 0.18} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
        <Rect x={ts * 0.72} y={ts * 0.7} width={ts * 0.18} height={ts * 0.18} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
        {/* Chimney */}
        <Rect x={ts * 0.78} y={ts * 0.15} width={ts * 0.15} height={ts * 0.25} fill="#7f8c8d" />
        {/* Fence */}
        <Rect x={ts * 0.05} y={ts * 1.28} width={ts * 0.95} height={ts * 0.06} fill="#8B7355" opacity={0.6} />
      </Svg>
    </View>
  );
}

// --- PNG Tree (top-down view) ---
function PngTree({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;

  // Tree is larger than tile (spans ~1.3x tile)
  const treeSize = ts * 1.5;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - treeSize / 2,
      top: pos.y - treeSize / 2,
      width: treeSize,
      height: treeSize,
      zIndex: 10,
      pointerEvents: "box-none",
    }}>
      <Image
        source={TREE_PNG}
        style={{ width: treeSize, height: treeSize }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- PNG Grass Plant (top-down view) ---
function PngGrassPlant({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;

  // Grass plant spans the tile
  const plantSize = ts * 1.2;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - plantSize / 2,
      top: pos.y - plantSize / 2,
      width: plantSize,
      height: plantSize,
      zIndex: 5,
      pointerEvents: "box-none",
    }}>
      <Image
        source={GRASS_PLANT_PNG}
        style={{ width: plantSize, height: plantSize }}
        contentFit="cover"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- Grass Overlay Renderer ---
function GrassOverlay({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;

  // Grass overlay covers the tile (slightly larger)
  const overlaySize = ts * 1.1;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - overlaySize / 2,
      top: pos.y - overlaySize / 2,
      width: overlaySize,
      height: overlaySize,
      zIndex: 2,
      pointerEvents: "box-none",
    }}>
      <Image
        source={GRASS_PLANT_PNG}
        style={{ width: overlaySize, height: overlaySize }}
        contentFit="cover"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- Building Component Selector ---
function BuildingOnTile({ col, row, buildingType, scale }: {
  col: number; row: number; buildingType: BuildingType; scale: number;
}) {
  switch (buildingType) {
    case "house_small": return <SmallHouse col={col} row={row} scale={scale} />;
    case "house_big": return <BigHouse col={col} row={row} scale={scale} />;
    case "tree_png": return <PngTree col={col} row={row} scale={scale} />;
    default: return null;
  }
}

// --- Main Component ---
export default function IsometricMap() {
  const [grid, setGrid] = useState<GridCell[][]>(createDefaultGrid);
  const [mode, setMode] = useState<PlaceMode>("tile");

  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const lastOffsetX = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const lastScaleValue = useSharedValue(1);

  const [currentScale, setCurrentScale] = useState(1);
  const panMoved = useRef(false);
  const isPressing = useRef(false);

  const MIN_SCALE = 0.3;
  const MAX_SCALE = 3.5;

  // Pan gesture
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(5)
        .activeOffsetX([-10, 10])
        .activeOffsetY([-10, 10])
        .failOffsetX([-100, 100])
        .failOffsetY([-100, 100])
        .onStart(() => {
          lastOffsetX.value = offsetX.value;
          lastOffsetY.value = offsetY.value;
          panMoved.current = false;
          isPressing.current = false;
        })
        .onUpdate((event) => {
          const dx = event.translationX;
          const dy = event.translationY;
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            panMoved.current = true;
          }
          offsetX.value = lastOffsetX.value + event.translationX;
          offsetY.value = lastOffsetY.value + event.translationY;
        })
        .runOnJS(false),
    []
  );

  // Pinch gesture
  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, lastScaleValue.value * event.scale));
          scaleValue.value = newScale;
          runOnJS(setCurrentScale)(newScale);
        })
        .onEnd(() => {
          lastScaleValue.value = scaleValue.value;
          runOnJS(setCurrentScale)(scaleValue.value);
        })
        .runOnJS(false),
    []
  );

  const combinedGesture = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture),
    [panGesture, pinchGesture]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scaleValue.value },
    ],
  }));

  // Handle tile/building placement
  const handleTilePress = useCallback(
    (col: number, row: number) => {
      if (Platform.OS !== "web" && panMoved.current) return;
      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
        if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
          if (mode === "tile") {
            const current = newGrid[row][col].tile;
            const typeIndex = TILE_TYPES.indexOf(current as TileType);
            const nextType = TILE_TYPES[(typeIndex + 1) % TILE_TYPES.length];
            newGrid[row][col].tile = nextType;
            if (nextType === "none") newGrid[row][col].building = "none";
            if (nextType === "water") newGrid[row][col].building = "none";
          } else if (mode === "grass_plant") {
            // Toggle grass overlay independently - doesn't affect building
            newGrid[row][col].grassOverlay = !newGrid[row][col].grassOverlay;
          } else if (mode === "house_small" || mode === "house_big" || mode === "tree_png") {
            const currentTile = newGrid[row][col].tile;
            const currentBuilding = newGrid[row][col].building;
            if (currentTile === "grass" || currentTile === "dirt" || currentTile === "road") {
              if (currentBuilding === mode) {
                newGrid[row][col].building = "none";
              } else {
                newGrid[row][col].building = mode;
              }
            }
          }
        }
        return newGrid;
      });
    },
    [mode]
  );

  // Render tiles
  const tiles = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.tile === "none") continue;
        elements.push(
          <SquareTile key={`tile-${row}-${col}`} col={col} row={row} cell={cell} scale={currentScale} onPress={() => handleTilePress(col, row)} />
        );
      }
    }
    return elements;
  }, [grid, currentScale, handleTilePress]);

  // Render buildings (top layer, sorted by row then col for proper z-ordering)
  const buildings = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.building === "none") continue;
        elements.push(
          <BuildingOnTile key={`bld-${row}-${col}`} col={col} row={row} buildingType={cell.building} scale={currentScale} />
        );
      }
    }
    return elements;
  }, [grid, currentScale]);

  // Empty hit areas for "none" tiles
  const emptyHitAreas = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col].tile !== "none") continue;
        const pos = gridToScreen(col, row, currentScale);
        const ts = TILE_SIZE * currentScale;
        elements.push(
          <TouchableOpacity key={`empty-${row}-${col}`} activeOpacity={0.3}
            style={{ position: "absolute", left: pos.x - ts / 2, top: pos.y - ts / 2, width: ts, height: ts, zIndex: 0 }}
            onPress={() => handleTilePress(col, row)} />
        );
      }
    }
    return elements;
  }, [grid, currentScale, handleTilePress]);

  const gridBounds = useMemo(() => {
    const totalSize = GRID_SIZE * TILE_SIZE + TILE_SIZE * 2;
    return { width: totalSize, height: totalSize };
  }, []);

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.mapContainer}>
        <View style={styles.centerWrapper}>
          <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[animatedStyle, { position: "relative" }]}>
              {/* Seamless grass background - covers entire grid to avoid tile seams */}
              <View style={{
                position: "absolute",
                left: -gridBounds.width / 2,
                top: -gridBounds.height / 2,
                width: gridBounds.width,
                height: gridBounds.height,
                zIndex: 0,
              }}>
                <Image
                  source={GRASS_TEXTURE}
                  style={{ width: gridBounds.width, height: gridBounds.height }}
                  contentFit="cover"
                  pointerEvents="none"
                />
              </View>
              {emptyHitAreas}
              {/* Non-grass tiles rendered on top of the seamless background */}
              {tiles.filter((t: any) => {
                // Only render non-grass tiles since grass is covered by the background
                return t?.props?.cell?.tile !== "grass";
              })}
              {/* Grass overlays rendered between tiles and buildings */}
              {(() => {
                const overlays: React.ReactNode[] = [];
                for (let row = 0; row < GRID_SIZE; row++) {
                  for (let col = 0; col < GRID_SIZE; col++) {
                    if (grid[row][col].grassOverlay) {
                      overlays.push(
                        <GrassOverlay key={`grass-${row}-${col}`} col={col} row={row} scale={currentScale} />
                      );
                    }
                  }
                }
                return overlays;
              })()}
              {buildings}
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>

      {/* Placement Mode Toolbar */}
      <View style={styles.toolbar}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeButton, mode === m && styles.modeButtonActive]}
            onPress={() => setMode(m)}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeIcon, mode === m && styles.modeIconActive]}>
              {MODE_LABELS[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WATER_BG },
  mapContainer: { flex: 1 },
  centerWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  toolbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    gap: 6,
    zIndex: 100,
  },
  modeButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  modeButtonActive: {
    backgroundColor: "rgba(76,175,80,0.5)",
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  modeIcon: {
    fontSize: 22,
  },
  modeIconActive: {
    fontSize: 26,
  },
});
