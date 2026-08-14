import { describe, expect, it } from "vitest";

// Orders board: flower goods pool + fulfillment from placed flowers
// These tests replicate the order-related logic from IsometricMap.tsx in a
// deterministic way so the flower order economy stays correct over time.

// --- Mirrored logic from IsometricMap.tsx (keep in sync!) ---

type OrderGoods = { label: string; emoji: string; baseValue: number; flower?: boolean };

const FLOWER_GOODS: OrderGoods[] = [
  { label: "🌷 Tulips", emoji: "🌷", baseValue: 15, flower: true },
  { label: "🌼 Daisies", emoji: "🌼", baseValue: 14, flower: true },
  { label: "💐 Hydrangea", emoji: "💐", baseValue: 18, flower: true },
  { label: "🪻 Lavender", emoji: "🪻", baseValue: 16, flower: true },
  { label: "🌹 Roses", emoji: "🌹", baseValue: 20, flower: true },
  { label: "🌻 Sunflowers", emoji: "🌻", baseValue: 17, flower: true },
  { label: "🤍 Lily of the Valley", emoji: "🤍", baseValue: 19, flower: true },
  { label: "🌈 Pansies", emoji: "🌈", baseValue: 15, flower: true },
  { label: "🩷 Lilies", emoji: "🩷", baseValue: 20, flower: true },
];

function orderLabelToBackpackKey(label: string): string {
  const words = label.trim().split(" ");
  return words.slice(1).join(" ");
}

function flowerOrderToDecorationType(label: string): string | null {
  const name = orderLabelToBackpackKey(label).toLowerCase();
  const map: Record<string, string> = {
    tulips: "flower_tulips", daisies: "flower_daisies", hydrangea: "flower_hydrangea",
    lavender: "flower_lavender", roses: "flower_roses", sunflowers: "flower_sunflowers",
    "lily of the valley": "flower_lily_valley", pansies: "flower_pansies", lilies: "flower_lilies",
  };
  return map[name] ?? null;
}

function countPlacedFlowers(grid: (string | null)[][], flowerType: string): number {
  let count = 0;
  for (const row of grid) for (const cell of row) if (cell === flowerType) count += 1;
  return count;
}

function fulfillFlowerOrder(
  grid: (string | null)[][],
  flowerLabel: string,
  quantity: number,
  rewardCoins: number,
  coins: number,
): { grid: (string | null)[][]; coins: number; delivered: boolean } {
  const flowerType = flowerOrderToDecorationType(flowerLabel);
  if (!flowerType) return { grid, coins, delivered: false };
  const placed = countPlacedFlowers(grid, flowerType);
  if (placed < quantity) return { grid, coins, delivered: false };
  const newGrid = grid.map((r) => [...r]);
  let toRemove = quantity;
  outer: for (let row = 0; row < newGrid.length; row += 1) {
    for (let col = 0; col < newGrid[row].length; col += 1) {
      if (newGrid[row][col] === flowerType) {
        newGrid[row][col] = null;
        toRemove -= 1;
        if (toRemove <= 0) break outer;
      }
    }
  }
  return { grid: newGrid, coins: coins + rewardCoins, delivered: true };
}

// --- Tests ---

describe("Flower order goods pool", () => {
  it("contains exactly the 9 new flower types with coin values", () => {
    expect(FLOWER_GOODS).toHaveLength(9);
    for (const g of FLOWER_GOODS) {
      expect(g.flower).toBe(true);
      expect(g.baseValue).toBeGreaterThanOrEqual(10);
      expect(orderLabelToBackpackKey(g.label)).toBeTruthy();
    }
  });

  it("every flower order label maps to a valid decoration building type", () => {
    for (const g of FLOWER_GOODS) {
      expect(flowerOrderToDecorationType(g.label)).toMatch(/^flower_/);
    }
  });
});

describe("Flower order fulfillment from placed flowers", () => {
  const GRID = 5;
  const makeGrid = (flowerType: string, count: number): (string | null)[][] => {
    const grid: (string | null)[][] = Array.from({ length: GRID }, () => Array(GRID).fill(null));
    let placed = 0;
    outer: for (let r = 0; r < GRID; r += 1) {
      for (let c = 0; c < GRID; c += 1) {
        if (placed < count) { grid[r][c] = flowerType; placed += 1; } else break outer;
      }
    }
    return grid;
  };

  it("delivers tulips from the map and pays coins when enough are placed", () => {
    const grid = makeGrid("flower_tulips", 3);
    const result = fulfillFlowerOrder(grid, "🌷 Tulips", 2, 2 * 15 + 25, 1000);
    expect(result.delivered).toBe(true);
    expect(result.coins).toBe(1000 + 30 + 25);
    expect(countPlacedFlowers(result.grid, "flower_tulips")).toBe(1);
  });

  it("refuses delivery when fewer flowers are placed than requested", () => {
    const grid = makeGrid("flower_roses", 1);
    const result = fulfillFlowerOrder(grid, "🌹 Roses", 2, 2 * 20 + 25, 1000);
    expect(result.delivered).toBe(false);
    expect(result.coins).toBe(1000);
    expect(countPlacedFlowers(result.grid, "flower_roses")).toBe(1);
  });

  it("removes exactly the requested quantity (first matches), leaving other flowers untouched", () => {
    const grid: (string | null)[][] = Array.from({ length: GRID }, () => Array(GRID).fill(null));
    grid[0][0] = "flower_daisies";
    grid[0][1] = "flower_roses";
    grid[1][0] = "flower_daisies";
    grid[1][1] = "flower_lilies";
    const result = fulfillFlowerOrder(grid, "🌼 Daisies", 1, 1 * 14 + 25, 500);
    expect(result.delivered).toBe(true);
    expect(result.coins).toBe(539);
    expect(countPlacedFlowers(result.grid, "flower_daisies")).toBe(1);
    expect(result.grid[0][1]).toBe("flower_roses");
    expect(result.grid[1][1]).toBe("flower_lilies");
  });

  it("rejects unknown flower labels", () => {
    const grid = makeGrid("flower_sunflowers", 3);
    const result = fulfillFlowerOrder(grid, "🌵 Cactus", 1, 40, 777);
    expect(result.delivered).toBe(false);
    expect(result.coins).toBe(777);
  });
});
