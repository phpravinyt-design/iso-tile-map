import React, { useRef, useCallback, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Svg, { Polygon, G, Line } from "react-native-svg";

// --- Constants ---
const TILE_WIDTH = 80;
const TILE_HEIGHT = 40;
const GRID_SIZE = 15;
const WATER_BG = "#1a2a3a";
const DEPTH = 12;

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

const TILE_LABELS: Record<TileType, string> = {
  grass: "Grass",
  water: "Water",
  rock: "Rock",
  flower: "Flower",
  dirt: "Dirt",
  none: "Erase",
};

const TILE_ICONS: Record<TileType, string> = {
  grass: "🌿",
  water: "💧",
  rock: "🪨",
  flower: "🌸",
  dirt: "🟫",
  none: "✖",
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
      const cx = GRID_SIZE / 2 - 0.5;
      const cy = GRID_SIZE / 2 - 0.5;
      const dist = Math.abs(col - cx) + Math.abs(row - cy);
      if (dist > GRID_SIZE / 2 - 1) { rowArr.push("none"); continue; }
      if ((col * 7 + row * 3) % 31 === 0) rowArr.push("water");
      else if ((col * 5 + row * 2) % 29 === 0) rowArr.push("rock");
      else if ((col * 3 + row * 5) % 23 === 0) rowArr.push("flower");
      else if ((col * 2 + row * 7) % 37 === 0) rowArr.push("dirt");
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
        left: pos.x - halfW - 1,
        top: pos.y - halfH - 1,
        width: tw + 2,
        height: th + depth + 2,
        zIndex: Math.floor(col + row) * 2 + 1,
      }}
    >
      <Svg
        width={tw + 2}
        height={th + depth + 2}
        viewBox={`${-halfW - 1} ${-halfH - 1} ${tw + 2} ${th + depth + 2}`}
      >
        <G>
          <Polygon points={topPoints} fill={colors.top} stroke={colors.left} strokeWidth={0.6} />
          
          {/* Grass blades */}
          {tileType === "grass" && (
            <>
              <Polygon points={`${-halfW*0.3},${-halfH*0.1} ${-halfW*0.25},${-halfH*0.4} ${-halfW*0.2},${-halfH*0.1}`} fill={colors.accent} />
              <Polygon points={`${halfW*0.1},${-halfH*0.2} ${halfW*0.15},${-halfH*0.5} ${halfW*0.2},${-halfH*0.2}`} fill="#8de88d" />
              <Polygon points={`${halfW*0.35},${halfH*0.05} ${halfW*0.4},${-halfH*0.25} ${halfW*0.45},${halfH*0.05}`} fill={colors.accent} />
              <Polygon points={`${-halfW*0.15},${halfH*0.15} ${-halfW*0.1},${-halfH*0.05} ${-halfW*0.05},${halfH*0.15}`} fill="#9fe89f" />
            </>
          )}
          {/* Water ripples */}
          {tileType === "water" && (
            <>
              <Polygon points={`${-halfW*0.4},${halfH*0.1} ${-halfW*0.1},${halfH*0.05} ${-halfW*0.15},${halfH*0.15}`} fill={colors.accent} opacity={0.4} />
              <Polygon points={`${halfW*0.1},${halfH*0.2} ${halfW*0.35},${halfH*0.15} ${halfW*0.3},${halfH*0.25}`} fill={colors.accent} opacity={0.3} />
            </>
          )}
          {/* Rock details */}
          {tileType === "rock" && (
            <>
              <Polygon points={`${-halfW*0.3},${-halfH*0.15} ${-halfW*0.05},${-halfH*0.2} ${-halfW*0.1},${halfH*0.1} ${-halfW*0.35},${halfH*0.05}`} fill={colors.accent} />
              <Polygon points={`${halfW*0.15},${halfH*0.0} ${halfW*0.35},${-halfH*0.05} ${halfW*0.3},${halfH*0.2} ${halfW*0.1},${halfH*0.15}`} fill="#d5d8d9" />
            </>
          )}
          {/* Flower details */}
          {tileType === "flower" && (
            <>
              <Polygon points={`${-halfW*0.25},${-halfH*0.15} ${-halfW*0.2},${-halfH*0.25} ${-halfW*0.15},${-halfH*0.1}`} fill="#e74c3c" />
              <Polygon points={`${halfW*0.3},${halfH*0.05} ${halfW*0.35},${-halfH*0.05} ${halfW*0.4},${halfH*0.1}`} fill="#e74c3c" />
              <Polygon points={`${halfW*0.05},${-halfH*0.2} ${halfW*0.1},${-halfH*0.3} ${halfW*0.15},${-halfH*0.15}`} fill="#f1c40f" />
            </>
          )}
          {/* Dirt pebbles */}
          {tileType === "dirt" && (
            <>
              <Polygon points={`${-halfW*0.2},0 ${-halfW*0.15},${-halfH*0.1} ${-halfW*0.1},${halfH*0.05} ${-halfW*0.25},${halfH*0.02}`} fill={colors.detail} />
              <Polygon points={`${halfW*0.2},${halfH*0.1} ${halfW*0.28},${halfH*0.02} ${halfW*0.25},${halfH*0.2} ${halfW*0.15},${halfH*0.15}`} fill={colors.detail} />
            </>
          )}

          <Polygon points={leftPoints} fill={colors.left} stroke={colors.left} strokeWidth={0.4} />
          <Polygon points={rightPoints} fill={colors.right} stroke={colors.right} strokeWidth={0.4} />
        </G>
      </Svg>
    </TouchableOpacity>
  );
}

// --- Main Component ---
export default function IsometricMap() {
  const [grid, setGrid] = useState<GridCell[][]>(createDefaultGrid);
  const [selectedTile, setSelectedTile] = useState<TileType>("grass");

  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const lastOffsetX = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);

  const scaleValue = useSharedValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  const lastScale = useRef(1);

  const tileCount = useMemo(() => {
    let count = 0;
    grid.forEach((row) => row.forEach((cell) => { if (cell !== "none") count++; }));
    return count;
  }, [grid]);

  const MIN_SCALE = 0.35;
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

  const handleTilePress = useCallback(
    (col: number, row: number) => {
      setGrid((prev) => {
        const newGrid = prev.map((r) => [...r]);
        if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
          newGrid[row][col] = selectedTile;
        }
        return newGrid;
      });
    },
    [selectedTile]
  );

  const handleReset = useCallback(() => {
    setGrid(createDefaultGrid());
    offsetX.value = 0; offsetY.value = 0;
    lastOffsetX.value = 0; lastOffsetY.value = 0;
    scaleValue.value = 1; setCurrentScale(1); lastScale.current = 1;
  }, []);

  const zoomIn = useCallback(() => {
    const newScale = Math.min(MAX_SCALE, currentScale * 1.25);
    scaleValue.value = newScale;
    setCurrentScale(newScale);
    lastScale.current = newScale;
  }, [currentScale]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(MIN_SCALE, currentScale / 1.25);
    scaleValue.value = newScale;
    setCurrentScale(newScale);
    lastScale.current = newScale;
  }, [currentScale]);

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
    const maxDist = (GRID_SIZE / 2 - 1);
    return {
      width: maxDist * TILE_WIDTH * 2 + TILE_WIDTH * 2,
      height: maxDist * TILE_HEIGHT + TILE_HEIGHT * 2 + DEPTH * 2,
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.topTitle}>Iso Tile Farm</Text>
          <Text style={styles.zoomLabel}>{Math.round(currentScale * 100)}%</Text>
        </View>
        <View style={styles.topRight}>
          <View style={styles.zoomButtons}>
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut} activeOpacity={0.7}>
              <Text style={styles.zoomBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn} activeOpacity={0.7}>
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tileCounter}>🌿 {tileCount}</Text>
          <TouchableOpacity style={styles.clearButton} onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.clearButtonText}>↺</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Area */}
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
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>

      {/* Bottom Toolbar */}
      <View style={styles.bottomToolbar}>
        <View style={styles.tileSelector}>
          {TILE_TYPES.map((type) => (
            <TouchableOpacity key={type}
              style={[styles.tileTypeButton, selectedTile === type && styles.tileTypeButtonActive]}
              onPress={() => setSelectedTile(type)} activeOpacity={0.7}>
              <Text style={styles.tileTypeIcon}>{TILE_ICONS[type]}</Text>
              <Text style={[styles.tileTypeLabel, selectedTile === type && styles.tileTypeLabelActive]}>
                {TILE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WATER_BG },
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8,
    backgroundColor: "rgba(0,0,0,0.55)", zIndex: 100,
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  topRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  topTitle: { fontSize: 18, fontWeight: "bold", color: "#E8F5E9" },
  zoomLabel: { fontSize: 11, color: "#A5D6A7", fontWeight: "500" },
  zoomButtons: { flexDirection: "row", gap: 2 },
  zoomBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  zoomBtnText: { fontSize: 18, color: "#E8F5E9", fontWeight: "bold" },
  tileCounter: { fontSize: 13, color: "#A5D6A7", fontWeight: "600" },
  clearButton: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  clearButtonText: { fontSize: 16, color: "#FFC107", fontWeight: "bold" },
  mapContainer: { flex: 1, overflow: "hidden" },
  centerWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  bottomToolbar: {
    backgroundColor: "rgba(0,0,0,0.65)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)",
    paddingBottom: 10, paddingHorizontal: 4, paddingTop: 8, zIndex: 100,
  },
  tileSelector: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  tileTypeButton: {
    alignItems: "center", justifyContent: "center", padding: 6, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1.5, borderColor: "transparent",
    minWidth: 46, gap: 2,
  },
  tileTypeButtonActive: {
    backgroundColor: "rgba(76,175,80,0.35)", borderColor: "#4CAF50",
    shadowColor: "#4CAF50", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 3,
  },
  tileTypeIcon: { fontSize: 18 },
  tileTypeLabel: { fontSize: 8, color: "#9E9E9E", fontWeight: "500" },
  tileTypeLabelActive: { color: "#E8F5E9", fontWeight: "700" },
});
