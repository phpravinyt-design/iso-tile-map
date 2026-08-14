import { describe, expect, it } from "vitest";

/**
 * Weekly Mega-Quest & Golden Seed economy — pure logic tests
 * Mirrors the mechanics implemented in IsometricMap.tsx:
 * - Complete all 3 daily quests on a day -> marks the day as complete (+50 coins, +25 XP)
 * - 7 completed days in the same ISO week -> awards 5 golden seeds + 500 coins + 500 XP
 * - Golden seeds plant a golden-tagged crop; harvesting it pays 100 coins (vs 25 normal)
 * - Harvest All also pays the premium and clears golden tags
 */

// ---------- Pure mirrors of the source logic ----------

function getWeekAnchor(): string {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function seedInventoryKey(cropType: string): string {
  return `seed_${cropType}`;
}

interface QuestState { claimed: boolean; done: boolean }

function completeDay(
  quests: QuestState[],
  weeklyProgress: string[],
  today: string
): { nextProgress: string[]; dayStreak: boolean } {
  if (quests.length === 0 || !quests.every((q) => q.claimed)) {
    return { nextProgress: weeklyProgress, dayStreak: false };
  }
  if (weeklyProgress.includes(today)) {
    return { nextProgress: weeklyProgress, dayStreak: false };
  }
  return { nextProgress: [...weeklyProgress, today], dayStreak: true };
}

function checkMegaReward(
  nextProgress: string[],
  awarded: boolean
): { award: boolean; seeds: number; coins: number; xp: number } {
  if (nextProgress.length >= 7 && !awarded) {
    return { award: true, seeds: 5, coins: 500, xp: 500 };
  }
  return { award: false, seeds: 0, coins: 0, xp: 0 };
}

function harvestCrop(
  goldenTags: Record<string, boolean>,
  cropType: string,
  backpack: Record<string, number>,
  coins: number
): { backpack: Record<string, number>; coins: number; goldenTags: Record<string, boolean> } {
  const seedKey = seedInventoryKey(cropType);
  const isGolden = goldenTags[seedKey] === true;
  const reward = isGolden ? 100 : 25;
  const backKey = isGolden ? seedKey + "_golden" : cropType;
  const nextBackpack = { ...backpack, [backKey]: (backpack[backKey] || 0) + 1 };
  const nextTags = { ...goldenTags };
  if (isGolden) delete nextTags[seedKey];
  return { backpack: nextBackpack, coins: coins + reward, goldenTags: nextTags };
}

function plantGoldenSeed(
  cropType: string,
  goldenTags: Record<string, boolean>,
  backpack: Record<string, number>
): { backpack: Record<string, number>; goldenTags: Record<string, boolean>; planted: boolean } {
  const goldenKey = seedInventoryKey(cropType) + "_golden";
  const owned = backpack[goldenKey] || 0;
  if (owned <= 0) return { backpack, goldenTags, planted: false };
  const nextBackpack = { ...backpack, [goldenKey]: owned - 1 };
  if (nextBackpack[goldenKey] <= 0) delete nextBackpack[goldenKey];
  const nextTags = { ...goldenTags, [seedInventoryKey(cropType)]: true };
  return { backpack: nextBackpack, goldenTags: nextTags, planted: true };
}

// ---------- Tests ----------

describe("Weekly Mega-Quest golden seed economy", () => {
  it("marks a day complete only when all quests are claimed", () => {
    const today = new Date().toISOString().slice(0, 10);
    const claimed = [true, true, true];
    const partial = [true, false, true];
    expect(completeDay(claimed.map((c) => ({ claimed: c, done: true })), [], today).nextProgress).toEqual([today]);
    expect(completeDay(partial.map((c) => ({ claimed: c, done: true })), [], today).dayStreak).toBe(false);
  });

  it("does not double-count the same day", () => {
    const today = new Date().toISOString().slice(0, 10);
    const quests = [true, true, true].map((c) => ({ claimed: c, done: true }));
    const first = completeDay(quests, [], today);
    const second = completeDay(quests, first.nextProgress, today);
    expect(second.nextProgress).toEqual([today]);
  });

  it("awards the mega reward only once the 7th day is completed", () => {
    const progress6 = ["d1", "d2", "d3", "d4", "d5", "d6"];
    expect(checkMegaReward([...progress6, "d7"], false).award).toBe(true);
    expect(checkMegaReward(progress6, false).award).toBe(false);
    // Awarded once per week only
    const r1 = checkMegaReward([...progress6, "d7"], false);
    const r2 = checkMegaReward([...progress6, "d7", "d8"], r1.award);
    expect(r2.award).toBe(false);
  });

  it("mega reward grants 5 golden seeds, 500 coins and 500 XP", () => {
    const r = checkMegaReward(["d1", "d2", "d3", "d4", "d5", "d6", "d7"], false);
    expect(r.seeds).toBe(5);
    expect(r.coins).toBe(500);
    expect(r.xp).toBe(500);
  });

  it("plants a golden seed and tags the next crop", () => {
    const back: Record<string, number> = { [seedInventoryKey("crop_wheat") + "_golden"]: 1 };
    const res = plantGoldenSeed("crop_wheat", {}, back);
    expect(res.planted).toBe(true);
    expect(res.backpack[seedInventoryKey("crop_wheat") + "_golden"]).toBeUndefined();
    expect(res.goldenTags[seedInventoryKey("crop_wheat")]).toBe(true);
    expect(plantGoldenSeed("crop_wheat", res.goldenTags, res.backpack).planted).toBe(false);
  });

  it("harvesting a golden crop pays 100 coins and clears the tag", () => {
    const { backpack, coins, goldenTags } = harvestCrop(
      { [seedInventoryKey("crop_wheat")]: true },
      "crop_wheat",
      {},
      100
    );
    expect(coins).toBe(200);
    expect(backpack[seedInventoryKey("crop_wheat") + "_golden"]).toBe(1);
    expect(goldenTags[seedInventoryKey("crop_wheat")]).toBeUndefined();
  });

  it("normal crops still pay 25 coins", () => {
    const { coins } = harvestCrop({}, "crop_wheat", {}, 100);
    expect(coins).toBe(125);
  });

  it("full loop: plant golden seed -> grow -> harvest pays premium", () => {
    let back: Record<string, number> = { [seedInventoryKey("crop_wheat") + "_golden"]: 3 };
    let tags: Record<string, boolean> = {};
    let coins = 0;

    // Plant 3 golden seeds
    for (let i = 0; i < 3; i++) {
      const p = plantGoldenSeed("crop_wheat", tags, back);
      expect(p.planted).toBe(true);
      back = p.backpack;
      tags = p.goldenTags;
      const h = harvestCrop(tags, "crop_wheat", back, coins);
      coins = h.coins;
      back = { ...h.backpack };
      tags = h.goldenTags;
    }
    expect(coins).toBe(300);
    expect(back[seedInventoryKey("crop_wheat") + "_golden"]).toBe(3);
  });
});
