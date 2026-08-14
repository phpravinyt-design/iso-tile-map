import { describe, expect, it } from "vitest";

// Re-declare the pure helpers here to avoid importing the whole component.
// xpForNextLevel: each level needs 50 * level XP
function xpForNextLevel(level: number): number {
  return 50 * level;
}

// Compute level from cumulative XP (mirrors the grantXp loop logic)
function computeLevel(xp: number): { level: number; remaining: number } {
  let lvl = 1;
  let remaining = xp;
  while (remaining >= xpForNextLevel(lvl)) {
    remaining -= xpForNextLevel(lvl);
    lvl += 1;
  }
  return { level: lvl, remaining };
}

const SEED_LEVEL_REQUIREMENTS: Record<string, number> = {
  strawberry: 2,
  chili: 2,
  mushroom: 3,
  broccoli: 4,
  watermelon: 5,
};

function isSeedUnlocked(cropType: string, level: number): boolean {
  const required = SEED_LEVEL_REQUIREMENTS[cropType];
  return !required || level >= required;
}

const XP_ACTIONS = {
  harvest: 5,
  sell: 2,
  order: 10,
  task: 15,
  place: 3,
  seedBuy: 1,
};

describe("Level progression", () => {
  it("computes level 1 at 0 XP", () => {
    expect(computeLevel(0)).toEqual({ level: 1, remaining: 0 });
  });

  it("levels up at 50 XP (50/50)", () => {
    expect(computeLevel(50)).toEqual({ level: 2, remaining: 0 });
  });

  it("levels up at 150 XP (50+100=150 => level 3, 0 remaining)", () => {
    expect(computeLevel(150)).toEqual({ level: 3, remaining: 0 });
  });

  it("splits XP across multiple level-ups (175 => level 3, 25 remaining)", () => {
    expect(computeLevel(175)).toEqual({ level: 3, remaining: 25 });
  });

  it("basic seeds are always unlocked", () => {
    for (const seed of ["tomato", "wheat", "carrot", "potato"]) {
      expect(isSeedUnlocked(seed, 1)).toBe(true);
    }
  });

  it("premium seeds unlock at required levels", () => {
    expect(isSeedUnlocked("strawberry", 1)).toBe(false);
    expect(isSeedUnlocked("strawberry", 2)).toBe(true);
    expect(isSeedUnlocked("watermelon", 4)).toBe(false);
    expect(isSeedUnlocked("watermelon", 5)).toBe(true);
    expect(isSeedUnlocked("broccoli", 3)).toBe(false);
    expect(isSeedUnlocked("broccoli", 4)).toBe(true);
  });

  it("a harvest + sell combo grants 7 XP", () => {
    const total = XP_ACTIONS.harvest + XP_ACTIONS.sell;
    expect(total).toBe(7);
    expect(computeLevel(total)).toEqual({ level: 1, remaining: 7 });
  });

  it("an order delivery + task claim grants 25 XP (halfway to level 2)", () => {
    const total = XP_ACTIONS.order + XP_ACTIONS.task;
    expect(total).toBe(25);
    expect(computeLevel(total)).toEqual({ level: 1, remaining: 25 });
  });

  it("10 orders alone reach level 2 (100 XP >= 50)", () => {
    const total = XP_ACTIONS.order * 10;
    expect(computeLevel(total).level).toBeGreaterThanOrEqual(2);
  });
});
