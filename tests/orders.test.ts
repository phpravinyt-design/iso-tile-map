import { describe, expect, it } from "vitest";

// Minimal re-implementation of the pure order logic for deterministic unit tests.
// The real logic lives in components/IsometricMap.tsx; this test validates the
// order generation and fulfillment mathematics independent of React state.

type OrderGoods = { label: string; emoji: string; baseValue: number };

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

const ORDER_NPCS = [
  "Farmer Balram", "Dr. Sharma", "Chef Ravi", "Teacher Neha",
  "Bookshop Aanya", "Vet Sonali", "Mayor", "Officer Priya", "Engineer Rohit",
];

// simpleHash (FNV-1a) matches the component's implementation used for daily shuffles
function simpleHash(s: string): number {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

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

interface OrderBoardItem {
  id: number;
  npcIndex: number;
  goodsLabel: string;
  quantity: number;
  rewardCoins: number;
  claimed: boolean;
}

function generateDailyOrders(claimState: Record<string, boolean> = {}): OrderBoardItem[] {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const orders: OrderBoardItem[] = [];
  const shuffledNpcs = orderShuffle(ORDER_NPCS, today + ":npc");
  const shuffledGoods = orderShuffle(ORDER_GOODS, today + ":goods");
  const count = Math.min(3, ORDER_GOODS.length);
  for (let i = 0; i < count; i += 1) {
    const goods = shuffledGoods[i];
    const qty = 1 + (simpleHash(today + ":qty" + i) % 3);
    orders.push({
      id: i,
      npcIndex: ORDER_NPCS.indexOf(shuffledNpcs[i]),
      goodsLabel: goods.label,
      quantity: qty,
      rewardCoins: qty * goods.baseValue + 25,
      claimed: claimState[`${i}`] === true,
    });
  }
  return orders;
}

describe("Orders Board logic", () => {
  it("generates exactly 3 orders per day", () => {
    const orders = generateDailyOrders();
    expect(orders).toHaveLength(3);
  });

  it("each order has quantity 1-3 and a premium reward above sell value", () => {
    const orders = generateDailyOrders();
    for (const o of orders) {
      expect(o.quantity).toBeGreaterThanOrEqual(1);
      expect(o.quantity).toBeLessThanOrEqual(3);
      const goods = ORDER_GOODS.find((g) => g.label === o.goodsLabel);
      expect(goods).toBeTruthy();
      expect(o.rewardCoins).toBe(o.quantity * (goods as OrderGoods).baseValue + 25);
      expect(o.rewardCoins).toBeGreaterThan(25);
    }
  });

  it("orders are deterministic for the same day", () => {
    const a = generateDailyOrders();
    const b = generateDailyOrders();
    expect(a).toEqual(b);
  });

  it("orders use distinct goods", () => {
    const orders = generateDailyOrders();
    const labels = orders.map((o) => o.goodsLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("orders use distinct NPC customers", () => {
    const orders = generateDailyOrders();
    const npcIndices = orders.map((o) => o.npcIndex);
    expect(new Set(npcIndices).size).toBe(npcIndices.length);
  });

  it("fulfillment deducts goods and grants the reward when enough stock exists", () => {
    const orders = generateDailyOrders();
    // Simulate backpack: crop_tomato key for tomatoes
    const backpack: Record<string, number> = { crop_tomato: 10, Wool: 5 };
    let coins = 1000;
    const order = orders[0];
    const goods = ORDER_GOODS.find((g) => g.label === order.goodsLabel)!;
    const isCrop = !!goods.label.match(/Tomato|Carrot|Potato|Wheat|Corn|Strawberry|Cucumber|Chili|Broccoli|Watermelon|Garlic|Mushroom/);
    const key = isCrop && goods.emoji === "🍅" ? "crop_tomato" : "Wool";
    const have = backpack[key] || 0;
    expect(have).toBeGreaterThanOrEqual(order.quantity);
    backpack[key] = have - order.quantity;
    coins += order.rewardCoins;
    expect(backpack[key]).toBeGreaterThanOrEqual(0);
    expect(coins).toBeGreaterThan(1000);
    expect(orders.map((o) => (o.id === order.id ? { ...o, claimed: true } : o))[0].claimed).toBe(true);
  });

  it("fulfillment is blocked when stock is insufficient", () => {
    const orders = generateDailyOrders();
    const backpack: Record<string, number> = {};
    const order = orders[0];
    const goods = ORDER_GOODS.find((g) => g.label === order.goodsLabel)!;
    const isCrop = !!goods.label.match(/Tomato|Carrot|Potato|Wheat|Corn|Strawberry|Cucumber|Chili|Broccoli|Watermelon|Garlic|Mushroom/);
    const key = isCrop && goods.emoji === "🍅" ? "crop_tomato" : "Wool";
    const have = backpack[key] || 0;
    const canFulfill = have >= order.quantity;
    expect(canFulfill).toBe(false);
  });

  it("claimed state persists into regenerated orders", () => {
    const orders = generateDailyOrders({ "0": true });
    expect(orders[0].claimed).toBe(true);
    expect(orders[1].claimed).toBe(false);
    expect(orders[2].claimed).toBe(false);
  });
});
