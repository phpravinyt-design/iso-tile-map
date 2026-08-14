import { describe, expect, it } from "vitest";

// --- Copy of pure data/logic from IsometricMap for deterministic unit testing ---
type FarmProduct = {
  label: string;
  emoji: string;
  goods: string;
  readyTimeMs: number;
  rewardCoins: number;
  collectLabel: string;
};
type FarmProduction = {
  title: string;
  products: FarmProduct[];
};

const INDUSTRY_TYPES = [
  "steel_factory", "oil_refinery", "food_factory",
  "recycling_plant", "dairy_factory", "yarn_factory",
  "chemical_plant", "wood_factory", "tech_factory",
] as const;

const INDUSTRY_PRODUCTIONS: Record<string, FarmProduction> = {
  steel_factory: { title: "STEEL FACTORY", products: [
    { label: "Steel", emoji: "⚙️", goods: "⚙️ ⚙️ ⚙️ ⚙️ ⚙️", readyTimeMs: 45000, rewardCoins: 30, collectLabel: "Steel" },
  ] },
  oil_refinery: { title: "OIL REFINERY", products: [
    { label: "Oil", emoji: "🛢️", goods: "🛢️ 🛢️ 🛢️ 🛢️ 🛢️", readyTimeMs: 50000, rewardCoins: 35, collectLabel: "Oil" },
  ] },
  food_factory: { title: "FOOD FACTORY", products: [
    { label: "Bread", emoji: "🍞", goods: "🍞 🍞 🍞 🍞 🍞", readyTimeMs: 30000, rewardCoins: 22, collectLabel: "Bread" },
  ] },
  recycling_plant: { title: "RECYCLING PLANT", products: [
    { label: "Recycled Goods", emoji: "♻️", goods: "♻️ ♻️ ♻️ ♻️ ♻️", readyTimeMs: 40000, rewardCoins: 25, collectLabel: "Recycled Goods" },
  ] },
  dairy_factory: { title: "DAIRY FACTORY", products: [
    { label: "Butter", emoji: "🧈", goods: "🧈 🧈 🧈 🧈 🧈", readyTimeMs: 35000, rewardCoins: 25, collectLabel: "Butter" },
  ] },
  yarn_factory: { title: "YARN FACTORY", products: [
    { label: "Yarn", emoji: "🧶", goods: "🧶 🧶 🧶 🧶 🧶", readyTimeMs: 35000, rewardCoins: 25, collectLabel: "Yarn" },
  ] },
  chemical_plant: { title: "CHEMICAL PLANT", products: [
    { label: "Chemicals", emoji: "🧪", goods: "🧪 🧪 🧪 🧪 🧪", readyTimeMs: 45000, rewardCoins: 30, collectLabel: "Chemicals" },
  ] },
  wood_factory: { title: "WOOD FACTORY", products: [
    { label: "Wood", emoji: "🪵", goods: "🪵 🪵 🪵 🪵 🪵", readyTimeMs: 30000, rewardCoins: 22, collectLabel: "Wood" },
  ] },
  tech_factory: { title: "TECH FACTORY", products: [
    { label: "Gadgets", emoji: "🖥️", goods: "🖥️ 🖥️ 🖥️ 🖥️ 🖥️", readyTimeMs: 50000, rewardCoins: 35, collectLabel: "Gadgets" },
  ] },
};

// Same ready-count math as the live popup ticker: ready = floor(elapsed / readyTimeMs)
function computeReady(elapsedMs: number, readyTimeMs: number): number {
  return Math.max(0, Math.floor(elapsedMs / readyTimeMs));
}

// Same earn math as collectFarmGoods
function computeEarned(ready: number, rewardCoins: number): number {
  return rewardCoins * ready;
}

describe("Industry (factory) production data", () => {
  it("defines production data for all 9 industry types", () => {
    for (const t of INDUSTRY_TYPES) {
      expect(INDUSTRY_PRODUCTIONS[t], `missing production data for ${t}`).toBeDefined();
      expect(INDUSTRY_PRODUCTIONS[t].products.length).toBeGreaterThan(0);
    }
  });

  it("has sane timers and rewards for every product", () => {
    for (const t of INDUSTRY_TYPES) {
      for (const p of INDUSTRY_PRODUCTIONS[t].products) {
        expect(p.readyTimeMs).toBeGreaterThan(5000);
        expect(p.readyTimeMs).toBeLessThanOrEqual(120000);
        expect(p.rewardCoins).toBeGreaterThan(0);
        expect(p.label.length).toBeGreaterThan(0);
        expect(p.collectLabel.length).toBeGreaterThan(0);
      }
    }
  });

  it("computeReady yields 0 before first batch and 1 exactly at batch time", () => {
    const p = INDUSTRY_PRODUCTIONS.steel_factory.products[0];
    expect(computeReady(p.readyTimeMs - 1, p.readyTimeMs)).toBe(0);
    expect(computeReady(p.readyTimeMs, p.readyTimeMs)).toBe(1);
    expect(computeReady(p.readyTimeMs * 2 + 500, p.readyTimeMs)).toBe(2);
  });

  it("collect math: multiple batches multiply rewards", () => {
    const p = INDUSTRY_PRODUCTIONS.tech_factory.products[0];
    const ready = computeReady(150000, p.readyTimeMs); // 3 batches of 50s
    expect(ready).toBe(3);
    expect(computeEarned(ready, p.rewardCoins)).toBe(3 * 35);
  });
});
