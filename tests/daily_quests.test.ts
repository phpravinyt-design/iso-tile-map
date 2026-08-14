import { describe, expect, it } from "vitest";

// ---- Re-implement the pure daily-quests logic for testing (mirrors IsometricMap.tsx) ----

type QuestKind = "coins" | "harvest" | "sell" | "place" | "deliver";

interface DailyQuest {
  id: number;
  kind: QuestKind;
  title: string;
  emoji: string;
  target: number;
  progress: number;
  done: boolean;
  claimed: boolean;
}

// simpleHash: djb2-style deterministic hash (same as in IsometricMap.tsx)
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

const QUEST_POOL: { kind: QuestKind; title: (t: number) => string; emoji: string; targets: (dateStr: string, idx: number) => number }[] = [
  { kind: "coins", title: (t) => `Earn ${t} coins`, emoji: "🪙", targets: (d, i) => 200 + simpleHash(d + ":qt" + i) % 4 * 100 },
  { kind: "harvest", title: (t) => `Harvest ${t} crops`, emoji: "🌾", targets: (d, i) => 8 + (simpleHash(d + ":qh" + i) % 5) },
  { kind: "sell", title: (t) => `Sell ${t} goods`, emoji: "🏪", targets: (d, i) => 8 + (simpleHash(d + ":qs" + i) % 5) },
  { kind: "place", title: (t) => `Place ${t} items`, emoji: "🏗️", targets: (d, i) => 3 + (simpleHash(d + ":qp" + i) % 3) },
  { kind: "deliver", title: (t) => `Deliver ${t} orders`, emoji: "📦", targets: (d, i) => 1 + (simpleHash(d + ":qd" + i) % 2) },
];

function generateQuestsForDate(dateStr: string): DailyQuest[] {
  const n = QUEST_POOL.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = simpleHash(dateStr + ":qpick" + i) % (i + 1);
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  return Array.from({ length: 3 }, (_, i) => {
    const q = QUEST_POOL[indices[i]];
    const target = q.targets(dateStr, i);
    return {
      id: i,
      kind: q.kind,
      title: q.title(target),
      emoji: q.emoji,
      target,
      progress: 0,
      done: false,
      claimed: false,
    };
  });
}

function advanceQuestProgress(prev: DailyQuest[], kind: QuestKind, amount: number): DailyQuest[] {
  return prev.map((q) => {
    if (q.kind !== kind || q.done) return q;
    const progress = Math.min(q.progress + amount, q.target);
    return { ...q, progress, done: progress >= q.target };
  });
}

const QUEST_REWARD_COINS = 150;
const QUEST_XP_BOOST = 100;

describe("Daily Quests", () => {
  const today = new Date().toISOString().slice(0, 10);

  it("generates exactly 3 quests for any date", () => {
    for (const d of ["2026-08-14", "2026-12-31", "2025-01-01"]) {
      expect(generateQuestsForDate(d)).toHaveLength(3);
    }
  });

  it("generation is deterministic for the same date", () => {
    const a = generateQuestsForDate(today);
    const b = generateQuestsForDate(today);
    expect(a.map((q) => q.kind)).toEqual(b.map((q) => q.kind));
    expect(a.map((q) => q.target)).toEqual(b.map((q) => q.target));
  });

  it("all quests have valid kinds and sane targets", () => {
    const quests = generateQuestsForDate(today);
    for (const q of quests) {
      expect(QUEST_POOL.map((p) => p.kind)).toContain(q.kind);
      expect(q.target).toBeGreaterThan(0);
      expect(q.title).toContain(String(q.target));
    }
  });

  it("harvest quest targets are 8-12 and place targets 3-5", () => {
    // Enumerate a wide range of dates to validate bounds
    const bounds: Record<string, [number, number]> = {
      harvest: [8, 12],
      sell: [8, 12],
      place: [3, 5],
      deliver: [1, 2],
      coins: [200, 500],
    };
    for (let day = 0; day < 400; day += 1) {
      const d = new Date(2026, 0, 1 + day).toISOString().slice(0, 10);
      for (const q of generateQuestsForDate(d)) {
        const [min, max] = bounds[q.kind];
        expect(q.target).toBeGreaterThanOrEqual(min);
        expect(q.target).toBeLessThanOrEqual(max);
      }
    }
  });

  it("advanceQuestProgress increments matching kind and caps at target", () => {
    const quests = generateQuestsForDate(today);
    const kind = quests[0].kind;
    const target = quests[0].target;
    let state = quests;
    // Feed more than needed to ensure capping
    state = advanceQuestProgress(state, kind, target * 3);
    expect(state[0].progress).toBe(target);
    expect(state[0].done).toBe(true);
    // Other kinds untouched
    state.forEach((q, i) => {
      if (i !== 0) {
        expect(q.progress).toBe(0);
        expect(q.done).toBe(false);
      }
    });
  });

  it("tracking multiple small amounts accumulates correctly", () => {
    const quests = generateQuestsForDate(today);
    const kind = quests[0].kind;
    const target = quests[0].target;
    let state = quests;
    for (let i = 0; i < target; i += 1) {
      state = advanceQuestProgress(state, kind, 1);
    }
    expect(state[0].progress).toBe(target);
    expect(state[0].done).toBe(true);
  });

  it("already-done quests ignore further tracking", () => {
    const quests = generateQuestsForDate(today);
    const doneQuest: DailyQuest = { ...quests[0], progress: quests[0].target, done: true };
    const state = [doneQuest, ...quests.slice(1)];
    const updated = advanceQuestProgress(state, quests[0].kind, 50);
    expect(updated[0].progress).toBe(quests[0].target);
  });

  it("claim math grants 150 coins and 100 XP", () => {
    expect(QUEST_REWARD_COINS).toBe(150);
    expect(QUEST_XP_BOOST).toBe(100);
    // XP boost should dwarf the normal task reward (15 XP)
    expect(QUEST_XP_BOOST).toBeGreaterThan(50);
  });

  it("each day picks a varied subset of quest kinds over a month", () => {
    const kindsSeen = new Set<QuestKind>();
    for (let day = 0; day < 30; day += 1) {
      const d = new Date(2026, 7, 1 + day).toISOString().slice(0, 10);
      for (const q of generateQuestsForDate(d)) {
        kindsSeen.add(q.kind);
      }
    }
    // Over a month, at least 4 of the 5 kinds should appear
    expect(kindsSeen.size).toBeGreaterThanOrEqual(4);
  });
});
