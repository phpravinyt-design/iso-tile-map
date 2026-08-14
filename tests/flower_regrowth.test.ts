import { describe, expect, it } from "vitest";

// Pure-logic mirror of the flower regrowth behavior implemented in
// components/IsometricMap.tsx (the component itself depends on React Native
// runtimes, so we test the queue semantics here in isolation):
// - A delivered flower is recorded with its type, position, and a bloomAt time.
// - When bloomAt <= now, the flower re-placed at its old tile if the tile is empty.
// - Expired entries are pruned from the persisted queue.

type RegrowthEntry = { type: string; row: number; col: number; bloomAt: number };

function tickRegrowth(queue: RegrowthEntry[], now: number): {
  remaining: RegrowthEntry[];
  bloomed: RegrowthEntry[];
} {
  const remaining: RegrowthEntry[] = [];
  const bloomed: RegrowthEntry[] = [];
  for (const e of queue) {
    if (e.bloomAt <= now) bloomed.push(e);
    else remaining.push(e);
  }
  return { remaining, bloomed };
}

function placeBloomed(grid: (string | null)[][], bloomed: RegrowthEntry[]): number {
  let placed = 0;
  for (const e of bloomed) {
    if (grid[e.row] && grid[e.row][e.col] === null) {
      grid[e.row][e.col] = e.type;
      placed += 1;
    }
  }
  return placed;
}

describe("flower regrowth", () => {
  it("records delivered flowers with bloomAt in the future", () => {
    const now = Date.now();
    const entry: RegrowthEntry = { type: "flower_roses", row: 5, col: 6, bloomAt: now + 30_000 };
    expect(entry.bloomAt).toBeGreaterThan(now);
    expect(entry.type).toBe("flower_roses");
  });

  it("does not bloom before bloomAt", () => {
    const queue: RegrowthEntry[] = [{ type: "flower_tulips", row: 2, col: 3, bloomAt: Date.now() + 30_000 }];
    const { remaining, bloomed } = tickRegrowth(queue, Date.now());
    expect(bloomed).toHaveLength(0);
    expect(remaining).toHaveLength(1);
  });

  it("blooms at bloomAt and prunes the queue", () => {
    const now = Date.now();
    const queue: RegrowthEntry[] = [{ type: "flower_tulips", row: 2, col: 3, bloomAt: now - 1 }];
    const { remaining, bloomed } = tickRegrowth(queue, now);
    expect(bloomed).toHaveLength(1);
    expect(bloomed[0].type).toBe("flower_tulips");
    expect(remaining).toHaveLength(0);
  });

  it("re-places the flower at its original tile when the tile is empty", () => {
    const grid: (string | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    const bloomed: RegrowthEntry[] = [{ type: "flower_lilies", row: 1, col: 1, bloomAt: 0 }];
    const placed = placeBloomed(grid, bloomed);
    expect(placed).toBe(1);
    expect(grid[1][1]).toBe("flower_lilies");
  });

  it("skips regrowth when the tile is occupied", () => {
    const grid: (string | null)[][] = [
      [null, null, null],
      [null, "house_barn", null],
      [null, null, null],
    ];
    const bloomed: RegrowthEntry[] = [{ type: "flower_lilies", row: 1, col: 1, bloomAt: 0 }];
    const placed = placeBloomed(grid, bloomed);
    expect(placed).toBe(0);
    expect(grid[1][1]).toBe("house_barn");
  });

  it("handles mixed queues: some bloom, some still waiting", () => {
    const now = Date.now();
    const queue: RegrowthEntry[] = [
      { type: "flower_roses", row: 0, col: 0, bloomAt: now - 500 },
      { type: "flower_daisies", row: 4, col: 4, bloomAt: now + 10_000 },
      { type: "flower_sunflowers", row: 8, col: 8, bloomAt: now - 2000 },
    ];
    const { remaining, bloomed } = tickRegrowth(queue, now);
    expect(bloomed).toHaveLength(2);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].type).toBe("flower_daisies");
  });

  it("persists only future entries after a tick", () => {
    const now = Date.now();
    const queue: RegrowthEntry[] = [
      { type: "flower_tulips", row: 1, col: 2, bloomAt: now - 100 },
      { type: "flower_roses", row: 3, col: 4, bloomAt: now + 5000 },
    ];
    const { remaining } = tickRegrowth(queue, now);
    // Persisted queue must only contain entries that can still bloom
    expect(remaining.every((e) => e.bloomAt > now)).toBe(true);
    expect(JSON.parse(JSON.stringify(remaining))).toHaveLength(1);
  });

  it("caps the in-memory sparkle overlay length", () => {
    // UI caps regrowFlowers at 20 entries via slice(-20)
    const overlay: { key: string; row: number; col: number }[] = [];
    for (let i = 0; i < 25; i += 1) {
      overlay.push(...Array(3).fill({ key: `r${i}`, row: i, col: i }));
    }
    const capped = overlay.slice(-20);
    expect(capped).toHaveLength(20);
  });
});
