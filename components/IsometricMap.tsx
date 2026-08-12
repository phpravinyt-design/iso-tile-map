import { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
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

// 9 Decoration PNGs from user's sheet
const DECORATION_FLOWER_ARCH_PNG = require("@/assets/images/cropped_decorations/flower_arch.png");
const DECORATION_FOUNTAIN_PNG = require("@/assets/images/cropped_decorations/fountain.png");
const DECORATION_BENCH_PNG = require("@/assets/images/cropped_decorations/bench.png");
const DECORATION_TOPIARY_PNG = require("@/assets/images/cropped_decorations/topiary.png");
const DECORATION_GAZEBO_PNG = require("@/assets/images/cropped_decorations/gazebo.png");
const DECORATION_FLOWER_POT_PNG = require("@/assets/images/cropped_decorations/flower_pot.png");
const DECORATION_SWING_PNG = require("@/assets/images/cropped_decorations/swing.png");
const DECORATION_WATERFALL_POND_PNG = require("@/assets/images/cropped_decorations/waterfall_pond.png");
const DECORATION_FLOWER_BED_PNG = require("@/assets/images/cropped_decorations/flower_bed.png");

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
// Currency system
const STARTING_COINS = 1000;
const ITEM_COST = 100;
// Daily reward system: 50 free coins once per day (date-keyed, user timezone)
const DAILY_REWARD_KEY = "last_daily_reward";
const STREAK_KEY = "login_streak";

// Login streak system: consecutive daily logins increase the reward
// Streak 1-2 = 50, streak 3-6 = 60, streak 7+ = 70 coins
function rewardForStreak(streak: number): number {
  if (streak >= 7) return 70;
  if (streak >= 3) return 60;
  return 50;
}

// Daily Tasks system: 3 tasks per day, each asks to place a random item (1-3 copies)
const DAILY_TASKS_KEY = "daily_tasks";
const DAILY_TASKS_DATE_KEY = "daily_tasks_date";
const TASK_REWARD_COINS = 100;

// Task item categories with representative types and emoji labels
const TASK_ITEM_CATEGORIES: { category: string; types: string[]; label: string }[] = [
  { category: "houses", types: ["house_small", "house_big", "town_market"], label: "House" },
  { category: "trees", types: ["tree_png", "palm_tree", "green_tree", "pine_tree", "willow_tree", "apple_tree", "cherry_blossom", "birch_tree", "autumn_tree", "blue_tree"], label: "Tree" },
  { category: "temples", types: ["temple_pink", "temple_gold_tower", "temple_brown_complex", "temple_white_marble", "temple_dark_bronze", "temple_gold_small", "temple_dark_stone", "temple_gold_pool", "temple_brown_gopuram"], label: "Temple" },
  { category: "community", types: ["town_hall", "hospital", "school", "fire_station", "police_station", "market", "library", "train_station", "park"], label: "Community Building" },
  { category: "decorations", types: ["flower_arch", "fountain", "bench", "topiary", "gazebo", "flower_pot", "swing", "waterfall_pond", "flower_bed"], label: "Decoration" },
  { category: "roads", types: ["road_straight", "road_corner", "road_intersection"], label: "Road" },
];

// Generate today's tasks from the date string (deterministic so all users' daily view is consistent)
interface DailyTask {
  id: number;
  category: string;
  label: string;
  required: number;
  progress: number;
  done: boolean;
  claimed: boolean;
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Count how many items of a task category are currently placed on the map
function countCategoryItems(grid: GridCell[][], category: string): number {
  let count = 0;
  const cat = TASK_ITEM_CATEGORIES.find((c) => c.category === category);
  if (!cat) return 0;
  for (const row of grid) {
    for (const cell of row) {
      const type = cell.building as string;
      if (type && type !== "none" && cat.types.includes(type)) count += 1;
    }
  }
  return count;
}

function generateTasksForDate(dateStr: string): DailyTask[] {
  // Pick 3 distinct categories deterministically for the day, without any
  // retry loops (loop-free Fisher-Yates shuffle of the category indices).
  const n = TASK_ITEM_CATEGORIES.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = simpleHash(dateStr + ":pick" + i) % (i + 1);
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  const tasks: DailyTask[] = [];
  for (let i = 0; i < 3; i += 1) {
    const cat = TASK_ITEM_CATEGORIES[indices[i]];
    const required = 1 + (simpleHash(dateStr + ":req" + i) % 3);
    tasks.push({
      id: i,
      category: cat.category,
      label: cat.label,
      required,
      progress: 0,
      done: false,
      claimed: false,
    });
  }
  return tasks;
}
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
  // 9 decoration types
  "flower_arch", "fountain", "bench", "topiary", "gazebo",
  "flower_pot", "swing", "waterfall_pond", "flower_bed",
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

// Decoration types for selection (9 decorations)
const DECORATION_TYPES = [
  "flower_arch", "fountain", "bench", "topiary", "gazebo",
  "flower_pot", "swing", "waterfall_pond", "flower_bed",
] as const;
type DecorationType = (typeof DECORATION_TYPES)[number];

// Decoration PNG sources
const DECORATION_SOURCES: Record<string, any> = {
  flower_arch: DECORATION_FLOWER_ARCH_PNG,
  fountain: DECORATION_FOUNTAIN_PNG,
  bench: DECORATION_BENCH_PNG,
  topiary: DECORATION_TOPIARY_PNG,
  gazebo: DECORATION_GAZEBO_PNG,
  flower_pot: DECORATION_FLOWER_POT_PNG,
  swing: DECORATION_SWING_PNG,
  waterfall_pond: DECORATION_WATERFALL_POND_PNG,
  flower_bed: DECORATION_FLOWER_BED_PNG,
};

// Decoration emoji labels
const DECORATION_EMOJIS: Record<string, string> = {
  flower_arch: "🌸",
  fountain: "⛲",
  bench: "🪑",
  topiary: "🌳",
  gazebo: "🏯",
  flower_pot: "🌺",
  swing: "🛝",
  waterfall_pond: "💧",
  flower_bed: "🌷",
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

// Full value lists (including house types) used for profile item stats classification
const TEMPLE_TYPE_VALUES: string[] = [...TEMPLE_TYPES];
const DECORATION_TYPE_VALUES: string[] = [...DECORATION_TYPES];
const COMMUNITY_TYPE_VALUES: string[] = [...COMMUNITY_TYPES];
const HOUSE_TYPE_VALUES: string[] = [...HOUSE_TYPES, "town_market"];
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
        source={COMMUNITY_SOURCES[communityType] || TEMPLE_SOURCES[communityType] || DECORATION_SOURCES[communityType] || TOWN_HALL_PNG}
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

// Generic decoration renderer (all 9 decoration PNGs)
function PngDecorationGeneric({ col, row, scale, decorationType }: {
  col: number; row: number; scale: number; decorationType: string;
}) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const size = ts * 1.5;
  return (
    <View style={{
      position: "absolute",
      left: pos.x - size / 2,
      top: pos.y - size / 2,
      width: size,
      height: size,
      zIndex: 10,
      pointerEvents: "box-none",
    }}>
      <Image
        source={DECORATION_SOURCES[decorationType] || DECORATION_FLOWER_ARCH_PNG}
        style={{ width: size, height: size }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}
// Placement modes
const MODES = ["tile", "tiles", "community", "temple", "decoration", "road", "house_small", "house_big", "town_market", "tree", "grass_plant"] as const;
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
const TREE_TYPE_VALUES: string[] = [...TREE_TYPES];

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
  decoration: "🌸",
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

// Map save version - bumped when the saved map schema/format changes.
// Old saves with a different version are ignored so the map always starts fresh.
const MAP_SAVE_VERSION = 2;
const MAP_SAVE_KEY = `map_grid_v${MAP_SAVE_VERSION}`;

// Clean start map: everything empty except ONE tree and ONE house
// (placed at fixed spots near the center). User buys everything else with coins.
const START_TREE_POS = { row: 14, col: 13 } as const;
const START_HOUSE_POS = { row: 14, col: 16 } as const;

function createDefaultGrid(): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowArr: GridCell[] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      let building: BuildingType = "none";
      if (row === START_TREE_POS.row && col === START_TREE_POS.col) {
        building = "tree_png" as BuildingType;
      }
      if (row === START_HOUSE_POS.row && col === START_HOUSE_POS.col) {
        building = "house_small" as BuildingType;
      }
      rowArr.push({ tile: "grass", building, grassOverlay: false, roadOverlay: null, roadRotation: 0, tileTexture: "lush_grass" });
    }
    grid.push(rowArr);
  }
  return grid;
}

// --- Long-Press Progress Bar above a pressed tile ---


// --- Flat Square Tile Component ---
// Each grass tile gets its own PNG image placed individually
function SquareTile({ col, row, cell, scale, onPress, onLongPress, onDelayStart, onDelayEnd, isPressed, progress }: {
  col: number; row: number; cell: GridCell; scale: number; onPress: () => void; onLongPress?: () => void;
  onDelayStart?: () => void; onDelayEnd?: () => void; isPressed?: boolean; progress?: number;
}) {
  const pos = gridToScreen(col, row, scale);
  const colors = TILE_COLORS[cell.tile];
  const ts = TILE_SIZE * scale;
  const hasItem = cell.building !== "none" || !!cell.roadOverlay || !!cell.grassOverlay;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={5000}
      onPressIn={() => {
        if (onDelayStart) onDelayStart();
      }}
      onPressOut={() => {
        if (onDelayEnd) onDelayEnd();
      }}
      style={{
        position: "absolute",
        left: pos.x - ts / 2,
        top: pos.y - ts / 2,
        width: ts,
        height: ts,
        zIndex: 1,
      }}
    >
      {/* Long-press progress bar above this tile */}
      {isPressed && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -10,
            right: -10,
            top: -14,
            height: 8,
            zIndex: 50,
          }}
        >
          <View style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(0,0,0,0.45)",
          }} />
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: ts + 20,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#F59E0B",
              transform: [{ scaleX: Math.min(1, Math.max(0, (progress ?? 0) / 100)) }],
              transformOrigin: "left center",
            }}
          />
        </View>
      )}
      {/* Tile rendering */}
      {cell.tile === "grass" ? (
        // Each grass tile gets its own individual PNG - uses the tileTexture from the cell.
        // Overlap adjacent tiles by 2px on every side so no hairline joint/seam is ever visible
        // between neighboring tiles (same-texture areas become one continuous lawn).
        <Image
          source={TILE_TEXTURE_SOURCES[cell.tileTexture] || GRASS_TILE_PNG}
          style={{ position: "absolute", left: -2, top: -2, width: ts + 4, height: ts + 4 }}
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
  // All decoration types use the generic renderer
  if (buildingType in DECORATION_SOURCES) {
    return <PngDecorationGeneric col={col} row={row} scale={scale} decorationType={buildingType} />;
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
    AsyncStorage.getItem(MAP_SAVE_KEY).then((saved) => {
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
    // Clear out old save keys from previous versions so stale maps never restore
    ["map_grid", "map_grid_v1"].forEach((oldKey) => {
      AsyncStorage.removeItem(oldKey).catch(() => {});
    });
    // Load saved coin balance (profile currency)
    AsyncStorage.getItem("profile_coins").then((saved) => {
      let val = saved ? parseInt(saved, 10) : STARTING_COINS;
      if (!Number.isFinite(val)) val = STARTING_COINS;
      // Daily reward + login streak: one grant per day, reward grows with streak
      const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" (local date)
      AsyncStorage.getItem(DAILY_REWARD_KEY).then((lastDate) => {
        AsyncStorage.getItem(STREAK_KEY).then((lastStreak) => {
          let streak = lastStreak ? parseInt(lastStreak, 10) : 0;
          if (!Number.isFinite(streak) || streak < 0) streak = 0;
          if (lastDate === today) {
            setCoins(val);
            return;
          }
          // Consecutive day? (yesterday) keep streak; otherwise reset to 0
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          if (lastDate !== yesterday) streak = 0;
          streak += 1; // new streak level for today's claim
          const reward = rewardForStreak(streak);
          val += reward;
          AsyncStorage.setItem(DAILY_REWARD_KEY, today).catch(() => {});
          AsyncStorage.setItem(STREAK_KEY, String(streak)).catch(() => {});
          setTimeout(() => {
            setCoins(val);
            setStreakLevel(streak);
            setDailyRewardAmount(reward);
            setShowDailyReward(true);
            setTimeout(() => setShowDailyReward(false), 3500);
          }, 600);
        });
      }).catch(() => {
        setCoins(val);
      });
    });
    AsyncStorage.getItem("profile_name").then((saved) => {
      if (saved) setProfileName(saved);
    });
    // Daily tasks: load today's tasks, refresh if it's a new day, and sync progress with the current map
    const today = new Date().toISOString().slice(0, 10);
    AsyncStorage.getItem(DAILY_TASKS_DATE_KEY).then((taskDate) => {
      if (taskDate === today) {
        // Same day: load saved tasks and update progress against current grid
        AsyncStorage.getItem(DAILY_TASKS_KEY).then((savedTasks) => {
          let tasks: DailyTask[] | null = null;
          if (savedTasks) {
            try { tasks = JSON.parse(savedTasks); } catch {}
          }
          if (!tasks || !Array.isArray(tasks) || tasks.length < 3) {
            tasks = generateTasksForDate(today);
          }
          const synced = tasks.map((t) => {
            const placed = countCategoryItems(grid, t.category);
            return {
              ...t,
              progress: Math.min(placed, t.required),
              done: placed >= t.required || t.done,
              claimed: t.claimed ?? false,
            };
          });
          setDailyTasks(synced);
          AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(synced)).catch(() => {});
        });
      } else {
        // New day: generate fresh tasks (progress starts at 0)
        const fresh = generateTasksForDate(today);
        setDailyTasks(fresh);
        AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(fresh)).catch(() => {});
        AsyncStorage.setItem(DAILY_TASKS_DATE_KEY, today).catch(() => {});
      }
    });
  }, []);

  // Save map on change (debounced via useEffect)
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(MAP_SAVE_KEY, JSON.stringify(grid)).catch(() => {});
    }
  }, [grid, loaded]);

  // Currency system: user starts with 1000 coins; profile currency persisted separately
  const [coins, setCoins] = useState(STARTING_COINS);
  const [profileName, setProfileName] = useState("Farmer");
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLowCoinsMsg, setShowLowCoinsMsg] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [streakLevel, setStreakLevel] = useState(0);
  const [dailyRewardAmount, setDailyRewardAmount] = useState(50);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(generateTasksForDate(new Date().toISOString().slice(0, 10)));
  const [showTasks, setShowTasks] = useState(false);
  const [showTaskReward, setShowTaskReward] = useState(false);
  const lowCoinsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flash a low-coins warning when the user places an item with little balance
  const flashLowCoins = useCallback(() => {
    if (lowCoinsTimer.current) clearTimeout(lowCoinsTimer.current);
    setShowLowCoinsMsg(true);
    lowCoinsTimer.current = setTimeout(() => setShowLowCoinsMsg(false), 2500);
  }, []);

  // Compute placed item stats for the profile screen
  const itemStats = useMemo(() => {
    let buildings = 0;
    let trees = 0;
    let roads = 0;
    let grassPlants = 0;
    let decorations = 0;
    let temples = 0;
    let communities = 0;
    let houses = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.building && cell.building !== "none") {
          if (TREE_TYPE_VALUES.includes(cell.building)) {
            trees += 1;
          } else if (DECORATION_TYPE_VALUES.includes(cell.building)) {
            decorations += 1;
          } else if (TEMPLE_TYPE_VALUES.includes(cell.building)) {
            temples += 1;
          } else if (COMMUNITY_TYPE_VALUES.includes(cell.building)) {
            communities += 1;
          } else {
            houses += 1;
          }
          buildings += 1;
        }
        if (cell.roadOverlay) roads += 1;
        if (cell.grassOverlay) grassPlants += 1;
      }
    }
    const totalItems = buildings + roads + grassPlants;
    return { buildings, trees, roads, grassPlants, decorations, temples, communities, houses, totalItems };
  }, [grid]);

  // Persist coin balance whenever it changes
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem("profile_coins", String(coins)).catch(() => {});
    }
  }, [coins, loaded]);

  // Persist profile name whenever it changes
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem("profile_name", profileName).catch(() => {});
    }
  }, [profileName, loaded]);
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
  const [selectedDecorationType, setSelectedDecorationType] = useState<DecorationType>("flower_arch");
  const [showDecorationSelector, setShowDecorationSelector] = useState(false);
  const [showItemsMenu, setShowItemsMenu] = useState(false);

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
  const [moveClipboard, setMoveClipboard] = useState<{ type: "building" | "road" | "grass"; buildingType?: BuildingType; roadType?: RoadType; roadRotation?: number; origCol?: number; origRow?: number } | null>(null);
  const [pickupMessage, setPickupMessage] = useState<string | null>(null);

  // Long-press progress bar state
  const pressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pressProgress, setPressProgress] = useState(0); // 0-100
  const [pressTarget, setPressTarget] = useState<{ col: number; row: number } | null>(null);
  const [isItemPress, setIsItemPress] = useState(false);
  const cancelPressTimerRef = useRef<() => void>(() => {});

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
          runOnJS(cancelPressTimerRef.current)();
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
          setMoveClipboard({ type: "building", buildingType: cell.building, origCol: col, origRow: row });
          setPickupMessage("Item picked up! Tap a tile to shift it, or remove it.");
          newGrid[row][col].building = "none";
        } else if (cell.roadOverlay) {
          setMoveClipboard({ type: "road", roadType: cell.roadOverlay, roadRotation: cell.roadRotation, origCol: col, origRow: row });
          setPickupMessage("Road picked up! Tap a tile to shift it, or remove it.");
          newGrid[row][col].roadOverlay = null;
          newGrid[row][col].roadRotation = 0;
        } else if (cell.grassOverlay) {
          setMoveClipboard({ type: "grass", origCol: col, origRow: row });
          setPickupMessage("Decoration picked up! Tap a tile to shift it, or remove it.");
          newGrid[row][col].grassOverlay = false;
        } else {
          // Tapping elsewhere while holding cancels the picked item
          setMoveClipboard(null);
          setPickupMessage(null);
        }
      }
      return newGrid;
    });
  }, []);

  // Cancel the long-press progress timer (on release / pan start)
  const cancelPressTimer = useCallback(() => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressProgress(0);
    setPressTarget(null);
  }, []);
  cancelPressTimerRef.current = cancelPressTimer;

  // Start the long-press progress timer: fills 0-100% over 5s then picks up the item
  const startPressTimer = useCallback((col: number, row: number, item: boolean) => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
    }
    setPressProgress(0);
    setPressTarget({ col, row });
    setIsItemPress(item);
    let elapsed = 0;
    const TOTAL = 5000;
    const STEP = 50;
    pressTimerRef.current = setInterval(() => {
      elapsed += STEP;
      const pct = Math.min(100, (elapsed / TOTAL) * 100);
      setPressProgress(pct);
      if (elapsed >= TOTAL) {
        if (pressTimerRef.current) clearInterval(pressTimerRef.current);
        pressTimerRef.current = null;
        setPressProgress(0);
        setPressTarget(null);
        runOnJS(handleRemoveBuilding)(col, row);
        runOnJS(cancelPressTimer)();
      }
    }, STEP);
  }, [handleRemoveBuilding, cancelPressTimer]);

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
              setPickupMessage(null);
              return newGrid;
            }
            const current = newGrid[row][col].tile;
            const typeIndex = TILE_TYPES.indexOf(current as TileType);
            const nextType = TILE_TYPES[(typeIndex + 1) % TILE_TYPES.length];
            // Tile cycle costs 100 coins only when actually changing the tile (not when cycling back to same)
            if (nextType !== current) {
              if (coins < ITEM_COST) flashLowCoins();
              setCoins((c) => Math.max(0, c - ITEM_COST));
            }
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
              setPickupMessage(null);
              return newGrid;
            }
            newGrid[row][col].grassOverlay = !newGrid[row][col].grassOverlay;
            if (newGrid[row][col].grassOverlay) {
              if (coins < ITEM_COST) flashLowCoins();
              setCoins((c) => Math.max(0, c - ITEM_COST));
            }
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
              if (coins < ITEM_COST) flashLowCoins();
              setCoins((c) => Math.max(0, c - ITEM_COST));
            }
          } else if (mode === "tiles") {
            // Tiles mode: apply the selected tile texture to this tile
            const textureToPlace = selectedTileType;
            if (newGrid[row][col].tile === "grass" || newGrid[row][col].tile === "dirt") {
              // Tile texture costs 100 coins only when actually changing the texture
              if (newGrid[row][col].tileTexture !== textureToPlace) {
                if (coins < ITEM_COST) flashLowCoins();
                setCoins((c) => Math.max(0, c - ITEM_COST));
              }
              newGrid[row][col].tileTexture = textureToPlace;
            }
          } else if (mode === "community" || mode === "temple" || mode === "decoration" || mode === "house_small" || mode === "house_big" || mode === "town_market" || mode === "tree") {
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
              setPickupMessage(null);
              return newGrid;
            }
            const currentTile = newGrid[row][col].tile;
            const currentBuilding = newGrid[row][col].building;
            if (currentTile === "grass" || currentTile === "dirt") {
              // Clear road overlay if placing a building on top
              newGrid[row][col].roadOverlay = null;
              let placedNewBuilding = false;
              if (mode === "community") {
                // Community building mode: use selectedCommunityType (the user's chosen community building)
                const buildingToPlace = selectedCommunityType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  placedNewBuilding = true;
                }
              } else if (mode === "town_market") {
                if (currentBuilding === "town_market") {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = "town_market";
                  placedNewBuilding = true;
                }
              } else if (mode === "temple") {
                // Temple mode: place the user's selected temple type
                const buildingToPlace = selectedTempleType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  placedNewBuilding = true;
                }
              } else if (mode === "decoration") {
                // Decoration mode: place the user's selected decoration type
                const buildingToPlace = selectedDecorationType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  placedNewBuilding = true;
                }
              } else if (mode === "tree") {
                // Tree mode: place the user's selected tree type
                if (currentBuilding === selectedTreeType) {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = selectedTreeType;
                  placedNewBuilding = true;
                }
              } else {
                // house_small or house_big mode: use selectedHouseType (the user's chosen house)
                const buildingToPlace = selectedHouseType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  placedNewBuilding = true;
                }
              }
              // Placing a NEW item costs 100 coins; removing/toggling off is free
              if (placedNewBuilding) {
                if (coins < ITEM_COST) flashLowCoins();
                setCoins((c) => Math.max(0, c - ITEM_COST));
              }
            }
          }
        }
        return newGrid;
      });
      // Daily tasks: refresh progress against the new grid (after placement)
      advanceDailyTasks();
    },
    [mode, selectedTreeType, selectedHouseType, selectedCommunityType, selectedRoadType, selectedTileType, selectedTempleType, selectedDecorationType, moveClipboard]
  );

  // Daily tasks: count placed items and complete tasks (award TASK_REWARD_COINS per completed task)
  const advanceDailyTasks = useCallback(() => {
    setGrid((g) => {
      setDailyTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.done) return t;
          const placed = countCategoryItems(g, t.category);
          return {
            ...t,
            progress: Math.min(placed, t.required),
            done: placed >= t.required,
          };
        });
        AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(updated)).catch(() => {});
        // Flash banner when a task becomes complete (reward must be claimed via the Claim button)
        const newlyDone = updated.filter((t, i) => t.done && !prev[i].done);
        if (newlyDone.length > 0) {
          setTaskRewardMessage(`Task Complete! Tap "Claim Reward" to get your 🪙`);
          setShowTaskReward(true);
          setTimeout(() => setShowTaskReward(false), 3500);
        }
        return updated;
      });
      return g; // no grid change, just trigger task refresh
    });
  }, []);

  const [taskRewardMessage, setTaskRewardMessage] = useState("");

  // Claim reward for a completed task (user taps the Claim Reward button)
  const claimTaskReward = useCallback((taskId: number) => {
    setDailyTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === taskId);
      if (idx < 0 || !prev[idx].done || prev[idx].claimed) return prev;
      const updated = prev.map((t) => (t.id === taskId ? { ...t, claimed: true } : t));
      AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(updated)).catch(() => {});
      setCoins((c) => c + TASK_REWARD_COINS);
      setTaskRewardMessage(`Claimed +${TASK_REWARD_COINS} 🪙`);
      setShowTaskReward(true);
      setTimeout(() => setShowTaskReward(false), 3500);
      return updated;
    });
  }, []);

  // Render ALL tiles (including grass tiles with individual PNG)
  const tiles = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.tile === "none") continue;
        const isPressed = pressTarget !== null && pressTarget.col === col && pressTarget.row === row;
        elements.push(
          <SquareTile
            key={`tile-${row}-${col}`}
            col={col} row={row} cell={cell} scale={currentScale}
            onPress={() => handleTilePress(col, row)}
            onLongPress={() => handleRemoveBuilding(col, row)}
            onDelayStart={() => startPressTimer(col, row, true)}
            onDelayEnd={() => cancelPressTimer()}
            isPressed={isPressed}
            progress={isPressed ? pressProgress : 0}
          />
        );
      }
    }
    return elements;
  }, [grid, currentScale, handleTilePress, handleRemoveBuilding, pressTarget, pressProgress, startPressTimer, cancelPressTimer]);

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
            onPress={() => handleTilePress(col, row)} onLongPress={() => handleRemoveBuilding(col, row)}
            onPressIn={() => startPressTimer(col, row, false)}
            onPressOut={() => cancelPressTimer()} />
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

      {/* Clipboard Indicator Bar (shown when an item is picked up via long press) */}
      {moveClipboard && (
        <View style={styles.clipboardBar}>
          <View style={styles.clipboardPreview}>
            {moveClipboard.type === "building" && moveClipboard.buildingType ? (
              <Image
                source={COMMUNITY_SOURCES[moveClipboard.buildingType] || TEMPLE_SOURCES[moveClipboard.buildingType] || DECORATION_SOURCES[moveClipboard.buildingType] || HOUSE_SOURCES[moveClipboard.buildingType] || TREE_SOURCES[moveClipboard.buildingType] || TOWN_HALL_PNG}
                style={styles.clipboardPreviewImage}
                contentFit="contain"
                cachePolicy="memory"
              />
            ) : moveClipboard.type === "road" ? (
              <Image
                source={ROAD_SOURCES[moveClipboard.roadType || ""] || ROAD_STRAIGHT_PNG}
                style={styles.clipboardPreviewImage}
                contentFit="contain"
                cachePolicy="memory"
              />
            ) : (
              <Text style={styles.clipboardPreviewEmoji}>🌿</Text>
            )}
          </View>
          <View style={styles.clipboardInfo}>
            <Text style={styles.clipboardText}>
              {moveClipboard.type === "road" ? "Road picked up!" : moveClipboard.type === "grass" ? "Decoration picked up!" : "Item picked up!"}
            </Text>
            <Text style={styles.clipboardSubtext}>
              Tap a grass tile to shift it • 🗑️ to remove
            </Text>
          </View>
          <TouchableOpacity
            style={styles.clipboardRemoveBtn}
            onPress={() => {
              setMoveClipboard(null);
              setPickupMessage(null);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.clipboardRemoveBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Low coins warning (briefly flashes when an item is placed with 0 balance) */}
      {showLowCoinsMsg && (
        <View style={styles.lowCoinsMsg}>
          <Text style={styles.lowCoinsMsgText}>🪙 Not enough coins! (Each item costs 100 🪙)</Text>
        </View>
      )}

      {/* Daily Reward banner: granted once per day */}
      {showDailyReward && (
        <View style={styles.dailyRewardMsg}>
          <Text style={styles.dailyRewardMsgText}>
            {streakLevel > 1 ? `🔥 Streak ${streakLevel}! ` : "🎁 "}Daily Reward! +{dailyRewardAmount} 🪙
          </Text>
        </View>
      )}

      {/* Daily Tasks panel (shown when Tasks button is tapped) */}
      {showTasks && (
        <View style={styles.profilePanel}>
          <View style={styles.itemsPanelHeader}>
            <Text style={styles.itemsPanelTitle}>📋 Daily Tasks</Text>
            <TouchableOpacity onPress={() => setShowTasks(false)} style={styles.itemsPanelClose} activeOpacity={0.7}>
              <Text style={styles.itemsPanelCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tasksSubtitle}>Complete tasks to earn +{TASK_REWARD_COINS} 🪙 each. Refreshes tomorrow!</Text>
          {dailyTasks.map((t, i) => {
            const ratio = Math.min(t.progress / Math.max(t.required, 1), 1);
            const catEmoji = t.category === "houses" ? "🏠" : t.category === "trees" ? "🌳" : t.category === "temples" ? "🛕" : t.category === "community" ? "🏛️" : t.category === "decorations" ? "🌸" : "🛣️";
            return (
              <View key={i} style={styles.taskCard}>
                <View style={styles.taskRow}>
                  <Text style={styles.taskLabel}>{catEmoji} Place {t.required} {t.label}{t.required > 1 ? "s" : ""}</Text>
                  <Text style={t.done ? styles.taskDoneText : styles.taskCountText}>
                    {t.done ? "✅ Done!" : `${t.progress}/${t.required}`}
                  </Text>
                </View>
                <View style={styles.taskBarBg}>
                  <View style={[styles.taskBarFill, { width: `${ratio * 100}%` }]} />
                </View>
                <View style={styles.taskRewardRow}>
                  <Text style={styles.taskRewardText}>
                    {t.done ? (t.claimed ? "✅ Reward Claimed" : `Reward ready: +${TASK_REWARD_COINS} 🪙`) : `Reward: +${TASK_REWARD_COINS} 🪙`}
                  </Text>
                  {t.done && !t.claimed ? (
                    <TouchableOpacity
                      onPress={() => claimTaskReward(t.id)}
                      style={styles.taskClaimBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.taskClaimBtnText}>Claim Reward 🪙</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
          <Text style={styles.tasksHint}>💡 Tip: Place the required items on the map and progress updates automatically!</Text>
        </View>
      )}

      {/* Task reward banner: brief flash when a task is completed */}
      {showTaskReward && (
        <View style={styles.taskRewardMsg}>
          <Text style={styles.taskRewardMsgText}>🏆 {taskRewardMessage}</Text>
        </View>
      )}

      {/* Profile Screen (shown when Profile button is tapped) */}
      {showProfile && (
        <View style={styles.profilePanel}>
          <View style={styles.itemsPanelHeader}>
            <Text style={styles.itemsPanelTitle}>🧑 Profile</Text>
            <TouchableOpacity onPress={() => setShowProfile(false)} style={styles.itemsPanelClose} activeOpacity={0.7}>
              <Text style={styles.itemsPanelCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          {/* Coin balance */}
          <View style={styles.profileCoinRow}>
            <View style={styles.profileCoinBadge}>
              <Text style={styles.profileCoinEmoji}>🪙</Text>
              <Text style={styles.profileCoinValue}>{coins.toLocaleString()}</Text>
            </View>
          </View>
          {/* Editable profile name */}
          <TextInput
            style={styles.profileNameInput}
            value={profileName}
            onChangeText={(t) => setProfileName(t.trim().slice(0, 20))}
            placeholder="Farmer"
            placeholderTextColor="rgba(255,255,255,0.4)"
            maxLength={20}
          />
          {/* Items summary */}
          <View style={styles.profileStatsGrid}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{itemStats.houses}</Text>
              <Text style={styles.profileStatLabel}>🏠 Houses</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{itemStats.trees}</Text>
              <Text style={styles.profileStatLabel}>🌳 Trees</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{itemStats.temples}</Text>
              <Text style={styles.profileStatLabel}>🛕 Temples</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{itemStats.communities}</Text>
              <Text style={styles.profileStatLabel}>🏛️ Community</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{itemStats.decorations}</Text>
              <Text style={styles.profileStatLabel}>🌸 Decor</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{itemStats.roads}</Text>
              <Text style={styles.profileStatLabel}>🛣️ Roads</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{itemStats.grassPlants}</Text>
              <Text style={styles.profileStatLabel}>🌿 Grass</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{itemStats.totalItems}</Text>
              <Text style={styles.profileStatLabel}>📦 Total</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{streakLevel > 0 ? `🔥${streakLevel}` : "-"}</Text>
              <Text style={styles.profileStatLabel}>Streak</Text>
            </View>
          </View>
          <View style={styles.profileFooter}>
            <Text style={styles.profileFooterText}>
              🎁 Next daily reward: {streakLevel >= 7 ? 70 : streakLevel >= 3 ? 60 : 50} 🪙 (Streak 7+ = 70 🪙)
            </Text>
          </View>
          <View style={styles.profileFooter}>
            <Text style={styles.profileFooterText}>
              💰 Items invested: {itemStats.totalItems} × 100 = 🪙 {itemStats.totalItems * ITEM_COST}
            </Text>
          </View>
        </View>
      )}

      {/* Items Popup Panel (shown when Items menu is open) */}
      {showItemsMenu && (
        <View style={styles.itemsPanel}>
          <View style={styles.itemsPanelHeader}>
            <Text style={styles.itemsPanelTitle}>Items</Text>
            <TouchableOpacity onPress={() => setShowItemsMenu(false)} style={styles.itemsPanelClose} activeOpacity={0.7}>
              <Text style={styles.itemsPanelCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.itemsGrid}>
            {MODES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.itemsGridButton, mode === m && styles.modeButtonActive]}
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
                  if (m === "decoration") {
                    setShowDecorationSelector(!showDecorationSelector);
                  } else {
                    setShowDecorationSelector(false);
                  }
                  setMode(m);
                  setShowItemsMenu(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeIcon, mode === m && styles.modeIconActive]}>
                  {MODE_LABELS[m]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Placement Mode Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.modeButton, showItemsMenu && styles.modeButtonActive, { width: 56 }]}
          onPress={() => setShowItemsMenu(!showItemsMenu)}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeIcon, showItemsMenu && styles.modeIconActive]}>🔧</Text>
        </TouchableOpacity>
        {/* Profile button with coin balance */}
        <TouchableOpacity
          style={[styles.profileButton, showProfile && styles.profileButtonActive]}
          onPress={() => { setShowProfile(!showProfile); setShowTasks(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.profileButtonIcon, showProfile && styles.profileButtonIconActive]}>🧑</Text>
          <Text style={styles.profileCoinText}>🪙 {coins.toLocaleString()}</Text>
        </TouchableOpacity>
        {/* Daily Tasks button */}
        <TouchableOpacity
          style={[styles.profileButton, showTasks && styles.profileButtonActive]}
          onPress={() => { setShowTasks(!showTasks); setShowProfile(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.profileButtonIcon, showTasks && styles.profileButtonIconActive]}>📋</Text>
          <Text style={styles.profileCoinText}>Tasks</Text>
        </TouchableOpacity>
        {MODES.includes(mode) && (
          <View style={[styles.modeButton, styles.modeButtonActive, { width: 70, justifyContent: "center" }]}>
            <Text style={[styles.modeIcon, styles.modeIconActive, { fontSize: 16 }]}>
              {MODE_LABELS[mode]}
            </Text>
          </View>
        )}
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

      {/* Decoration Sub-Selector (shown when decoration mode is active) */}
      {mode === "decoration" && (
        <View style={[styles.treeSelectorWrapper, { bottom: 140 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {DECORATION_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.treeOption, selectedDecorationType === t && styles.treeOptionActive]}
                onPress={() => {
                  setSelectedDecorationType(t);
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={DECORATION_SOURCES[t] || DECORATION_FLOWER_ARCH_PNG}
                  style={styles.treeOptionImage}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            <Text style={styles.treeSelectedText}>Tap an item to select it</Text>
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
  itemsPanel: {
    position: "absolute",
    bottom: 60,
    left: 16,
    right: 16,
    backgroundColor: "rgba(10,10,10,0.92)",
    borderRadius: 18,
    padding: 12,
    zIndex: 102,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  itemsPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  itemsPanelTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemsPanelClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  itemsPanelCloseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  itemsGridButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  clipboardBar: {
    position: "absolute",
    bottom: 120,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,30,30,0.95)",
    borderRadius: 16,
    padding: 10,
    zIndex: 103,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  clipboardPreview: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  clipboardPreviewImage: {
    width: 44,
    height: 44,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,20,20,0.75)",
    borderRadius: 16,
    paddingHorizontal: 8,
    height: 40,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.45)",
    gap: 5,
  },
  profileButtonActive: {
    backgroundColor: "rgba(76,175,80,0.55)",
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  profileButtonIcon: {
    fontSize: 17,
    lineHeight: 22,
  },
  profileButtonIconActive: {},
  profileCoinText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "bold",
    lineHeight: 18,
  },
  profilePanel: {
    position: "absolute",
    bottom: 60,
    left: 16,
    right: 16,
    backgroundColor: "rgba(10,10,10,0.94)",
    borderRadius: 18,
    padding: 14,
    zIndex: 104,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.4)",
  },
  profileCoinRow: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  profileCoinBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.15)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.5)",
    gap: 8,
  },
  profileCoinEmoji: {
    fontSize: 20,
    lineHeight: 26,
  },
  profileCoinValue: {
    color: "#FFD700",
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 28,
  },
  profileNameInput: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    textAlign: "center",
  },
  profileStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  profileStat: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 80,
  },
  profileStatValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 24,
  },
  profileStatLabel: {
    color: "#bbb",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  profileFooter: {
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  profileFooterText: {
    color: "#FFD700",
    fontSize: 12,
    lineHeight: 18,
  },
  lowCoinsMsg: {
    position: "absolute",
    bottom: 170,
    left: 16,
    right: 16,
    backgroundColor: "rgba(239,68,68,0.95)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    zIndex: 105,
  },
  lowCoinsMsgText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    lineHeight: 18,
  },
  dailyRewardMsg: {
    position: "absolute",
    bottom: 210,
    left: 16,
    right: 16,
    backgroundColor: "rgba(34,197,94,0.95)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    zIndex: 105,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  dailyRewardMsgText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 22,
  },
  tasksSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
    textAlign: "center",
  },
  taskCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    flex: 1,
    paddingRight: 6,
  },
  taskCountText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "bold",
  },
  taskDoneText: {
    color: "#4ADE80",
    fontSize: 13,
    fontWeight: "bold",
  },
  taskBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  taskBarFill: {
    height: 8,
    backgroundColor: "#4ADE80",
    borderRadius: 4,
  },
  taskRewardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  taskClaimBtn: {
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  taskClaimBtnText: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  taskRewardText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    lineHeight: 15,
  },
  tasksHint: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 6,
  },
  taskRewardMsg: {
    position: "absolute",
    bottom: 300,
    left: 16,
    right: 16,
    backgroundColor: "rgba(180,83,9,0.95)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    zIndex: 106,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  taskRewardMsgText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 22,
  },
  clipboardPreviewEmoji: {
    fontSize: 26,
  },
  clipboardInfo: {
    flex: 1,
    paddingRight: 8,
  },
  clipboardText: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "bold",
  },
  clipboardSubtext: {
    color: "#ccc",
    fontSize: 11,
    marginTop: 2,
  },
  clipboardRemoveBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(239,68,68,0.25)",
    borderWidth: 1,
    borderColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  clipboardRemoveBtnText: {
    fontSize: 20,
  },
});
