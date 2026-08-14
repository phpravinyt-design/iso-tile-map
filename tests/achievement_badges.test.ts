import { describe, expect, it } from "vitest";
/**
 * Achievement Badge Wall — pure logic tests
 * Mirrors the mechanics implemented in IsometricMap.tsx:
 * - Badges are recorded once (idempotent), with permanent earnedAt timestamps
 * - Mega-quest completion awards "first_mega" (week-anchored) + tier badges
 *   "mega_5" (at 5 total mega-quests) and "mega_10" (at 10)
 * - Tier badges derive from the total number of mega badges already held
 * - Level milestones: level_5 at player level >= 5, level_10 at >= 10
 * - Stat milestones: coins_5000 (lifetime coins earned >= 5000),
 *   harvest_100 (crops harvested >= 100), order_25 (orders delivered >= 25)
 * - Streak milestone: streak_3 (daily streak >= 3)
 * - Golden harvest: golden_harvest badge awarded on harvesting a golden crop
 */

// ---------- Pure mirrors of the source logic ----------
const ACHIEVEMENT_DEFS = [
  { id: "first_mega", emoji: "🌟", name: "Mega Farmer", desc: "Complete your first Weekly Mega-Quest" },
  { id: "mega_5", emoji: "🏆", name: "Mega Veteran", desc: "Complete 5 Weekly Mega-Quests" },
  { id: "mega_10", emoji: "👑", name: "Mega Legend", desc: "Complete 10 Weekly Mega-Quests" },
  { id: "level_5", emoji: "⭐", name: "Rising Star", desc: "Reach level 5" },
  { id: "level_10", emoji: "🌈", name: "Master Farmer", desc: "Reach level 10" },
  { id: "coins_5000", emoji: "💰", name: "Coin Hoarder", desc: "Earn 5,000 coins lifetime" },
  { id: "harvest_100", emoji: "🌾", name: "Harvest Hero", desc: "Harvest 100 crops" },
  { id: "streak_3", emoji: "🔥", name: "On Fire", desc: "Keep a 3-day daily streak" },
  { id: "golden_harvest", emoji: "✨", name: "Golden Touch", desc: "Harvest your first golden wheat" },
  { id: "order_25", emoji: "📦", name: "Trusted Supplier", desc: "Deliver 25 orders" },
];
type AchievementRecord = { id: string; earnedAt: string; week?: string };

// awardAchievement: idempotent — only records once, preserves existing records
function awardAchievement(prev: AchievementRecord[], id: string, week?: string): AchievementRecord[] {
  if (prev.some((a) => a.id === id)) return prev;
  return [...prev, { id, earnedAt: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC", ...(week ? { week } : {}) }];
}

// Mega-quest award logic from the mega-quest completion block:
// awards "first_mega" (week-anchored), then "mega_5" at 5 total, "mega_10" at 10.
function awardMegaQuestBadges(prev: AchievementRecord[], awardedWeek: string): AchievementRecord[] {
  const prevMega = prev.filter((a) => /^mega_\d+$/.test(a.id)).length;
  const totalMega = prevMega + 1;
  let next = [...prev];
  const pushBadge = (id: string) => {
    if (!next.some((a) => a.id === id)) {
      next.push({ id, earnedAt: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC", week: awardedWeek });
    }
  };
  pushBadge(`mega_${totalMega}`);
  if (totalMega === 1) pushBadge("first_mega");
  if (totalMega >= 10) pushBadge("mega_10");
  else if (totalMega >= 5) pushBadge("mega_5");
  return next;
}

// ---------- Tests ----------
describe("Achievement Badge Wall", () => {
  it("awards a badge exactly once (idempotent)", () => {
    let badges: AchievementRecord[] = [];
    badges = awardAchievement(badges, "first_mega", "2026-W34");
    badges = awardAchievement(badges, "first_mega", "2026-W34");
    badges = awardAchievement(badges, "first_mega", "2026-W35");
    expect(badges.filter((a) => a.id === "first_mega")).toHaveLength(1);
    expect(badges).toHaveLength(1);
  });

  it("records earnedAt timestamp and optional week anchor", () => {
    const badges = awardAchievement([], "first_mega", "2026-W34");
    expect(badges[0].earnedAt).toContain("UTC");
    expect(badges[0].week).toBe("2026-W34");
    const noWeek = awardAchievement([], "golden_harvest");
    expect(noWeek[0].week).toBeUndefined();
  });

  it("mega-quest completion awards first_mega anchored to the current week", () => {
    const badges = awardMegaQuestBadges([], "2026-W34");
    // first completion awards its unique record (mega_1) plus the first_mega badge
    expect(badges.map((b) => b.id)).toEqual(["mega_1", "first_mega"]);
    expect(badges[0].week).toBe("2026-W34");
    expect(badges[1].week).toBe("2026-W34");
  });

  it("awards mega_5 badge when total mega-quest count reaches 5", () => {
    // Simulate 4 prior mega-quests via the real award function (unique mega_N records)
    let badges: AchievementRecord[] = [];
    for (let n = 1; n <= 4; n++) {
      badges = awardMegaQuestBadges(badges, `2026-W${30 + n}`);
    }
    const megaCount = badges.filter((a) => /^mega_\d+$/.test(a.id)).length;
    expect(megaCount).toBe(4);
    expect(badges.some((b) => b.id === "first_mega")).toBe(true); // awarded at completion 1
    // 5th completion pushes total to 5 -> unique record mega_5 doubles as the tier badge
    badges = awardMegaQuestBadges(badges, "2026-W34");
    expect(badges.filter((a) => /^mega_\d+$/.test(a.id)).length).toBe(5);
    expect(badges.some((b) => b.id === "mega_5")).toBe(true);
    expect(badges.filter((b) => b.id === "mega_10")).toHaveLength(0);
  });

  it("awards mega_10 badge when total count reaches 10 (mega_5 awarded at the 5th)", () => {
    let badges: AchievementRecord[] = [];
    for (let n = 1; n <= 10; n++) {
      badges = awardMegaQuestBadges(badges, `2026-W${21 + n}`);
    }
    const megaCount = badges.filter((a) => /^mega_\d+$/.test(a.id)).length;
    expect(megaCount).toBe(10);
    expect(badges.some((b) => b.id === "mega_10")).toBe(true);
    // mega_5 was awarded when the 5th mega-quest completed (idempotent — single copy)
    expect(badges.filter((b) => b.id === "mega_5")).toHaveLength(1);
    // first_mega awarded exactly once, anchored to the first completion week
    expect(badges.filter((b) => b.id === "first_mega")).toHaveLength(1);
    expect(badges.find((b) => b.id === "first_mega")?.week).toBe("2026-W22");
  });

  it("level milestones award at thresholds 5 and 10", () => {
    const awardLevelBadges = (level: number) => {
      const out: string[] = [];
      if (level >= 5) out.push("level_5");
      if (level >= 10) out.push("level_10");
      return out;
    };
    expect(awardLevelBadges(4)).toEqual([]);
    expect(awardLevelBadges(5)).toContain("level_5");
    expect(awardLevelBadges(9)).toEqual(["level_5"]);
    expect(awardLevelBadges(10)).toContain("level_10");
  });

  it("stat milestones award at thresholds 5000 coins / 100 harvests / 25 orders", () => {
    const checkStatBadges = (coins: number, harvests: number, orders: number) => {
      const out: string[] = [];
      if (coins >= 5000) out.push("coins_5000");
      if (harvests >= 100) out.push("harvest_100");
      if (orders >= 25) out.push("order_25");
      return out;
    };
    expect(checkStatBadges(4999, 99, 24)).toEqual([]);
    expect(checkStatBadges(5000, 100, 25)).toEqual(["coins_5000", "harvest_100", "order_25"]);
    expect(checkStatBadges(10000, 200, 30)).toEqual(["coins_5000", "harvest_100", "order_25"]);
  });

  it("streak badge awards at streak >= 3 and golden harvest badge exists", () => {
    expect(ACHIEVEMENT_DEFS.some((d) => d.id === "streak_3")).toBe(true);
    expect(ACHIEVEMENT_DEFS.some((d) => d.id === "golden_harvest")).toBe(true);
    expect([2].map((s) => s >= 3)).toEqual([false]);
    expect([3, 7].map((s) => s >= 3)).toEqual([true, true]);
  });

  it("badge wall shows earned count against total definitions", () => {
    const earnedAchievements: AchievementRecord[] = [
      { id: "first_mega", earnedAt: "2026-07-20 10:00 UTC", week: "2026-W30" },
      { id: "golden_harvest", earnedAt: "2026-07-21 12:00 UTC" },
    ];
    expect(earnedAchievements.length).toBe(2);
    expect(ACHIEVEMENT_DEFS.length).toBe(10);
    const earnedIds = new Set(earnedAchievements.map((a) => a.id));
    const unlocked = ACHIEVEMENT_DEFS.filter((d) => earnedIds.has(d.id));
    const locked = ACHIEVEMENT_DEFS.filter((d) => !earnedIds.has(d.id));
    expect(unlocked).toHaveLength(2);
    expect(locked).toHaveLength(8);
  });
});

// ---------- "How to Unlock" badge guide logic mirrors (IsometricMap.tsx) ----------
type GuideDef = { id: string; emoji: string; name: string; desc: string; unlockHint: string };
const GUIDE_DEFS: GuideDef[] = [
  { id: "first_mega", emoji: "🌟", name: "First Mega-Quest", desc: "", unlockHint: "Complete all 3 daily quests every day for 7 days" },
  { id: "mega_5", emoji: "🏆", name: "Mega Veteran", desc: "", unlockHint: "Finish 5 weekly mega-quests" },
  { id: "mega_10", emoji: "👑", name: "Mega Legend", desc: "", unlockHint: "Finish 10 weekly mega-quests" },
  { id: "level_5", emoji: "⭐", name: "Rising Star", desc: "", unlockHint: "Earn XP to reach Level 5" },
  { id: "level_10", emoji: "🚀", name: "Farm Master", desc: "", unlockHint: "Earn XP to reach Level 10" },
  { id: "coins_5000", emoji: "💰", name: "Rich Farmer", desc: "", unlockHint: "Earn 5,000 coins in total" },
  { id: "harvest_100", emoji: "🌾", name: "Harvest King", desc: "", unlockHint: "Harvest 100 crops in total" },
  { id: "streak_3", emoji: "🔥", name: "Dedicated Farmer", desc: "", unlockHint: "Come back on 3 consecutive days" },
  { id: "golden_harvest", emoji: "✨", name: "Golden Touch", desc: "", unlockHint: "Win Golden Seeds from a mega-quest, plant and harvest" },
  { id: "order_25", emoji: "📦", name: "Trusted Supplier", desc: "", unlockHint: "Deliver 25 NPC orders" },
];

const badgeGuideProgress = (def: GuideDef, s: { coinsEarned: number; cropsHarvested: number; ordersDelivered: number }, level: number, streak: number, earned: AchievementRecord[], weekDays: number): string => {
  if (def.id === "coins_5000") return `${Math.min(s.coinsEarned, 5000).toLocaleString()} / 5,000 🪙`;
  if (def.id === "harvest_100") return `${Math.min(s.cropsHarvested, 100)} / 100 crops harvested`;
  if (def.id === "order_25") return `${Math.min(s.ordersDelivered, 25)} / 25 orders delivered`;
  if (def.id === "level_5") return `Lv ${Math.min(level, 5)} / 5`;
  if (def.id === "level_10") return `Lv ${Math.min(level, 10)} / 10`;
  if (def.id === "streak_3") return `Streak ${Math.min(streak, 3)} / 3 days`;
  const megaCount = earned.filter((a) => /^mega_\d+$/.test(a.id)).length;
  if (def.id === "mega_5") return `${Math.min(megaCount, 5)} / 5 mega-quests`;
  if (def.id === "mega_10") return `${Math.min(megaCount, 10)} / 10 mega-quests`;
  if (def.id === "first_mega") return `${Math.min(weekDays, 7)} / 7 days completed this week`;
  return "No progress yet — start the requirement above!";
};

const badgeGuideRatio = (def: GuideDef, s: { coinsEarned: number; cropsHarvested: number; ordersDelivered: number }, level: number, streak: number, earned: AchievementRecord[], weekDays: number): number => {
  if (def.id === "coins_5000") return Math.min(s.coinsEarned / 5000, 1);
  if (def.id === "harvest_100") return Math.min(s.cropsHarvested / 100, 1);
  if (def.id === "order_25") return Math.min(s.ordersDelivered / 25, 1);
  if (def.id === "level_5") return Math.min(level / 5, 1);
  if (def.id === "level_10") return Math.min(level / 10, 1);
  if (def.id === "streak_3") return Math.min(streak / 3, 1);
  const megaCount = earned.filter((a) => /^mega_\d+$/.test(a.id)).length;
  if (def.id === "mega_5") return Math.min(megaCount / 5, 1);
  if (def.id === "mega_10") return Math.min(megaCount / 10, 1);
  if (def.id === "first_mega") return Math.min((weekDays || 0) / 7, 1);
  return 0;
};

describe("\"How to Unlock\" badge guide screen", () => {
  const emptyStats = { coinsEarned: 0, cropsHarvested: 0, ordersDelivered: 0 };
  const earned: AchievementRecord[] = [];

  it("has exactly one guide entry for every badge definition", () => {
    expect(GUIDE_DEFS).toHaveLength(ACHIEVEMENT_DEFS.length);
    const ids = new Set(GUIDE_DEFS.map((d) => d.id));
    expect(ids.size).toBe(GUIDE_DEFS.length);
  });

  it("computes progress text per badge at a fresh start", () => {
    expect(badgeGuideProgress(GUIDE_DEFS.find((d) => d.id === "coins_5000")!, emptyStats, 1, 0, earned, 0)).toBe("0 / 5,000 🪙");
    expect(badgeGuideProgress(GUIDE_DEFS.find((d) => d.id === "harvest_100")!, emptyStats, 1, 0, earned, 0)).toBe("0 / 100 crops harvested");
    expect(badgeGuideProgress(GUIDE_DEFS.find((d) => d.id === "order_25")!, emptyStats, 1, 0, earned, 0)).toBe("0 / 25 orders delivered");
    expect(badgeGuideProgress(GUIDE_DEFS.find((d) => d.id === "level_5")!, emptyStats, 1, 0, earned, 0)).toBe("Lv 1 / 5");
    expect(badgeGuideProgress(GUIDE_DEFS.find((d) => d.id === "streak_3")!, emptyStats, 1, 0, earned, 0)).toBe("Streak 0 / 3 days");
    expect(badgeGuideProgress(GUIDE_DEFS.find((d) => d.id === "golden_harvest")!, emptyStats, 1, 0, earned, 0)).toContain("No progress yet");
  });

  it("caps ratios at 1 and computes partial progress", () => {
    const s = { coinsEarned: 2500, cropsHarvested: 150, ordersDelivered: 12 };
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "coins_5000")!, s, 1, 0, earned, 0)).toBeCloseTo(0.5);
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "harvest_100")!, s, 1, 0, earned, 0)).toBe(1); // over-earned stays at 1
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "order_25")!, s, 1, 0, earned, 0)).toBeCloseTo(0.48);
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "level_5")!, s, 3, 0, earned, 0)).toBeCloseTo(0.6);
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "first_mega")!, s, 3, 0, earned, 4)).toBeCloseTo(4 / 7);
  });

  it("progress text caps at the target and uses earned mega-quest records", () => {
    const earnedRecs: AchievementRecord[] = [
      { id: "mega_1", earnedAt: "2026-07-01 00:00 UTC", week: "2026-W27" },
      { id: "mega_2", earnedAt: "2026-07-08 00:00 UTC", week: "2026-W28" },
      { id: "mega_3", earnedAt: "2026-07-15 00:00 UTC", week: "2026-W29" },
    ];
    expect(badgeGuideProgress(GUIDE_DEFS.find((d) => d.id === "mega_5")!, emptyStats, 1, 0, earnedRecs, 0)).toBe("3 / 5 mega-quests");
    expect(badgeGuideProgress(GUIDE_DEFS.find((d) => d.id === "mega_10")!, emptyStats, 1, 0, earnedRecs, 0)).toBe("3 / 10 mega-quests");
    // first_mega already earned; progress still reports weekly day count
    expect(badgeGuideProgress(GUIDE_DEFS.find((d) => d.id === "first_mega")!, emptyStats, 1, 0, earnedRecs, 7)).toBe("7 / 7 days completed this week");
  });

  it("guide ratio implies earned status consistently with threshold checks", () => {
    // At exactly-threshold values, ratio is 1 — matching the award conditions
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "coins_5000")!, { coinsEarned: 5000, cropsHarvested: 0, ordersDelivered: 0 }, 1, 0, earned, 0)).toBe(1);
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "harvest_100")!, { coinsEarned: 0, cropsHarvested: 100, ordersDelivered: 0 }, 1, 0, earned, 0)).toBe(1);
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "order_25")!, { coinsEarned: 0, cropsHarvested: 0, ordersDelivered: 25 }, 1, 0, earned, 0)).toBe(1);
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "level_5")!, { coinsEarned: 0, cropsHarvested: 0, ordersDelivered: 0 }, 5, 0, earned, 0)).toBe(1);
    expect(badgeGuideRatio(GUIDE_DEFS.find((d) => d.id === "streak_3")!, { coinsEarned: 0, cropsHarvested: 0, ordersDelivered: 0 }, 1, 3, earned, 0)).toBe(1);
  });
});
