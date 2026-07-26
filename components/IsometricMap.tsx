import React, { useRef, useCallback, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Polygon, G, Rect, Circle } from "react-native-svg";

// --- Constants ---
const TILE_WIDTH = 100;
const TILE_HEIGHT = 50;
const GRID_SIZE = 30;
const WATER_BG = "#1a2a3a";
const DEPTH = 8;

// Tile types (ground)
const TILE_TYPES = ["grass", "water", "rock", "flower", "dirt", "road", "none"] as const;
type TileType = (typeof TILE_TYPES)[number];

// Building types (placed ON tiles)
const BUILDING_TYPES = ["house_small", "house_big", "tree_small", "tree_big", "none"] as const;
type BuildingType = (typeof BUILDING_TYPES)[number];

// Placement modes
const MODES = ["tile", "house_small", "house_big", "tree_small", "tree_big"] as const;
type PlaceMode = (typeof MODES)[number];

const TILE_COLORS: Record<TileType, { top: string; left: string; right: string; accent: string; detail: string }> = {
  grass: { top: "#5cb85c", left: "#3a7a3a", right: "#2d6b2d", accent: "#7ec87e", detail: "#4a9a4a" },
  water: { top: "#3498db", left: "#1a6fa8", right: "#145a8a", accent: "#5dade2", detail: "#2980b9" },
  rock: { top: "#95a5a6", left: "#6c7a7b", right: "#566566", accent: "#bdc3c7", detail: "#7f8c8d" },
  flower: { top: "#6ab04c", left: "#4a8c2a", right: "#3a7a1a", accent: "#f9ca24", detail: "#e74c3c" },
  dirt: { top: "#b08968", left: "#7a5c42", right: "#5c4430", accent: "#ddb892", detail: "#8d6e63" },
  road: { top: "#6b6b6b", left: "#4a4a4a", right: "#3a3a3a", accent: "#8a8a8a", detail: "#555555" },
  none: { top: WATER_BG, left: "#0f1a25", right: "#0a1218", accent: WATER_BG, detail: WATER_BG },
};

const MODE_LABELS: Record<PlaceMode, string> = {
  tile: "🖌️",
  house_small: "🏠",
  house_big: "🏡",
  tree_small: "🌲",
  tree_big: "🌳",
};

type GridCell = { tile: TileType; building: BuildingType };

function gridToIso(col: number, row: number, scale: number) {
  const cx = GRID_SIZE / 2 - 0.5;
  const cy = GRID_SIZE / 2 - 0.5;
  const x = (col - cx - (row - cy)) * (TILE_WIDTH / 2) * scale;
  const y = (col - cx + row - cy) * (TILE_HEIGHT / 2) * scale;
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
      if (dist > GRID_SIZE / 2 + 2) { rowArr.push({ tile: "none", building: "none" }); continue; }
      let tile: TileType = "grass";
      if ((col * 7 + row * 3) % 41 === 0) tile = "water";
      else if ((col * 5 + row * 2) % 37 === 0) tile = "rock";
      else if ((col * 3 + row * 5) % 31 === 0) tile = "flower";
      else if ((col * 2 + row * 7) % 43 === 0) tile = "dirt";
      // Scatter some trees on grass tiles
      let building: BuildingType = "none";
      if (tile === "grass" && (col * 11 + row * 7) % 53 === 0) {
        building = (col + row) % 2 === 0 ? "tree_small" : "tree_big";
      }
      // Scatter some small houses
      if (tile === "grass" && building === "none" && (col * 13 + row * 11) % 67 === 0) {
        building = "house_small";
      }
      rowArr.push({ tile, building });
    }
    grid.push(rowArr);
  }
  return grid;
}

// --- SVG Isometric Tile ---
function IsoTileSvg({ col, row, cell, scale, onPress }: {
  col: number; row: number; cell: GridCell; scale: number; onPress: () => void;
}) {
  const pos = gridToIso(col, row, scale);
  const colors = TILE_COLORS[cell.tile];
  const tw = TILE_WIDTH * scale;
  const th = TILE_HEIGHT * scale;
  const depth = DEPTH * scale;
  const halfW = tw / 2;
  const halfH = th / 2;

  const topPoints = `0,${-halfH} ${halfW},0 0,${halfH} ${-halfW},0`;
  const leftPoints = `${-halfW},0 0,${halfH} 0,${halfH + depth} ${-halfW},${depth}`;
  const rightPoints = `0,${halfH} ${halfW},0 ${halfW},${depth} 0,${halfH + depth}`;

  // Road has center line
  const roadCenterLine = cell.tile === "road" ? (
    <>
      <Rect x={-halfW * 0.15} y={-halfH * 0.05} width={halfW * 0.3} height={halfH * 0.1} fill="#e8e8e8" opacity={0.7} />
    </>
  ) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        position: "absolute",
        left: pos.x - halfW,
        top: pos.y - halfH,
        width: tw,
        height: th + depth,
        zIndex: Math.floor(col + row) * 4 + 1,
      }}
    >
      <Svg
        width={tw}
        height={th + depth}
        viewBox={`${-halfW} ${-halfH} ${tw} ${th + depth}`}
      >
        <G>
          {/* Tile base */}
          <Polygon points={topPoints} fill={colors.top} stroke={colors.left} strokeWidth={0.5} />
          
          {cell.tile === "grass" && (
            <>
              <Polygon points={`${-halfW*0.3},${-halfH*0.1} ${-halfW*0.25},${-halfH*0.4} ${-halfW*0.2},${-halfH*0.1}`} fill={colors.accent} />
              <Polygon points={`${halfW*0.1},${-halfH*0.2} ${halfW*0.15},${-halfH*0.5} ${halfW*0.2},${-halfH*0.2}`} fill="#8de88d" />
              <Polygon points={`${halfW*0.35},${halfH*0.05} ${halfW*0.4},${-halfH*0.25} ${halfW*0.45},${halfH*0.05}`} fill={colors.accent} />
              <Polygon points={`${-halfW*0.15},${halfH*0.15} ${-halfW*0.1},${-halfH*0.05} ${-halfW*0.05},${halfH*0.15}`} fill="#9fe89f" />
            </>
          )}
          {cell.tile === "water" && (
            <>
              <Polygon points={`${-halfW*0.4},${halfH*0.1} ${-halfW*0.1},${halfH*0.05} ${-halfW*0.15},${halfH*0.15}`} fill={colors.accent} opacity={0.4} />
              <Polygon points={`${halfW*0.1},${halfH*0.2} ${halfW*0.35},${halfH*0.15} ${halfW*0.3},${halfH*0.25}`} fill={colors.accent} opacity={0.3} />
            </>
          )}
          {cell.tile === "rock" && (
            <>
              <Polygon points={`${-halfW*0.3},${-halfH*0.15} ${-halfW*0.05},${-halfH*0.2} ${-halfW*0.1},${halfH*0.1} ${-halfW*0.35},${halfH*0.05}`} fill={colors.accent} />
              <Polygon points={`${halfW*0.15},${halfH*0.0} ${halfW*0.35},${-halfH*0.05} ${halfW*0.3},${halfH*0.2} ${halfW*0.1},${halfH*0.15}`} fill="#d5d8d9" />
            </>
          )}
          {cell.tile === "flower" && (
            <>
              <Polygon points={`${-halfW*0.25},${-halfH*0.15} ${-halfW*0.2},${-halfH*0.25} ${-halfW*0.15},${-halfH*0.1}`} fill="#e74c3c" />
              <Polygon points={`${halfW*0.3},${halfH*0.05} ${halfW*0.35},${-halfH*0.05} ${halfW*0.4},${halfH*0.1}`} fill="#e74c3c" />
              <Polygon points={`${halfW*0.05},${-halfH*0.2} ${halfW*0.1},${-halfH*0.3} ${halfW*0.15},${-halfH*0.15}`} fill="#f1c40f" />
            </>
          )}
          {cell.tile === "dirt" && (
            <>
              <Polygon points={`${-halfW*0.2},0 ${-halfW*0.15},${-halfH*0.1} ${-halfW*0.1},${halfH*0.05} ${-halfW*0.25},${halfH*0.02}`} fill={colors.detail} />
              <Polygon points={`${halfW*0.2},${halfH*0.1} ${halfW*0.28},${halfH*0.02} ${halfW*0.25},${halfH*0.2} ${halfW*0.15},${halfH*0.15}`} fill={colors.detail} />
            </>
          )}
          {roadCenterLine}

          <Polygon points={leftPoints} fill={colors.left} stroke={colors.left} strokeWidth={0.3} />
          <Polygon points={rightPoints} fill={colors.right} stroke={colors.right} strokeWidth={0.3} />
        </G>
      </Svg>
    </TouchableOpacity>
  );
}

// --- SVG Building: Small House ---
function SmallHouse({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToIso(col, row, scale);
  const tw = TILE_WIDTH * scale;
  const th = TILE_HEIGHT * scale;
  const halfW = tw / 2;
  const halfH = th / 2;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - halfW * 0.55,
      top: pos.y - halfH * 2.2,
      width: tw * 0.7,
      height: halfH * 2.8,
      zIndex: Math.floor(col + row) * 4 + 3,
    }}>
      <Svg width={tw * 0.7} height={halfH * 2.8} viewBox={`0 0 ${tw * 0.7} ${halfH * 2.8}`}>
        <G>
          {/* Roof - triangle shape */}
          <Polygon points={`${tw*0.05},${halfH*0.6} ${tw*0.35},${-halfH*0.2} ${tw*0.65},${halfH*0.6}`} fill="#c0392b" stroke="#922b21" strokeWidth={1} />
          <Polygon points={`${tw*0.05},${halfH*0.6} ${tw*0.35},${-halfH*0.2} ${tw*0.35},${halfH*0.5}`} fill="#e74c3c" />
          {/* House body */}
          <Rect x={tw*0.1} y={halfH*0.6} width={tw*0.5} height={halfH*1.6} fill="#d4a574" stroke="#a0522d" strokeWidth={0.5} />
          {/* Door */}
          <Rect x={tw*0.25} y={halfH*1.4} width={tw*0.2} height={halfH*0.8} fill="#8B4513" rx={2} />
          <Circle cx={tw*0.41} cy={halfH*1.8} r={tw*0.015} fill="#f1c40f" />
          {/* Windows */}
          <Rect x={tw*0.12} y={halfH*0.8} width={tw*0.12} height={halfH*0.3} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
          <Rect x={tw*0.46} y={halfH*0.8} width={tw*0.12} height={halfH*0.3} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
          {/* Chimney */}
          <Rect x={tw*0.4} y={halfH*0.0} width={tw*0.1} height={halfH*0.4} fill="#8B4513" />
        </G>
      </Svg>
    </View>
  );
}

// --- SVG Building: Big House ---
function BigHouse({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToIso(col, row, scale);
  const tw = TILE_WIDTH * scale;
  const th = TILE_HEIGHT * scale;
  const halfW = tw / 2;
  const halfH = th / 2;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - halfW * 0.65,
      top: pos.y - halfH * 2.8,
      width: tw * 0.8,
      height: halfH * 3.5,
      zIndex: Math.floor(col + row) * 4 + 3,
    }}>
      <Svg width={tw * 0.8} height={halfH * 3.5} viewBox={`0 0 ${tw * 0.8} ${halfH * 3.5}`}>
        <G>
          {/* Roof - larger */}
          <Polygon points={`${tw*0.05},${halfH*0.7} ${tw*0.4},${-halfH*0.1} ${tw*0.75},${halfH*0.7}`} fill="#2c3e50" stroke="#1a252f" strokeWidth={1} />
          <Polygon points={`${tw*0.05},${halfH*0.7} ${tw*0.4},${-halfH*0.1} ${tw*0.4},${halfH*0.6}`} fill="#34495e" />
          {/* House body */}
          <Rect x={tw*0.08} y={halfH*0.7} width={tw*0.64} height={halfH*2.2} fill="#f5e6c8" stroke="#c9a96e" strokeWidth={0.5} />
          {/* Large door */}
          <Rect x={tw*0.3} y={halfH*1.7} width={tw*0.2} height={halfH*1.2} fill="#5d4037" rx={tw*0.02} />
          <Circle cx={tw*0.47} cy={halfH*2.3} r={tw*0.018} fill="#f1c40f" />
          {/* Windows - bigger */}
          <Rect x={tw*0.1} y={halfH*0.9} width={tw*0.14} height={halfH*0.4} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
          <Rect x={tw*0.56} y={halfH*0.9} width={tw*0.14} height={halfH*0.4} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
          <Rect x={tw*0.1} y={halfH*1.5} width={tw*0.14} height={halfH*0.4} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
          <Rect x={tw*0.56} y={halfH*1.5} width={tw*0.14} height={halfH*0.4} fill="#87CEEB" stroke="#5b9bd5" strokeWidth={0.5} />
          {/* Chimney */}
          <Rect x={tw*0.5} y={halfH*0.1} width={tw*0.12} height={halfH*0.5} fill="#7f8c8d" />
          {/* Fence */}
          <Rect x={tw*0.05} y={halfH*2.7} width={tw*0.7} height={halfH*0.15} fill="#8B7355" opacity={0.6} />
        </G>
      </Svg>
    </View>
  );
}

// --- SVG Tree: Small ---
function SmallTree({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToIso(col, row, scale);
  const tw = TILE_WIDTH * scale;
  const th = TILE_HEIGHT * scale;
  const halfW = tw / 2;
  const halfH = th / 2;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - halfW * 0.3,
      top: pos.y - halfH * 2.0,
      width: halfW * 0.6,
      height: halfH * 2.6,
      zIndex: Math.floor(col + row) * 4 + 3,
    }}>
      <Svg width={halfW * 0.6} height={halfH * 2.6} viewBox={`0 0 ${halfW * 0.6} ${halfH * 2.6}`}>
        <G>
          {/* Trunk */}
          <Rect x={halfW * 0.2} y={halfH * 1.6} width={halfW * 0.2} height={halfH * 1.0} fill="#8B4513" />
          {/* Tree top - triangle */}
          <Polygon points={`${halfW*0.05},${halfH*1.8} ${halfW*0.3},${halfH*0.0} ${halfW*0.55},${halfH*1.8}`} fill="#2d5a27" stroke="#1e3d1a" strokeWidth={0.8} />
          <Polygon points={`${halfW*0.15},${halfH*1.2} ${halfW*0.3},${halfH*0.4} ${halfW*0.45},${halfH*1.2}`} fill="#3a7a30" />
          <Polygon points={`${halfW*0.2},${halfH*0.8} ${halfW*0.3},${halfH*0.3} ${halfW*0.4},${halfH*0.8}`} fill="#4a9a40" />
        </G>
      </Svg>
    </View>
  );
}

// --- SVG Tree: Big ---
function BigTree({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToIso(col, row, scale);
  const tw = TILE_WIDTH * scale;
  const th = TILE_HEIGHT * scale;
  const halfW = tw / 2;
  const halfH = th / 2;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - halfW * 0.4,
      top: pos.y - halfH * 2.6,
      width: halfW * 0.8,
      height: halfH * 3.2,
      zIndex: Math.floor(col + row) * 4 + 3,
    }}>
      <Svg width={halfW * 0.8} height={halfH * 3.2} viewBox={`0 0 ${halfW * 0.8} ${halfH * 3.2}`}>
        <G>
          {/* Trunk - thicker */}
          <Rect x={halfW * 0.25} y={halfH * 2.2} width={halfW * 0.3} height={halfH * 1.0} fill="#6b3a1f" />
          {/* Large foliage - rounded */}
          <Circle cx={halfW * 0.4} cy={halfH * 1.5} r={halfW * 0.35} fill="#2d5a27" />
          <Circle cx={halfW * 0.25} cy={halfH * 1.3} r={halfW * 0.25} fill="#3a7a30" />
          <Circle cx={halfW * 0.55} cy={halfH * 1.3} r={halfW * 0.25} fill="#3a7a30" />
          <Circle cx={halfW * 0.4} cy={halfH * 0.8} r={halfW * 0.3} fill="#4a9a40" />
          <Circle cx={halfW * 0.4} cy={halfH * 1.1} r={halfW * 0.35} fill="#2d5a27" opacity={0.7} />
        </G>
      </Svg>
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
    case "tree_small": return <SmallTree col={col} row={row} scale={scale} />;
    case "tree_big": return <BigTree col={col} row={row} scale={scale} />;
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
        .minDistance(8)
        .onStart(() => {
          lastOffsetX.value = offsetX.value;
          lastOffsetY.value = offsetY.value;
          panMoved.current = false;
          isPressing.current = false;
        })
        .onUpdate((event) => {
          const dx = event.translationX;
          const dy = event.translationY;
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
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
            // Cycle tile type
            const current = newGrid[row][col].tile;
            const typeIndex = TILE_TYPES.indexOf(current as TileType);
            const nextType = TILE_TYPES[(typeIndex + 1) % TILE_TYPES.length];
            // If new tile is road, clear building; if new tile is none, clear building
            newGrid[row][col].tile = nextType;
            if (nextType === "none") newGrid[row][col].building = "none";
            if (nextType === "water") newGrid[row][col].building = "none";
          } else if (mode === "house_small" || mode === "house_big" || mode === "tree_small" || mode === "tree_big") {
            // Place building - only on grass, dirt, or road tiles
            const currentTile = newGrid[row][col].tile;
            const currentBuilding = newGrid[row][col].building;
            if (currentTile === "grass" || currentTile === "dirt" || currentTile === "road") {
              // Toggle: if same building exists, remove it; otherwise place it
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

  // Render tiles (bottom layer)
  const tiles = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.tile === "none") continue;
        elements.push(
          <IsoTileSvg key={`tile-${row}-${col}`} col={col} row={row} cell={cell} scale={currentScale} onPress={() => handleTilePress(col, row)} />
        );
      }
    }
    return elements;
  }, [grid, currentScale, handleTilePress]);

  // Render buildings (top layer)
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
        const pos = gridToIso(col, row, currentScale);
        const tw = TILE_WIDTH * currentScale;
        const th = TILE_HEIGHT * currentScale;
        elements.push(
          <TouchableOpacity key={`empty-${row}-${col}`} activeOpacity={0.3}
            style={{ position: "absolute", left: pos.x - tw / 2, top: pos.y - th / 2, width: tw, height: th + DEPTH * currentScale, zIndex: 0 }}
            onPress={() => handleTilePress(col, row)} />
        );
      }
    }
    return elements;
  }, [grid, currentScale, handleTilePress]);

  const gridBounds = useMemo(() => {
    const maxDist = (GRID_SIZE / 2 + 2);
    return {
      width: maxDist * TILE_WIDTH * 2 + TILE_WIDTH * 2,
      height: maxDist * TILE_HEIGHT + TILE_HEIGHT * 2 + DEPTH * 2,
    };
  }, []);

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.mapContainer}>
        <View style={styles.centerWrapper}>
          <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[animatedStyle, { position: "relative" }]}>
              <View style={{
                position: "absolute",
                left: -gridBounds.width / 2,
                top: -gridBounds.height / 2,
                width: gridBounds.width,
                height: gridBounds.height,
                backgroundColor: WATER_BG,
                borderRadius: 4,
              }} />
              {emptyHitAreas}
              {tiles}
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
