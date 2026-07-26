import React, { useRef, useCallback, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Svg, { Polygon, G } from "react-native-svg";

// --- Constants ---
const TILE_WIDTH = 100;   // Wider tiles for better screen coverage
const TILE_HEIGHT = 50;   // Proportional height for isometric
const GRID_SIZE = 20;     // Larger grid to fill screen
const WATER_BG = "#1a2a3a";
const DEPTH = 8;          // Subtle 3D depth

const TILE_TYPES = ["grass", "water", "rock", "flower", "dirt", "none"] as const;
type TileType = (typeof TILE_TYPES)[number];

const TILE_COLORS: Record<TileType, { top: string; left: string; right: string; accent: string; detail: string }> = {
  grass: { top: "#5cb85c", left: "#3a7a3a", right: "#2d6b2d", accent: "#7ec87e", detail: "#4a9a4a" },
  water: { top: "#3498db", left: "#1a6fa8", right: "#145a8a", accent: "#5dade2", detail: "#2980b9" },
  rock: { top: "#95a5a6", left: "#6c7a7b", right: "#566566", accent: "#bdc3c7", detail: "#7f8c8d" },
  flower: { top: "#6ab04c", left: "#4a8c2a", right: "#3a7a1a", accent: "#f9ca24", detail: "#e74c3c" },
  dirt: { top: "#b08968", left: "#7a5c42", right: "#5c4430", accent: "#ddb892", detail: "#8d6e63" },
  none: { top: WATER_BG, left: "#0f1a25", right: "#0a1218", accent: WATER_BG, detail: WATER_BG },
};

type GridCell = TileType;

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
      // Use a diamond-shaped region that fills most of the grid
      const cx = GRID_SIZE / 2 - 0.5;
      const cy = GRID_SIZE / 2 - 0.5;
      const dist = Math.abs(col - cx) + Math.abs(row - cy);
      // Diamond shape that covers ~80% of the grid
      if (dist > GRID_SIZE / 2 + 1) { rowArr.push("none"); continue; }
      if ((col * 7 + row * 3) % 41 === 0) rowArr.push("water");
      else if ((col * 5 + row * 2) % 37 === 0) rowArr.push("rock");
      else if ((col * 3 + row * 5) % 31 === 0) rowArr.push("flower");
      else if ((col * 2 + row * 7) % 43 === 0) rowArr.push("dirt");
      else rowArr.push("grass");
    }
    grid.push(rowArr);
  }
  return grid;
}

// --- SVG Isometric Tile ---
function IsoTileSvg({ col, row, tileType, scale, onPress }: {
  col: number; row: number; tileType: TileType; scale: number; onPress: () => void;
}) {
  const pos = gridToIso(col, row, scale);
  const colors = TILE_COLORS[tileType];
  const tw = TILE_WIDTH * scale;
  const th = TILE_HEIGHT * scale;
  const depth = DEPTH * scale;
  const halfW = tw / 2;
  const halfH = th / 2;

  const topPoints = `0,${-halfH} ${halfW},0 0,${halfH} ${-halfW},0`;
  const leftPoints = `${-halfW},0 0,${halfH} 0,${halfH + depth} ${-halfW},${depth}`;
  const rightPoints = `0,${halfH} ${halfW},0 ${halfW},${depth} 0,${halfH + depth}`;

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
        zIndex: Math.floor(col + row) * 2 + 1,
      }}
    >
      <Svg
        width={tw}
        height={th + depth}
        viewBox={`${-halfW} ${-halfH} ${tw} ${th + depth}`}
      >
        <G>
          <Polygon points={topPoints} fill={colors.top} stroke={colors.left} strokeWidth={0.5} />
          
          {tileType === "grass" && (
            <>
              <Polygon points={`${-halfW*0.3},${-halfH*0.1} ${-halfW*0.25},${-halfH*0.4} ${-halfW*0.2},${-halfH*0.1}`} fill={colors.accent} />
              <Polygon points={`${halfW*0.1},${-halfH*0.2} ${halfW*0.15},${-halfH*0.5} ${halfW*0.2},${-halfH*0.2}`} fill="#8de88d" />
              <Polygon points={`${halfW*0.35},${halfH*0.05} ${halfW*0.4},${-halfH*0.25} ${halfW*0.45},${halfH*0.05}`} fill={colors.accent} />
              <Polygon points={`${-halfW*0.15},${halfH*0.15} ${-halfW*0.1},${-halfH*0.05} ${-halfW*0.05},${halfH*0.15}`} fill="#9fe89f" />
            </>
          )}
          {tileType === "water" && (
            <>
              <Polygon points={`${-halfW*0.4},${halfH*0.1} ${-halfW*0.1},${halfH*0.05} ${-halfW*0.15},${halfH*0.15}`} fill={colors.accent} opacity={0.4} />
              <Polygon points={`${halfW*0.1},${halfH*0.2} ${halfW*0.35},${halfH*0.15} ${halfW*0.3},${halfH*0.25}`} fill={colors.accent} opacity={0.3} />
            </>
          )}
          {tileType === "rock" && (
            <>
              <Polygon points={`${-halfW*0.3},${-halfH*0.15} ${-halfW*0.05},${-halfH*0.2} ${-halfW*0.1},${halfH*0.1} ${-halfW*0.35},${halfH*0.05}`} fill={colors.accent} />
              <Polygon points={`${halfW*0.15},${halfH*0.0} ${halfW*0.35},${-halfH*0.05} ${halfW*0.3},${halfH*0.2} ${halfW*0.1},${halfH*0.15}`} fill="#d5d8d9" />
            </>
          )}
          {tileType === "flower" && (
            <>
              <Polygon points={`${-halfW*0.25},${-halfH*0.15} ${-halfW*0.2},${-halfH*0.25} ${-halfW*0.15},${-halfH*0.1}`} fill="#e74c3c" />
              <Polygon points={`${halfW*0.3},${halfH*0.05} ${halfW*0.35},${-halfH*0.05} ${halfW*0.4},${halfH*0.1}`} fill="#e74c3c" />
              <Polygon points={`${halfW*0.05},${-halfH*0.2} ${halfW*0.1},${-halfH*0.3} ${halfW*0.15},${-halfH*0.15}`} fill="#f1c40f" />
            </>
          )}
          {tileType === "dirt" && (
            <>
              <Polygon points={`${-halfW*0.2},0 ${-halfW*0.15},${-halfH*0.1} ${-halfW*0.1},${halfH*0.05} ${-halfW*0.25},${halfH*0.02}`} fill={colors.detail} />
              <Polygon points={`${halfW*0.2},${halfH*0.1} ${halfW*0.28},${halfH*0.02} ${halfW*0.25},${halfH*0.2} ${halfW*0.15},${halfH*0.15}`} fill={colors.detail} />
            </>
          )}

          <Polygon points={leftPoints} fill={colors.left} stroke={colors.left} strokeWidth={0.3} />
          <Polygon points={rightPoints} fill={colors.right} stroke={colors.right} strokeWidth={0.3} />
        </G>
      </Svg>
    </TouchableOpacity>
  );
}

// --- Main Component: Full screen, no UI ---
export default function IsometricMap() {
  const [grid, setGrid] = useState<GridCell[][]>(createDefaultGrid);

  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const lastOffsetX = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);

  const scaleValue = useSharedValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  const lastScale = useRef(1);

  const MIN_SCALE = 0.3;
  const MAX_SCALE = 3.0;

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => { lastOffsetX.value = offsetX.value; lastOffsetY.value = offsetY.value; })
        .onUpdate((event) => {
          offsetX.value = lastOffsetX.value + event.translationX;
          offsetY.value = lastOffsetY.value + event.translationY;
        }),
    []
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, lastScale.current * event.scale));
          scaleValue.value = newScale;
          setCurrentScale(newScale);
        })
        .onEnd(() => { lastScale.current = scaleValue.value; }),
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

  // Cycle tile type on tap
  const handleTilePress = useCallback(
    (col: number, row: number) => {
      setGrid((prev) => {
        const newGrid = prev.map((r) => [...r]);
        if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
          const current = newGrid[row][col];
          const typeIndex = TILE_TYPES.indexOf(current as TileType);
          const nextType = TILE_TYPES[(typeIndex + 1) % TILE_TYPES.length];
          newGrid[row][col] = nextType;
        }
        return newGrid;
      });
    },
    []
  );

  const tiles = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const tileType = grid[row][col];
        if (tileType === "none") continue;
        elements.push(
          <IsoTileSvg key={`${row}-${col}`} col={col} row={row} tileType={tileType} scale={currentScale} onPress={() => handleTilePress(col, row)} />
        );
      }
    }
    return elements;
  }, [grid, currentScale, handleTilePress]);

  const emptyHitAreas = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] !== "none") continue;
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
    const maxDist = (GRID_SIZE / 2 + 1);
    return {
      width: maxDist * TILE_WIDTH * 2 + TILE_WIDTH * 2,
      height: maxDist * TILE_HEIGHT + TILE_HEIGHT * 2 + DEPTH * 2,
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.centerWrapper}>
        <GestureDetector gesture={combinedGesture}>
          <Animated.View style={[animatedStyle, { position: "relative" }]}>
            {/* Water background */}
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
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WATER_BG },
  centerWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
});
