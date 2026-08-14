import { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Dimensions,
  Switch,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withRepeat,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Rect, Circle, Polygon, G } from "react-native-svg";
import { Image } from "expo-image";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

// 3 Tile texture PNGs from user's sheet
const LUSH_GRASS_TILE_PNG = require("@/assets/images/cropped_tiles/lush_grass.jpg");
const LIGHT_GRASS_TILE_PNG = require("@/assets/images/cropped_tiles/light_grass.png");
const SAND_TILE_PNG = require("@/assets/images/cropped_tiles/sand.png");
const SAND_GRASS_TILE_PNG = require("@/assets/images/tile_sand_grass.png");
const FARMLAND_TILE_PNG = require("@/assets/images/tile_farmland.png");

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

// New road PNGs from user upload (with sidewalks + corner turn)
const ROAD_WIDE_STRAIGHT_PNG = require("@/assets/images/road_straight_small.png");
const ROAD_WIDE_CORNER_PNG = require("@/assets/images/road_corner_small.png");

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
const DECORATION_WATER_WELL_PNG = require("@/assets/images/water_well.png");

// Farm building PNG sources
const FARM_SHEEP_BARN_PNG = require("@/assets/images/farm_sheep_barn.png");
const FARM_CHICKEN_COOP_PNG = require("@/assets/images/farm_chicken_coop.png");
const FARM_GOAT_FARM_PNG = require("@/assets/images/farm_goat_farm.png");
const FARM_BUFFALO_PEN_PNG = require("@/assets/images/farm_buffalo_pen.png");
const FARM_DAIRY_FARM_PNG = require("@/assets/images/farm_dairy_farm.png");
const FARM_FISH_POND_PNG = require("@/assets/images/farm_fish_pond.png");
const FARM_LLAMA_FARM_PNG = require("@/assets/images/farm_llama_farm.png");
const FARM_DUCK_POND_PNG = require("@/assets/images/farm_duck_pond.png");
const FARM_BEEHIVE_PNG = require("@/assets/images/farm_beehive.png");

// 9 Industry/Factory PNGs from user's sheet
const INDUSTRY_STEEL_PNG = require("@/assets/images/cropped_factories/steel_factory.png");
const INDUSTRY_OIL_PNG = require("@/assets/images/cropped_factories/oil_refinery.png");
const INDUSTRY_FOOD_PNG = require("@/assets/images/cropped_factories/food_factory.png");
const INDUSTRY_RECYCLING_PNG = require("@/assets/images/cropped_factories/recycling_plant.png");
const INDUSTRY_DAIRY_PNG = require("@/assets/images/cropped_factories/dairy_factory.png");
const INDUSTRY_YARN_PNG = require("@/assets/images/cropped_factories/yarn_factory.png");
const INDUSTRY_CHEMICAL_PNG = require("@/assets/images/cropped_factories/chemical_plant.png");
const INDUSTRY_WOOD_PNG = require("@/assets/images/cropped_factories/wood_factory.png");
const INDUSTRY_TECH_PNG = require("@/assets/images/cropped_factories/tech_factory.png");

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

// --- NPC Character Sprites ---
const NPC_FARMER_PNG = require("@/assets/images/npc_farmer_small.png");
const NPC_VILLAGER_MAN_PNG = require("@/assets/images/npc_villager_man_small.png");
const NPC_VILLAGER_WOMAN_PNG = require("@/assets/images/npc_villager_woman_small.png");
const NPC_CHILD_PNG = require("@/assets/images/npc_child_small.png");

// --- Animal Sprites ---
const NPC_COW_PNG = require("@/assets/images/npc_cow_small.png");
const NPC_CHICKEN_PNG = require("@/assets/images/npc_chicken_small.png");
const NPC_DOG_PNG = require("@/assets/images/npc_dog_small.png");

// --- 3D Farmer NPC Sprite ---
const FARMER_3D_PNG = require("@/assets/images/farmer_3d_npc.png");

// --- Vehicle Sprites (road-only NPCs) ---
const VEHICLE_CAR_PNG = require("@/assets/images/vehicle_car_small.png");
const VEHICLE_TRUCK_PNG = require("@/assets/images/vehicle_truck_small.png");
const VEHICLE_BUS_PNG = require("@/assets/images/vehicle_bus_small.png");

// Animal sprite sources
const ANIMAL_SOURCES: Record<string, any> = {
  cow: NPC_COW_PNG,
  chicken: NPC_CHICKEN_PNG,
  dog: NPC_DOG_PNG,
  farmer_3d: FARMER_3D_PNG,
};

// NPC sprite sources (4 different Township-style characters)
const NPC_SOURCES: Record<string, any> = {
  farmer: NPC_FARMER_PNG,
  villager_man: NPC_VILLAGER_MAN_PNG,
  villager_woman: NPC_VILLAGER_WOMAN_PNG,
  child: NPC_CHILD_PNG,
};

// NPC walking config
const NPC_COUNT = 4;
const NPC_WALK_SPEED = 1.2; // tiles per second
const NPC_IDLE_TIME = 1500; // ms to wait before picking a new destination

// Speech bubble messages for NPCs and animals
const NPC_MESSAGES: Record<string, string[]> = {
  farmer: ["Beautiful farm! 🌾", "Time to harvest! 🌾", "Nice weather today! ☀️", "Growing crops! 🥕", "Welcome to town! 👋"],
  villager_man: ["Great town! 🏘️", "Love it here! ❤️", "What a nice day! 😊", "Hello neighbor! 👋", "So peaceful! 🍃"],
  villager_woman: ["Lovely flowers! 🌸", "Pretty town! 🏡", "Feeling happy! 😄", "Nice to meet you! 👋", "What a lovely day! 🌞"],
  child: ["Yay! Fun! 🎉", "Let's play! 🎈", "I love this town! 💕", "So many trees! 🌳", "Whee! 🏃"],
};

const ANIMAL_MESSAGES: Record<string, string[]> = {
  cow: ["🐄 Moo!", "🌾 Yummy grass!", "🐄 Moooo! 🥛", "Nice field! 🌿"],
  chicken: ["🐔 Cluck!", "🥚 Egg time!", "🐔 Bawk bawk!", "🌾 Peck peck!"],
  dog: ["🐕 Woof!", "🦴 Good boy!", "🐕 Woof woof!", "🎾 Fetch!", "🐾 *wags tail*"],
};

// Speech bubble messages for the 3D farmer NPC
const FARMER_3D_MESSAGES: string[] = [
  "🚜 What a lovely farm! 🌾",
  "Crops looking great! 🌽",
  "Let's harvest together! 🌻",
  "Fresh air, fresh crops! 🌿",
  "This farm is growing nicely! 🍅",
];

// Animal walking config
const ANIMAL_COUNT = 3;
const ANIMAL_WALK_SPEED = 0.8; // animals walk slower
const ANIMAL_IDLE_TIME = 2500; // animals idle longer

// Farmer task-helper: hint messages shown above a ready crop
const FARMER_HINT_MESSAGES: string[] = [
  "Harvest karo! 🌾",
  "Ready hai! Pick it! 🍅",
  "Let's collect these! 🥕",
  "Fully grown! 🌽",
  "Harvest time! 🍓",
];
// How often (ms) the farmer re-scans for ready crops while wandering
const FARMER_HINT_SCAN_MS = 3000;
// Time (ms) the farmer stays at a ready crop showing the hint before re-scanning
const FARMER_HINT_STAY_MS = 8000;
const FARMER_ID = 100; // the farmer_3d entity is always the first spawned animal (id 100)

// NPC state interface
interface NpcState {
  id: number;
  type: "farmer" | "villager_man" | "villager_woman" | "child";
  x: number; // grid column (float)
  y: number; // grid row (float)
  targetX: number;
  targetY: number;
  idleUntil: number;
  direction: 1 | -1; // for sprite flip
}

// Animal NPC state interface
interface AnimalNpcState {
  id: number;
  type: "cow" | "chicken" | "dog" | "farmer_3d";
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  idleUntil: number;
  direction: 1 | -1;
  // Playful chase state: "chaser" runs toward chaseTarget, "chasee" darts away
  chaseRole?: "chaser" | "chasee";
  chaseTargetId?: number; // id of the other animal involved
  chaseEndsAt?: number;
  // Night sleep state: animal walks home at dusk and sleeps until morning
  sleeping?: boolean; // true while asleep at the bed spot
  bedX?: number; // grid position of the bed (nearest building)
  bedY?: number;
}

// Vehicle NPC state - only moves on placed roads
interface VehicleState {
  id: number;
  type: "car" | "truck" | "bus";
  x: number; // grid column (float)
  y: number; // grid row (float)
  targetX: number;
  targetY: number;
  rotation: number; // 0=up, 90=right, 180=down, 270=left
}

// Vehicle sprite sources
const VEHICLE_SOURCES: Record<string, any> = {
  car: VEHICLE_CAR_PNG,
  truck: VEHICLE_TRUCK_PNG,
  bus: VEHICLE_BUS_PNG,
};

// Vehicle config
const VEHICLE_COUNT = 3;
const VEHICLE_WALK_SPEED = 2.0; // faster than NPCs
const VEHICLE_IDLE_TIME = 500; // shorter idle on roads

// Get all road tiles on the map
function getRoadTiles(grid: GridCell[][]): { x: number; y: number }[] {
  const roads: { x: number; y: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].roadOverlay !== null) {
        roads.push({ x: col, y: row });
      }
    }
  }
  return roads;
}

// Get connected road neighbors (adjacent N/S/E/W tiles that are also roads)
function getConnectedRoads(grid: GridCell[][], row: number, col: number): { x: number; y: number; direction: number }[] {
  const connected: { x: number; y: number; direction: number }[] = [];
  const dirs = [
    { dx: 0, dy: -1, dir: 0 },    // up = 0
    { dx: 1, dy: 0, dir: 90 },    // right = 90
    { dx: 0, dy: 1, dir: 180 },   // down = 180
    { dx: -1, dy: 0, dir: 270 },  // left = 270
  ];
  for (const { dx, dy, dir } of dirs) {
    const nx = col + dx;
    const ny = row + dy;
    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
      if (grid[ny][nx].roadOverlay !== null) {
        connected.push({ x: nx, y: ny, direction: dir });
      }
    }
  }
  return connected;
}

// Check if a tile is walkable (grass or dirt, no building)
function isTileWalkable(grid: GridCell[][], row: number, col: number): boolean {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false;
  const cell = grid[row][col];
  // Walkable on grass and dirt tiles, not on water/rock/none, and no building
  if (cell.tile !== "grass" && cell.tile !== "dirt") return false;
  if (cell.building !== "none" && cell.building !== "tree_png") return false;
  if (cell.roadOverlay) return false;
  return true;
}

// Pick a random walkable tile near the NPC
function pickRandomWalkableTile(grid: GridCell[][], currentX: number, currentY: number): { x: number; y: number } | null {
  // Try random tiles within a radius of 3-5
  const radius = 3 + (Math.floor(Math.random() * 3));
  const candidates: { x: number; y: number }[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = Math.round(currentX) + dx;
      const ny = Math.round(currentY) + dy;
      if (isTileWalkable(grid, ny, nx)) {
        candidates.push({ x: nx, y: ny });
      }
    }
  }
  if (candidates.length === 0) return null;
  // Pick a random candidate
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// --- NPC Sprite Renderer (follows pan/zoom via gridToScreen) ---
function NpcSprite({ npc, scale, onTap }: { npc: NpcState; scale: number; onTap: (id: number, type: string, x: number, y: number) => void }) {
  const pos = gridToScreen(npc.x, npc.y, scale);
  const ts = TILE_SIZE * scale;
  const npcSize = ts * 0.7; // NPCs are smaller than buildings

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onTap(npc.id, npc.type, npc.x, npc.y)}
      style={{
        position: "absolute",
        left: pos.x - npcSize / 2,
        top: pos.y - npcSize / 2,
        width: npcSize,
        height: npcSize,
        zIndex: 15, // Above grass, below buildings
        transform: npc.direction === -1 ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <Image
        source={NPC_SOURCES[npc.type] || NPC_FARMER_PNG}
        style={{ width: npcSize, height: npcSize }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </TouchableOpacity>
  );
}

// --- NPC Delivery Sprite (animated walk-to-collect on order delivery) ---
// Walks from origin to delivery spot (1.2s), does a pickup pop (0.7s), then walks back (1.2s).
const DELIVERY_TO_MS = 1200;
const DELIVERY_PICKUP_MS = 700;
const DELIVERY_RETURN_MS = 1200;
function DeliveryNpcSprite({ delivery, scale }: { delivery: DeliveryState; scale: number }) {
  // Re-render at ~30fps while the delivery animation is active so the walk stays smooth
  const [, setTick] = useState(0);
  useEffect(() => {
    const total = DELIVERY_TO_MS + DELIVERY_PICKUP_MS + DELIVERY_RETURN_MS;
    const interval = setInterval(() => setTick((n) => n + 1), 33);
    const timeout = setTimeout(() => clearInterval(interval), total + 100);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);
  // Interpolate between origin and spot based on elapsed time within current step
  const now = Date.now();
  const elapsed = now - delivery.startedAt;
  let t: number; // progress 0..1 within current step
  let from: { x: number; y: number };
  let to: { x: number; y: number };
  let showEmoji = false;
  let emojiBounce = false;
  let facing: 1 | -1 = 1;
  if (delivery.step === "toSpot") {
    from = delivery.origin;
    to = delivery.spot;
    t = Math.min(1, Math.max(0, elapsed / DELIVERY_TO_MS));
    facing = to.x >= from.x ? 1 : -1;
  } else if (delivery.step === "pickup") {
    from = delivery.spot;
    to = delivery.spot;
    t = Math.min(1, Math.max(0, (elapsed - DELIVERY_TO_MS) / DELIVERY_PICKUP_MS));
    showEmoji = true;
    emojiBounce = t < 0.7;
  } else {
    from = delivery.spot;
    to = delivery.origin;
    t = Math.min(1, Math.max(0, (elapsed - DELIVERY_TO_MS - DELIVERY_PICKUP_MS) / DELIVERY_RETURN_MS));
    facing = to.x >= from.x ? 1 : -1;
  }
  // Smoothstep easing for natural walk feel
  const eased = t * t * (3 - 2 * t);
  const cx = from.x + (to.x - from.x) * eased;
  const cy = from.y + (to.y - from.y) * eased;
  const pos = gridToScreen(cx, cy, scale);
  const npcSize = TILE_SIZE * scale * 0.7;
  // Bobbing while walking
  const bob = delivery.step !== "pickup" ? Math.sin(t * Math.PI * 2) * 4 : 0;
  // Pickup pop: quick scale burst
  const popScale = showEmoji ? 1 + Math.sin(t * Math.PI * 2) * 0.18 : 1;
  // Thank-you bubble: fades in at the start of pickup and pops out by the end
  const thanksProgress = showEmoji ? Math.sin(t * Math.PI) : 0; // 0→1→0 over pickup
  const thanks = delivery.step === "pickup" && thanksProgress > 0.25;
  const bubbleScale = 0.8 + thanksProgress * 0.2;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: pos.x - npcSize / 2,
        top: pos.y - npcSize / 2 - 20 + bob,
        width: npcSize,
        height: npcSize + 20,
        zIndex: 25, // Above buildings so delivery walk is clearly visible
        transform: [{ scaleX: facing }],
      }}
    >
      <View style={{ width: npcSize, height: npcSize, transform: [{ scale: popScale }] }}>
        <Image source={delivery.sprite} style={{ width: npcSize, height: npcSize }} contentFit="contain" />
      </View>
      {showEmoji && (
        <View
          style={{
            position: "absolute",
            top: -14 - (emojiBounce ? 4 : 0),
            left: npcSize / 2 - 16,
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.92)",
            borderRadius: 16,
            transform: [{ scaleX: facing }],
          }}
        >
          <Text style={{ fontSize: 18, lineHeight: 24 }}>📦</Text>
        </View>
      )}
      {/* Coin float: "+{coins} 🪙" rises above the NPC during pickup and fades out */}
      {showEmoji && (
        <View
          style={{
            position: "absolute",
            top: -20 - thanksProgress * 22, // rises 22px over pickup
            left: npcSize / 2 - 28,
            width: 56,
            alignItems: "center",
            opacity: Math.max(0, 1 - thanksProgress * 1.25), // fades out as pickup ends
            transform: [{ scaleX: 1 }, { scale: 0.9 + thanksProgress * 0.15 }],
          }}
        >
          <Text
            style={{
              color: "#FFC107",
              fontSize: 13,
              fontWeight: "800",
              lineHeight: 18,
              textAlign: "center",
              textShadowColor: "rgba(0,0,0,0.25)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            +{delivery.rewardCoins} 🪙
          </Text>
        </View>
      )}

      {/* Thank-you dialogue bubble above the NPC during pickup */}
      {thanks && (
        <View
          style={{
            position: "absolute",
            top: -46,
            left: npcSize / 2 - 62,
            width: 124,
            alignItems: "center",
            opacity: Math.min(1, thanksProgress * 1.6),
            transform: [{ scaleX: 1 }, { scale: bubbleScale }],
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1.5,
              borderColor: "#FFB020",
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2,
            }}
          >
            <Text style={{ color: "#4a3520", fontSize: 10, fontWeight: "700", textAlign: "center", lineHeight: 13 }}>
              Shukriya! Achhe goods hain!
            </Text>
          </View>
          {/* Bubble tail */}
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 6,
              borderRightWidth: 6,
              borderTopWidth: 8,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: "#FFB020",
              marginTop: -1,
            }}
          />
        </View>
      )}
    </View>
  );
}

// --- Ambient Wildlife (birds + butterflies) ---
// Birds drift across the screen with a bobbing path; butterflies flutter near the middle with a zigzag drift.
// Purely ambient, non-interactive overlays that make the farm feel alive.
interface WildlifeCreature {
  id: number;
  type: "bird" | "butterfly";
  startX: number; // screen fraction 0-1 where it enters
  y: number; // screen fraction 0-1 of vertical position
  speed: number; // fraction of screen width per second (0.06-0.14)
  phase: number; // bob/zigzag offset
  dir: 1 | -1; // fly direction
  emoji: string;
  size: number; // px base size
}
let wildlifeIdCounter = 0;
function createWildlife(w: Partial<WildlifeCreature> = {}): WildlifeCreature {
  const isBird = (w.type ?? (Math.random() < 0.5 ? "bird" : "butterfly")) === "bird";
  wildlifeIdCounter += 1;
  return {
    id: wildlifeIdCounter,
    type: isBird ? "bird" : "butterfly",
    startX: isBird ? (Math.random() < 0.5 ? -0.08 : 1.08) : -0.08,
    y: isBird ? 0.08 + Math.random() * 0.3 : 0.35 + Math.random() * 0.45,
    speed: isBird ? 0.07 + Math.random() * 0.07 : 0.04 + Math.random() * 0.03,
    phase: Math.random() * Math.PI * 2,
    dir: isBird ? (Math.random() < 0.5 ? 1 : -1) : 1,
    emoji: isBird ? (Math.random() < 0.6 ? "🐦" : "🕊️") : Math.random() < 0.5 ? "🦋" : "🐝",
    size: isBird ? 26 + Math.random() * 12 : 16 + Math.random() * 6,
    ...w,
  };
}
function WildlifeOverlay({ scale, weather }: { scale: number; weather: "sunny" | "cloudy" | "rainy" }) {
  // Ambient wildlife only visible at moderate zooms (too small when zoomed out, too crowded when zoomed in)
  const [, setTick] = useState(0);
  // Weather reactivity: birds hide during rain (they take shelter); butterflies/bees love sunny
  // weather and reduce in clouds; everyone hides in heavy rain. Fades in/out smoothly.
  const visible = weather !== "rainy";
  // Sunny = full cast, cloudy = fewer butterflies/bees, birds still fly under clouds
  const activeCount = weather === "sunny" ? 5 : weather === "cloudy" ? 3 : 0;
  const [creatures] = useState<WildlifeCreature[]>(() =>
    Array.from({ length: 5 }, () => createWildlife())
  );
  const bornRef = useRef(Date.now());
  const visibleRef = useRef(visible);
  // Track when visibility last changed to drive a fade transition
  const [fadeStart, setFadeStart] = useState(() => Date.now());
  useEffect(() => {
    bornRef.current = Date.now();
    const interval = setInterval(() => setTick((n) => n + 1), 50); // 20fps ambient, not gameplay-critical
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (visibleRef.current !== visible) {
      visibleRef.current = visible;
      setFadeStart(Date.now());
    }
  }, [visible]);
  const elapsed = (Date.now() - bornRef.current) / 1000;
  const fadeElapsed = (Date.now() - fadeStart) / 1000;
  const fadeAlpha = Math.min(1, fadeElapsed / 0.8); // 0.8s fade when weather changes
  const baseOpacity = visible ? 0.9 * fadeAlpha : Math.max(0, 0.9 * (1 - fadeAlpha));
  if (baseOpacity <= 0.01) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, zIndex: 12 }}>
      {creatures.slice(0, activeCount).map((c) => {
        // Weather-reactive visibility per creature type
        if (c.type === "bird" && weather === "rainy") return null; // birds take shelter in rain
        if (c.type === "butterfly" && !visible) return null;
        // Recycle creature position for a continuous stream
        const cycleSec = 1 / c.speed;
        const t = (elapsed + c.startX / c.speed) % 1;
        const x = c.startX + t; // 0→1 across screen
        if (x < -0.12 || x > 1.12) return null;
        // Cloudy = calmer flight; birds fly lower and slower under clouds
        const bobAmp = weather === "cloudy" ? 3 : 6;
        const bob = Math.sin(elapsed * 3 + c.phase) * bobAmp; // gentle bob/zigzag
        const z = Math.sin(elapsed * 1.5 + c.phase * 0.5) * 0.06; // subtle altitude drift (scale)
        return (
          <Text
            key={c.id}
            style={{
              position: "absolute",
              left: `${x * 100}%`,
              top: `${(c.y * 100) + (bob * 0.15)}%`,
              fontSize: c.size,
              lineHeight: c.size + 8,
              opacity: baseOpacity,
              zIndex: 12,
              transform: [{ scaleX: c.dir }, { scale: 1 + z }, { rotate: `${bob * 0.8}deg` }],
            }}
          >
            {c.emoji}
          </Text>
        );
      })}
    </View>
  );
}

// --- Nighttime Ambient Wildlife (bats + fireflies) ---
// Only appears at night (isNight): bats flutter across the upper sky erratically,
// fireflies glow and bob near the lower band with pulsing light.
interface NightCreature {
  id: number;
  type: "bat" | "firefly";
  startX: number; // screen fraction 0-1
  y: number; // screen fraction 0-1
  speed: number; // fraction of screen width per second
  phase: number; // movement offset
  dir: 1 | -1;
  size: number;
}
let nightIdCounter = 0;
function createNightCreature(type: "bat" | "firefly"): NightCreature {
  nightIdCounter += 1;
  const isBat = type === "bat";
  return {
    id: nightIdCounter,
    type,
    startX: isBat ? (Math.random() < 0.5 ? -0.08 : 1.08) : Math.random(),
    y: isBat ? 0.05 + Math.random() * 0.3 : 0.5 + Math.random() * 0.4,
    speed: isBat ? 0.08 + Math.random() * 0.06 : 0.01 + Math.random() * 0.015,
    phase: Math.random() * Math.PI * 2,
    dir: isBat ? (Math.random() < 0.5 ? 1 : -1) : 1,
    size: isBat ? 22 + Math.random() * 10 : 12 + Math.random() * 6,
  };
}
function NightlifeOverlay({ isNight }: { isNight: boolean }) {
  const [, setTick] = useState(0);
  const [creatures] = useState<NightCreature[]>(() => [
    createNightCreature("bat"),
    createNightCreature("bat"),
    createNightCreature("bat"),
    createNightCreature("firefly"),
    createNightCreature("firefly"),
    createNightCreature("firefly"),
    createNightCreature("firefly"),
  ]);
  const bornRef = useRef(Date.now());
  const nightRef = useRef(isNight);
  const [fadeStart, setFadeStart] = useState(() => (isNight ? Date.now() - 1000 : Date.now()));
  useEffect(() => {
    bornRef.current = Date.now();
    const interval = setInterval(() => setTick((n) => n + 1), 50);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (nightRef.current !== isNight) {
      nightRef.current = isNight;
      setFadeStart(Date.now());
      bornRef.current = Date.now();
    }
  }, [isNight]);
  const elapsed = (Date.now() - bornRef.current) / 1000;
  const fadeElapsed = (Date.now() - fadeStart) / 1000;
  const fadeAlpha = Math.min(1, fadeElapsed / 1.2); // gentle 1.2s fade for night transitions
  const baseOpacity = isNight ? fadeAlpha : Math.max(0, 1 - fadeAlpha);
  if (baseOpacity <= 0.01) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, zIndex: 13 }}>
      {creatures.map((c) => {
        const cycleSec = 1 / c.speed;
        // Bats drift across; fireflies linger and loop within the band
        const t = c.type === "bat" ? (elapsed + c.startX / c.speed) % 1 : ((elapsed * c.speed) + c.startX) % 1;
        const x = c.type === "bat" ? c.startX + t * (c.dir === 1 ? 1 : -1) : c.startX + (Math.sin(elapsed * c.speed * 6 + c.phase) * 0.08);
        if (c.type === "bat" && (x < -0.12 || x > 1.12)) return null;
        // Bats: erratic flutter; fireflies: soft bob
        const bob = Math.sin(elapsed * 4 + c.phase) * (c.type === "bat" ? 8 : 4);
        const flap = c.type === "bat" ? Math.abs(Math.sin(elapsed * 8 + c.phase)) * 0.35 : 0;
        const glow = c.type === "firefly" ? 0.55 + Math.sin(elapsed * 2.2 + c.phase) * 0.45 : 0;
        const opacity = c.type === "firefly" ? glow * baseOpacity * 0.95 : 0.85 * baseOpacity;
        return (
          <Text
            key={c.id}
            style={{
              position: "absolute",
              left: `${x * 100}%`,
              top: `${(c.y * 100) + (bob * 0.15)}%`,
              fontSize: c.size,
              lineHeight: c.size + 6,
              opacity,
              zIndex: 13,
              transform: [{ scaleX: c.type === "bat" ? c.dir : 1 }, { scale: c.type === "firefly" ? 1 + Math.sin(elapsed * 2.2 + c.phase) * 0.15 : 1 - flap }, { rotate: `${bob * (c.type === "bat" ? 1.2 : 0.5)}deg` }],
            }}
          >
            {c.type === "bat" ? "🦇" : "✨"}
          </Text>
        );
      })}
    </View>
  );
}

// --- Vehicle Sprite Renderer (road-only NPCs) ---
function VehicleSprite({ vehicle, scale }: { vehicle: VehicleState; scale: number }) {
  const pos = gridToScreen(vehicle.x, vehicle.y, scale);
  const ts = TILE_SIZE * scale;
  const vehicleSize = ts * 0.65; // vehicles are slightly smaller than NPCs

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: pos.x - vehicleSize / 2,
        top: pos.y - vehicleSize / 2,
        width: vehicleSize,
        height: vehicleSize,
        zIndex: 16, // Above NPCs and animals
        transform: [{ rotate: `${vehicle.rotation}deg` }],
      }}
    >
      <Image
        source={VEHICLE_SOURCES[vehicle.type] || VEHICLE_CAR_PNG}
        style={{ width: vehicleSize, height: vehicleSize }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- Animal Sprite Renderer ---
function AnimalSprite({ animal, scale, onTap }: { animal: AnimalNpcState; scale: number; onTap: (id: number, type: string, x: number, y: number) => void }) {
  const pos = gridToScreen(animal.x, animal.y, scale);
  const ts = TILE_SIZE * scale;
  // The 3D farmer is human-sized; other animals are smaller
  const isFarmer = animal.type === "farmer_3d";
  const animalSize = isFarmer ? ts * 1.05 : ts * 0.55;
  const spriteHeight = isFarmer ? animalSize * 1.25 : animalSize;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onTap(animal.id, animal.type, animal.x, animal.y)}
      style={{
        position: "absolute",
        left: pos.x - animalSize / 2,
        top: pos.y - spriteHeight / 2,
        width: animalSize,
        height: spriteHeight,
        zIndex: 14, // Slightly below human NPCs
        transform: animal.direction === -1 ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <Image
        source={ANIMAL_SOURCES[animal.type] || NPC_COW_PNG}
        style={{
          width: animalSize,
          height: spriteHeight,
          transform: animal.sleeping && !isFarmer ? [{ scaleY: 0.62 }, { translateY: animalSize * 0.28 }] : undefined,
        }}
        contentFit="contain"
        cachePolicy="memory"
      />
      {animal.sleeping && !isFarmer && <SleepZzz animalSize={animalSize} />}
    </TouchableOpacity>
  );
}

// Small floating "Zzz" above a sleeping animal — rises, fades, and loops
function SleepZzz({ animalSize }: { animalSize: number }) {
  const [, setTick] = useState(0);
  const bornRef = useRef(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 60);
    return () => clearInterval(interval);
  }, []);
  const t = ((Date.now() - bornRef.current) % 2400) / 2400; // 2.4s loop
  const yRise = t * 26; // rises 26px
  const opacity = t < 0.25 ? t / 0.25 : t > 0.8 ? (1 - t) / 0.2 : 1;
  const scale = 0.7 + t * 0.5; // grows slightly as it rises
  return (
    <Text
      style={{
        position: "absolute",
        left: animalSize * 0.3,
        top: -yRise - 4,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "700",
        color: "#e8eef7",
        opacity,
        zIndex: 15,
        transform: [{ scale }],
      }}
    >
      Z
    </Text>
  );
}

// --- Constants ---
// Flat top-down square tiles (1:1 aspect ratio) - Township style
const TILE_SIZE = 90;
const GRID_SIZE = 25;
const SETTINGS_KEY = "iso-settings-v1";
const WATER_BG = "#1a2a3a";
const DEFAULT_SCALE = 1.0;
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 1.5;
// Currency system
const STARTING_COINS = 1000;
const ITEM_COST = 100;
const SELL_REFUND = 50;
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
const TILE_TEXTURE_TYPES = ["lush_grass", "light_grass", "sand", "sand_grass", "farmland"] as const;
type TileTextureType = (typeof TILE_TEXTURE_TYPES)[number];

// Tile texture PNG sources
const TILE_TEXTURE_SOURCES: Record<string, any> = {
  lush_grass: LUSH_GRASS_TILE_PNG,
  light_grass: LIGHT_GRASS_TILE_PNG,
  sand: SAND_TILE_PNG,
  sand_grass: SAND_GRASS_TILE_PNG,
  farmland: FARMLAND_TILE_PNG,
};

// Crop types (emoji-based crops that can be placed on farmland tiles)
const CROP_TYPES = [
  "crop_tomato", "crop_eggplant", "crop_potato",
  "crop_wheat", "crop_strawberry", "crop_cucumber",
  "crop_carrot", "crop_corn", "crop_watermelon",
  "crop_chili", "crop_broccoli", "crop_peanut",
  "crop_garlic", "crop_mushroom"
] as const;
type CropType = (typeof CROP_TYPES)[number];

// Crop emoji display
const CROP_EMOJIS: Record<string, string> = {
  crop_tomato: "🍅",
  crop_eggplant: "🍆",
  crop_potato: "🥔",
  crop_wheat: "🌾",
  crop_strawberry: "🍓",
  crop_cucumber: "🥒",
  crop_carrot: "🥕",
  crop_corn: "🌽",
  crop_watermelon: "🍉",
  crop_chili: "🌶️",
  crop_broccoli: "🥦",
  crop_peanut: "🥜",
  crop_garlic: "🧄",
  crop_mushroom: "🍄‍",
};

// Growth times per crop type (in milliseconds)
const CROP_GROWTH_TIMES: Record<CropType, number> = {
  crop_carrot: 30000,      // 30 seconds
  crop_potato: 35000,      // 35 seconds
  crop_garlic: 40000,      // 40 seconds
  crop_wheat: 45000,       // 45 seconds
  crop_corn: 45000,        // 45 seconds
  crop_peanut: 45000,      // 45 seconds
  crop_tomato: 50000,      // 50 seconds
  crop_eggplant: 50000,    // 50 seconds
  crop_cucumber: 50000,    // 50 seconds
  crop_strawberry: 55000,  // 55 seconds
  crop_chili: 55000,       // 55 seconds
  crop_mushroom: 60000,    // 60 seconds
  crop_broccoli: 70000,    // 70 seconds
  crop_watermelon: 90000,  // 90 seconds
};

// Get growth time for a crop type (default 50s)
function getCropGrowthTime(cropType: CropType): number {
  return CROP_GROWTH_TIMES[cropType] || 50000;
}

// Sell prices per crop type (coins per vegetable)
const CROP_SELL_PRICES: Record<CropType, number> = {
  crop_carrot: 5,        // Fast, cheap
  crop_potato: 7,        // Fast, cheap
  crop_garlic: 8,        // Medium-fast
  crop_wheat: 8,         // Medium
  crop_corn: 9,          // Medium
  crop_peanut: 9,        // Medium
  crop_tomato: 10,       // Standard
  crop_eggplant: 10,     // Standard
  crop_cucumber: 10,     // Standard
  crop_strawberry: 12,   // Slightly rare
  crop_chili: 12,        // Slightly rare
  crop_mushroom: 14,     // Rare
  crop_broccoli: 18,     // Slow, valuable
  crop_watermelon: 25,   // Very slow, most valuable
};

// Get sell price for a crop type (default 10)
function getCropSellPrice(cropType: CropType): number {
  return CROP_SELL_PRICES[cropType] || 10;
}

// ---------- Orders Board (NPC customer orders) ----------
type OrderGoods = { label: string; emoji: string; baseValue: number };
// Pool of goods NPCs can request: crops (harvested vegetables) + farm products.
// baseValue is the coins a single unit is worth when sold by NPC (premium over sell price).
const ORDER_GOODS: OrderGoods[] = [
  { label: "🍅 Tomato", emoji: "🍅", baseValue: 12 },
  { label: "🥕 Carrot", emoji: "🥕", baseValue: 8 },
  { label: "🥔 Potato", emoji: "🥔", baseValue: 9 },
  { label: "🌾 Wheat", emoji: "🌾", baseValue: 10 },
  { label: "🌽 Corn", emoji: "🌽", baseValue: 11 },
  { label: "🍓 Strawberry", emoji: "🍓", baseValue: 15 },
  { label: "🥒 Cucumber", emoji: "🥒", baseValue: 12 },
  { label: "🌶️ Chili", emoji: "🌶️", baseValue: 15 },
  { label: "🥦 Broccoli", emoji: "🥦", baseValue: 20 },
  { label: "🍉 Watermelon", emoji: "🍉", baseValue: 30 },
  { label: "🧄 Garlic", emoji: "🧄", baseValue: 10 },
  { label: "🍄 Mushroom", emoji: "🍄‍🟫", baseValue: 17 },
  { label: "🥚 Eggs", emoji: "🥚", baseValue: 14 },
  { label: "🐑 Wool", emoji: "🐑", baseValue: 18 },
  { label: "🥛 Milk", emoji: "🥛", baseValue: 24 },
  { label: "🧀 Cheese", emoji: "🧀", baseValue: 30 },
  { label: "🐟 Fish", emoji: "🐟", baseValue: 18 },
  { label: "🍯 Honey", emoji: "🍯", baseValue: 22 },
];
// Map order label keys to backpack keys
function orderLabelToBackpackKey(label: string): string {
  // Order labels are "🍅 Tomato" → backpack key "Tomato"; crops are stored as crop type
  // strings like "crop_tomato" while farm goods use their collectLabel (e.g. "Wool").
  const words = label.trim().split(" ");
  return words.slice(1).join(" ");
}
type OrderNpc = { npcType: string; sprite: any; name: string; title: string };
function getOrderNpcs(): OrderNpc[] {
  // Lazy accessor so NPC sprite constants (defined later in the file) are initialized.
  return [
    { npcType: "market", sprite: NPC_FARMER_BIG_PNG, name: "Farmer Balram", title: "Market Vendor" },
    { npcType: "hospital", sprite: NPC_DOCTOR_PNG, name: "Dr. Sharma", title: "Doctor" },
    { npcType: "train_station", sprite: NPC_CHEF_PNG, name: "Chef Ravi", title: "Chef" },
    { npcType: "school", sprite: NPC_TEACHER_PNG, name: "Teacher Neha", title: "Teacher" },
    { npcType: "library", sprite: NPC_SHOPKEEPER_PNG, name: "Bookshop Aanya", title: "Shopkeeper" },
    { npcType: "park", sprite: NPC_VET_PNG, name: "Vet Sonali", title: "Vet" },
    { npcType: "town_hall", sprite: NPC_MAYOR_PNG, name: "Mayor", title: "Mayor" },
    { npcType: "police_station", sprite: NPC_POLICEWOMAN_PNG, name: "Officer Priya", title: "Officer" },
    { npcType: "fire_station", sprite: NPC_BUILDER_PNG, name: "Engineer Rohit", title: "Engineer" },
  ];
}
interface OrderBoardItem {
  id: number;
  npcIndex: number;
  goodsLabel: string; // key in ORDER_GOODS
  quantity: number;
  rewardCoins: number;
  claimed: boolean;
}
// Delivery animation: NPC walks from their building (origin) to a nearby delivery spot, does a pickup pop, and walks back.
type DeliveryStep = "toSpot" | "pickup" | "returning";
interface DeliveryState {
  sprite: any; // NPC sprite PNG source
  emoji: string;
  origin: { x: number; y: number };
  spot: { x: number; y: number };
  step: DeliveryStep;
  startedAt: number;
  rewardCoins: number; // coins granted by this delivery (for the float animation)
  goodsLabel: string; // requested goods label (e.g. "Eggs")
}
// Deterministic daily shuffle (no loops over retries)
function orderShuffle<T>(arr: T[], salt: string): T[] {
  const indices = Array.from({ length: arr.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = simpleHash(salt + ":" + i) % (i + 1);
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  return indices.map((idx) => arr[idx]);
}
const ORDERS_KEY = "orders_v1";
const ORDERS_DATE_KEY = "orders_date";
function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function generateDailyOrders(claimState: Record<string, boolean> = {}): OrderBoardItem[] {
  // Claim states persist across days for previously generated orders; new day regenerates.
  const today = getTodayStr();
  const orders: OrderBoardItem[] = [];
  const shuffledNpcs = orderShuffle(getOrderNpcs(), today + ":npc");
  const shuffledGoods = orderShuffle(ORDER_GOODS, today + ":goods");
  const count = Math.min(3, ORDER_GOODS.length);
  for (let i = 0; i < count; i += 1) {
    const goods = shuffledGoods[i];
    const qty = 1 + (simpleHash(today + ":qty" + i) % 3); // 1-3 units
    orders.push({
      id: i,
      npcIndex: getOrderNpcs().indexOf(shuffledNpcs[i] as OrderNpc),
      goodsLabel: goods.label,
      quantity: qty,
      rewardCoins: qty * goods.baseValue + 25, // premium reward above sell value
      claimed: claimState[`${i}`] === true,
    });
  }
  return orders;
}

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
  // 10 decoration types
  "flower_arch", "fountain", "bench", "topiary", "gazebo",
  "flower_pot", "swing", "waterfall_pond", "flower_bed", "water_well",
  // 9 industry/factory types
  "steel_factory", "oil_refinery", "food_factory",
  "recycling_plant", "dairy_factory", "yarn_factory",
  "chemical_plant", "wood_factory", "tech_factory",
  // 14 emoji crop types (placed on farmland)
  "crop_tomato", "crop_eggplant", "crop_potato",
  "crop_wheat", "crop_strawberry", "crop_cucumber",
  "crop_carrot", "crop_corn", "crop_watermelon",
  "crop_chili", "crop_broccoli", "crop_peanut",
  "crop_garlic", "crop_mushroom",
  // 9 farm building types
  "farm_sheep_barn", "farm_chicken_coop", "farm_goat_farm",
  "farm_buffalo_pen", "farm_dairy_farm", "farm_fish_pond",
  "farm_llama_farm", "farm_duck_pond", "farm_beehive",
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
  "flower_pot", "swing", "waterfall_pond", "flower_bed", "water_well",
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
  water_well: DECORATION_WATER_WELL_PNG,
};

// Industry/Factory types for selection (9 factories)
const INDUSTRY_TYPES = [
  "steel_factory", "oil_refinery", "food_factory",
  "recycling_plant", "dairy_factory", "yarn_factory",
  "chemical_plant", "wood_factory", "tech_factory",
] as const;
type IndustryType = (typeof INDUSTRY_TYPES)[number];
const INDUSTRY_TYPE_VALUES: string[] = [...INDUSTRY_TYPES];

// Farm building types for selection (9 farm buildings)
const FARM_TYPES = [
  "farm_sheep_barn", "farm_chicken_coop", "farm_goat_farm",
  "farm_buffalo_pen", "farm_dairy_farm", "farm_fish_pond",
  "farm_llama_farm", "farm_duck_pond", "farm_beehive",
] as const;
type FarmType = (typeof FARM_TYPES)[number];
const FARM_TYPE_VALUES: string[] = [...FARM_TYPES];

// Farm PNG sources
const FARM_SOURCES: Record<string, any> = {
  farm_sheep_barn: FARM_SHEEP_BARN_PNG,
  farm_chicken_coop: FARM_CHICKEN_COOP_PNG,
  farm_goat_farm: FARM_GOAT_FARM_PNG,
  farm_buffalo_pen: FARM_BUFFALO_PEN_PNG,
  farm_dairy_farm: FARM_DAIRY_FARM_PNG,
  farm_fish_pond: FARM_FISH_POND_PNG,
  farm_llama_farm: FARM_LLAMA_FARM_PNG,
  farm_duck_pond: FARM_DUCK_POND_PNG,
  farm_beehive: FARM_BEEHIVE_PNG,
};

// Farm production data (Goathed-style popup)
// Each farm building produces one or more goods over time; left/right arrows cycle products.
type FarmProduct = {
  label: string;      // e.g. "Goats"
  emoji: string;      // display emoji for the product
  goods: string;      // what's shown inside the building in the popup image area
  readyTimeMs: number; // time for one good to become ready
  rewardCoins: number; // coins earned per collected good
  collectLabel: string; // name used in backpack / banner
};
type FarmProduction = {
  title: string;       // popup title bar text
  products: FarmProduct[];
};
const FARM_PRODUCTIONS: Record<string, FarmProduction> = {
  farm_sheep_barn: { title: "SHEEP BARN", products: [
    { label: "Wool", emoji: "🐑", goods: "🐑 🐑 🐑 🐑 🐑", readyTimeMs: 30000, rewardCoins: 15, collectLabel: "Wool" },
  ] },
  farm_chicken_coop: { title: "CHICKEN COOP", products: [
    { label: "Eggs", emoji: "🥚", goods: "🐔 🐔 🥚 🥚 🐔", readyTimeMs: 20000, rewardCoins: 10, collectLabel: "Eggs" },
  ] },
  farm_goat_farm: { title: "GOATHED", products: [
    { label: "Goats", emoji: "🐐", goods: "🐐 🐐 🐐 🐐 🐐", readyTimeMs: 35000, rewardCoins: 20, collectLabel: "Goats" },
  ] },
  farm_buffalo_pen: { title: "BUFFALO PEN", products: [
    { label: "Milk", emoji: "🥛", goods: "🐃 🐃 🥛 🐃 🐃", readyTimeMs: 40000, rewardCoins: 20, collectLabel: "Milk" },
  ] },
  farm_dairy_farm: { title: "DAIRY FARM", products: [
    { label: "Cheese", emoji: "🧀", goods: "🥛 🧀 🧀 🥛 🧀", readyTimeMs: 45000, rewardCoins: 25, collectLabel: "Cheese" },
  ] },
  farm_fish_pond: { title: "FISH POND", products: [
    { label: "Fish", emoji: "🐟", goods: "🐟 🐟 🐟 🐟 🐟", readyTimeMs: 30000, rewardCoins: 15, collectLabel: "Fish" },
  ] },
  farm_llama_farm: { title: "LLAMA FARM", products: [
    { label: "Llama Wool", emoji: "🦙", goods: "🦙 🦙 🦙 🦙 🦙", readyTimeMs: 40000, rewardCoins: 20, collectLabel: "Llama Wool" },
  ] },
  farm_duck_pond: { title: "DUCK POND", products: [
    { label: "Feathers", emoji: "🪶", goods: "🦆 🦆 🪶 🦆 🦆", readyTimeMs: 30000, rewardCoins: 15, collectLabel: "Feathers" },
  ] },
  farm_beehive: { title: "BEEHIVE", products: [
    { label: "Honey", emoji: "🍯", goods: "🐝 🐝 🍯 🐝 🐝", readyTimeMs: 35000, rewardCoins: 18, collectLabel: "Honey" },
  ] },
};

// Production progress: map of "row,col" → { productIndex, readyCount, startedAt }
const FARM_PROD_KEY = "farm_production_v1";

// Industry PNG sources
const INDUSTRY_SOURCES: Record<string, any> = {
  steel_factory: INDUSTRY_STEEL_PNG,
  oil_refinery: INDUSTRY_OIL_PNG,
  food_factory: INDUSTRY_FOOD_PNG,
  recycling_plant: INDUSTRY_RECYCLING_PNG,
  dairy_factory: INDUSTRY_DAIRY_PNG,
  yarn_factory: INDUSTRY_YARN_PNG,
  chemical_plant: INDUSTRY_CHEMICAL_PNG,
  wood_factory: INDUSTRY_WOOD_PNG,
  tech_factory: INDUSTRY_TECH_PNG,
};

// Industry production data (Goathed-style popup, shared with farm production system)
// Each factory produces one or more goods over time; left/right arrows cycle products.
const INDUSTRY_PRODUCTIONS: Record<string, FarmProduction> = {
  steel_factory: { title: "STEEL FACTORY", products: [
    { label: "Steel", emoji: "\u2699\uFE0F", goods: "\u2699\uFE0F \u2699\uFE0F \u2699\uFE0F \u2699\uFE0F \u2699\uFE0F", readyTimeMs: 45000, rewardCoins: 30, collectLabel: "Steel" },
  ] },
  oil_refinery: { title: "OIL REFINERY", products: [
    { label: "Oil", emoji: "\uD83D\uDEE2\uFE0F", goods: "\uD83D\uDEE2\uFE0F \uD83D\uDEE2\uFE0F \uD83D\uDEE2\uFE0F \uD83D\uDEE2\uFE0F \uD83D\uDEE2\uFE0F", readyTimeMs: 50000, rewardCoins: 35, collectLabel: "Oil" },
  ] },
  food_factory: { title: "FOOD FACTORY", products: [
    { label: "Bread", emoji: "\uD83C\uDF5E", goods: "\uD83C\uDF5E \uD83C\uDF5E \uD83C\uDF5E \uD83C\uDF5E \uD83C\uDF5E", readyTimeMs: 30000, rewardCoins: 22, collectLabel: "Bread" },
  ] },
  recycling_plant: { title: "RECYCLING PLANT", products: [
    { label: "Recycled Goods", emoji: "\u267B\uFE0F", goods: "\u267B\uFE0F \u267B\uFE0F \u267B\uFE0F \u267B\uFE0F \u267B\uFE0F", readyTimeMs: 40000, rewardCoins: 25, collectLabel: "Recycled Goods" },
  ] },
  dairy_factory: { title: "DAIRY FACTORY", products: [
    { label: "Butter", emoji: "\uD83E\uDDC8", goods: "\uD83E\uDDC8 \uD83E\uDDC8 \uD83E\uDDC8 \uD83E\uDDC8 \uD83E\uDDC8", readyTimeMs: 35000, rewardCoins: 25, collectLabel: "Butter" },
  ] },
  yarn_factory: { title: "YARN FACTORY", products: [
    { label: "Yarn", emoji: "\uD83E\uDDF6", goods: "\uD83E\uDDF6 \uD83E\uDDF6 \uD83E\uDDF6 \uD83E\uDDF6 \uD83E\uDDF6", readyTimeMs: 35000, rewardCoins: 25, collectLabel: "Yarn" },
  ] },
  chemical_plant: { title: "CHEMICAL PLANT", products: [
    { label: "Chemicals", emoji: "\uD83E\uDDEA", goods: "\uD83E\uDDEA \uD83E\uDDEA \uD83E\uDDEA \uD83E\uDDEA \uD83E\uDDEA", readyTimeMs: 45000, rewardCoins: 30, collectLabel: "Chemicals" },
  ] },
  wood_factory: { title: "WOOD FACTORY", products: [
    { label: "Wood", emoji: "\uD83E\uDEB5", goods: "\uD83E\uDEB5 \uD83E\uDEB5 \uD83E\uDEB5 \uD83E\uDEB5 \uD83E\uDEB5", readyTimeMs: 30000, rewardCoins: 22, collectLabel: "Wood" },
  ] },
  tech_factory: { title: "TECH FACTORY", products: [
    { label: "Gadgets", emoji: "\uD83D\uDDA5\uFE0F", goods: "\uD83D\uDDA5\uFE0F \uD83D\uDDA5\uFE0F \uD83D\uDDA5\uFE0F \uD83D\uDDA5\uFE0F \uD83D\uDDA5\uFE0F", readyTimeMs: 50000, rewardCoins: 35, collectLabel: "Gadgets" },
  ] },
};

// Industry emoji labels
const INDUSTRY_EMOJIS: Record<string, string> = {
  steel_factory: "⚙️",
  oil_refinery: "🛢️",
  food_factory: "🍞",
  recycling_plant: "♻️",
  dairy_factory: "🥛",
  yarn_factory: "🧶",
  chemical_plant: "🧪",
  wood_factory: "🪵",
  tech_factory: "🖥️",
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
  water_well: "🪣",
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

// Road tile types (5 road tiles - 3 original + 2 new wide roads)
const ROAD_TYPES = ["road_straight", "road_corner", "road_intersection", "road_wide_straight", "road_wide_corner"] as const;
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

// Building chat NPC sprites (9 characters, one per community building)
const NPC_MAYOR_PNG = require("@/assets/images/npc_mayor.png");
const NPC_DOCTOR_PNG = require("@/assets/images/npc_doctor.png");
const NPC_POLICEWOMAN_PNG = require("@/assets/images/npc_policewoman.png");
const NPC_BUILDER_PNG = require("@/assets/images/npc_builder.png");
const NPC_FARMER_BIG_PNG = require("@/assets/images/npc_farmer.png");
const NPC_TEACHER_PNG = require("@/assets/images/npc_woman_farmer.png");
const NPC_SHOPKEEPER_PNG = require("@/assets/images/npc_grocery_girl.png");
const NPC_CHEF_PNG = require("@/assets/images/npc_chef.png");
const NPC_VET_PNG = require("@/assets/images/npc_vet.png");

// Typing animation: animated "..." dots that bounce sequentially
function TypingDots() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  const a1 = useAnimatedStyle(() => ({ opacity: 0.35 + (dot1.value as number) * 0.65 }));
  const a2 = useAnimatedStyle(() => ({ opacity: 0.35 + (dot2.value as number) * 0.65 }));
  const a3 = useAnimatedStyle(() => ({ opacity: 0.35 + (dot3.value as number) * 0.65 }));

  // Bounce each dot opacity between 0 and 1 repeatedly, staggered per dot
  useEffect(() => {
    const pulse = (val: SharedValue<number>, delay: number) => {
      val.value = 0;
      const interval = setInterval(() => {
        val.value = withSequence(
          withDelay(delay, withTiming(1, { duration: 400 })),
          withTiming(0, { duration: 400 })
        );
      }, 800 + delay * 2);
      return interval;
    };
    const i1 = pulse(dot1, 0);
    const i2 = pulse(dot2, 130);
    const i3 = pulse(dot3, 260);
    return () => {
      clearInterval(i1);
      clearInterval(i2);
      clearInterval(i3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 4, paddingHorizontal: 4 }}>
      <Animated.Text style={[{ fontSize: 18, lineHeight: 22, color: "#687076" }, a1]}>.</Animated.Text>
      <Animated.Text style={[{ fontSize: 18, lineHeight: 22, color: "#687076" }, a2]}>.</Animated.Text>
      <Animated.Text style={[{ fontSize: 18, lineHeight: 22, color: "#687076" }, a3]}>.</Animated.Text>
    </View>
  );
}

// Building chat: character + dialog per community building
interface BuildingChatLine {
  from: "npc" | "user";
  text: string;
}
interface BuildingChatNpc {
  sprite: any;
  name: string;
  emoji: string;
  opening: string;
  replies: { label: string; responses: string[] }[];
}
const BUILDING_CHAT_NPCS: Record<string, BuildingChatNpc> = {
  town_hall: {
    sprite: NPC_MAYOR_PNG,
    name: "Mayor",
    emoji: "🏛️",
    opening: "Namaste! 🎩 Main is shahar ka Mayor hoon. Aapka swagat hai!",
    replies: [
      { label: "Shahar kaisa hai?", responses: ["Bahut achha hai! 🌟 Aapke buildings ki wajah se shahar khil utha hai!", "Population badh rahi hai, koi complain nahi! 😄"] },
      { label: "Koi kaam hai?", responses: ["Aur community buildings banaiye, taaki shahar aur behtar bane! 🏗️"] },
    ],
  },
  hospital: {
    sprite: NPC_DOCTOR_PNG,
    name: "Dr. Sharma",
    emoji: "🏥",
    opening: "Hello! 🩺 Main Doctor hoon. Aapki tabiyat kaisi hai?",
    replies: [
      { label: "Main thik hoon", responses: ["Bahut achha! 😊 Swasth rehna hi sabse badi daulat hai!", "Achhi khabar hai! Roz exercise kijiye. 💪"] },
      { label: "Thoda thaka hua hoon", responses: ["Aapne bahut kaam kiya hai! 🌿 Aaram kijiye aur paani piiye. Jaldi thik ho jayenge!"] },
    ],
  },
  police_station: {
    sprite: NPC_POLICEWOMAN_PNG,
    name: "Officer Priya",
    emoji: "🚔",
    opening: "Salute! 👮‍♀️ Main Police Officer Priya. Shahar bilkul safe hai aapki wajah se!",
    replies: [
      { label: "Achi khabar!", responses: ["Ji sir/ma'am! 🛡️ Crime bilkul zero. Saari credit aapki hai!"] },
      { label: "Kuch zaroorat hai?", responses: ["Roads par vehicles chal rahi hain, sab niyam maan rahe hain! 🚦 Bas aise hi rakhiye."] },
    ],
  },
  fire_station: {
    sprite: NPC_BUILDER_PNG,
    name: "Engineer Rohit",
    emoji: "🚒",
    opening: "Thumbs up! 👷 Main Engineer Rohit. Fire station mein sab ready hai!",
    replies: [
      { label: "Equipment theek hai?", responses: ["Haan ji! 🧯 Har cheez check ho gayi. Koi aag ho to hum 2 minute mein pahunch jayenge!"] },
      { label: "Safety tips batao", responses: ["Aag se door rakhiye, electrical wires check karwate rahiye. 🔥 Pehle safety!"] },
    ],
  },
  market: {
    sprite: NPC_FARMER_BIG_PNG,
    name: "Farmer Balram",
    emoji: "🛒",
    opening: "Arre aaiye aaiye! 🧑‍🌾 Main Farmer Balram. Meri sabziyan dekho!",
    replies: [
      { label: "Kya bechte ho?", responses: ["🥕🍅🥔 Gajar, tamatar, aloo... jo aap ugaate hain woh main bechta hoon! Achhe daam milte hain!"] },
      { label: "Daam achhe milenge?", responses: ["Best daam! 💰 Aap jitna zyada harvest karoge, utna zyada kamaoge!"] },
    ],
  },
  school: {
    sprite: NPC_TEACHER_PNG,
    name: "Teacher Neha",
    emoji: "🏫",
    opening: "Namaste! 👩‍🏫 Main Teacher Neha. School mein bachche bahut khush hain!",
    replies: [
      { label: "Bachche kaise hain?", responses: ["Bahut achhe! 📚 Naye buildings dekhkar bachchon ki aankhein chamak uthti hain!"] },
      { label: "Kuch sikhao", responses: ["Mehnat + planning = achha shahar! ✏️ Yahi sabse badi lesson hai."] },
    ],
  },
  library: {
    sprite: NPC_SHOPKEEPER_PNG,
    name: "Bookshop Aanya",
    emoji: "📚",
    opening: "Shhh... Welcome! 🤫 Main Aanya, library sambhalti hoon!",
    replies: [
      { label: "Kya padhna milega?", responses: ["Shahar banane ki kitaaben, farming ke nuskhe, sab hai! 📖 Knowledge hi power hai."] },
      { label: "Shant jagah chahiye", responses: ["Library sabse shant jagah hai! 🧘 Aao, ek kone mein baith jao aur aaram karo."] },
    ],
  },
  train_station: {
    sprite: NPC_CHEF_PNG,
    name: "Chef Ravi",
    emoji: "🚂",
    opening: "Chuk-chuk! 🍳 Main Chef Ravi, station ke paas apna swaad faila raha hoon!",
    replies: [
      { label: "Kya khana milega?", responses: ["Garam jalebi, chai-samosa! 🥟 Yatriyon ko meri khushboo hi attract karti hai!"] },
      { label: "Swadisht lagta hai!", responses: ["Aree bas utha lijiye! 😋 Achhi khaani-piini se shahar aur khushaal banta hai!"] },
    ],
  },
  park: {
    sprite: NPC_VET_PNG,
    name: "Vet Sonali",
    emoji: "🌳",
    opening: "Hi! 🐶 Main Vet Sonali. Mere saath Kutty bhi hai!",
    replies: [
      { label: "Kutty kaisa hai?", responses: ["Bahut healthy! 🐾 Woof woof! Park mein bhagna uski sabse pasandeeda activity hai!"] },
      { label: "Aur janwar?", responses: ["🐄🐔 Gaiya aur murghiyan bhi park mein aati hain. Sab mil-jul kar rehte hain!"] },
    ],
  },
};

// Road tile PNG sources
const ROAD_SOURCES: Record<string, any> = {
  road_straight: ROAD_STRAIGHT_PNG,
  road_corner: ROAD_CORNER_PNG,
  road_intersection: ROAD_INTERSECTION_PNG,
  road_wide_straight: ROAD_WIDE_STRAIGHT_PNG,
  road_wide_corner: ROAD_WIDE_CORNER_PNG,
};

// Generic Road tile renderer (covers the whole tile)
function PngRoadGeneric({ col, row, scale, roadType, rotation = 0, flipped = false }: {
  col: number; row: number; scale: number; roadType: string; rotation?: number; flipped?: boolean;
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
        style={{ width: ts, height: ts, transform: [{ rotate: `${rotation}deg` }, { scaleX: flipped ? -1 : 1 }] }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// Generic Community Building renderer
function PngCommunityGeneric({ col, row, scale, communityType, flipped = false }: {
  col: number; row: number; scale: number; communityType: string; flipped?: boolean;
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
        style={{ width: bldSize, height: bldSize, transform: [{ scaleX: flipped ? -1 : 1 }] }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// Generic PNG Factory/Industry Building renderer
function PngIndustryGeneric({ col, row, scale, industryType, flipped = false }: {
  col: number; row: number; scale: number; industryType: string; flipped?: boolean;
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
        source={INDUSTRY_SOURCES[industryType] || INDUSTRY_STEEL_PNG}
        style={{ width: bldSize, height: bldSize, transform: [{ scaleX: flipped ? -1 : 1 }] }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}
// Generic PNG Farm Building renderer
function PngFarmGeneric({ col, row, scale, farmType, flipped = false }: {
  col: number; row: number; scale: number; farmType: string; flipped?: boolean;
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
        source={FARM_SOURCES[farmType] || TOWN_HALL_PNG}
        style={{ width: bldSize, height: bldSize, transform: [{ scaleX: flipped ? -1 : 1 }] }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// Generic PNG House renderer
function PngHouseGeneric({ col, row, scale, houseType, flipped = false }: {
  col: number; row: number; scale: number; houseType: string; flipped?: boolean;
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
        style={{ width: houseSize, height: houseSize, transform: [{ scaleX: flipped ? -1 : 1 }] }}
                contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// Generic decoration renderer (all 9 decoration PNGs)
function PngDecorationGeneric({ col, row, scale, decorationType, flipped = false }: {
  col: number; row: number; scale: number; decorationType: string; flipped?: boolean;
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
        style={{ width: size, height: size, transform: [{ scaleX: flipped ? -1 : 1 }] }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// Emoji crop renderer (renders emoji on farmland tiles) with growth animation
function EmojiCrop({ col, row, scale, cropType, flipped = false, growthStage = 0 }: {
  col: number; row: number; scale: number; cropType: string; flipped?: boolean; growthStage?: number;
}) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const emojiSize = ts * 0.8;
  // Growth stages: 0-24 = growing, 25-49 = stage 2, 50-74 = stage 3, 75+ = fully grown (harvestable)
  // Total growth time: ~25 seconds (at 1 tick/second)
  const MAX_GROWTH = 100;
  const isFullyGrown = growthStage >= MAX_GROWTH;
  // Scale grows from 0.3 (seedling) to 1.0 (fully grown)
  const growthScale = Math.min(1.0, 0.3 + (growthStage / MAX_GROWTH) * 0.7);
  // Per-crop stagger seed so pulses don't sync (hash of position)
  const glowSeed = (col * 7 + row * 13) % 100;
  // Opacity grows from 0.4 to 1.0
  const growthOpacity = Math.min(1.0, 0.4 + (growthStage / MAX_GROWTH) * 0.6);
  return (
    <View style={{
      position: "absolute",
      left: pos.x - emojiSize / 2,
      top: pos.y - emojiSize / 2,
      width: emojiSize,
      height: emojiSize,
      zIndex: 10,
      pointerEvents: "box-none",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Pulsating golden glow ring behind fully grown crops */}
      {isFullyGrown && <ReadyCropGlow col={col} row={row} scale={scale} seed={glowSeed} />}
      <Text
        style={{
          fontSize: emojiSize * 0.7 * growthScale,
          lineHeight: emojiSize * 0.9 * growthScale,
          opacity: growthOpacity,
          transform: [
            { scaleX: flipped ? -1 : 1 },
            { scaleY: growthScale },
          ],
          // Add a subtle pulse animation when fully grown to indicate harvestable
          ...(isFullyGrown ? {
            textShadowColor: "#FFD700",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 4,
          } : {}),
        }}
      >
        {CROP_EMOJIS[cropType] || "🌱"}
      </Text>
      {/* Growth progress bar indicator (only shown while growing) */}
      {!isFullyGrown && (
        <View style={{
          position: "absolute",
          bottom: 0,
          left: "15%",
          width: "70%",
          height: 3,
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: 2,
          overflow: "hidden",
        }}>
          <View style={{
            width: `${Math.min(100, (growthStage / MAX_GROWTH) * 100)}%`,
            height: "100%",
            backgroundColor: "#4CAF50",
            borderRadius: 2,
          }} />
        </View>
      )}
    </View>
  );
}
// Placement modes
const MODES = ["tile", "tiles", "community", "temple", "decoration", "industry", "farm", "road", "house_small", "house_big", "town_market", "tree", "grass_plant"] as const;
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
  farm: "🐑",
  industry: "🏭",
  community: "🏛️",
  road: "🛣️",
  house_small: "🏠",
  house_big: "🏡",
  town_market: "🏪",
  tree: "🌳",
  grass_plant: "🌿",
};

type GridCell = { tile: TileType; building: BuildingType; grassOverlay: boolean; roadOverlay: string | null; roadRotation: number; tileTexture: string; flipped: boolean; cropGrowthStage: number };

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
      rowArr.push({ tile: "grass", building, grassOverlay: false, roadOverlay: null, roadRotation: 0, tileTexture: "lush_grass", flipped: false, cropGrowthStage: 0 });
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
    // Wrapper View owns the responder: responder callbacks survive parent pan gesture
    // takeover, so the 5s hold timer is never silently cancelled mid-hold
    <View
      onStartShouldSetResponder={() => true}
      onResponderGrant={() => {
        if (onDelayStart) onDelayStart();
      }}
      onResponderRelease={() => {
        if (onDelayEnd) onDelayEnd();
      }}
      onResponderTerminate={() => {
        if (onDelayEnd) onDelayEnd();
      }}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
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
            left: pos.x - ts / 2 - 10,
            top: pos.y - ts / 2 - 14,
            width: ts + 20,
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
    </View>
  );
}

// --- Pickup Pop: small bounce + sparkle effect when the 5s progress bar fills ---
function PickupPop({
  col,
  row,
  scale,
  scaleValue,
  opacityValue,
}: {
  col: number;
  row: number;
  scale: number;
  scaleValue: SharedValue<number>;
  opacityValue: SharedValue<number>;
}) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const size = ts * 1.4;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: pos.x - size / 2,
        top: pos.y - size / 2,
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        ...animStyle,
      }}
    >
      <Text style={{ fontSize: ts * 0.55, lineHeight: ts * 0.7 }}>✨</Text>
    </Animated.View>
  );
}

// --- Place Pop: sparkle celebration at a placed tile (triggered on successful item placement) ---
function PlacePop({
  col,
  row,
  scale,
  scaleValue,
  opacityValue,
}: {
  col: number;
  row: number;
  scale: number;
  scaleValue: SharedValue<number>;
  opacityValue: SharedValue<number>;
}) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: pos.x - ts / 2,
        top: pos.y - ts / 2,
        width: ts,
        height: ts,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 120,
        ...animStyle,
      }}
    >
      <Text style={{ fontSize: ts * 0.6, lineHeight: ts * 0.8 }}>✨</Text>
    </Animated.View>
  );
}

// --- Dust Cloud: puff-of-dust animation at a removed tile ---
function DustCloud({
  col,
  row,
  scale,
  scaleValue,
  opacityValue,
}: {
  col: number;
  row: number;
  scale: number;
  scaleValue: SharedValue<number>;
  opacityValue: SharedValue<number>;
}) {
  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: pos.x - ts / 2,
        top: pos.y - ts / 2,
        width: ts,
        height: ts,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 120,
        ...animStyle,
      }}
    >
      <Text style={{ fontSize: ts * 0.75, lineHeight: ts }}>💨</Text>
    </Animated.View>
  );
}

// --- Golden Glow: pulsating golden ring under a harvest-ready crop to make it more visible ---
function ReadyCropGlow({ col, row, scale, seed }: { col: number; row: number; scale: number; seed: number }) {
  const [, setTick] = useState(0);
  const bornRef = useRef(Date.now() + seed * 400); // stagger each crop's pulse
  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 80);
    return () => clearInterval(interval);
  }, []);

  const pos = gridToScreen(col, row, scale);
  const ts = TILE_SIZE * scale;
  // Pulsate between 0.85 and 1.15 scale, opacity 0.35-0.75, on a 1.2s loop
  const t = ((Date.now() - bornRef.current) % 1200) / 1200;
  const pulse = Math.sin(t * Math.PI * 2) * 0.5 + 0.5; // 0..1
  const glowScale = 0.85 + pulse * 0.3;
  const glowOpacity = 0.35 + pulse * 0.4;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: pos.x - ts / 2,
        top: pos.y - ts / 2,
        width: ts,
        height: ts,
        zIndex: 8,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: glowScale }],
        opacity: glowOpacity,
      }}
    >
      <View
        style={{
          width: ts * 0.92,
          height: ts * 0.62,
          borderRadius: ts * 0.31,
          borderWidth: 2,
          borderColor: "#FFD700",
          backgroundColor: "rgba(255, 215, 0, 0.25)",
          shadowColor: "#FFD700",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowOpacity,
          shadowRadius: 10,
          elevation: 6,
        }}
      />
    </View>
  );
}

// --- Harvest Sparkles: burst of small ✨/⭐ particles rising and fading at a harvested tile ---
function HarvestSparkles({ burst, scale }: { burst: { key: string; col: number; row: number; at: number; stars: { dx: number; dy: number; delay: number }[] }; scale: number }) {
  const pos = gridToScreen(burst.col + 0.5, burst.row + 0.5, scale);
  const ts = TILE_SIZE * scale;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: pos.x - ts / 2,
        top: pos.y - ts / 2,
        width: ts,
        height: ts,
        zIndex: 50,
      }}
    >
      {burst.stars.map((s, i) => (
        <HarvestStar key={`${burst.key}-${i}`} x={ts / 2} y={ts * 0.3} dx={s.dx * ts * 0.45} dy={s.dy * ts * 0.6} delay={s.delay} at={burst.at} />
      ))}
    </View>
  );
}

function HarvestStar({ x, y, dx, dy, delay, at }: { x: number; y: number; dx: number; dy: number; delay: number; at: number }) {
  const [, forceRender] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      forceRender((n) => n + 1);
    }, 40);
    return () => clearInterval(interval);
  }, []);
  const now = Date.now();
  const age = Math.max(0, now - at - delay);
  const DURATION = 700;
  const t = Math.min(1, age / DURATION);
  const opacity = 1 - t;
  const rise = dy * t;
  const xOff = dx * Math.sin(t * Math.PI) * t;
  const sc = 0.5 + t * 0.9;
  if (t >= 1) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x + xOff - 8,
        top: y + rise - 8,
        width: 16,
        height: 16,
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: [{ scale: sc }],
      }}
    >
      <Text style={{ fontSize: 14, lineHeight: 16 }}>✨</Text>
    </View>
  );
}

// --- Farmer Harvest Hint: bubble shown above a ready crop while the 3D farmer stands nearby ---
function FarmerHintBubble({
  col,
  row,
  scale,
  message,
  opacityValue,
}: {
  col: number;
  row: number;
  scale: number;
  message: string;
  opacityValue: SharedValue<{ col: number; row: number; opacity: number } | null>;
}) {
  const pos = gridToScreen(col + 0.5, row + 0.5, scale);
  const ts = TILE_SIZE * scale;

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value?.opacity ?? 0,
  }));

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: pos.x - 90,
        top: pos.y - ts * 0.55 - 62,
        width: 180,
        alignItems: "center",
        zIndex: 60,
        ...animStyle,
      }}
    >
      {/* Bubble card */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: "#FF9F43",
          paddingHorizontal: 10,
          paddingVertical: 7,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
          alignItems: "center",
        }}
      >
        {/* Small farmer emoji to attribute the hint */}
        <Text style={{ fontSize: 15, lineHeight: 20, marginBottom: 1 }}>🧑‍🌾</Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#333", textAlign: "center" }}>{message}</Text>
      </View>
      {/* Bubble tail */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "#FF9F43",
          alignSelf: "center",
          marginTop: 2,
        }}
      />
    </View>
  );
}

// --- Claim Pop: same bounce + sparkle celebration, centered on screen (for task reward claims) ---
function ClaimPop({
  dims,
  scaleValue,
  opacityValue,
}: {
  dims: { width: number; height: number };
  scaleValue: SharedValue<number>;
  opacityValue: SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  const size = Math.min(dims.width, dims.height) * 0.35;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: dims.width / 2 - size / 2,
        top: dims.height / 2 - size / 2,
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <Animated.View style={animStyle}>
        <Text style={{ fontSize: size * 0.5, lineHeight: size * 0.65 }}>✨</Text>
      </Animated.View>
    </View>
  );
}

// --- PNG House: Small House (top-down view) ---
function SmallHouse({ col, row, scale, flipped = false }: { col: number; row: number; scale: number; flipped?: boolean }) {
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
        style={{ width: houseSize, height: houseSize, transform: [{ scaleX: flipped ? -1 : 1 }] }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- PNG House: Big House (top-down view) ---
function BigHouse({ col, row, scale, flipped = false }: { col: number; row: number; scale: number; flipped?: boolean }) {
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
        style={{ width: houseSize, height: houseSize, transform: [{ scaleX: flipped ? -1 : 1 }] }}
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
function PngTreeGeneric({ col, row, scale, treeType, flipped = false }: {
  col: number; row: number; scale: number; treeType: string; flipped?: boolean;
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
        style={{ width: treeSize, height: treeSize, transform: [{ scaleX: flipped ? -1 : 1 }] }}
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
function TownMarket({ col, row, scale, flipped = false }: { col: number; row: number; scale: number; flipped?: boolean }) {
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
        style={{ width: marketSize, height: marketSize, transform: [{ scaleX: flipped ? -1 : 1 }] }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );
}

// --- Building Component Selector ---
function BuildingOnTile({ col, row, buildingType, scale, flipped = false, growthStage = -1 }: {
  col: number; row: number; buildingType: BuildingType; scale: number; flipped?: boolean; growthStage?: number;
}) {
  // All tree types use the generic renderer
  if (buildingType in TREE_SOURCES) {
    return <PngTreeGeneric col={col} row={row} scale={scale} treeType={buildingType} flipped={flipped} />;
  }
  // All user house types use the generic renderer
  if (buildingType in HOUSE_SOURCES) {
    return <PngHouseGeneric col={col} row={row} scale={scale} houseType={buildingType} flipped={flipped} />;
  }
  // All community building types use the generic renderer
  if (buildingType in COMMUNITY_SOURCES) {
    return <PngCommunityGeneric col={col} row={row} scale={scale} communityType={buildingType} flipped={flipped} />;
  }
  // All temple types use the generic renderer
  if (buildingType in TEMPLE_SOURCES) {
    return <PngCommunityGeneric col={col} row={row} scale={scale} communityType={buildingType} flipped={flipped} />;
  }
  // All road tile types use the generic renderer
  if (buildingType in ROAD_SOURCES) {
    return <PngRoadGeneric col={col} row={row} scale={scale} roadType={buildingType} flipped={flipped} />;
  }
  // All decoration types use the generic renderer
  if (buildingType in DECORATION_SOURCES) {
    return <PngDecorationGeneric col={col} row={row} scale={scale} decorationType={buildingType} flipped={flipped} />;
  }
  // All industry/factory types use the dedicated generic renderer
  if (buildingType in INDUSTRY_SOURCES) {
    return <PngIndustryGeneric col={col} row={row} scale={scale} industryType={buildingType} flipped={flipped} />;
  }
  // All farm building types use the generic renderer
  if (buildingType in FARM_SOURCES) {
    return <PngFarmGeneric col={col} row={row} scale={scale} farmType={buildingType} flipped={flipped} />;
  }
  // All crop types render as emoji on farmland
  if (buildingType in CROP_EMOJIS) {
    return <EmojiCrop col={col} row={row} scale={scale} cropType={buildingType} flipped={flipped} growthStage={growthStage >= 0 ? growthStage : 0} />;
  }
  switch (buildingType) {
    case "house_small": return <SmallHouse col={col} row={row} scale={scale} flipped={flipped} />;
    case "house_big": return <BigHouse col={col} row={row} scale={scale} flipped={flipped} />;
    case "town_market": return <TownMarket col={col} row={row} scale={scale} flipped={flipped} />;
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
            // Migrate: convert old crop types to new emoji crop types and add cropGrowthStage
            const OLD_CROP_MAP: Record<string, string> = {
              "tomato": "crop_tomato", "eggplant": "crop_eggplant", "carrot": "crop_carrot",
              "cabbage": "crop_broccoli", "chili": "crop_chili", "onion": "crop_garlic",
              "potato": "crop_potato", "cucumber": "crop_cucumber", "okra": "crop_peanut",
            };
            const migrated = parsed.map((rowArr) =>
              rowArr.map((cell) => {
                const newBuilding = (OLD_CROP_MAP[cell.building] || cell.building) as BuildingType;
                return { ...cell, building: newBuilding, cropGrowthStage: cell.cropGrowthStage ?? 0 };
              })
            );
            setGrid(migrated);
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
  const [showSellMsg, setShowSellMsg] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [streakLevel, setStreakLevel] = useState(0);
  const [dailyRewardAmount, setDailyRewardAmount] = useState(50);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(generateTasksForDate(new Date().toISOString().slice(0, 10)));
  const [showTasks, setShowTasks] = useState(false);
  const [showTaskReward, setShowTaskReward] = useState(false);
  const [showBackpack, setShowBackpack] = useState(false);
  const [harvestedItems, setHarvestedItems] = useState<Record<string, number>>({});
  const [showHarvestAllMsg, setShowHarvestAllMsg] = useState(false);

  // --- Orders Board: NPC customers request goods for premium coin rewards ---
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState<OrderBoardItem[]>(() => generateDailyOrders());
  const [orderRewardBanner, setOrderRewardBanner] = useState<string | null>(null);
  const orderRewardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // --- NPC delivery animation: ordering NPC walks to collect goods then returns ---
  const [delivery, setDelivery] = useState<DeliveryState | null>(null);
  // Load persisted orders; regenerate on a new day
  useEffect(() => {
    AsyncStorage.multiGet([ORDERS_KEY, ORDERS_DATE_KEY]).then(([ordersEntry, dateEntry]) => {
      const savedDate = dateEntry?.[1];
      const today = getTodayStr();
      if (savedDate === today && ordersEntry?.[1]) {
        try {
          const parsed = JSON.parse(ordersEntry[1]) as OrderBoardItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
            return;
          }
        } catch {}
      }
      // New day (or nothing saved) — generate fresh orders
      const fresh = generateDailyOrders();
      setOrders(fresh);
      AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(fresh)).catch(() => {});
      AsyncStorage.setItem(ORDERS_DATE_KEY, today).catch(() => {});
    });
  }, []);
  const saveOrders = useCallback((next: OrderBoardItem[]) => {
    setOrders(next);
    AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);
  // Delivery animation: find a spot where the NPC's community building stands (origin),
  // plus an empty grass tile nearby (delivery point). Falls back to map-center spots.
  const findDeliverySpots = useCallback((npcType: string): { origin: { x: number; y: number }; spot: { x: number; y: number } } => {
    const buildCol: number[] = [];
    const buildRow: number[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col].building === npcType) {
          buildCol.push(col);
          buildRow.push(row);
        }
      }
    }
    let origin: { x: number; y: number };
    if (buildCol.length > 0) {
      origin = { x: buildCol[0], y: buildRow[0] };
    } else {
      origin = { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) };
    }
    // Look for an empty grass/dirt/farmland tile near the origin for the delivery point
    let best: { x: number; y: number } | null = null;
    let bestDist = Infinity;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        const isWalkable = cell.building === "none" && !CROP_EMOJIS[cell.building as CropType];
        if (!isWalkable) continue;
        const dist = Math.abs(col - origin.x) + Math.abs(row - origin.y);
        if (dist >= 1 && dist <= 3 && dist < bestDist) {
          bestDist = dist;
          best = { x: col, y: row };
        }
      }
    }
    const spot = best || { x: (origin.x + 2) % GRID_SIZE, y: (origin.y + 2) % GRID_SIZE };
    return { origin, spot };
  }, [grid]);
  const deliveryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Run the delivery walk: origin -> delivery spot (pickup pop) -> origin
  const startNpcDelivery = useCallback((npc: OrderNpc, rewardCoins: number, goodsLabel: string) => {
    const { origin, spot } = findDeliverySpots(npc.npcType);
    setDelivery({ sprite: npc.sprite, emoji: "📦", origin, spot, step: "toSpot", startedAt: Date.now(), rewardCoins, goodsLabel });
    const toSpotMs = 1200;
    const pickupMs = 700;
    const returnMs = 1200;
    if (deliveryTimer.current) clearTimeout(deliveryTimer.current);
    deliveryTimer.current = setTimeout(() => {
      // Chime plays the moment the NPC receives the goods (start of pickup)
      playDeliveryChime();
      setDelivery((d) => d ? { ...d, step: "pickup" } : d);
      deliveryTimer.current = setTimeout(() => {
        setDelivery((d) => d ? { ...d, step: "returning" } : d);
        deliveryTimer.current = setTimeout(() => {
          setDelivery((d) => (d ? null : d));
          deliveryTimer.current = null;
        }, returnMs);
      }, pickupMs);
    }, toSpotMs);
  }, [findDeliverySpots]);
  // NOTE: playDeliveryChime is intentionally called inside startNpcDelivery but not listed in
  // its deps array, because it is defined later in the component body (avoiding TDZ). It reads
  // settings.sound at call time via closure on the latest render in practice because
  // startNpcDelivery is invoked only from the latest render's fulfillOrder.

  useEffect(() => {
    return () => {
      if (deliveryTimer.current) clearTimeout(deliveryTimer.current);
    };
  }, []);

  const fulfillOrder = useCallback((orderId: number) => {
    setOrders((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (!order || order.claimed) return prev;
      const goods = ORDER_GOODS.find((g) => g.label === order.goodsLabel);
      if (!goods) return prev;
      // Backpack stores farm goods by collectLabel ("Wool", "Eggs") and crops by crop type
      // ("crop_tomato"). Resolve which key to consume.
      const requestedName = orderLabelToBackpackKey(order.goodsLabel);
      const cropKey = (CROP_TYPES as readonly string[]).find((ct) => CROP_EMOJIS[ct] === goods.emoji);
      const haveFromFarm = harvestedItems[requestedName] || 0;
      const haveFromCrop = cropKey ? harvestedItems[cropKey] || 0 : 0;
      const haveTotal = haveFromFarm + haveFromCrop;
      if (haveTotal < order.quantity) return prev; // not enough goods yet
      const updated = { ...harvestedItems };
      let remaining = order.quantity;
      if (cropKey && updated[cropKey]) {
        const take = Math.min(remaining, updated[cropKey]);
        updated[cropKey] -= take;
        if (updated[cropKey] <= 0) delete updated[cropKey];
        remaining -= take;
      }
      if (remaining > 0 && updated[requestedName]) {
        updated[requestedName] -= remaining;
        if (updated[requestedName] <= 0) delete updated[requestedName];
      }
      saveBackpack(updated);
      setCoins((c) => c + order.rewardCoins);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const npc = getOrderNpcs()[order.npcIndex];
      setOrderRewardBanner(`✅ ${npc.name}: Thank you! +${order.rewardCoins} 🪙`);
      if (orderRewardTimer.current) clearTimeout(orderRewardTimer.current);
      orderRewardTimer.current = setTimeout(() => setOrderRewardBanner(null), 2500);
      // Start delivery walk animation: NPC walks from a building spot to a
      // delivery point near their community building, picks up the goods, and returns
      startNpcDelivery(npc, order.rewardCoins, order.goodsLabel);
      return prev.map((o) => (o.id === orderId ? { ...o, claimed: true } : o));
    });
  }, [harvestedItems]);
  const lowCoinsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const harvestAllMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Persist backpack
  const BACKPACK_KEY = "backpack_v1";
  const [, forceBackpackRender] = useState(0);
  // Load backpack on mount
  useEffect(() => {
    AsyncStorage.getItem(BACKPACK_KEY).then((saved) => {
      if (saved) {
        try { setHarvestedItems(JSON.parse(saved)); } catch {}
      }
    });
  }, []);
  // Save backpack when it changes
  const saveBackpack = useCallback((items: Record<string, number>) => {
    setHarvestedItems(items);
    forceBackpackRender((n) => n + 1);
    AsyncStorage.setItem(BACKPACK_KEY, JSON.stringify(items)).catch(() => {});
  }, []);

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
  const [selectedCropType, setSelectedCropType] = useState<CropType>("crop_tomato");
  const [tappedFarmlandPos, setTappedFarmlandPos] = useState<{ col: number; row: number } | null>(null);
  const [selectedTempleType, setSelectedTempleType] = useState<TempleType>("temple_pink");
  const [showTempleSelector, setShowTempleSelector] = useState(false);
  const [selectedDecorationType, setSelectedDecorationType] = useState<DecorationType>("flower_arch");
  const [showDecorationSelector, setShowDecorationSelector] = useState(false);
  const [selectedIndustryType, setSelectedIndustryType] = useState<IndustryType>("steel_factory");
  const [selectedFarmType, setSelectedFarmType] = useState<FarmType>("farm_sheep_barn");

  // Mirror (flip) toggle for item selection: when ON, previews and placed items render mirrored
  const [mirrorMode, setMirrorMode] = useState(false);
  const [showIndustrySelector, setShowIndustrySelector] = useState(false);
  const [showItemsMenu, setShowItemsMenu] = useState(false);

  // Building chat panel state
  const [chatPanel, setChatPanel] = useState<{
    buildingType: string;
    messages: BuildingChatLine[];
    userReplied: boolean;
  } | null>(null);
  const chatScrollRef = useRef<ScrollView>(null);

  // Chat panel slide animation (enter: slide-up, close: slide-down)
  const chatSlideY = useSharedValue(480);
  const chatOpacity = useSharedValue(0);
  const chatClosingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeChatPanelAnimated = useCallback(() => {
    chatSlideY.value = withTiming(480, { duration: 250, easing: Easing.in(Easing.cubic) });
    chatOpacity.value = withTiming(0, { duration: 250 });
    if (chatClosingTimerRef.current) clearTimeout(chatClosingTimerRef.current);
    chatClosingTimerRef.current = setTimeout(() => {
      setChatPanel(null);
    }, 260);
  }, []);

  // Show a brief hover tooltip for a building's character (name + profession)
  const showBuildingTooltip = useCallback((buildingType: string, col: number, row: number) => {
    if (!BUILDING_CHAT_NPCS[buildingType]) return;
    setBuildingTooltip({ buildingType, col, row });
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => {
      setBuildingTooltip(null);
    }, 1800);
  }, []);

  // Slide-up enter animation when a chat panel opens
  useEffect(() => {
    if (chatPanel) {
      chatSlideY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
      chatOpacity.value = withTiming(1, { duration: 250 });
    } else {
      chatSlideY.value = 480;
      chatOpacity.value = 0;
    }
    return () => {
      if (chatClosingTimerRef.current) clearTimeout(chatClosingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatPanel]);

  // Chat typing animation state
  const [chatTyping, setChatTyping] = useState(false);
  const chatTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Settings preferences (sound/haptic toggles) — declared early so handlers can reference settings.haptics
  const [settings, setSettings] = useState<{ sound: boolean; haptics: boolean }>({
    sound: true,
    haptics: true,
  });
  const settingsLoadedRef = useRef(false);

  // Farm building production popup (Goathed-style)
  const [farmPopup, setFarmPopup] = useState<{
    buildingType: string;
    col: number;
    row: number;
    productIndex: number;
    ready: number;       // goods currently ready to collect
    startedAt: number;   // timestamp the current batch started
    ticking: boolean;    // refresh tick active
  } | null>(null);
  const farmPopupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load/save farm production progress per building cell: "row,col" → { startedAt }
  const loadFarmProd = useCallback(() => {
    return AsyncStorage.getItem(FARM_PROD_KEY).then((saved) => {
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
      return {};
    });
  }, []);

  // Resolve production data for both farm buildings and factories
  const getProduction = (buildingType: string): FarmProduction | undefined =>
    FARM_PRODUCTIONS[buildingType] || INDUSTRY_PRODUCTIONS[buildingType];

  const openFarmPopup = useCallback((buildingType: string, col: number, row: number) => {
    const prod = getProduction(buildingType);
    if (!prod || !prod.products.length) return;
    loadFarmProd().then((saved: Record<string, any>) => {
      const key = `${row},${col}`;
      const startedAt = saved?.[key]?.startedAt ?? Date.now();
      const p = prod.products[0];
      const elapsed = Date.now() - startedAt;
      const ready = Math.floor(elapsed / p.readyTimeMs);
      setFarmPopup({ buildingType, col, row, productIndex: 0, ready, startedAt, ticking: true });
      if (farmPopupIntervalRef.current) clearInterval(farmPopupIntervalRef.current);
      farmPopupIntervalRef.current = setInterval(() => {
        setFarmPopup((prev) => {
          if (!prev || !prev.ticking) return prev;
          const cur = getProduction(prev.buildingType)?.products?.[prev.productIndex];
          if (!cur) return prev;
          const elapsedNow = Date.now() - prev.startedAt;
          return { ...prev, ready: Math.floor(elapsedNow / cur.readyTimeMs) };
        });
      }, 1000);
    });
    if (Platform.OS !== "web" && settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [loadFarmProd, settings.haptics]);

  const closeFarmPopup = useCallback(() => {
    setFarmPopup(null);
    if (farmPopupIntervalRef.current) {
      clearInterval(farmPopupIntervalRef.current);
      farmPopupIntervalRef.current = null;
    }
  }, []);

  const collectFarmGoods = useCallback(() => {
    setFarmPopup((prev) => {
      if (!prev || prev.ready <= 0) return prev;
      const prod = getProduction(prev.buildingType);
      if (!prod) return prev;
      const p = prod.products[prev.productIndex];
      const earned = p.rewardCoins * prev.ready;
      // Add coins
      setCoins((c) => Math.max(0, c + earned));
      // Add to backpack inventory
      saveBackpack({ ...harvestedItems, [p.collectLabel]: (harvestedItems[p.collectLabel] || 0) + prev.ready });
      // Persist progress: reset batch clock to now
      loadFarmProd().then((saved: Record<string, any>) => {
        const key = `${prev.row},${prev.col}`;
        AsyncStorage.setItem(FARM_PROD_KEY, JSON.stringify({ ...saved, [key]: { startedAt: Date.now() } })).catch(() => {});
      });
      return { ...prev, ready: 0, startedAt: Date.now() };
    });
    if (Platform.OS !== "web" && settings.haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [harvestedItems, saveBackpack, loadFarmProd, settings.haptics]);

  // Clean up farm popup interval on unmount
  useEffect(() => {
    return () => {
      if (farmPopupIntervalRef.current) clearInterval(farmPopupIntervalRef.current);
    };
  }, []);

  // Building hover tooltip: shows character name + profession
  const [buildingTooltip, setBuildingTooltip] = useState<{
    buildingType: string;
    col: number;
    row: number;
  } | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [moveClipboard, setMoveClipboard] = useState<{ type: "building" | "road" | "grass"; buildingType?: BuildingType; roadType?: string; roadRotation?: number; origCol?: number; origRow?: number } | null>(null);
  const [pickupMessage, setPickupMessage] = useState<string | null>(null);

  // Grid snap preview: track hovered tile when item is in clipboard
  const [snapPreviewTile, setSnapPreviewTile] = useState<{ col: number; row: number } | null>(null);
  const snapOpacity = useSharedValue(0);

  // Pulse the snap preview highlight
  useEffect(() => {
    if (moveClipboard && snapPreviewTile) {
      snapOpacity.value = 0;
      snapOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 500 }),
          withTiming(0.2, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      snapOpacity.value = 0;
    }
  }, [moveClipboard, snapPreviewTile]);

  // Track touch position for snap preview (web only - uses pointermove)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handlePointerMove = (e: PointerEvent) => {
      if (!moveClipboard) return;
      const rect = (e.target as HTMLElement)?.closest("[data-map-container]")?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Convert screen coords to grid coords
      // Approximate: use the same gridToScreen inverse logic
      // Simple approach: iterate and find closest tile
      let bestDist = Infinity;
      let bestCol = -1;
      let bestRow = -1;
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const pos = gridToScreen(col, row, currentScale);
          const dx = pos.x - x;
          const dy = pos.y - y;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            bestCol = col;
            bestRow = row;
          }
        }
      }
      if (bestDist < (TILE_SIZE * currentScale * 0.5) ** 2) {
        setSnapPreviewTile({ col: bestCol, row: bestRow });
      } else {
        setSnapPreviewTile(null);
      }
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [moveClipboard, currentScale]);

  // Triple-tap flip tracking
  const tripleTapRef = useRef<{ col: number; row: number; count: number; timer: ReturnType<typeof setTimeout> | null; lastTap: number }>({ col: -1, row: -1, count: 0, timer: null, lastTap: 0 });

  // Long-press progress bar state
  const pressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pressProgress, setPressProgress] = useState(0); // 0-100
  const [popCol, setPopCol] = useState<number | null>(null);
  const [popRow, setPopRow] = useState<number | null>(null);
  const popScale = useSharedValue(0);
  const popOpacity = useSharedValue(0);
  const claimPopScale = useSharedValue(0);
  const claimPopOpacity = useSharedValue(0);
  const [claimPopActive, setClaimPopActive] = useState(false);

  // --- Place success pop + sound ---
  const placePopScale = useSharedValue(0);
  const placePopOpacity = useSharedValue(0);
  const [placePopPos, setPlacePopPos] = useState<{ col: number; row: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- Settings: sound + haptic toggles, persisted via AsyncStorage ---
  const saveSettings = useCallback((next: { sound: boolean; haptics: boolean }) => {
    setSettings(next);
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);
  useEffect(() => {
    if (settingsLoadedRef.current) return;
    settingsLoadedRef.current = true;
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as { sound?: boolean; haptics?: boolean };
          setSettings({
            sound: parsed.sound !== false,
            haptics: parsed.haptics !== false,
          });
        }
      })
      .catch(() => {});
  }, []);
  const [settingsPanel, setSettingsPanel] = useState(false);

  const playPlaceSound = useCallback(() => {
    if (!settings.sound) return;
    try {
      if (Platform.OS === "web") {
        if (!audioCtxRef.current) {
          const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!AC) return;
          audioCtxRef.current = new AC();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else {
        if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      // audio/haptics unavailable, ignore
    }
  }, [settings]);
  // --- Per-crop harvest chime pitch: each crop gets its own tonal character ---
  // [ding start Hz, ding end Hz, shimmer start Hz, shimmer end Hz]
  const HARVEST_PITCH: Record<string, [number, number, number, number]> = {
    crop_watermelon: [330, 480, 680, 820],   // 🍉 deep bass-heavy thud-tink (big fruit)
    crop_garlic: [390, 540, 780, 920],       // 🧄 warm mid-low, earthy
    crop_mushroom: [360, 510, 740, 880],     // 🍄 mellow forest tone
    crop_peanut: [440, 620, 880, 1040],      // 🥜 cozy mid
    crop_broccoli: [470, 660, 940, 1110],    // 🥦 fresh mid-high
    crop_carrot: [520, 740, 1060, 1250],     // 🥕 crisp snappy
    crop_tomato: [560, 790, 1140, 1340],     // 🍅 juicy medium chime (default-like)
    crop_eggplant: [600, 840, 1220, 1430],   // 🍆 smooth round
    crop_potato: [640, 900, 1300, 1520],     // 🥔 hearty earthy
    crop_wheat: [700, 1000, 1420, 1660],     // 🌾 sharp bright field tink
    crop_strawberry: [760, 1080, 1540, 1800],// 🍓 sweet high tink
    crop_cucumber: [820, 1150, 1640, 1900],  // 🥒 light crisp
    crop_corn: [880, 1220, 1740, 2020],      // 🌽 sunny high bright
    crop_chili: [940, 1290, 1840, 2130],     // 🌶️ spicy fast sizzle-high
    crop_sweetpotato: [430, 600, 860, 1020], // 🍠 similar to peanut
    crop_grapes: [680, 960, 1380, 1610],     // 🍇 plump round
    crop_lemon: [740, 1050, 1500, 1760],     // 🍋 zesty
    crop_onion: [490, 680, 990, 1160],       // 🧅 teary-eyed mid
    crop_peas: [720, 1010, 1450, 1690],      // 🫛 light pop
    crop_bellpepper: [610, 860, 1240, 1450], // 🫑 crunchy
  };
  const playHarvestChime = useCallback((cropType?: string) => {
    if (!settings.sound) return;
    try {
      if (Platform.OS === "web") {
        if (!audioCtxRef.current) {
          const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!AC) return;
          audioCtxRef.current = new AC();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;
        const pitch = HARVEST_PITCH[cropType || ""] || [720, 1180, 1480, 1650];
        const [dStart, dEnd, sStart, sEnd] = pitch;
        // Note 1: quick rising ding
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = "sine";
        o1.frequency.setValueAtTime(dStart, now);
        o1.frequency.exponentialRampToValueAtTime(dEnd, now + 0.09);
        g1.gain.setValueAtTime(0.22, now);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o1.connect(g1).connect(ctx.destination);
        o1.start(now);
        o1.stop(now + 0.32);
        // Note 2: brighter shimmer slightly delayed
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = "triangle";
        o2.frequency.setValueAtTime(sStart, now + 0.06);
        o2.frequency.exponentialRampToValueAtTime(sEnd, now + 0.15);
        g2.gain.setValueAtTime(0.0, now + 0.06);
        g2.gain.linearRampToValueAtTime(0.12, now + 0.09);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        o2.connect(g2).connect(ctx.destination);
        o2.start(now + 0.06);
        o2.stop(now + 0.32);
      } else {
        if (settings.haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e) {
      // audio/haptics unavailable, ignore
    }
  }, [settings]);
  // --- Harvest sparkles: bursts of small sparkle particles at harvested crops ---
  type HarvestSparkle = { key: string; col: number; row: number; at: number; stars: { dx: number; dy: number; delay: number }[] };
  const [harvestSparkles, setHarvestSparkles] = useState<HarvestSparkle[]>([]);
  const harvestSparkleTick = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      harvestSparkleTick.current += 1;
      setHarvestSparkles((prev) => prev.filter((s) => Date.now() - s.at < 900));
    }, 60);
    return () => clearInterval(interval);
  }, []);
  const triggerHarvestSparkles = useCallback((col: number, row: number) => {
    const stars: HarvestSparkle["stars"] = Array.from({ length: 6 }, (_, i) => ({
      dx: (Math.random() - 0.5) * 2,
      dy: -0.3 - Math.random() * 1.4,
      delay: i * 40,
    }));
    setHarvestSparkles((prev: HarvestSparkle[]) => [...prev.slice(-10), { key: `${col}-${row}-${Date.now()}`, col, row, at: Date.now(), stars }]);
  }, []);
  // --- Delivery pickup chime: subtle C-E-G sine triplet when NPC receives the goods ---
  const playDeliveryChime = useCallback(() => {
    if (!settings.sound) return;
    try {
      if (Platform.OS === "web") {
        if (!audioCtxRef.current) {
          const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!AC) return;
          audioCtxRef.current = new AC();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.0, ctx.currentTime + i * 0.11);
          gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.11 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.11 + 0.25);
          osc.connect(gain).connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.11);
          osc.stop(ctx.currentTime + i * 0.11 + 0.3);
        });
      } else {
        if (settings.haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e) {
      // audio/haptics unavailable, ignore
    }
  }, [settings]);
  // --- Morning farm bell: warm metallic strike + shimmer, rings once at dawn
  const playMorningBell = useCallback(() => {
    if (!settings.sound) return;
    try {
      if (Platform.OS === "web") {
        if (!audioCtxRef.current) {
          const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!AC) return;
          audioCtxRef.current = new AC();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        // Metallic bell strike + shimmering overtones with long decay tail
        const strike = (freq: number, start: number, type: OscillatorType, gainPeak: number, decay: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          gain.gain.setValueAtTime(0.0, ctx.currentTime + start);
          gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + decay);
          osc.connect(gain).connect(ctx.destination);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + decay + 0.05);
        };
        // Main strike (triangle, bell-like) + shimmering overtones
        strike(830, 0.0, "triangle", 0.14, 1.6);
        strike(1660, 0.0, "sine", 0.06, 1.2);
        strike(2490, 0.02, "sine", 0.03, 0.9);
        // Second soft toll, brighter morning feel
        strike(980, 0.45, "triangle", 0.11, 1.3);
        strike(1960, 0.45, "sine", 0.05, 1.0);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      // audio/haptics unavailable, ignore
    }
  }, [settings]);
  // --- Nighttime owl hoot: quiet two-note "hoo-hoo" descending sine, occasional ambient
  const playOwlHoot = useCallback(() => {
    if (!settings.sound) return;
    try {
      if (Platform.OS === "web") {
        if (!audioCtxRef.current) {
          const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!AC) return;
          audioCtxRef.current = new AC();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        // "hoo" notes: soft sine with a slight vibrato, falling pitch within each note
        const hoots = [
          { start: 0.0, freq: 330 },
          { start: 0.55, freq: 300 },
        ];
        hoots.forEach(({ start, freq }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const vibrato = ctx.createOscillator();
          const vibratoGain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.82, ctx.currentTime + start + 0.45);
          vibrato.type = "sine";
          vibrato.frequency.setValueAtTime(5.5, ctx.currentTime + start);
          vibratoGain.gain.setValueAtTime(8, ctx.currentTime + start);
          gain.gain.setValueAtTime(0.0, ctx.currentTime + start);
          gain.gain.linearRampToValueAtTime(0.10, ctx.currentTime + start + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.6);
          vibrato.connect(vibratoGain).connect(osc.frequency);
          osc.connect(gain).connect(ctx.destination);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + 0.75);
          vibrato.start(ctx.currentTime + start);
          vibrato.stop(ctx.currentTime + start + 0.75);
        });
      }
    } catch (e) {
      // audio unavailable, ignore
    }
  }, [settings]);
  // --- Removal dust cloud + distinct sound ---
  const dustScale = useSharedValue(0);
  const dustOpacity = useSharedValue(0);
  const [dustPos, setDustPos] = useState<{ col: number; row: number } | null>(null);
  const playRemovalSound = useCallback(() => {
    if (!settings.sound) return;
    try {
      if (Platform.OS === "web") {
        if (!audioCtxRef.current) {
          const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!AC) return;
          audioCtxRef.current = new AC();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        // Deeper whoosh-style sound distinct from the placement pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.32);
      } else {
        if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e) {
      // audio/haptics unavailable, ignore
    }
  }, [settings.haptics]);
  const triggerRemovalDustAnimation = useCallback((col: number, row: number) => {
    playRemovalSound();
    setDustPos({ col, row });
    dustOpacity.value = 1;
    dustScale.value = withSequence(
      withTiming(0.5, { duration: 60, easing: Easing.in(Easing.cubic) }),
      withTiming(1.25, { duration: 260, easing: Easing.out(Easing.back(1.2)) })
    );
    dustOpacity.value = withDelay(240, withTiming(0, { duration: 200 }));
    setTimeout(() => {
      setDustPos(null);
    }, 520);
  }, [dustOpacity, dustScale, playRemovalSound, settings.haptics]);

  const triggerPlacePopAnimation = useCallback((col: number, row: number) => {
    playPlaceSound();
    setPlacePopPos({ col, row });
    placePopOpacity.value = 1;
    placePopScale.value = withSequence(
      withTiming(1.35, { duration: 120, easing: Easing.out(Easing.back(1.7)) }),
      withDelay(80, withTiming(0.4, { duration: 220, easing: Easing.inOut(Easing.cubic) }))
    );
    placePopOpacity.value = withDelay(320, withTiming(0, { duration: 150 }));
    setTimeout(() => {
      setPlacePopPos(null);
    }, 550);
  }, [placePopOpacity, placePopScale, playPlaceSound, audioCtxRef, settings.haptics]);
  const screenDims = useMemo(() => Dimensions.get("window"), []);
  const [pressTarget, setPressTarget] = useState<{ col: number; row: number } | null>(null);
  const [isItemPress, setIsItemPress] = useState(false);
  const cancelPressTimerRef = useRef<() => void>(() => {});

  // Speech bubble state
  const [activeBubble, setActiveBubble] = useState<{ id: number; message: string; isAnimal: boolean; x: number; y: number } | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Day/Night Cycle ---
  const [timeOfDay, setTimeOfDay] = useState(0.3); // 0=midnight, 0.5=noon, 1=midnight (24h cycle)
  const [isNight, setIsNight] = useState(false);
  const dayNightTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Weather System ---
  type WeatherType = "sunny" | "cloudy" | "rainy";
  const [weather, setWeather] = useState<WeatherType>("sunny");
  const [rainDrops, setRainDrops] = useState<{ id: number; x: number; y: number; speed: number; opacity: number }[]>([]);
  const weatherTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rainIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropIdRef = useRef(0);

  // Weather timer: change weather every ~60 seconds (random between sunny/cloudy/rainy)
  useEffect(() => {
    weatherTimerRef.current = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.4) setWeather("sunny");
      else if (rand < 0.7) setWeather("cloudy");
      else setWeather("rainy");
    }, 60000); // Change every 60 seconds
    return () => {
      if (weatherTimerRef.current) clearInterval(weatherTimerRef.current);
    };
  }, []);

  // Rain drops animation
  useEffect(() => {
    if (weather === "rainy") {
      // Generate rain drops
      const createDrops = () => {
        const newDrops = [];
        for (let i = 0; i < 8; i++) {
          newDrops.push({
            id: dropIdRef.current++,
            x: Math.random() * 100,
            y: -10,
            speed: 2 + Math.random() * 3,
            opacity: 0.4 + Math.random() * 0.3,
          });
        }
        return newDrops;
      };

      rainIntervalRef.current = setInterval(() => {
        setRainDrops((prev) => {
          const updated = prev.map((d) => ({ ...d, y: d.y + d.speed }));
          const fallen = updated.filter((d) => d.y < 110);
          const newDrops = createDrops();
          return [...fallen, ...newDrops];
        });
      }, 50);
    } else {
      if (rainIntervalRef.current) {
        clearInterval(rainIntervalRef.current);
        rainIntervalRef.current = null;
      }
      setRainDrops([]);
    }
    return () => {
      if (rainIntervalRef.current) clearInterval(rainIntervalRef.current);
    };
  }, [weather]);

  // Weather effect values
  const weatherOverlayOpacity = useMemo(() => {
    if (weather === "sunny") return 0;
    if (weather === "cloudy") return 0.15;
    return 0.25;
  }, [weather]);

  const weatherEmoji = weather === "sunny" ? "☀️" : weather === "cloudy" ? "☁️" : "🌧️";

  // Day/night timer: slowly advance time of day (full cycle every 5 minutes for demo)
  useEffect(() => {
    dayNightTimerRef.current = setInterval(() => {
      setTimeOfDay((prev) => {
        const next = prev + 0.001; // Full cycle ~1000 ticks
        if (next >= 1) return 0;
        return next;
      });
    }, 300); // Update every 300ms
    return () => {
      if (dayNightTimerRef.current) clearInterval(dayNightTimerRef.current);
    };
  }, []);

  // Check if a tile is within range of a water well (2x growth boost)
  const isNearWell = useCallback((col: number, row: number, currentGrid: GridCell[][]): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c].building === "water_well") {
          const dist = Math.sqrt((r - row) ** 2 + (c - col) ** 2);
          if (dist <= 3) return true;
        }
      }
    }
    return false;
  }, []);

  // Farmer task-helper refs/state (declared here, before first use in scan tick effect)
  const farmerHintRef = useRef<{ col: number; row: number; until: number; message: string } | null>(null);
  const farmerHintBubble = useSharedValue<{ col: number; row: number; opacity: number } | null>(null);
  const [, setFarmerHintTick] = useState(0);

  // Crop growth timer: advance cropGrowthStage for all planted crops (1 tick/sec, MAX=100)
  useEffect(() => {
    const growthInterval = setInterval(() => {
      setGrid((prev) => {
        let changed = false;
        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            const cell = newGrid[row][col];
            if (cell.building !== "none" && CROP_EMOJIS[cell.building as CropType]) {
              if (cell.cropGrowthStage < 100) {
                // Per-crop growth: different crops grow at different rates
                const totalDuration = getCropGrowthTime(cell.building as CropType);
                let increment = 100000 / totalDuration; // 100 stages per duration
                // Water well boost: 2x growth if within 3 tiles of a well
                if (isNearWell(col, row, newGrid)) {
                  increment *= 2;
                }
                cell.cropGrowthStage = Math.min(100, cell.cropGrowthStage + increment);
                changed = true;
              }
            }
          }
        }
        return changed ? newGrid : prev;
      });
    }, 1000); // Update every second
    return () => clearInterval(growthInterval);
  }, [isNearWell]);

  // Find a ready (fully grown) crop closest to the given position, ignoring an already-hinted one
  const findReadyCrop = useCallback(
    (g: GridCell[][], nearX: number, nearY: number, ignoreCol: number, ignoreRow: number): { col: number; row: number } | null => {
      let best: { col: number; row: number } | null = null;
      let bestDist = Infinity;
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const cell = g[row][col];
          if (cell.building !== "none" && CROP_EMOJIS[cell.building as CropType] && cell.cropGrowthStage >= 100) {
            if (col === ignoreCol && row === ignoreRow) continue;
            const d = (col - nearX) ** 2 + (row - nearY) ** 2;
            if (d < bestDist) {
              bestDist = d;
              best = { col, row };
            }
          }
        }
      }
      return best;
    },
    []
  );

  // Farmer task-helper tick: scan for ready crops and guide the farmer to them with a hint bubble.
  // Runs every second; the farmer overrides its wander to walk to the ready crop, shows a
  // "Harvest karo!" bubble above it, then returns to wandering after the hint window.
  useEffect(() => {
    const scanInterval = setInterval(() => {
      const now = Date.now();
      const hint = farmerHintRef.current;

      // Drop the hint if the crop at the hinted tile is no longer ready/harvested
      if (hint) {
        setGrid((prev) => {
          const cell = prev[hint.row]?.[hint.col];
          const stillReady = cell?.cropGrowthStage >= 100;
          if (!stillReady) farmerHintRef.current = null;
          return prev;
        });
      }

      // Pick a new target crop if nothing is currently being hinted
      if (!farmerHintRef.current) {
        setAnimals((prev) => {
          const farmer = prev.find((a) => a.id === FARMER_ID);
          if (!farmer) return prev;
          setGrid((g) => {
            const target = findReadyCrop(g, farmer.x, farmer.y, -1, -1);
            if (target) {
              const msg = FARMER_HINT_MESSAGES[Math.floor(Math.random() * FARMER_HINT_MESSAGES.length)];
              farmerHintRef.current = { col: target.col, row: target.row, until: now + FARMER_HINT_STAY_MS, message: msg };
              farmerHintBubble.value = { col: target.col, row: target.row, opacity: 0 };
            }
            return g;
          });
          return prev;
        });
        setFarmerHintTick((n) => n + 1);
      }

      // Fade the hint bubble in while active
      if (farmerHintRef.current) {
        const active = now < farmerHintRef.current.until;
        const cur = farmerHintBubble.value;
        if (cur) {
          farmerHintBubble.value = { col: cur.col, row: cur.row, opacity: active ? 1 : 0 };
        }
        if (!active) {
          farmerHintRef.current = null;
          setFarmerHintTick((n) => n + 1);
        }
      } else {
        farmerHintBubble.value = null;
      }
    }, 1000);
    return () => clearInterval(scanInterval);
  }, [findReadyCrop, farmerHintBubble]);

  // Farmer task-helper: override wander target to walk to the hinted ready crop
  useEffect(() => {
    const interval = setInterval(() => {
      const hint = farmerHintRef.current;
      if (!hint) return;
      setAnimals((prev) => {
        const farmer = prev.find((a) => a.id === FARMER_ID);
        if (!farmer || farmer.sleeping) return prev;
        const dx = hint.col + 0.5 - farmer.x;
        const dy = hint.row + 0.5 - farmer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 1.1) {
          // Standing next to the ready crop: idle and keep showing the hint
          return prev.map((a) => (a.id === FARMER_ID ? { ...a, targetX: a.x, targetY: a.y, idleUntil: Date.now() + 500 } : a));
        }
        return prev.map((a) =>
          a.id === FARMER_ID
            ? { ...a, targetX: hint.col + 0.5, targetY: hint.row + 0.5, idleUntil: Date.now() + 300, direction: dx > 0 ? 1 : dx < 0 ? -1 : a.direction }
            : a
        );
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Determine if it's night (0.85 to 0.15 range) and play an occasional owl hoot while dark
  const owlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const night = timeOfDay > 0.85 || timeOfDay < 0.15;
    setIsNight(night);
    if (!night) {
      if (owlTimerRef.current) {
        clearTimeout(owlTimerRef.current);
        owlTimerRef.current = null;
      }
      return;
    }
    // Schedule hoots throughout the night at irregular 8-18s intervals
    const scheduleNext = () => {
      if (owlTimerRef.current) clearTimeout(owlTimerRef.current);
      const delay = 8000 + Math.random() * 10000;
      owlTimerRef.current = setTimeout(() => {
        playOwlHoot();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (owlTimerRef.current) clearTimeout(owlTimerRef.current);
    };
    // Re-schedule when the hoot function changes; playOwlHoot is stable on [settings]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOfDay, playOwlHoot]);

  // Calculate night darkness (0 = full day, 0.45 = full night)
  const nightOpacity = useMemo(() => {
    if (timeOfDay >= 0.15 && timeOfDay <= 0.85) return 0;
    if (timeOfDay > 0.85) {
      // Transition from day to night (0.85 -> 1.0)
      return Math.min(0.45, (timeOfDay - 0.85) / 0.15 * 0.45);
    }
    // Transition from night to day (0.0 -> 0.15)
    return Math.max(0, (0.15 - timeOfDay) / 0.15 * 0.45);
  }, [timeOfDay]);

  // Sun/Moon emoji indicator
  const celestialEmoji = timeOfDay > 0.15 && timeOfDay < 0.85 ? "☀️" : "🌙";

  // Find nearest building for NPCs to go home at night
  const nearestBuilding = useCallback(() => {
    let bestDist = Infinity;
    let bestPos = { x: 12, y: 12 };
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col].building !== "none") {
          const dx = col - 12;
          const dy = row - 12;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            bestPos = { x: col, y: row };
          }
        }
      }
    }
    return bestPos;
  }, [grid]);

  const handleNpcTap = useCallback((id: number, type: string, x: number, y: number) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    const msgs = NPC_MESSAGES[type] || NPC_MESSAGES["farmer"];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    setActiveBubble({ id, message: msg, isAnimal: false, x, y });
    bubbleTimerRef.current = setTimeout(() => setActiveBubble(null), 2000);
  }, []);

  const handleAnimalTap = useCallback((id: number, type: string, x: number, y: number) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    const msgs = ANIMAL_MESSAGES[type] || (type === "farmer_3d" ? FARMER_3D_MESSAGES : ANIMAL_MESSAGES["dog"]);
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    setActiveBubble({ id, message: msg, isAnimal: true, x, y });
    bubbleTimerRef.current = setTimeout(() => setActiveBubble(null), 2000);
  }, []);

  // Cleanup bubble timer on unmount
  useEffect(() => {
    return () => { if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current); };
  }, []);

  // --- NPC System ---
  const npcTypes: NpcState["type"][] = ["farmer", "villager_man", "villager_woman", "child"];
  const [npcs, setNpcs] = useState<NpcState[]>(() => {
    // Spawn NPCs at random walkable positions near center
    const initial: NpcState[] = [];
    for (let i = 0; i < NPC_COUNT; i++) {
      // Place near center, find walkable
      let x = 12 + Math.floor(Math.random() * 4);
      let y = 12 + Math.floor(Math.random() * 4);
      initial.push({
        id: i,
        type: npcTypes[i % npcTypes.length],
        x,
        y,
        targetX: x,
        targetY: y,
        idleUntil: Date.now() + Math.random() * 3000,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
    return initial;
  });

  // --- Animal NPCs ---
  const animalTypes: AnimalNpcState["type"][] = ["cow", "chicken", "dog", "farmer_3d"];
  // Playful chase: triggered occasionally; one animal chases another for a few seconds
  const chaseCooldownRef = useRef(20000 + Math.random() * 15000);
  const [animals, setAnimals] = useState<AnimalNpcState[]>(() => {
    const initial: AnimalNpcState[] = [];
    for (let i = 0; i < animalTypes.length; i++) {
      let x = 12 + Math.floor(Math.random() * 4);
      let y = 12 + Math.floor(Math.random() * 4);
      initial.push({
        id: 100 + i,
        type: animalTypes[i % animalTypes.length],
        x,
        y,
        targetX: x,
        targetY: y,
        idleUntil: Date.now() + Math.random() * 3000,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
    return initial;
  });

  // --- Vehicle NPCs (road-only) ---
  const vehicleTypes: VehicleState["type"][] = ["car", "truck", "bus"];
  const [vehicles, setVehicles] = useState<VehicleState[]>([]);

  // Spawn vehicles when roads exist on the map
  useEffect(() => {
    const roadTiles = getRoadTiles(grid);
    if (roadTiles.length === 0) {
      setVehicles([]); // No roads = no vehicles
      return;
    }
    setVehicles((prev) => {
      // Already spawned enough vehicles
      if (prev.length >= VEHICLE_COUNT) return prev;
      const initial: VehicleState[] = [...prev];
      for (let i = prev.length; i < VEHICLE_COUNT; i++) {
        // Pick a random road tile to spawn on
        const roadTile = roadTiles[Math.floor(Math.random() * roadTiles.length)];
        const connected = getConnectedRoads(grid, roadTile.y, roadTile.x);
        let targetX = roadTile.x;
        let targetY = roadTile.y;
        let rotation = 0;
        if (connected.length > 0) {
          const next = connected[Math.floor(Math.random() * connected.length)];
          targetX = next.x;
          targetY = next.y;
          rotation = next.direction;
        }
        initial.push({
          id: 200 + i,
          type: vehicleTypes[i % vehicleTypes.length],
          x: roadTile.x + 0.5,
          y: roadTile.y + 0.5,
          targetX,
          targetY,
          rotation,
        });
      }
      return initial;
    });
  }, [grid]);

  // Vehicle movement tick (only on roads)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setVehicles((prevVehicles) => {
        return prevVehicles.map((v) => {
          if (v.x === v.targetX && v.y === v.targetY) return v;
          const dx = v.targetX - v.x;
          const dy = v.targetY - v.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.15) {
            // Arrived at target, pick next connected road tile
            const row = Math.round(v.y);
            const col = Math.round(v.x);
            const connected = getConnectedRoads(grid, row, col);
            if (connected.length === 0) return v; // No connected roads, stay put
            // Avoid going back to where we came from
            const forward = connected.filter((c) => {
              const prevRow = Math.round(v.y - dy * 3);
              const prevCol = Math.round(v.x - dx * 3);
              return !(c.x === prevCol && c.y === prevRow);
            });
            const candidates = forward.length > 0 ? forward : connected;
            const next = candidates[Math.floor(Math.random() * candidates.length)];
            return {
              ...v,
              targetX: next.x,
              targetY: next.y,
              rotation: next.direction,
              idleUntil: now + VEHICLE_IDLE_TIME,
            };
          }
          // Move toward target
          const speed = VEHICLE_WALK_SPEED * 0.1;
          const moveX = (dx / dist) * speed;
          const moveY = (dy / dist) * speed;
          return {
            ...v,
            x: v.x + moveX,
            y: v.y + moveY,
          };
        });
      });
    }, 100);
    return () => clearInterval(interval);
  }, [grid]);

  // NPC movement tick (runs every ~100ms for smooth walking)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const isRainyNow = weather === "rainy";

      // Update human NPCs
      setNpcs((prevNpcs) => {
        const isNightNow = timeOfDay > 0.85 || timeOfDay < 0.15;
        return prevNpcs.map((npc) => {
          if (now < npc.idleUntil) return npc;
          const dx = npc.targetX - npc.x;
          const dy = npc.targetY - npc.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.15) {
            // At night, NPCs walk toward nearest building instead of random
            if (isNightNow) {
              const homePos = nearestBuilding();
              const hdx = homePos.x - npc.x;
              const hdy = homePos.y - npc.y;
              const homeDist = Math.sqrt(hdx * hdx + hdy * hdy);
              if (homeDist > 0.5) {
                return {
                  ...npc,
                  targetX: homePos.x,
                  targetY: homePos.y,
                  idleUntil: now + 300, // Keep moving toward home
                  direction: hdx > 0 ? 1 : hdx < 0 ? -1 : npc.direction,
                };
              }
              // Near home, idle at night
              return { ...npc, idleUntil: now + 3000 };
            }
            const target = pickRandomWalkableTile(grid, npc.x, npc.y);
            if (target) {
              return {
                ...npc,
                targetX: target.x,
                targetY: target.y,
                idleUntil: now + NPC_IDLE_TIME,
                direction: target.x > npc.x ? 1 : target.x < npc.x ? -1 : npc.direction,
              };
            }
            return { ...npc, idleUntil: now + 2000 };
          }
          // Weather: humans walk slower in rain
          const speedMult = isRainyNow ? 0.5 : 1.0;
          const speed = NPC_WALK_SPEED * 0.1 * speedMult;
          const moveX = (dx / dist) * speed;
          const moveY = (dy / dist) * speed;
          return {
            ...npc,
            x: npc.x + moveX,
            y: npc.y + moveY,
            direction: moveX > 0.01 ? 1 : moveX < -0.01 ? -1 : npc.direction,
          };
        });
      });

      // Playful chase trigger: only during day, clear of rain/placement, with 2+ animals
      const placementActive = tappedFarmlandPos !== null;
      if (!placementActive && !isNight && !isRainyNow) {
        chaseCooldownRef.current -= 100;
        if (chaseCooldownRef.current <= 0) {
          chaseCooldownRef.current = 20000 + Math.random() * 20000;
          setAnimals((prevAnimals) => {
            const dayAnimals = prevAnimals.filter((a) => !a.chaseRole);
            if (dayAnimals.length < 2) return prevAnimals;
            const chaserIdx = Math.floor(Math.random() * dayAnimals.length);
            const chaseeIdx = (chaserIdx + 1 + Math.floor(Math.random() * (dayAnimals.length - 1))) % dayAnimals.length;
            const chaser = dayAnimals[chaserIdx];
            const chasee = dayAnimals[chaseeIdx];
            const endsAt = Date.now() + 3500;
            return prevAnimals.map((a) => {
              if (a.id === chaser.id) return { ...a, chaseRole: "chaser", chaseTargetId: chasee.id, chaseEndsAt: endsAt };
              if (a.id === chasee.id) return { ...a, chaseRole: "chasee", chaseTargetId: chaser.id, chaseEndsAt: endsAt };
              return a;
            });
          });
        }
      } else {
        // Placement/rain simply delay the chase cooldown
        chaseCooldownRef.current -= 50;
        if (chaseCooldownRef.current < 0) chaseCooldownRef.current = 0;
      }

      // Update animal NPCs
      setAnimals((prevAnimals) => {
        // Sleep bookkeeping: dusk -> walk to bed; dawn -> wake up + ring the farm bell
        const nightNow = timeOfDay > 0.85 || timeOfDay < 0.15;
        if (nightNow) {
          prevAnimals.forEach((animal) => {
            if (animal.sleeping) return;
            if (!animal.bedX && !animal.bedY) {
              // Assign bed: nearest placed building, else grid center
              let bx = 12;
              let by = 12;
              let best = Infinity;
              for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                  if (grid[row][col].building !== "none") {
                    const d = (col - animal.x) ** 2 + (row - animal.y) ** 2;
                    if (d < best) {
                      best = d;
                      bx = col;
                      by = row;
                    }
                  }
                }
              }
              animal.bedX = bx + 0.5;
              animal.bedY = by + 0.5;
            }
          });
        } else if (prevAnimals.some((a) => a.sleeping)) {
          // Dawn: wake everyone up and ring the morning bell once
          playMorningBell();
          setAnimals((prev) => prev.map((a) => (a.sleeping ? { ...a, sleeping: false, idleUntil: Date.now() } : a)));
        }
        return prevAnimals.map((animal) => {
          // End chase when time's up
          if (animal.chaseRole && animal.chaseEndsAt && now >= animal.chaseEndsAt) {
            return { ...animal, chaseRole: undefined, chaseTargetId: undefined, chaseEndsAt: undefined, idleUntil: now + ANIMAL_IDLE_TIME };
          }
          if (animal.sleeping) {
            // Asleep at the bed: don't wander, just idle in place
            return { ...animal, idleUntil: now + 5000 };
          }
          // Dusk: walk toward the bed before sleeping
          if (nightNow && animal.bedX !== undefined && animal.bedY !== undefined) {
            const dxToBed = animal.bedX - animal.x;
            const dyToBed = animal.bedY - animal.y;
            const distToBed = Math.sqrt(dxToBed * dxToBed + dyToBed * dyToBed);
            if (distToBed < 0.4) {
              return { ...animal, sleeping: true, targetX: animal.bedX, targetY: animal.bedY, idleUntil: now + 5000 };
            }
            return {
              ...animal,
              targetX: animal.bedX,
              targetY: animal.bedY,
              idleUntil: now + 200,
              direction: dxToBed > 0 ? 1 : dxToBed < 0 ? -1 : animal.direction,
            };
          }
          if (now < animal.idleUntil) return animal;
          const dx = animal.targetX - animal.x;
          const dy = animal.targetY - animal.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.15) {
            if (animal.chaseRole === "chaser") {
              // Chaser that has caught up keeps its target in range by idling briefly (chasee will dart away)
              return { ...animal, idleUntil: now + 400 };
            }
            const target = pickRandomWalkableTile(grid, animal.x, animal.y);
            if (target) {
              return {
                ...animal,
                targetX: target.x,
                targetY: target.y,
                idleUntil: now + ANIMAL_IDLE_TIME,
                direction: target.x > animal.x ? 1 : target.x < animal.x ? -1 : animal.direction,
              };
            }
            return { ...animal, idleUntil: now + 2000 };
          }
          // Weather: animals stop moving during rain (hide under trees/buildings)
          if (isRainyNow) {
            return { ...animal, idleUntil: now + 10000 };
          }
          let speed = ANIMAL_WALK_SPEED * 0.1;
          let chaseeDartX = dx;
          let chaseeDartY = dy;
          if (animal.chaseRole) {
            const other = prevAnimals.find((a) => a.id === animal.chaseTargetId);
            if (!other) {
              return { ...animal, chaseRole: undefined, chaseTargetId: undefined, chaseEndsAt: undefined };
            }
            if (animal.chaseRole === "chaser") {
              // Chase: run straight at the chasee at 3x speed
              speed = ANIMAL_WALK_SPEED * 0.3;
              chaseeDartX = other.x - animal.x;
              chaseeDartY = other.y - animal.y;
            } else {
              // Chasee: dart away from the chaser at 2x speed
              speed = ANIMAL_WALK_SPEED * 0.2;
              chaseeDartX = animal.x - other.x;
              chaseeDartY = animal.y - other.y;
            }
          }
          const moveX = (chaseeDartX / dist) * speed;
          const moveY = (chaseeDartY / dist) * speed;
          return {
            ...animal,
            x: animal.x + moveX,
            y: animal.y + moveY,
            direction: moveX > 0.01 ? 1 : moveX < -0.01 ? -1 : animal.direction,
          };
        });
      });
    }, 100);
    return () => clearInterval(interval);
  }, [grid, timeOfDay, isNight, nearestBuilding, weather, tappedFarmlandPos]);

  // Mirrored cursor preview (web): track pointer position for the preview overlay
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const handlePointerMove = useCallback((e: any) => {
    // On web, capture pointer position relative to the map container for the cursor preview
    const locX = e.nativeEvent?.locationX;
    const locY = e.nativeEvent?.locationY;
    if (typeof locX === "number" && typeof locY === "number") {
      setCursorPos({ x: locX, y: locY });
    }
  }, []);
  const handlePointerLeave = useCallback(() => {
    setCursorPos(null);
  }, []);

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
            // Cancel any running long-press pickup timer only when the map actually moves
            runOnJS(cancelPressTimerRef.current)();
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
    let removedFlag = false;
    setGrid((prev) => {
      const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        const cell = newGrid[row][col];
        // Pick up whatever is there into clipboard for moving
        if (cell.building !== "none") {
          setMoveClipboard({ type: "building", buildingType: cell.building, origCol: col, origRow: row });
          setPickupMessage("Item picked up! Tap a tile to shift it, or remove it.");
          newGrid[row][col].building = "none";
          removedFlag = true;
        } else if (cell.roadOverlay) {
          setMoveClipboard({ type: "road", roadType: cell.roadOverlay, roadRotation: cell.roadRotation, origCol: col, origRow: row });
          setPickupMessage("Road picked up! Tap a tile to shift it, or remove it.");
          newGrid[row][col].roadOverlay = null;
          newGrid[row][col].roadRotation = 0;
          removedFlag = true;
        } else if (cell.grassOverlay) {
          setMoveClipboard({ type: "grass", origCol: col, origRow: row });
          setPickupMessage("Decoration picked up! Tap a tile to shift it, or remove it.");
          newGrid[row][col].grassOverlay = false;
          removedFlag = true;
        } else {
          // Tapping elsewhere while holding cancels the picked item
          setMoveClipboard(null);
          setPickupMessage(null);
        }
        // Sell refund: every pickup refunds 50 coins (item removed from map)
        if (cell.building !== "none" || cell.roadOverlay || cell.grassOverlay) {
          setCoins((c) => c + SELL_REFUND);
          setShowSellMsg(true);
          setTimeout(() => setShowSellMsg(false), 2000);
        }
      }
      return newGrid;
    });
    // Dust cloud + distinct whoosh sound whenever an item actually leaves the map
    if (removedFlag) triggerRemovalDustAnimation(col, row);
  }, [triggerRemovalDustAnimation]);

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
        runOnJS(playPopEffect)();
        runOnJS(triggerPopAnimation)(col, row);
      }
    }, STEP);
  }, [handleRemoveBuilding, cancelPressTimer]);

  // Pop sound + haptic feedback when the progress bar fully completes
  const playPopEffect = useCallback(() => {
    if (Platform.OS !== "web" && settings.haptics) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        // haptics unavailable, ignore
      }
    }
  }, [settings.haptics]);

  // Small pop animation at the picked-up tile: quick scale bounce + fade out
  const triggerPopAnimation = useCallback((col: number, row: number) => {
    setPopCol(col);
    setPopRow(row);
    popOpacity.value = 1;
    popScale.value = withSequence(
      withTiming(1.3, { duration: 120, easing: Easing.out(Easing.back(1.7)) }),
      withDelay(80, withTiming(0.4, { duration: 220, easing: Easing.inOut(Easing.cubic) }))
    );
    popOpacity.value = withDelay(320, withTiming(0, { duration: 150 }));
    // clear the pop marker after the animation ends
    setTimeout(() => {
      setPopCol(null);
      setPopRow(null);
    }, 550);
  }, [popOpacity, popScale]);

  // Celebration pop effect reused for other success moments (e.g. task reward claim)
  const playClaimPopEffect = useCallback(() => {
    if (Platform.OS !== "web" && settings.haptics) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        // haptics unavailable, ignore
      }
    }
  }, [settings.haptics]);

  const triggerClaimPopAnimation = useCallback(() => {
    setClaimPopActive(true);
    claimPopOpacity.value = 1;
    claimPopScale.value = withSequence(
      withTiming(1.3, { duration: 120, easing: Easing.out(Easing.back(1.7)) }),
      withDelay(80, withTiming(0.4, { duration: 220, easing: Easing.inOut(Easing.cubic) }))
    );
    claimPopOpacity.value = withDelay(320, withTiming(0, { duration: 150 }));
    setTimeout(() => {
      setClaimPopActive(false);
    }, 550);
  }, [claimPopOpacity, claimPopScale]);

  // Handle farmland tile tap: opens crop selector for placing emoji crops on farmland
  const handleFarmlandTap = useCallback((col: number, row: number) => {
    if (Platform.OS !== "web" && panMoved.current) return;
    setTappedFarmlandPos({ col, row });
  }, []);

  // Handle crop selection from farmland tap (places crop on the tapped tile)
  const handleCropSelectFromTap = useCallback((crop: CropType) => {
    setSelectedCropType(crop);
    if (!tappedFarmlandPos) return;
    setGrid((prev) => {
      const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
      const { col, row } = tappedFarmlandPos;
      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        const cropAsBuilding = crop as BuildingType;
        if (newGrid[row][col].building !== cropAsBuilding) {
          newGrid[row][col].building = cropAsBuilding;
          newGrid[row][col].roadOverlay = null;
          newGrid[row][col].cropGrowthStage = 0;
          if (coins < ITEM_COST) flashLowCoins();
          setCoins((c) => Math.max(0, c - ITEM_COST));
        }
      }
      return newGrid;
    });
    setTappedFarmlandPos(null);
  }, [tappedFarmlandPos, coins, flashLowCoins]);

  // Handle tile/building placement
  const handleTilePress = useCallback(
    (col: number, row: number) => {
      if (Platform.OS !== "web" && panMoved.current) return;
      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
        if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
          // Building chat: tapping a placed community building opens a conversation
          // with its assigned character (only when not in community placement mode).
          // In community mode, tap keeps its existing select/remove toggle behavior.
          const tappedBuilding = newGrid[row][col].building;
          if (mode !== "community" && tappedBuilding !== "none" && BUILDING_CHAT_NPCS[tappedBuilding]) {
            const npc = BUILDING_CHAT_NPCS[tappedBuilding];
            // Brief hover tooltip showing character name + profession before the chat opens
            showBuildingTooltip(tappedBuilding, col, row);
            setChatPanel({
              buildingType: tappedBuilding,
              messages: [{ from: "npc", text: npc.opening }],
              userReplied: false,
            });
            if (Platform.OS !== "web" && settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            return newGrid; // no grid change
          }
          // Farm/industry production popup: tapping a placed farm or factory building opens the
          // Goathed-style production popup to cycle products and collect goods (outside placement modes).
          if (mode !== "farm" && mode !== "industry" && tappedBuilding !== "none" && (FARM_PRODUCTIONS[tappedBuilding] || INDUSTRY_PRODUCTIONS[tappedBuilding])) {
            openFarmPopup(tappedBuilding, col, row);
            return newGrid; // no grid change
          }
          if (mode === "tile") {
            // If we have a picked-up object, place it here
            if (moveClipboard) {
              if (newGrid[row][col].tile === "grass" || newGrid[row][col].tile === "dirt") {
                if (moveClipboard.type === "building") {
                  newGrid[row][col].building = moveClipboard.buildingType || "none";
                  newGrid[row][col].roadOverlay = null;
                  newGrid[row][col].cropGrowthStage = 0; // Reset growth for moved items
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
                  newGrid[row][col].cropGrowthStage = 0; // Reset growth for moved items
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
            } else {
              // Grass overlay removed — dust cloud + whoosh
              triggerRemovalDustAnimation(col, row);
            }
          } else if (mode === "road") {
            // Road mode: road PNG overlays ON grass tile (grass stays underneath)
            // For corner roads, cycle rotation 0→90→180→270 on each tap
            const roadToPlace = selectedRoadType as RoadType;
            if (newGrid[row][col].roadOverlay === roadToPlace && roadToPlace !== "road_corner") {
              newGrid[row][col].roadOverlay = null;
              newGrid[row][col].roadRotation = 0;
              // Dust cloud + whoosh on road removal (toggle off)
              triggerRemovalDustAnimation(col, row);
            } else if (newGrid[row][col].roadOverlay === roadToPlace && roadToPlace === "road_corner") {
              // Rotate corner by 90 degrees
              newGrid[row][col].roadRotation = (newGrid[row][col].roadRotation + 90) % 360;
            } else {
              newGrid[row][col].roadOverlay = roadToPlace;
              newGrid[row][col].roadRotation = 0;
              newGrid[row][col].flipped = mirrorMode;
              if (coins < ITEM_COST) flashLowCoins();
              setCoins((c) => Math.max(0, c - ITEM_COST));
              // Celebration pop + subtle sound on successful road placement
              triggerPlacePopAnimation(col, row);
            }
          } else if (mode === "tiles") {
            // Tiles mode: apply the selected tile texture to this tile
            const textureToPlace = selectedTileType;
            if (newGrid[row][col].tile === "grass" || newGrid[row][col].tile === "dirt") {
              // If user selected farmland texture, place a crop on it
              if (textureToPlace === "farmland") {
                // Place the selected crop as a building on the farmland tile
                newGrid[row][col].tileTexture = "farmland";
                const cropAsBuilding = selectedCropType as BuildingType;
                if (newGrid[row][col].building !== cropAsBuilding) {
                  newGrid[row][col].building = cropAsBuilding;
                  newGrid[row][col].roadOverlay = null;
                  newGrid[row][col].cropGrowthStage = 0; // Reset growth to stage 1 (seedling)
                  if (coins < ITEM_COST) flashLowCoins();
                  setCoins((c) => Math.max(0, c - ITEM_COST));
                  // Celebration pop + subtle sound on successful crop planting
                  triggerPlacePopAnimation(col, row);
                }
              } else {
                // Regular tile texture change
                if (newGrid[row][col].tileTexture !== textureToPlace) {
                  if (coins < ITEM_COST) flashLowCoins();
                  setCoins((c) => Math.max(0, c - ITEM_COST));
                }
                newGrid[row][col].tileTexture = textureToPlace;
              }
            }
          } else if (mode === "community" || mode === "temple" || mode === "decoration" || mode === "industry" || mode === "farm" || mode === "house_small" || mode === "house_big" || mode === "town_market" || mode === "tree") {
            // If we have a picked-up object, place it here first
            if (moveClipboard) {
              if (newGrid[row][col].tile === "grass" || newGrid[row][col].tile === "dirt") {
                if (moveClipboard.type === "building") {
                  newGrid[row][col].building = moveClipboard.buildingType || "none";
                  newGrid[row][col].roadOverlay = null;
                  newGrid[row][col].cropGrowthStage = 0; // Reset growth for moved items
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
              let removedItem = false;
              if (mode === "community") {
                // Community building mode: use selectedCommunityType (the user's chosen community building)
                const buildingToPlace = selectedCommunityType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                  removedItem = true;
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  newGrid[row][col].flipped = mirrorMode;
                  placedNewBuilding = true;
                }
              } else if (mode === "town_market") {
                if (currentBuilding === "town_market") {
                  newGrid[row][col].building = "none";
                  removedItem = true;
                } else {
                  newGrid[row][col].building = "town_market";
                  newGrid[row][col].flipped = mirrorMode;
                  placedNewBuilding = true;
                }
              } else if (mode === "temple") {
                // Temple mode: place the user's selected temple type
                const buildingToPlace = selectedTempleType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                  removedItem = true;
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  newGrid[row][col].flipped = mirrorMode;
                  placedNewBuilding = true;
                }
              } else if (mode === "decoration") {
                // Decoration mode: place the user's selected decoration type
                const buildingToPlace = selectedDecorationType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                  removedItem = true;
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  newGrid[row][col].flipped = mirrorMode;
                  placedNewBuilding = true;
                }
              } else if (mode === "industry") {
                // Industry mode: place the user's selected factory type
                const buildingToPlace = selectedIndustryType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                  removedItem = true;
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  newGrid[row][col].flipped = mirrorMode;
                  placedNewBuilding = true;
                }
              } else if (mode === "farm") {
                // Farm mode: place the user's selected farm building type
                const buildingToPlace = selectedFarmType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                  removedItem = true;
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  newGrid[row][col].flipped = mirrorMode;
                  placedNewBuilding = true;
                }
              } else if (mode === "tree") {
                // Tree mode: place the user's selected tree type
                if (currentBuilding === selectedTreeType) {
                  newGrid[row][col].building = "none";
                  removedItem = true;
                } else {
                  newGrid[row][col].building = selectedTreeType;
                  newGrid[row][col].flipped = mirrorMode;
                  placedNewBuilding = true;
                }
              } else {
                // house_small or house_big mode: use selectedHouseType (the user's chosen house)
                const buildingToPlace = selectedHouseType as BuildingType;
                if (currentBuilding === buildingToPlace) {
                  newGrid[row][col].building = "none";
                  removedItem = true;
                } else {
                  newGrid[row][col].building = buildingToPlace;
                  newGrid[row][col].flipped = mirrorMode;
                  placedNewBuilding = true;
                }
              }
              // Placing a NEW item costs 100 coins; removing/toggling off is free
              if (placedNewBuilding) {
                if (coins < ITEM_COST) flashLowCoins();
                setCoins((c) => Math.max(0, c - ITEM_COST));
                // Celebration pop + subtle sound on successful new placement
                triggerPlacePopAnimation(col, row);
              } else if (removedItem) {
                // Dust cloud + distinct whoosh sound on free removal (toggle off)
                triggerRemovalDustAnimation(col, row);
              }
            }
          }
        }
        return newGrid;
      });
      // Daily tasks: refresh progress against the new grid (after placement)
      advanceDailyTasks();
    },
    [mode, selectedTreeType, selectedHouseType, selectedCommunityType, selectedRoadType, selectedTileType, selectedTempleType, selectedDecorationType, selectedIndustryType, selectedFarmType, moveClipboard, mirrorMode, triggerPlacePopAnimation, triggerRemovalDustAnimation]
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
      playClaimPopEffect();
      triggerClaimPopAnimation();
      return updated;
    });
  }, [playClaimPopEffect, triggerClaimPopAnimation]);

  // Render ALL tiles (including grass tiles with individual PNG) - NO long-press on tiles, only short press
  const tiles = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.tile === "none") continue;
        // Check if this is the snap preview tile
        const isSnapPreview = snapPreviewTile !== null && snapPreviewTile.col === col && snapPreviewTile.row === row;
        elements.push(
          <View key={`tile-${row}-${col}`}>
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: gridToScreen(col, row, currentScale).x - (TILE_SIZE * currentScale) / 2,
                top: gridToScreen(col, row, currentScale).y - (TILE_SIZE * currentScale) / 2,
                width: TILE_SIZE * currentScale,
                height: TILE_SIZE * currentScale,
                zIndex: 1,
              }}
            >
              <Image
                source={TILE_TEXTURE_SOURCES[cell.tileTexture] || GRASS_TILE_PNG}
                style={{ width: "100%", height: "100%" }}
                resizeMode="stretch"
              />
            </View>
            {/* Snap preview highlight */}
            {isSnapPreview && moveClipboard && cell.building === "none" && cell.roadOverlay === null && (
              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: gridToScreen(col, row, currentScale).x - (TILE_SIZE * currentScale) / 2,
                  top: gridToScreen(col, row, currentScale).y - (TILE_SIZE * currentScale) / 2,
                  width: TILE_SIZE * currentScale,
                  height: TILE_SIZE * currentScale,
                  zIndex: 15,
                  backgroundColor: "rgba(255, 255, 100, 0.4)",
                  borderWidth: 2,
                  borderColor: "rgba(255, 200, 0, 0.8)",
                  borderRadius: 4,
                  opacity: snapOpacity,
                }}
              />
            )}
          </View>
        );
      }
    }
    return elements;
  }, [grid, currentScale, snapPreviewTile, moveClipboard, snapOpacity]);

  // Render NPCs (walking characters on the map)
  const npcSprites = useMemo(() => {
    return npcs.map((npc) => (
      <NpcSprite key={`npc-${npc.id}`} npc={npc} scale={currentScale} onTap={handleNpcTap} />
    ));
  }, [npcs, currentScale, handleNpcTap]);

  // Render Animal NPCs (walking animals on the map)
  const animalSprites = useMemo(() => {
    return animals.map((animal) => (
      <AnimalSprite key={`animal-${animal.id}`} animal={animal} scale={currentScale} onTap={handleAnimalTap} />
    ));
  }, [animals, currentScale, handleAnimalTap]);

  // Render Vehicle NPCs (road-following cars/trucks)
  const vehicleSprites = useMemo(() => {
    return vehicles.map((vehicle) => (
      <VehicleSprite key={`vehicle-${vehicle.id}`} vehicle={vehicle} scale={currentScale} />
    ));
  }, [vehicles, currentScale]);

  // Render buildings (top layer, sorted by row then col for proper z-ordering)
  // Buildings now have 5s long-press for move/remove
  const buildings = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.building === "none") continue;
        const isPressed = pressTarget !== null && pressTarget.col === col && pressTarget.row === row;
        elements.push(
          <View key={`bld-wrap-${row}-${col}`}>
            <BuildingOnTile col={col} row={row} buildingType={cell.building} scale={currentScale} flipped={cell.flipped || false} growthStage={cell.cropGrowthStage ?? 0} />
            {/* Long-press hit area for item selection */}
            <TouchableOpacity
              activeOpacity={0.3}
              delayLongPress={5000}
              style={{
                position: "absolute",
                left: gridToScreen(col, row, currentScale).x - (TILE_SIZE * currentScale) / 2,
                top: gridToScreen(col, row, currentScale).y - (TILE_SIZE * currentScale) / 2,
                width: TILE_SIZE * currentScale,
                height: TILE_SIZE * currentScale,
                zIndex: 20,
              }}
              onPressIn={() => startPressTimer(col, row, true)}
              onPressOut={() => cancelPressTimer()}
              onPress={() => {
                // Triple-tap flip: if same tile tapped 3 times within 400ms, flip it
                const now = Date.now();
                const prev = tripleTapRef.current;
                if (prev.col === col && prev.row === row && prev.count === 2 && prev.timer && now - (prev as any).lastTap < 400) {
                  // Flip this item!
                  if (prev.timer) clearTimeout(prev.timer);
                  tripleTapRef.current = { col: -1, row: -1, count: 0, timer: null, lastTap: 0 };
                  setGrid((g) => {
                    const newGrid = g.map((r) => r.map((c) => ({ ...c })));
                    newGrid[row][col].flipped = !newGrid[row][col].flipped;
                    return newGrid;
                  });
                  // Haptic feedback
                  if (Platform.OS !== "web" && settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } else if (prev.col === col && prev.row === row && prev.count < 2) {
                  // Increment count
                  const lastTap = now;
                  tripleTapRef.current = { col, row, count: prev.count + 1, timer: setTimeout(() => {
                    tripleTapRef.current = { col: -1, row: -1, count: 0, timer: null, lastTap: 0 };
                  }, 400), lastTap };
                  handleTilePress(col, row);
                } else {
                  // New tap sequence
                  const lastTap = now;
                  if (tripleTapRef.current.timer) clearTimeout(tripleTapRef.current.timer);
                  tripleTapRef.current = { col, row, count: 1, timer: setTimeout(() => {
                    tripleTapRef.current = { col: -1, row: -1, count: 0, timer: null, lastTap: 0 };
                  }, 400), lastTap };
                  handleTilePress(col, row);
                }
              }}
              onLongPress={() => handleRemoveBuilding(col, row)}
            >
              {isPressed && (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "10%",
                    width: "80%",
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  <View
                    style={{
                      width: `${pressProgress}%`,
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: "#FF8C00",
                    }}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        );
      }
    }
    return elements;
  }, [grid, currentScale, pressTarget, pressProgress, startPressTimer, cancelPressTimer, handleTilePress, handleRemoveBuilding]);

  // Hit areas for grass/dirt tiles (these tiles have pointerEvents="none" so they need separate touch handlers)
  const grassHitAreas = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        // Only create hit areas for grass/dirt tiles
        if (cell.tile !== "grass" && cell.tile !== "dirt") continue;
        // Farmland tiles: tap opens crop selector (acts like a button) - even if they have a crop on them
        const isFarmland = cell.tileTexture === "farmland";
        // Farmland with a crop building: skip normal hit area, will use separate farmlandCropHitAreas
        const hasCropBuilding = isFarmland && cell.building !== "none" && CROP_EMOJIS[cell.building as CropType];
        if (cell.building !== "none" && !hasCropBuilding) continue; // Skip tiles with non-crop buildings
        const pos = gridToScreen(col, row, currentScale);
        const ts = TILE_SIZE * currentScale;
        if (isFarmland) {
          // Farmland tiles: tap opens crop selector (acts like a button)
          elements.push(
            <TouchableOpacity key={`grass-${row}-${col}`} activeOpacity={0.3} delayLongPress={5000}
              style={{ position: "absolute", left: pos.x - ts / 2, top: pos.y - ts / 2, width: ts, height: ts, zIndex: 3 }}
              onPress={() => handleFarmlandTap(col, row)}
              onLongPress={() => handleRemoveBuilding(col, row)}
              onPressIn={() => startPressTimer(col, row, true)}
              onPressOut={() => cancelPressTimer()} />
          );
        } else {
          // Regular grass tiles: tap places items based on current mode
          elements.push(
            <TouchableOpacity key={`grass-${row}-${col}`} activeOpacity={0.3} delayLongPress={5000}
              style={{ position: "absolute", left: pos.x - ts / 2, top: pos.y - ts / 2, width: ts, height: ts, zIndex: 2 }}
              onPress={() => handleTilePress(col, row)}
              onLongPress={() => handleRemoveBuilding(col, row)}
              onPressIn={() => startPressTimer(col, row, true)}
              onPressOut={() => cancelPressTimer()} />
          );
        }
      }
    }
    return elements;
  }, [grid, currentScale, handleTilePress, handleRemoveBuilding, startPressTimer, cancelPressTimer, handleFarmlandTap]);

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
              {grassHitAreas}
              {emptyHitAreas}
              {/* Grass overlays rendered between tiles and buildings */}
              {grassOverlays}
              {/* Road overlays rendered on top of grass tiles */}
              {roadOverlays}
              {buildings}
              {/* NPCs: walking characters on the map */}
              {npcSprites}
              {/* Animal NPCs: walking animals */}
              {animalSprites}
              {/* Vehicle NPCs: cars/trucks driving on roads */}
              {vehicleSprites}
              {/* Mirrored cursor preview (web): semi-transparent flipped item following the pointer */}
              {cursorPos && mirrorMode && mode !== "tile" && mode !== "grass_plant" && !moveClipboard && (() => {
                let previewSrc: number | null = null;
                const placementModes: string[] = ["community", "temple", "decoration", "industry", "farm", "tree", "house_small", "house_big", "town_market", "road", "tiles"];
                if (placementModes.includes(mode)) {
                  if (mode === "community") previewSrc = selectedCommunityType ? (COMMUNITY_SOURCES as any)[selectedCommunityType] ?? null : null;
                  else if (mode === "temple") previewSrc = selectedTempleType ? (TEMPLE_SOURCES as any)[selectedTempleType] ?? null : null;
                  else if (mode === "decoration") previewSrc = selectedDecorationType ? (DECORATION_SOURCES as any)[selectedDecorationType] ?? null : null;
                  else if (mode === "industry") previewSrc = selectedIndustryType ? (INDUSTRY_SOURCES as any)[selectedIndustryType] ?? null : null;
                  else if (mode === "farm") previewSrc = selectedFarmType ? (FARM_SOURCES as any)[selectedFarmType] ?? null : null;
                  else if (mode === "tree") previewSrc = selectedTreeType ? (TREE_SOURCES as any)[selectedTreeType] ?? TREE_PNG : null;
                  else if (mode === "road") previewSrc = selectedRoadType ? (ROAD_SOURCES as any)[selectedRoadType] ?? ROAD_STRAIGHT_PNG : null;
                  else if (mode === "tiles") {
                    if (selectedTileType === "farmland") previewSrc = null; // crop preview uses emoji below
                    else previewSrc = (TILE_TEXTURE_SOURCES as any)[selectedTileType] ?? null;
                  }
                  else previewSrc = selectedHouseType ? (HOUSE_SOURCES as any)[selectedHouseType] ?? HOUSE_PNG : null;
                }
                // Crop preview: render the selected crop emoji (crops are emoji-based, not PNG sprites)
                const cropEmojiPreview = mode === "tiles" && selectedTileType === "farmland" ? (CROP_EMOJIS as any)[selectedCropType] ?? null : null;
                if (!previewSrc && !cropEmojiPreview) return null;
                // Convert pointer coords (map container space) to grid coords
                const halfMap = (GRID_SIZE * TILE_SIZE) / 2;
                const gx = (cursorPos.x - halfMap + offsetX.value + halfMap) / (TILE_SIZE * currentScale) + (GRID_SIZE / 2 - 0.5);
                const gy = (cursorPos.y - halfMap + offsetY.value + halfMap) / (TILE_SIZE * currentScale) + (GRID_SIZE / 2 - 0.5);
                const snapCol = Math.round(gx);
                const snapRow = Math.round(gy);
                const inBounds = snapCol >= 0 && snapCol < GRID_SIZE && snapRow >= 0 && snapRow < GRID_SIZE;
                const pos = gridToScreen(inBounds ? snapCol : gx, inBounds ? snapRow : gy, currentScale);
                return cropEmojiPreview ? (
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      width: TILE_SIZE * currentScale * 0.9,
                      height: TILE_SIZE * currentScale * 0.9,
                      left: pos.x - (TILE_SIZE * currentScale * 0.9) / 2,
                      top: pos.y - (TILE_SIZE * currentScale * 0.9) / 2,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.55,
                      transform: [{ scaleX: -1 }],
                      zIndex: 60,
                    }}
                  >
                    <Text style={{ fontSize: TILE_SIZE * currentScale * 0.6 }}>{cropEmojiPreview}</Text>
                  </View>
                ) : (
                  <Image
                    source={previewSrc}
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      width: TILE_SIZE * currentScale * 0.9,
                      height: TILE_SIZE * currentScale * 0.9,
                      left: pos.x - (TILE_SIZE * currentScale * 0.9) / 2,
                      top: pos.y - (TILE_SIZE * currentScale * 0.9) / 2,
                      opacity: 0.55,
                      transform: [{ scaleX: -1 }],
                      zIndex: 60,
                    }}
                    resizeMode="contain"
                  />
                );
              })()}
              {/* Night overlay: dark blue tint during nighttime */}
              {nightOpacity > 0 && (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: `rgba(15, 20, 50, ${nightOpacity})`,
                    zIndex: 100,
                  }}
                />
              )}
              {/* Weather overlay (cloudy/rainy tint) */}
              {weatherOverlayOpacity > 0 && (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: weather === "rainy" ? "rgba(100, 120, 150, 0.25)" : "rgba(150, 160, 170, 0.15)",
                    zIndex: 99,
                  }}
                />
              )}
              {/* Rain drops */}
              {weather === "rainy" && rainDrops.map((drop) => (
                <View
                  key={drop.id}
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: `${drop.x}%`,
                    top: `${drop.y}%`,
                    width: 2,
                    height: 12,
                    backgroundColor: `rgba(170, 200, 255, ${drop.opacity})`,
                    borderRadius: 1,
                    zIndex: 150,
                  }}
                />
              ))}
              {/* Speech bubble for tapped NPC/animal */}
              {activeBubble && (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: gridToScreen(activeBubble.x, activeBubble.y, currentScale).x - 60,
                    top: gridToScreen(activeBubble.x, activeBubble.y, currentScale).y - 65,
                    zIndex: 200,
                  }}
                >
                  <View style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", textAlign: "center" }}>
                      {activeBubble.message}
                    </Text>
                  </View>
                  {/* Bubble tail */}
                  <View style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 6,
                    borderRightWidth: 6,
                    borderTopWidth: 8,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderTopColor: "white",
                    alignSelf: "center",
                    marginTop: 2,
                  }} />
                </View>
              )}
              {/* Pop animation: small scale bounce + sparkle shown when the 5s bar fills */}
              {popCol !== null && popRow !== null && (
                <PickupPop
                  col={popCol}
                  row={popRow}
                  scale={currentScale}
                  scaleValue={popScale}
                  opacityValue={popOpacity}
                />
              )}
              {/* Farmer task-helper: harvest hint bubble above a ready crop */}
              {farmerHintBubble.value && (
                <FarmerHintBubble
                  key={`hint-${farmerHintBubble.value.col}-${farmerHintBubble.value.row}`}
                  col={farmerHintBubble.value.col}
                  row={farmerHintBubble.value.row}
                  scale={currentScale}
                  message={farmerHintRef.current?.message || "Harvest karo! 🌾"}
                  opacityValue={farmerHintBubble}
                />
              )}
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>

      {/* Time of Day indicator (sun/moon) */}
      <View style={{
        position: "absolute",
        top: 8,
        right: 12,
        zIndex: 250,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}>
        <Text style={{ fontSize: 22 }}>{celestialEmoji}</Text>
      </View>

      {/* Weather indicator */}
      <View style={{
        position: "absolute",
        top: 8,
        right: 60,
        zIndex: 250,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}>
        <Text style={{ fontSize: 22 }}>{weatherEmoji}</Text>
      </View>

      {/* Clipboard Indicator Bar (shown when an item is picked up via long press) */}
      {moveClipboard && (
        <View style={styles.clipboardBar}>
          <View style={styles.clipboardPreview}>
            {moveClipboard.type === "building" && moveClipboard.buildingType ? (
              CROP_EMOJIS[moveClipboard.buildingType] ? (
                <Text style={{ fontSize: 28 }}>{CROP_EMOJIS[moveClipboard.buildingType]}</Text>
              ) : (
                <Image
                  source={COMMUNITY_SOURCES[moveClipboard.buildingType] || TEMPLE_SOURCES[moveClipboard.buildingType] || DECORATION_SOURCES[moveClipboard.buildingType] || INDUSTRY_SOURCES[moveClipboard.buildingType] || FARM_SOURCES[moveClipboard.buildingType] || HOUSE_SOURCES[moveClipboard.buildingType] || TREE_SOURCES[moveClipboard.buildingType] || TOWN_HALL_PNG}
                  style={styles.clipboardPreviewImage}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              )
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

      {/* Sell refund banner (shown briefly when an item is removed/sold from the map) */}
      {showSellMsg && (
        <View style={styles.sellRefundMsg}>
          <Text style={styles.sellRefundMsgText}>🏪 Item sold! +{SELL_REFUND} 🪙 refunded</Text>
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

      {/* Backpack panel (shown when 🎒 button is tapped) */}
      {showBackpack && (
        <View style={styles.itemsPanel}>
          <View style={styles.itemsPanelHeader}>
            <Text style={styles.itemsPanelTitle}>🎒 Harvested Vegetables</Text>
            <TouchableOpacity onPress={() => setShowBackpack(false)} style={styles.itemsPanelClose} activeOpacity={0.7}>
              <Text style={styles.itemsPanelCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8, gap: 8, paddingHorizontal: 4 }}
          >
            {CROP_TYPES.map((crop) => {
              const count = harvestedItems[crop] || 0;
              return (
                <View
                  key={crop}
                  style={{
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 10,
                    minWidth: 70,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{CROP_EMOJIS[crop] || "🌱"}</Text>
                  <Text style={{ color: count > 0 ? "#4CAF50" : "#666", fontSize: 16, fontWeight: "bold", marginTop: 4 }}>
                    {count}
                  </Text>
                  {count > 0 && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#FF9800",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        marginTop: 4,
                      }}
                      onPress={() => {
                        // Sell all of this crop type at crop-specific price
                        const sellCoins = count * getCropSellPrice(crop as CropType);
                        setCoins((c) => c + sellCoins);
                        const updated = { ...harvestedItems };
                        delete updated[crop];
                        saveBackpack(updated);
                        if (Platform.OS !== "web") {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                        Sell All ({count * getCropSellPrice(crop as CropType)})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
          <Text style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 4 }}>
            Total: {Object.values(harvestedItems).reduce((a, b) => a + b, 0)} vegetables
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

      {/* Orders Board panel (shown when 📌 Orders button is tapped) */}
      {showOrders && (
        <View style={styles.profilePanel}>
          <View style={styles.itemsPanelHeader}>
            <Text style={styles.itemsPanelTitle}>📌 Orders Board</Text>
            <TouchableOpacity onPress={() => setShowOrders(false)} style={styles.itemsPanelClose} activeOpacity={0.7}>
              <Text style={styles.itemsPanelCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.ordersSubTitle}>NPC customers want your goods — deliver for premium coins!</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8, gap: 10, paddingHorizontal: 4 }}
          >
            {orders.map((o) => {
              const npc = getOrderNpcs()[o.npcIndex];
              const goods = ORDER_GOODS.find((g) => g.label === o.goodsLabel);
              const requestedName = orderLabelToBackpackKey(o.goodsLabel);
              const cropKey = (CROP_TYPES as readonly string[]).find((ct) => CROP_EMOJIS[ct] === goods?.emoji);
              const have = (harvestedItems[cropKey || ""] || 0) + (harvestedItems[requestedName] || 0);
              const fulfilled = have >= o.quantity;
              return (
                <View
                  key={o.id}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.12)",
                    borderRadius: 16,
                    padding: 12,
                    minWidth: 220,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: o.claimed ? "rgba(255,255,255,0.15)" : fulfilled ? "#4CAF50" : "rgba(255,255,255,0.2)",
                  }}
                >
                  <Image source={npc.sprite} style={{ width: 48, height: 48, resizeMode: "contain", marginBottom: 4 }} />
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700", lineHeight: 18 }}>{npc.name}</Text>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, lineHeight: 15, marginTop: 1 }}>{npc.title}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 22, lineHeight: 28 }}>{goods?.emoji}</Text>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", marginLeft: 6, lineHeight: 19 }}>
                      {have}/{o.quantity} {goods ? goods.label.split(" ").slice(1).join(" ") : ""}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                    <Text style={{ fontSize: 16, lineHeight: 22 }}>🪙</Text>
                    <Text style={{ color: "#FFD166", fontSize: 15, fontWeight: "700", marginLeft: 4, lineHeight: 20 }}>+{o.rewardCoins}</Text>
                  </View>
                  {o.claimed ? (
                    <View style={{ backgroundColor: "rgba(76,175,80,0.25)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginTop: 8 }}>
                      <Text style={{ color: "#8FD98F", fontSize: 12, fontWeight: "700", lineHeight: 16 }}>✅ Delivered!</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => fulfillOrder(o.id)}
                      disabled={!fulfilled}
                      style={{
                        backgroundColor: fulfilled ? "#FF9800" : "rgba(255,255,255,0.15)",
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        marginTop: 8,
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: fulfilled ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700", lineHeight: 17 }}>
                        {fulfilled ? "Deliver & Collect 🚚" : "Need more goods…"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
          <Text style={styles.ordersHint}>💡 Tip: Harvest crops and collect farm goods, then deliver to earn premium coins. Orders refresh daily!</Text>
        </View>
      )}

      {/* Harvest sparkles: ✨ particle bursts at each harvested crop */}
      {harvestSparkles.map((burst) => (
        <HarvestSparkles key={burst.key} burst={burst} scale={currentScale} />
      ))}
      {/* Removal: 💨 dust cloud at the tile where an item was removed */}
      {dustPos ? (
        <DustCloud
          key={`dust-${dustPos.col}-${dustPos.row}`}
          col={dustPos.col}
          row={dustPos.row}
          scale={currentScale}
          scaleValue={dustScale}
          opacityValue={dustOpacity}
        />
      ) : null}
      {/* Claim celebration: same ✨ pop used for pickup, centered on screen for task claims */}
      {placePopPos ? (
        <PlacePop
          key={`place-${placePopPos.col}-${placePopPos.row}-${placePopScale.value}`}
          col={placePopPos.col}
          row={placePopPos.row}
          scale={currentScale}
          scaleValue={placePopScale}
          opacityValue={placePopOpacity}
        />
      ) : null}
      {claimPopActive ? (
        <ClaimPop dims={screenDims} scaleValue={claimPopScale} opacityValue={claimPopOpacity} />
      ) : null}

      {/* Task reward banner: brief flash when a task is completed */}
      {showTaskReward && (
        <View style={styles.taskRewardMsg}>
          <Text style={styles.taskRewardMsgText}>🏆 {taskRewardMessage}</Text>
        </View>
      )}

      {/* Orders Board reward banner: brief flash when an order is delivered */}
      {orderRewardBanner && (
        <View style={styles.taskRewardMsg}>
          <Text style={styles.taskRewardMsgText}>{orderRewardBanner}</Text>
        </View>
      )}

      {/* NPC delivery animation: walks to collect goods, picks them up, and returns */}
      {delivery ? (
        <DeliveryNpcSprite key={`delivery-${delivery.startedAt}`} delivery={delivery} scale={currentScale} />
      ) : null}

      {/* Ambient wildlife: birds and butterflies drifting across the farm */}
      <WildlifeOverlay key={Math.floor(currentScale * 10)} scale={currentScale} weather={weather} />

      {/* Nighttime wildlife: bats and fireflies, only visible in the dark */}
      <NightlifeOverlay isNight={isNight} />

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
                  if (m === "industry") {
                    setShowIndustrySelector(!showIndustrySelector);
                  } else {
                    setShowIndustrySelector(false);
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
        {/* Settings button */}
        <TouchableOpacity
          style={[styles.profileButton, settingsPanel && styles.profileButtonActive]}
          onPress={() => setSettingsPanel(!settingsPanel)}
          activeOpacity={0.7}
        >
          <Text style={[styles.profileButtonIcon, settingsPanel && styles.profileButtonIconActive]}>⚙️</Text>
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
          onPress={() => { setShowTasks(!showTasks); setShowProfile(false); setShowBackpack(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.profileButtonIcon, showTasks && styles.profileButtonIconActive]}>📋</Text>
          <Text style={styles.profileCoinText}>Tasks</Text>
        </TouchableOpacity>
        {/* Backpack button */}
        <TouchableOpacity
          style={[styles.profileButton, showBackpack && styles.profileButtonActive]}
          onPress={() => { setShowBackpack(!showBackpack); setShowProfile(false); setShowTasks(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.profileButtonIcon, showBackpack && styles.profileButtonIconActive]}>🎒</Text>
          <Text style={styles.profileCoinText}>{Object.values(harvestedItems).reduce((a, b) => a + b, 0)}</Text>
        </TouchableOpacity>
        {/* Orders Board button - NPC customers request goods for coins */}
        <TouchableOpacity
          style={[styles.profileButton, showOrders && styles.profileButtonActive]}
          onPress={() => { setShowOrders(!showOrders); setShowProfile(false); setShowTasks(false); setShowBackpack(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.profileButtonIcon, showOrders && styles.profileButtonIconActive]}>📌</Text>
          <Text style={styles.profileCoinText}>Orders</Text>
        </TouchableOpacity>
        {/* Harvest All button - collects all fully grown crops at once */}
        <TouchableOpacity
          style={styles.harvestAllButton}
          onPress={() => {
            setGrid((prev) => {
              let totalHarvested = 0;
              const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
              const newBackpack = { ...harvestedItems };
              for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                  const cell = newGrid[row][col];
                  if (cell.building !== "none" && CROP_EMOJIS[cell.building as CropType] && cell.cropGrowthStage >= 100) {
                    const cropType = cell.building as CropType;
                    cell.building = "none";
                    cell.cropGrowthStage = 0;
                    totalHarvested++;
                    newBackpack[cropType] = (newBackpack[cropType] || 0) + 1;
                    playHarvestChime(cropType);
                    triggerHarvestSparkles(col, row);
                  }
                }
              }
              if (totalHarvested > 0) {
                setCoins((c) => c + totalHarvested * 25);
                saveBackpack(newBackpack);
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                // Show brief harvest all message
                setShowHarvestAllMsg(true);
                if (harvestAllMsgTimer.current) clearTimeout(harvestAllMsgTimer.current);
                harvestAllMsgTimer.current = setTimeout(() => setShowHarvestAllMsg(false), 2000);
              }
              return newGrid;
            });
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.harvestAllButtonText}>🌾 All</Text>
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
          {/* Mirror toggle: place the selected item mirrored */}
          <View style={styles.mirrorRow}>
            <TouchableOpacity
              style={[styles.mirrorBtn, mirrorMode && styles.mirrorBtnActive]}
              onPress={() => setMirrorMode((m) => !m)}
              activeOpacity={0.6}
            >
              <Text style={styles.mirrorBtnText}>🪞 Mirror</Text>
            </TouchableOpacity>
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
          <View style={styles.mirrorRow}>
            <TouchableOpacity
              style={[styles.mirrorBtn, mirrorMode && styles.mirrorBtnActive]}
              onPress={() => setMirrorMode((m) => !m)}
              activeOpacity={0.6}
            >
              <Text style={styles.mirrorBtnText}>🪞 Mirror</Text>
            </TouchableOpacity>
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
          <View style={styles.mirrorRow}>
            <TouchableOpacity
              style={[styles.mirrorBtn, mirrorMode && styles.mirrorBtnActive]}
              onPress={() => setMirrorMode((m) => !m)}
              activeOpacity={0.6}
            >
              <Text style={styles.mirrorBtnText}>🪞 Mirror</Text>
            </TouchableOpacity>
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
          <View style={styles.mirrorRow}>
            <TouchableOpacity
              style={[styles.mirrorBtn, mirrorMode && styles.mirrorBtnActive]}
              onPress={() => setMirrorMode((m) => !m)}
              activeOpacity={0.6}
            >
              <Text style={styles.mirrorBtnText}>🪞 Mirror</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Crop Sub-Selector (shown when tiles mode + farmland texture is selected, OR when a farmland tile is tapped) */}
      {(mode === "tiles" && selectedTileType === "farmland") || tappedFarmlandPos !== null ? (
        <View style={[styles.treeSelectorWrapper, { bottom: 190 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {CROP_TYPES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.treeOption, selectedCropType === c && styles.treeOptionActive]}
                onPress={() => {
                  if (tappedFarmlandPos) {
                    // When tapped from farmland tile, place crop immediately on that tile
                    handleCropSelectFromTap(c);
                  } else {
                    // When in tiles mode, just update selected crop type
                    setSelectedCropType(c);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 28 }}>
                  {CROP_EMOJIS[c] || "🌱"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            {tappedFarmlandPos ? (
              <View style={styles.cropSelectorActions}>
                <Text style={styles.treeSelectedText}>🌾 Select a crop to plant here</Text>
                {/* Harvest All toast message */}
                {showHarvestAllMsg && (
                  <View style={{ position: "absolute", top: -50, left: "50%", marginLeft: -80, backgroundColor: "rgba(34,197,94,0.9)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, zIndex: 100 }}>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>Harvested all crops!</Text>
                  </View>
                )}
                {/* Harvest button - removes crop and gives +25 coins */}
                <TouchableOpacity
                  style={styles.harvestButton}
                  onPress={() => {
                    if (!tappedFarmlandPos) return;
                    setGrid((prev) => {
                      const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
                      const { col, row } = tappedFarmlandPos;
                      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
                        const cell = newGrid[row][col];
                        if (cell.building !== "none" && CROP_EMOJIS[cell.building as CropType]) {
                          // Only harvest when fully grown (stage >= 100)
                          if (cell.cropGrowthStage >= 100) {
                            // Harvest: remove crop and give +25 coins
                            const cropType = cell.building as CropType;
                            cell.building = "none";
                            cell.cropGrowthStage = 0;
                            setCoins((c) => c + 25);
                            playHarvestChime(cropType);
                            triggerHarvestSparkles(col, row);
                            if (Platform.OS !== "web") {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }
                            // Add to backpack
                            const updated = { ...harvestedItems };
                            updated[cropType] = (updated[cropType] || 0) + 1;
                            saveBackpack(updated);
                          }
                        }
                      }
                      return newGrid;
                    });
                    setTappedFarmlandPos(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.harvestButtonText}>🌾 Harvest (+25)</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.treeSelectedText}>🌾 Tap a crop to select, then tap farmland to plant</Text>
            )}
          </View>
        </View>
      ) : null}

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
          <View style={styles.mirrorRow}>
            <TouchableOpacity
              style={[styles.mirrorBtn, mirrorMode && styles.mirrorBtnActive]}
              onPress={() => setMirrorMode((m) => !m)}
              activeOpacity={0.6}
            >
              <Text style={styles.mirrorBtnText}>🪞 Mirror</Text>
            </TouchableOpacity>
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
          <View style={styles.mirrorRow}>
            <TouchableOpacity
              style={[styles.mirrorBtn, mirrorMode && styles.mirrorBtnActive]}
              onPress={() => setMirrorMode((m) => !m)}
              activeOpacity={0.6}
            >
              <Text style={styles.mirrorBtnText}>🪞 Mirror</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Industry Sub-Selector (shown when industry mode is active) */}
      {mode === "industry" && (
        <View style={[styles.treeSelectorWrapper, { bottom: 170 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {INDUSTRY_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.treeOption, selectedIndustryType === t && styles.treeOptionActive]}
                onPress={() => {
                  setSelectedIndustryType(t);
                  if (Platform.OS !== "web" && settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={INDUSTRY_SOURCES[t] || INDUSTRY_STEEL_PNG}
                  style={styles.treeOptionImage}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            <Text style={styles.treeSelectedText}>Tap a factory to select it</Text>
          </View>
          <View style={styles.mirrorRow}>
            <TouchableOpacity
              style={[styles.mirrorBtn, mirrorMode && styles.mirrorBtnActive]}
              onPress={() => setMirrorMode((m) => !m)}
              activeOpacity={0.6}
            >
              <Text style={styles.mirrorBtnText}>🪞 Mirror</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Farm Sub-Selector (shown when farm mode is active) */}
      {mode === "farm" && (
        <View style={[styles.treeSelectorWrapper, { bottom: 170 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.treeSelector}
          >
            {FARM_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.treeOption, selectedFarmType === t && styles.treeOptionActive]}
                onPress={() => {
                  setSelectedFarmType(t);
                  if (Platform.OS !== "web" && settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={FARM_SOURCES[t]}
                  style={styles.treeOptionImage}
                  contentFit="contain"
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.treeSelectedLabel}>
            <Text style={styles.treeSelectedText}>Tap a farm building to select it</Text>
          </View>
          <View style={styles.mirrorRow}>
            <TouchableOpacity
              style={[styles.mirrorBtn, mirrorMode && styles.mirrorBtnActive]}
              onPress={() => setMirrorMode((m) => !m)}
              activeOpacity={0.6}
            >
              <Text style={styles.mirrorBtnText}>🪞 Mirror</Text>
            </TouchableOpacity>
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
          <View style={styles.mirrorRow}>
            <TouchableOpacity
              style={[styles.mirrorBtn, mirrorMode && styles.mirrorBtnActive]}
              onPress={() => setMirrorMode((m) => !m)}
              activeOpacity={0.6}
            >
              <Text style={styles.mirrorBtnText}>🪞 Mirror</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Building hover tooltip: character name + profession */}
      {buildingTooltip && BUILDING_CHAT_NPCS[buildingTooltip.buildingType] && (() => {
        const npc = BUILDING_CHAT_NPCS[buildingTooltip.buildingType];
        const pos = gridToScreen(buildingTooltip.col, buildingTooltip.row, scaleValue.value);
        const winW = Dimensions.get("window").width;
        const tooltipTop = pos.y - 56;
        return (
          <View
            style={[
              chatStyles.tooltip,
              {
                left: Math.min(Math.max(pos.x - 110, 12), winW - 232),
                top: Math.max(tooltipTop, 8),
              },
            ]}
            pointerEvents="none"
          >
            <Text style={chatStyles.tooltipName} numberOfLines={1}>
              {npc.emoji} {npc.name}
            </Text>
            <Text style={chatStyles.tooltipRole} numberOfLines={1}>
              {COMMUNITY_EMOJIS[buildingTooltip.buildingType] || "🏠"} {buildingTooltip.buildingType.replace(/_/g, " ")}
            </Text>
          </View>
        );
      })()}

      {/* Building Chat Panel (tap a community building to talk with its character) */}
      {chatPanel && BUILDING_CHAT_NPCS[chatPanel.buildingType] && (
        <View style={chatStyles.backdrop} pointerEvents="box-none">
          <TouchableOpacity
            style={chatStyles.backdropTouchable}
            onPress={closeChatPanelAnimated}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              chatStyles.panel,
              {
                transform: [{ translateY: chatSlideY }],
                opacity: chatOpacity,
              },
            ]}
            pointerEvents="box-none"
          >
            <View style={chatStyles.panelHeader}>
              <View style={chatStyles.headerRow}>
                <Image
                  source={BUILDING_CHAT_NPCS[chatPanel.buildingType].sprite}
                  style={chatStyles.avatar}
                  contentFit="contain"
                  cachePolicy="memory"
                />
                <View style={chatStyles.headerText}>
                  <Text style={chatStyles.charName} numberOfLines={1}>
                    {BUILDING_CHAT_NPCS[chatPanel.buildingType].emoji} {BUILDING_CHAT_NPCS[chatPanel.buildingType].name}
                  </Text>
                  <Text style={chatStyles.charRole} numberOfLines={1}>
                    {COMMUNITY_EMOJIS[chatPanel.buildingType] || ""} {chatPanel.buildingType.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={closeChatPanelAnimated}
                activeOpacity={0.6}
                style={chatStyles.closeBtn}
              >
                <Text style={chatStyles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={chatStyles.messageList}
              contentContainerStyle={chatStyles.messageListContent}
              showsVerticalScrollIndicator={false}
              ref={chatScrollRef}
              onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => chatScrollRef.current?.scrollToEnd({ animated: false })}
            >
              {chatPanel.messages.map((m, i) => (
                <View
                  key={i}
                  style={m.from === "npc" ? chatStyles.msgRowNpc : chatStyles.msgRowUser}
                >
                  <Image
                    source={BUILDING_CHAT_NPCS[chatPanel.buildingType].sprite}
                    style={m.from === "npc" ? chatStyles.msgAvatar : chatStyles.msgAvatarUser}
                    contentFit="contain"
                    cachePolicy="memory"
                  />
                  <View
                    style={
                      m.from === "npc"
                        ? chatStyles.bubbleNpc
                        : chatStyles.bubbleUser
                    }
                  >
                    <Text style={m.from === "npc" ? chatStyles.msgTextNpc : chatStyles.msgTextUser}>
                      {m.text}
                    </Text>
                  </View>
                </View>
              ))}
              {/* Typing animation: animated "..." dots while the character is composing */}
              {chatTyping && (
                <View style={chatStyles.msgRowNpc}>
                  <Image
                    source={BUILDING_CHAT_NPCS[chatPanel.buildingType].sprite}
                    style={chatStyles.msgAvatar}
                    contentFit="contain"
                    cachePolicy="memory"
                  />
                  <View style={chatStyles.bubbleTyping}>
                    <Text style={chatStyles.msgTextNpc}>
                      <TypingDots />
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
            <View style={chatStyles.replyRow}>
              {chatPanel.userReplied ? (
                <View style={chatStyles.waveText}>
                  <Text style={chatStyles.waveLabel}>👋 {BUILDING_CHAT_NPCS[chatPanel.buildingType].name} keh rahe hain: achha laga aapse baat karke!</Text>
                </View>
              ) : (
                BUILDING_CHAT_NPCS[chatPanel.buildingType].replies.map((r, i) => (
                  <TouchableOpacity
                    key={i}
                    style={chatStyles.replyBtn}
                    onPress={() => {
                      const npc = BUILDING_CHAT_NPCS[chatPanel.buildingType];
                      const response = r.responses[Math.floor(Math.random() * r.responses.length)];
                      // Close chat panel on double response? No — append user reply first,
                      // show typing animation, then deliver NPC reply after a delay.
                      setChatPanel((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          messages: [...prev.messages, { from: "user" as const, text: r.label }],
                          userReplied: true,
                        };
                      });
                      if (Platform.OS !== "web" && settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      // Typing animation: character "composes" their reply
                      setChatTyping(true);
                      if (chatTypingTimerRef.current) clearTimeout(chatTypingTimerRef.current);
                      chatTypingTimerRef.current = setTimeout(() => {
                        setChatTyping(false);
                        setChatPanel((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            messages: [...prev.messages, { from: "npc" as const, text: response }],
                          };
                        });
                        if (Platform.OS !== "web" && settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      }, 900);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={chatStyles.replyBtnText}>{r.label}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </Animated.View>
        </View>
      )}

      {/* Farm Production Popup (Goathed-style: tap a placed farm building) */}
      {farmPopup && (() => {
        const prod = getProduction(farmPopup.buildingType);
        if (!prod) return null;
        const p = prod.products[farmPopup.productIndex];
        const imgSrc =
          ((FARM_SOURCES as any)[farmPopup.buildingType] as any) ??
          ((INDUSTRY_SOURCES as any)[farmPopup.buildingType] as any) ??
          null;
        return (
          <>
            <TouchableOpacity
              style={chatStyles.backdrop}
              activeOpacity={1}
              onPress={() => closeFarmPopup()}
            />
            <View style={chatStyles.panel}>
              <View style={chatStyles.panelHeader}>
                <Text style={chatStyles.panelTitle}>{INDUSTRY_PRODUCTIONS[farmPopup.buildingType] ? "🏭" : "🏠"} {prod.title}</Text>
                <TouchableOpacity
                  style={chatStyles.closeBtn}
                  onPress={() => closeFarmPopup()}
                  activeOpacity={0.7}
                >
                  <Text style={chatStyles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              {/* Product arrows + goods emoji strip */}
              <View style={farmStyles.prodRow}>
                <TouchableOpacity
                  style={farmStyles.arrowBtn}
                  onPress={() => {
                    setFarmPopup((prev) => {
                      if (!prev || !prod.products.length) return prev;
                      return { ...prev, productIndex: (prev.productIndex - 1 + prod.products.length) % prod.products.length, ready: 0, startedAt: Date.now() };
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={farmStyles.arrowText}>◀</Text>
                </TouchableOpacity>
                <View style={farmStyles.goodsBox}>
                  <Text style={farmStyles.goodsEmoji}>{p.goods}</Text>
                  <Text style={farmStyles.goodsLabel}>{p.emoji} {p.label}</Text>
                </View>
                <TouchableOpacity
                  style={farmStyles.arrowBtn}
                  onPress={() => {
                    setFarmPopup((prev) => {
                      if (!prev || !prod.products.length) return prev;
                      return { ...prev, productIndex: (prev.productIndex + 1) % prod.products.length, ready: 0, startedAt: Date.now() };
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={farmStyles.arrowText}>▶</Text>
                </TouchableOpacity>
              </View>
              {/* Building image */}
              {imgSrc ? (
                <Image
                  source={imgSrc}
                  style={farmStyles.buildingImg}
                  resizeMode="contain"
                />
              ) : (
                <View style={[farmStyles.buildingImg, farmStyles.buildingImgPlaceholder]}>
                  <Text style={{ fontSize: 44 }}>🏠</Text>
                </View>
              )}
              <Text style={farmStyles.prodInfo}>
                ⏱️ New batch every {Math.round(p.readyTimeMs / 1000)}s • 💰 {p.rewardCoins} coins per batch
              </Text>
              {/* Collect button with ready-count badge */}
              <TouchableOpacity
                style={[farmStyles.collectBtn, farmPopup.ready <= 0 && farmStyles.collectBtnDisabled]}
                onPress={() => collectFarmGoods()}
                disabled={farmPopup.ready <= 0}
                activeOpacity={0.8}
              >
                <Text style={farmStyles.collectBtnText}>
                  {farmPopup.ready > 0 ? `Collect ${farmPopup.ready > 1 ? `×${farmPopup.ready}` : ""} 🎁` : "Producing… ⏳"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );
      })()}

      {/* Settings panel (shown when ⚙️ is tapped) */}
      {settingsPanel && (
        <>
          <TouchableOpacity
            style={chatStyles.backdrop}
            activeOpacity={1}
            onPress={() => setSettingsPanel(false)}
          />
          <View style={chatStyles.panel}>
            <View style={chatStyles.panelHeader}>
              <Text style={chatStyles.panelTitle}>⚙️ Settings</Text>
              <TouchableOpacity
                style={chatStyles.closeBtn}
                onPress={() => setSettingsPanel(false)}
                activeOpacity={0.7}
              >
                <Text style={chatStyles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 280 }}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsRowLeft}>
                  <Text style={styles.settingsRowText}>🔊 Sound Effects</Text>
                  <Text style={styles.settingsRowNote}>Placement pop, removal whoosh</Text>
                </View>
                <Switch
                  value={settings.sound}
                  onValueChange={(v) => saveSettings({ ...settings, sound: v })}
                />
              </View>
              <View style={styles.settingsRow}>
                <View style={styles.settingsRowLeft}>
                  <Text style={styles.settingsRowText}>📳 Haptic Feedback</Text>
                  <Text style={styles.settingsRowNote}>Vibration on taps (mobile only)</Text>
                </View>
                <Switch
                  value={settings.haptics}
                  onValueChange={(v) => saveSettings({ ...settings, haptics: v })}
                />
              </View>
            </ScrollView>
          </View>
        </>
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
  cropSelectorActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  harvestButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  harvestButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  harvestAllButton: {
    backgroundColor: "#FF9800",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 8,
    alignSelf: "center",
  },
  harvestAllButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
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
  sellRefundMsg: {
    position: "absolute",
    bottom: 130,
    left: 16,
    right: 16,
    backgroundColor: "rgba(34,197,94,0.95)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    zIndex: 105,
  },
  sellRefundMsgText: {
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
  ordersSubTitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  ordersHint: {
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
  mirrorRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 6,
  },
  mirrorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.2)",
  },
  mirrorBtnActive: {
    backgroundColor: "#fde68a",
    borderColor: "#f59e0b",
  },
  mirrorBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#11181c",
    lineHeight: 17,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,24,28,0.08)",
  },
  settingsRowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#11181c",
    lineHeight: 21,
  },
  settingsRowNote: {
    fontSize: 12,
    color: "#687076",
    lineHeight: 16,
    marginTop: 2,
  },
  settingsRowLeft: {
    flex: 1,
    paddingRight: 12,
  },
});
// Building chat panel styles
const chatStyles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 400,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  panel: {
    width: "92%",
    maxHeight: 420,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 60,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#11181c",
    lineHeight: 22,
    flex: 1,
  },
  headerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 64,
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  charName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#11181c",
    lineHeight: 22,
  },
  charRole: {
    fontSize: 12,
    color: "#687076",
    marginTop: 2,
    lineHeight: 16,
    textTransform: "capitalize",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f2f5",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    color: "#687076",
    lineHeight: 18,
  },
  messageList: {
    maxHeight: 220,
  },
  messageListContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  msgRowNpc: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  msgRowUser: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  msgAvatar: {
    width: 30,
    height: 38,
    marginRight: 6,
  },
  msgAvatarUser: {
    width: 30,
    height: 38,
    marginLeft: 6,
  },
  bubbleNpc: {
    backgroundColor: "#f0f2f5",
    borderRadius: 14,
    borderTopLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "82%",
  },
  bubbleUser: {
    backgroundColor: "#d8e8fb",
    borderRadius: 14,
    borderTopRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "82%",
  },
  bubbleTyping: {
    backgroundColor: "#f0f2f5",
    borderRadius: 14,
    borderTopLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 56,
  },
  tooltip: {
    position: "absolute",
    zIndex: 500,
    backgroundColor: "rgba(17,24,28,0.92)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 220,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  tooltipName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 19,
  },
  tooltipRole: {
    fontSize: 12,
    color: "#c9d4dc",
    lineHeight: 16,
  },
  msgTextNpc: {
    fontSize: 14,
    color: "#11181c",
    lineHeight: 20,
  },
  msgTextUser: {
    fontSize: 14,
    color: "#11181c",
    lineHeight: 20,
  },
  replyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#f0f2f5",
  },
  replyBtn: {
    backgroundColor: "#0a7ea4",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  replyBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  waveText: {
    flex: 1,
  },
  waveLabel: {
    fontSize: 12,
    color: "#687076",
    fontStyle: "italic",
    lineHeight: 17,
  },
});

// --- Farm Production Popup (Goathed-style) ---
const farmStyles = StyleSheet.create({
  prodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 10,
  },
  arrowBtn: {
    backgroundColor: "#eef3f7",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d6e0e8",
  },
  arrowText: {
    fontSize: 20,
    color: "#0a7ea4",
    fontWeight: "700",
    lineHeight: 26,
  },
  goodsBox: {
    flex: 1,
    backgroundColor: "#fff8ea",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0e2c0",
  },
  goodsEmoji: {
    fontSize: 22,
    lineHeight: 30,
    marginBottom: 2,
  },
  goodsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b4d1a",
    lineHeight: 18,
  },
  buildingImg: {
    width: 150,
    height: 90,
    alignSelf: "center",
    marginTop: 10,
  },
  buildingImgPlaceholder: {
    backgroundColor: "#eef3f7",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  prodInfo: {
    fontSize: 12,
    color: "#687076",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },
  collectBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 18,
    paddingVertical: 10,
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  collectBtnDisabled: {
    backgroundColor: "#d6e0e8",
  },
  collectBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
});
