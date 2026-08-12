import { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

// 3 Tile texture PNGs from user's sheet
const LUSH_GRASS_TILE_PNG = require("@/assets/images/cropped_tiles/lush_grass.jpg");
const LIGHT_GRASS_TILE_PNG = require("@/assets/images/cropped_tiles/light_grass.png");
const SAND_TILE_PNG = require("@/assets/images/cropped_tiles/sand.png");

// Tree PNG assets - 11 tree types
const TREE_PNG = require("@/assets/images/tree.png");
const PALM_TREE_PNG = require("@/assets/images/palm_tree.png");
const GREEN_TREE_PNG = require("@/assets/images/cropped_trees/green_tree.png");
const PINE_TREE_PNG = require("@/assets/images/cropped_trees/pine_tree.png");
const WILLOW_TREE_PNG = require("@/assets/images/cropped_trees/willow_tree.png");
const APPLE_TREE_PNG = require("@/assets/images/cropped_trees/apple_tree.png");
const CHERRY_BLOSSOM_PNG = require("@/assets/images/cherry_blossom_full.png");
const BIRCH_TREE_PNG = require("@/assets/images/cropped_trees/birch_tree.png");
const AUTUMN_TREE_PNG = require("@/assets/images/cropped_trees/autumn_tree.png");
const BLUE_TREE_PNG = require("@/assets/images/cropped_trees/blue_tree.png");

// House PNG asset - Township-style house
const HOUSE_PNG = require("@/assets/images/house.png");

// 9 Cropped House PNGs from user's sheet
const BLUE_HOUSE_RED_ROOF_PNG = require("@/assets/images/cropped_houses/blue_house_red_roof.png");
const BROWN_HOUSE_BLUE_ROOF_PNG = require("@/assets/images/cropped_houses/brown_house_blue_roof.png");
const PURPLE_HOUSE_PNG = require("@/assets/images/cropped_houses/purple_house.png");
const GREEN_ROOF_COTTAGE_PNG = require("@/assets/images/cropped_houses/green_roof_cottage.png");
const WHITE_VILLA_DOME_PNG = require("@/assets/images/cropped_houses/white_villa_dome.png");
const ORANGE_ROOF_HOUSE_PNG = require("@/assets/images/cropped_houses/orange_roof_house.png");
const MODERN_WHITE_HOUSE_PNG = require("@/assets/images/cropped_houses/modern_white_house.png");
const PURPLE_MANSION_PNG = require("@/assets/images/cropped_houses/purple_mansion.png");
const STONE_HOUSE_BLUE_ROOF_PNG = require("@/assets/images/cropped_houses/stone_house_blue_roof.png");

// Town Market building PNG
const TOWN_MARKET_PNG = require("@/assets/images/town_market.png");

// 3 Road tile PNGs from user's sheet
const ROAD_STRAIGHT_PNG = require("@/assets/images/cropped_roads/road_straight.png");
const ROAD_CORNER_PNG = require("@/assets/images/cropped_roads/road_corner.png");
const ROAD_INTERSECTION_PNG = require("@/assets/images/cropped_roads/road_intersection.png");

// 9 Temple PNGs from user's sheet
const TEMPLE_PINK_PNG = require("@/assets/images/cropped_temples/temple_pink.png");
const TEMPLE_GOLD_TOWER_PNG = require("@/assets/images/cropped_temples/temple_gold_tower.png");
const TEMPLE_BROWN_COMPLEX_PNG = require("@/assets/images/cropped_temples/temple_brown_complex.png");
const TEMPLE_WHITE_MARBLE_PNG = require("@/assets/images/cropped_temples/temple_white_marble.png");
const TEMPLE_DARK_BRONZE_PNG = require("@/assets/images/cropped_temples/temple_dark_bronze.png");
const TEMPLE_GOLD_SMALL_PNG = require("@/assets/images/cropped_temples/temple_gold_small.png");
const TEMPLE_DARK_STONE_PNG = require("@/assets/images/cropped_temples/temple_dark_stone.png");
const TEMPLE_GOLD_POOL_PNG = require("@/assets/images/cropped_temples/temple_gold_pool.png");
const TEMPLE_BROWN_GOPURAM_PNG = require("@/assets/images/cropped_temples/temple_brown_gopuram.png");

// 9 Community Building PNGs from user's sheet
const TOWN_HALL_PNG = require("@/assets/images/cropped_community/town_hall.png");
const HOSPITAL_PNG = require("@/assets/images/cropped_community/hospital.png");
const SCHOOL_PNG = require("@/assets/images/cropped_community/school.png");
const FIRE_STATION_PNG = require("@/assets/images/cropped_community/fire_station.png");
const POLICE_STATION_PNG = require("@/assets/images/cropped_community/police_station.png");
const MARKET_PNG = require("@/assets/images/cropped_community/market.png");
const LIBRARY_PNG = require("@/assets/images/cropped_community/library.png");
const TRAIN_STATION_PNG = require("@/assets/images/cropped_community/train_station.png");
const PARK_PNG = require("@/assets/images/cropped_community/park.png");

// Individual grass tile PNG - placed on each grass tile separately
const GRASS_TILE_PNG = require("@/assets/images/grass_texture.png");

// Grass plant PNG asset - used as a building/object on tiles
const GRASS_PLANT_PNG = require("@/assets/images/grass_plant.png");

// --- Constants ---
// Flat top-down square tiles (1:1 aspect ratio) - Township style
const TILE_SIZE = 90;
const GRID_SIZE = 25;
const WATER_BG = "#1a2a3a";
const DEFAULT_SCALE = 1.0;
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 1.5;

// Tile types (ground)
const TILE_TYPES = ["grass", "water", "rock", "flower", "dirt", "none"] as const;
type TileType = (typeof TILE_TYPES)[number];

// Tile texture types (for the Tiles selector - user picks which grass/sand texture)
const TILE_TEXTURE_TYPES = ["lush_grass", "light_grass", "sand"] as const;
type TileTextureType = (typeof TILE_TEXTURE_TYPES)[number];

// Tile texture PNG sources
const TILE_TEXTURE_SOURCES: Record<string, any> = {
  lush_grass: LUSH_GRASS_TILE_PNG,
  light_grass: LIGHT_GRASS_TILE_PNG,
  sand: SAND_TILE_PNG,
};

// Building types (placed ON tiles)
const BUILDING_TYPES = [
  "house_small", "house_big", "town_market", "none",
  // 11 tree types
  "tree_png", "palm_tree",
  "green_tree", "pine_tree", "willow_tree",
  "apple_tree", "cherry_blossom", "birch_tree",
  "autumn_tree", "blue_tree",
  // 9 community building types
  "town_hall", "hospital", "school", "fire_station",
  "police_station", "market", "library", "train_station", "park",
  // 9 temple types
  "temple_pink", "temple_gold_tower", "temple_brown_complex",
  "temple_white_marble", "temple_dark_bronze", "temple_gold_small",
  "temple_dark_stone", "temple_gold_pool", "temple_brown_gopuram",
  // 3 road tile types
  "road_straight", "road_corner", "road_intersection",
] as const;
type BuildingType = (typeof BUILDING_TYPES)[number];

// House types for selection (9 user-provided houses)
const HOUSE_TYPES = [
  "blue_house_red_roof", "brown_house_blue_roof", "purple_house",
  "green_roof_cottage", "white_villa_dome", "orange_roof_house",
  "modern_white_house", "purple_mansion", "stone_house_blue_roof",
] as const;
type HouseType = (typeof HOUSE_TYPES)[number];

// Temple types for selection (9 temples)
const TEMPLE_TYPES = [
  "temple_pink", "temple_gold_tower", "temple_brown_complex",
  "temple_white_marble", "temple_dark_bronze", "temple_gold_small",
  "temple_dark_stone", "temple_gold_pool", "temple_brown_gopuram",
] as const;
type TempleType = (typeof TEMPLE_TYPES)[number];

// Temple PNG sources
const TEMPLE_SOURCES: Record<string, any> = {
  temple_pink: TEMPLE_PINK_PNG,
  temple_gold_tower: TEMPLE_GOLD_TOWER_PNG,
  temple_brown_complex: TEMPLE_BROWN_COMPLEX_PNG,
  temple_white_marble: TEMPLE_WHITE_MARBLE_PNG,
  temple_dark_bronze: TEMPLE_DARK_BRONZE_PNG,
  temple_gold_small: TEMPLE_GOLD_SMALL_PNG,
  temple_dark_stone: TEMPLE_DARK_STONE_PNG,
  temple_gold_pool: TEMPLE_GOLD_POOL_PNG,
  temple_brown_gopuram: TEMPLE_BROWN_GOPURAM_PNG,
};

// Temple emoji labels
const TEMPLE_EMOJIS: Record<string, string> = {
  temple_pink: "🕉️",
  temple_gold_tower: "🏛️",
  temple_brown_complex: "🛕",
  temple_white_marble: "⚪",
  temple_dark_bronze: "🟫",
  temple_gold_small: "✨",
  temple_dark_stone: "🪨",
  temple_gold_pool: "💧",
  temple_brown_gopuram: "🛕",
};

// Community building types (9 community buildings)
const COMMUNITY_TYPES = [
  "town_hall", "hospital", "school", "fire_station",
  "police_station", "market", "library", "train_station", "park",
] as const;
type CommunityType = (typeof COMMUNITY_TYPES)[number];

// Road tile types (3 road tiles from user's sheet)
const ROAD_TYPES = ["road_straight", "road_corner", "road_intersection"] as const;
type RoadType = (typeof ROAD_TYPES)[number];

// House PNG sources
const HOUSE_SOURCES: Record<string, any> = {
  blue_house_red_roof: BLUE_HOUSE_RED_ROOF_PNG,
  brown_house_blue_roof: BROWN_HOUSE_BLUE_ROOF_PNG,
  purple_house: PURPLE_HOUSE_PNG,
  green_roof_cottage: GREEN_ROOF_COTTAGE_PNG,
  white_villa_dome: WHITE_VILLA_DOME_PNG,
  orange_roof_house: ORANGE_ROOF_HOUSE_PNG,
  modern_white_house: MODERN_WHITE_HOUSE_PNG,
  purple_mansion: PURPLE_MANSION_PNG,
  stone_house_blue_roof: STONE_HOUSE_BLUE_ROOF_PNG,
};

// Community building PNG sources
const COMMUNITY_SOURCES: Record<string, any> = {
  town_hall: TOWN_HALL_PNG,
  hospital: HOSPITAL_PNG,
  school: SCHOOL_PNG,
  fire_station: FIRE_STATION_PNG,
  police_station: POLICE_STATION_PNG,
  market: MARKET_PNG,
  library: LIBRARY_PNG,
  train_station: TRAIN_STATION_PNG,
  park: PARK_PNG,
};

// Community building emoji labels
const COMMUNITY_EMOJIS: Record<string, string> = {
  town_hall: "🏛️",
  hospital: "🏥",
  school: "🏫",
  fire_station: "🚒",
  police_station: "🚔",
  market: "🛒",
  library: "📚",
  train_station: "🚂",
  park: "🌳",
};

// Road tile PNG sources
const ROAD_SOURCES: Record<string, any> = {
  road_straight: ROAD_STRAIGHT_PNG,
  road_corner: ROAD_CORNER_PNG,
  road_intersection: ROAD_INTERSECTION_PNG,
};

// Generic Road tile renderer (covers the whole tile)
function PngRoadGeneric({ col, row, scale, roadType, rotation = 0 }: {
  col: number; row: number; scale: number; roadType: string; rotation?: number;
}) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - ts / 2,
      top: pos.y - ts / 2,
      width: ts,
      height: ts,
      zIndex: 2,
      pointerEvents: "box-none",
    }}>
      <Image
        source={ROAD_SOURCES[roadType] || ROAD_STRAIGHT_PNG}
        style={{ width: ts, height: ts, transform: [{ rotate: `${rotation}deg` }] }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// Generic Community Building renderer
function PngCommunityGeneric({ col, row, scale, communityType }: {
  col: number; row: number; scale: number; communityType: string;
}) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const bldSize = ts * 1.8;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - bldSize / 2,
      top: pos.y - bldSize / 2,
      width: bldSize,
      height: bldSize,
      zIndex: 10,
      pointerEvents: "box-none",
    }}>
      <Image
        source={COMMUNITY_SOURCES[communityType] || TEMPLE_SOURCES[communityType] || TOWN_HALL_PNG}
        style={{ width: bldSize, height: bldSize }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// Generic PNG House renderer
function PngHouseGeneric({ col, row, scale, houseType }: {
  col: number; row: number; scale: number; houseType: string;
}) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const houseSize = ts * 1.6;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - houseSize / 2,
      top: pos.y - houseSize / 2,
      width: houseSize,
      height: houseSize,
      zIndex: 10,
      pointerEvents: "box-none",
    }}>
      <Image
        source={HOUSE_SOURCES[houseType] || HOUSE_PNG}
        style={{ width: houseSize, height: houseSize }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// Placement modes
const MODES = ["tile", "tiles", "community", "temple", "road", "house_small", "house_big", "town_market", "tree", "grass_plant"] as const;
type PlaceMode = (typeof MODES)[number];

// Tree emoji labels
const TREE_EMOJIS: Record<string, string> = {
  tree_png: "🌳",
  palm_tree: "🌴",
  green_tree: "🟢",
  pine_tree: "🎄",
  willow_tree: "🌾",
  apple_tree: "🍎",
  cherry_blossom: "🌸",
  birch_tree: "🤍",
  autumn_tree: "🍂",
  blue_tree: "🩵",
};

// Tree sub-types for selection (11 types)
const TREE_TYPES = [
  "tree_png", "palm_tree",
  "green_tree", "pine_tree", "willow_tree",
  "apple_tree", "cherry_blossom", "birch_tree",
  "autumn_tree", "blue_tree",
] as const;
type TreeType = (typeof TREE_TYPES)[number];

const TILE_COLORS: Record<TileType, { base: string; detail: string; accent: string }> = {
  grass: { base: "#5cb85c", detail: "#4a9a4a", accent: "#7ec87e" },
  water: { base: "#3498db", detail: "#2980b9", accent: "#5dade2" },
  rock: { base: "#95a5a6", detail: "#7f8c8d", accent: "#bdc3c7" },
  flower: { base: "#6ab04c", detail: "#e74c3c", accent: "#f9ca24" },
  dirt: { base: "#b08968", detail: "#8d6e63", accent: "#ddb892" },
  none: { base: WATER_BG, detail: WATER_BG, accent: WATER_BG },
};

const MODE_LABELS: Record<PlaceMode, string> = {
  tile: "🖌️",
  tiles: "🧱",
  temple: "🛕",
  community: "🏛️",
  road: "🛣️",
  house_small: "🏠",
  house_big: "🏡",
  town_market: "🏪",
  tree: "🌳",
  grass_plant: "🌿",
};

type GridCell = { tile: TileType; building: BuildingType; grassOverlay: boolean; roadOverlay: RoadType | null; roadRotation: number; tileTexture: TileTextureType };

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
      if (dist > GRID_SIZE / 2 + 1) { rowArr.push({ tile: "none", building: "none", grassOverlay: false, roadOverlay: null, roadRotation: 0, tileTexture: "lush_grass" }); continue; }
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
      rowArr.push({ tile, building, grassOverlay: false, roadOverlay: null, roadRotation: 0, tileTexture: "lush_grass" });
    }
    grid.push(rowArr);
  }
  return grid;
}

// --- Flat Square Tile Component ---
// Each grass tile gets its own PNG image placed individually
function SquareTile({ col, row, cell, scale, onPress, onLongPress }: {
  col: number; row: number; cell: GridCell; scale: number; onPress: () => void; onLongPress?: () => void;
}) {
  const pos = gridToScreen(col, row, scale);
  const colors = TILE_COLORS[cell.tile];
  const ts = TILE_SIZE * scale;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={5000}
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
        // Each grass tile gets its own individual PNG - uses the tileTexture from the cell
        <Image
          source={TILE_TEXTURE_SOURCES[cell.tileTexture] || GRASS_TILE_PNG}
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

        </Svg>
      ))}
    </TouchableOpacity>
  );
}

// --- PNG House: Small House (top-down view) ---
function SmallHouse({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;

  // House PNG size - slightly larger than tile
  const houseSize = ts * 1.5;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - houseSize / 2,
      top: pos.y - houseSize / 2,
      width: houseSize,
      height: houseSize,
      zIndex: 10,
      pointerEvents: "box-none",
    }}>
      <Image
        source={HOUSE_PNG}
        style={{ width: houseSize, height: houseSize }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- PNG House: Big House (top-down view) ---
function BigHouse({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;

  // House PNG size - larger for big house
  const houseSize = ts * 1.8;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - houseSize / 2,
      top: pos.y - houseSize / 2,
      width: houseSize,
      height: houseSize,
      zIndex: 10,
      pointerEvents: "box-none",
    }}>
      <Image
        source={HOUSE_PNG}
        style={{ width: houseSize, height: houseSize }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- PNG Tree (round foliage tree) ---
function PngTree({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const treeSize = ts * 1.3;

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

// --- PNG Palm Tree ---
function PalmTree({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const treeSize = ts * 1.3;

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
        source={PALM_TREE_PNG}
        style={{ width: treeSize, height: treeSize }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- New Tree Types (all share same rendering pattern) ---
// Map of tree type key to PNG source
const TREE_SOURCES: Record<string, any> = {
  tree_png: TREE_PNG,
  palm_tree: PALM_TREE_PNG,
  green_tree: GREEN_TREE_PNG,
  pine_tree: PINE_TREE_PNG,
  willow_tree: WILLOW_TREE_PNG,
  apple_tree: APPLE_TREE_PNG,
  cherry_blossom: CHERRY_BLOSSOM_PNG,
  birch_tree: BIRCH_TREE_PNG,
  autumn_tree: AUTUMN_TREE_PNG,
  blue_tree: BLUE_TREE_PNG,
};

// Generic PNG Tree renderer
function PngTreeGeneric({ col, row, scale, treeType }: {
  col: number; row: number; scale: number; treeType: string;
}) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const treeSize = ts * 1.3;

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
        source={TREE_SOURCES[treeType] || TREE_PNG}
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

// --- PNG Town Market Building ---
function TownMarket({ col, row, scale }: { col: number; row: number; scale: number }) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const marketSize = ts * 2.2;

  return (
    <View style={{
      position: "absolute",
      left: pos.x - marketSize / 2,
      top: pos.y - marketSize / 2,
      width: marketSize,
      height: marketSize,
      zIndex: 10,
      pointerEvents: "box-none",
    }}>
      <Image
        source={TOWN_MARKET_PNG}
        style={{ width: marketSize, height: marketSize }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- Building Component Selector ---
function BuildingOnTile({ col, row, buildingType, scale }: {
  col: number; row: number; buildingType: BuildingType; scale: number;
}) {
  // All tree types use the generic renderer
  if (buildingType in TREE_SOURCES) {
    return <PngTreeGeneric col={col} row={row} scale={scale} treeType={buildingType} />;
  }
  // All user house types use the generic renderer
  if (buildingType in HOUSE_SOURCES) {
    return <PngHouseGeneric col={col} row={row} scale={scale} houseType={buildingType} />;
  }
  // All community building types use the generic renderer
  if (buildingType in COMMUNITY_SOURCES) {
    return <PngCommunityGeneric col={col} row={row} scale={scale} communityType={buildingType} />;
  }
  // All temple types use the generic renderer
  if (buildingType in TEMPLE_SOURCES) {
    return <PngCommunityGeneric col={col} row={row} scale={scale} communityType={buildingType} />;
  }
  // All road tile types use the generic renderer
  if (buildingType in ROAD_SOURCES) {
    return <PngRoadGeneric col={col} row={row} scale={scale} roadType={buildingType} />;
  }
  switch (buildingType) {
    case "house_small": return <SmallHouse col={col} row={row} scale={scale} />;
    case "house_big": return <BigHouse col={col} row={row} scale={scale} />;
    case "town_market": return <TownMarket col={col} row={row} scale={scale} />;
    default: return null;
  }
}

// --- Main Component ---
export default function IsometricMap() {
  const [grid, setGrid] = useState<GridCell[][]>(createDefaultGrid);
  const [loaded, setLoaded] = useState(false);

  // Load saved map on mount
  useEffect(() => {
    AsyncStorage.getItem("map_grid").then((saved) => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as GridCell[][];
          if (parsed && Array.isArray(parsed) && parsed.length === GRID_SIZE) {
            setGrid(parsed);
          }
        } catch (e) {
          // Invalid data, use default
        }
      }
      setLoaded(true);
    });
  }, []);

  // Save map on change (debounced via useEffect)
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem("map_grid", JSON.stringify(grid)).catch(() => {});
    }
  }, [grid, loaded]);
  const [mode, setMode] = useState<PlaceMode>("tile");
  const [selectedTreeType, setSelectedTreeType] = useState<TreeType>("tree_png");
  const [showTreeSelector, setShowTreeSelector] = useState(false);
  const [selectedHouseType, setSelectedHouseType] = useState<HouseType>("blue_house_red_roof");
  const [showHouseSelector, setShowHouseSelector] = useState(false);
  const [selectedCommunityType, setSelectedCommunityType] = useState<CommunityType>("town_hall");
  const [showCommunitySelector, setShowCommunitySelector] = useState(false);
  const [selectedRoadType, setSelectedRoadType] = useState<RoadType>("road_straight");
  const [showRoadSelector, setShowRoadSelector] = useState(false);
  const [selectedTileType, setSelectedTileType] = useState<TileTextureType>("lush_grass");
  const [showTileSelector, setShowTileSelector] = useState(false);
  const [selectedTempleType, setSelectedTempleType] = useState<TempleType>("temple_pink");
  const [showTempleSelector, setShowTempleSelector] = useState(false);

  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const lastOffsetX = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const lastScaleValue = useSharedValue(1);

  const [currentScale, setCurrentScale] = useState(DEFAULT_SCALE);
  const panMoved = useRef(false);
  const isPressing = useRef(false);

  const MIN_SCALE = MIN_ZOOM;
  const MAX_SCALE = MAX_ZOOM;

  // Move clipboard: holds object picked up via long press (cut mode)
  const [moveClipboard, setMoveClipboard] = useState<{ type: "building" | "road" | "grass"; buildingType?: BuildingType; roadType?: RoadType; roadRotation?: number } | null>(null);

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

  // Handle long press to pick up (cut) building/object for moving
  const handleRemoveBuilding = useCallback((col: number, row: number) => {
    setGrid((prev) => {
      const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        const cell = newGrid[row][col];
        // Pick up whatever is there into clipboard for moving
        if (cell.building !== "none") {
          setMoveClipboard({ type: "building", buildingType: cell.building });
          newGrid[row][col].building = "none";
        } else if (cell.roadOverlay) {
          setMoveClipboard({ type: "road", roadType: cell.roadOverlay, roadRotation: cell.roadRotation });
          newGrid[row][col].roadOverlay = null;
          newGrid[row][col].roadRotation = 0;
        } else if (cell.grassOverlay) {
          setMoveClipboard({ type: "grass" });
          newGrid[row][col].grassOverlay = false;
        } else {
          setMoveClipboard(null);
        }
      }
      return newGrid;
    });
  }, []);

  // Handle tile/building placement
  const handleTilePress = useCallback(
    (col: number, row: number) => {
      if (Platform.OS !== "web" && panMoved.current) return;
      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
        if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
          if (mode === "tile") {
            // If we have a picked-up object, place it here
            if (moveClipboard) {
              if (newGrid[row][col].tile === "grass" || newGrid[row][col].tile === "dirt") {
                if (moveClipboard.type === "building") {
                  newGrid[row][col].building = moveClipboard.buildingType || "none";
                  newGrid[row][col].roadOverlay = null;
                } else if (moveClipboard.type === "road") {
                  newGrid[row][col].roadOverlay = moveClipboard.roadType || null;
                  newGrid[row][col].roadRotation = moveClipboard.roadRotation || 0;
                } else if (moveClipboard.type === "grass") {
                  newGrid[row][col].grassOverlay = true;
                }
              }
              setMoveClipboard(null);
              return newGrid;
            }
            const current = newGrid[row][col].tile;
            const typeIndex = TILE_TYPES.indexOf(current as TileType);
            const nextType = TILE_TYPES[(typeIndex + 1) % TILE_TYPES.length];
            newGrid[row][col].tile = nextType;
            if (nextType === "none") newGrid[row][col].building = "none";
            if (nextType === "water") newGrid[row][col].building = "none";
          } else if (mode === "grass_plant") {
            // If we have a picked-up object, place it here first
            if (moveClipboard) {
              if (newGrid[row][col].tile === "grass" || newGrid[row][col].tile === "dirt") {
                if (moveClipboard.type === "building") {
                  newGrid[row][col].building = moveClipboard.buildingType || "none";
                  newGrid[row][col].roadOverlay = null;
                } else if (moveClipboard.type === "road") {
                  newGrid[row][col].roadOverlay = moveClipboard.roadType || null;
                  newGrid[row][col].roadRotation = moveClipboard.roadRotation || 0;
                } else if (moveClipboard.type === "grass") {
                  newGrid[row][col].grassOverlay = true;
                }
              }
              setMoveClipboard(null);
              return newGrid;
            }
            newGrid[row][col].grassOverlay = !newGrid[row][col].grassOverlay;
          } else if (mode === "road") {
            // Road mode: road PNG overlays ON grass tile (grass stays underneath)
            // For corner roads, cycle rotation 0→90→180→270 on each tap
            const roadToPlace = selectedRoadType as RoadType;
            if (newGrid[row][col].roadOverlay === roadToPlace && roadToPlace !== "road_corner") {
              newGrid[row][col].roadOverlay = null;
              newGrid[row][col].roadRotation = 0;
            } else if (newGrid[row][col].roadOverlay === roadToPlace && roadToPlace === "road_corner") {
              // Rotate corner by 90 degrees
              newGrid[row][col].roadRotation = (newGrid[row][col].roadRotation + 90) % 360;
            } else {
              newGrid[row][col].roadOverlay = roadToPlace;
              newGrid[row][col].roadRotation = 0;
            }
          } else if (mode === "tiles") {
            // Tiles mode: apply the selected tile texture to this tile
            const textureToPlace = selectedTileType;
            if (newGrid[row][col].tile === "grass" || newGrid[row][col].tile === "dirt") {
              newGrid[row][col].tileTexture = textureToPlace;
            }
          } else if (mode === "community" || mode === "temple" || mode === "house_small" || mode === "house_big" || mode === "town_market" || mode === "tree") {
            // If we have a picked-up object, place it here first
            if (moveClipboard) {
              if (newGrid[row][col].tile === "grass" || newGrid[row][col].tile === "dirt") {
                if (moveClipboard.type === "building") {
                  newGrid[row][col].building = moveClipboard.buildingType || "none";
                  newGrid[row][col].roadOverlay = null;
                } else if (moveClipboard.type === "road") {
                  newGrid[row][col].roadOverlay = moveClipboard.roadType || null;
                  newGrid[row][col].roadRotation = moveClipboard.roadRotation || 0;
                } else if (moveClipboard.type === "grass") {
                  newGrid[row][col].grassOverlay = true;
                }
              }
              setMoveClipboard(null);
              return newGrid;
            }
            const currentTile = newGrid[row][col].tile;
            const currentBuilding = newGrid[row][col].building;
            if (currentTile === "grass" || currentTile === "dirt") {
              // Clear road overlay if placing a building on top
              newGrid[row][col].roadOverlay = null;
              if (mode === "community") {
                // Community building mode: use selectedCommunityType (the user's chosen community building)
                const buildingToPlace = selectedCommunityType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = buildingToPlace;
                }
              } else if (mode === "town_market") {
                if (currentBuilding === "town_market") {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = "town_market";
                }
              } else if (mode === "temple") {
                // Temple mode: place the user's selected temple type
                const buildingToPlace = selectedTempleType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = buildingToPlace;
                }
              } else if (mode === "tree") {
                // Tree mode: place the user's selected tree type
                if (currentBuilding === selectedTreeType) {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = selectedTreeType;
                }
              } else {
                // house_small or house_big mode: use selectedHouseType (the user's chosen house)
                const buildingToPlace = selectedHouseType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = buildingToPlace;
                }
              }
            }
          }
        }
        return newGrid;
      });
    },
    [mode, selectedTreeType, selectedHouseType, selectedCommunityType, selectedRoadType, selectedTileType, selectedTempleType, moveClipboard]
  );

  // Render ALL tiles (including grass tiles with individual PNG)
  const tiles = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.tile === "none") continue;
        elements.push(
          <SquareTile key={`tile-${row}-${col}`} col={col} row={row} cell={cell} scale={currentScale} onPress={() => handleTilePress(col, row)} onLongPress={() => handleRemoveBuilding(col, row)} />
        );
      }
    }
    return elements;
  }, [grid, currentScale, handleTilePress, handleRemoveBuilding]);

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
          <TouchableOpacity key={`empty-${row}-${col}`} activeOpacity={0.3} delayLongPress={5000}
            style={{ position: "absolute", left: pos.x - ts / 2, top: pos.y - ts / 2, width: ts, height: ts, zIndex: 0 }}
            onPress={() => handleTilePress(col, row)} onLongPress={() => handleRemoveBuilding(col, row)} />
        );
      }
    }
    return elements;
  }, [grid, currentScale, handleTilePress, handleRemoveBuilding]);

  // Road overlays (render ON grass tiles)
  const roadOverlays = useMemo(() => {
    const overlays: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.roadOverlay) {
          overlays.push(
            <PngRoadGeneric key={`road-${row}-${col}`} col={col} row={row} scale={currentScale} roadType={cell.roadOverlay} rotation={cell.roadRotation} />
          );
        }
      }
    }
    return overlays;
  }, [grid, currentScale]);

  // Grass overlays
  const grassOverlays = useMemo(() => {
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
  }, [grid, currentScale]);

  // Render road overlays
  const roadRender = roadOverlays;

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
              {/* All tiles rendered - each grass tile has its own PNG */}
              {tiles}
              {emptyHitAreas}
              {/* Grass overlays rendered between tiles and buildings */}
              {grassOverlays}
              {/* Road overlays rendered on top of grass tiles */}
              {roadOverlays}
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
            onPress={() => {
              if (m === "tree") {
                setShowTreeSelector(!showTreeSelector);
              } else {
                setShowTreeSelector(false);
              }
              if (m === "road") {
                setShowRoadSelector(!showRoadSelector);
              } else {
                setShowRoadSelector(false);
              }
              if (m === "tiles") {
                setShowTileSelector(!showTileSelector);
              } else {
                setShowTileSelector(false);
              }
              if (m === "temple") {
                setShowTempleSelector(!showTempleSelector);
              } else {
                setShowTempleSelector(false);
              }
              setMode(m);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeIcon, mode === m && styles.modeIconActive]}>
              {MODE_LABELS[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Community Building Sub-Selector (shown when community mode is active) */}
      {mode === "community" && (
        <View style={[styles.treeSelectorWrapper, { bottom: 140 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {COMMUNITY_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.treeOption, selectedCommunityType === t && styles.treeOptionActive]}
                onPress={() => {
                  setSelectedCommunityType(t);
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={COMMUNITY_SOURCES[t] || TOWN_HALL_PNG}
                  style={styles.treeOptionImage}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            <Text style={styles.treeSelectedText}>Tap a building to select it</Text>
          </View>
        </View>
      )}

      {/* Road Sub-Selector (shown when road mode is active) */}
      {mode === "road" && (
        <View style={[styles.treeSelectorWrapper, { bottom: 140 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {ROAD_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.treeOption, selectedRoadType === t && styles.treeOptionActive]}
                onPress={() => {
                  setSelectedRoadType(t);
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={ROAD_SOURCES[t] || ROAD_STRAIGHT_PNG}
                  style={styles.treeOptionImage}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            <Text style={styles.treeSelectedText}>Tap a road to select it</Text>
          </View>
        </View>
      )}

      {/* House Sub-Selector (shown when house mode is active) */}
      {(mode === "house_small" || mode === "house_big") && (
        <View style={[styles.treeSelectorWrapper, { bottom: 140 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {HOUSE_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.treeOption, selectedHouseType === t && styles.treeOptionActive]}
                onPress={() => {
                  setSelectedHouseType(t);
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={HOUSE_SOURCES[t] || HOUSE_PNG}
                  style={styles.treeOptionImage}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            <Text style={styles.treeSelectedText}>Tap a house to select it</Text>
          </View>
        </View>
      )}

      {/* Tiles Sub-Selector (shown when tiles mode is active) */}
      {mode === "tiles" && (
        <View style={[styles.treeSelectorWrapper, { bottom: 140 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {TILE_TEXTURE_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.treeOption, selectedTileType === t && styles.treeOptionActive]}
                onPress={() => {
                  setSelectedTileType(t);
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={TILE_TEXTURE_SOURCES[t] || GRASS_TILE_PNG}
                  style={styles.treeOptionImage}
                  contentFit="cover"
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            <Text style={styles.treeSelectedText}>Tap a tile texture to select it</Text>
          </View>
        </View>
      )}

      {/* Temple Sub-Selector (shown when temple mode is active) */}
      {mode === "temple" && (
        <View style={[styles.treeSelectorWrapper, { bottom: 140 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {TEMPLE_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.treeOption, selectedTempleType === t && styles.treeOptionActive]}
                onPress={() => {
                  setSelectedTempleType(t);
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={TEMPLE_SOURCES[t] || TEMPLE_PINK_PNG}
                  style={styles.treeOptionImage}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            <Text style={styles.treeSelectedText}>Tap a temple to select it</Text>
          </View>
        </View>
      )}

      {/* Tree Sub-Selector (shown when tree mode is active) */}
      {mode === "tree" && (
        <View style={styles.treeSelectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {TREE_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.treeOption, selectedTreeType === t && styles.treeOptionActive]}
                onPress={() => {
                  setSelectedTreeType(t);
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={TREE_SOURCES[t] || TREE_PNG}
                  style={styles.treeOptionImage}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            <Text style={styles.treeSelectedText}>Tap a tree to select it</Text>
          </View>
        </View>
      )}
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
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    gap: 6,
    zIndex: 100,
  },
  modeButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
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
  treeSelectorWrapper: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    zIndex: 101,
    maxHeight: 80,
  },
  treeSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
    gap: 8,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  treeOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  treeOptionActive: {
    backgroundColor: "rgba(76,175,80,0.5)",
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  treeOptionImage: {
    width: 48,
    height: 48,
  },
  treeOptionEmoji: {
    fontSize: 20,
  },
  treeSelectedLabel: {
    alignItems: "center",
    paddingVertical: 2,
  },
  treeSelectedText: {
    color: "#aaa",
    fontSize: 11,
  },
});
