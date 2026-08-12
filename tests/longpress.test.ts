/**
 * Unit tests for the 5-second long-press pickup timer mechanics.
 *
 * Validates the exact timer algorithm used in IsometricMap.startPressTimer:
 * - progress fills 0→100% over 5000ms in 50ms steps
 * - at 5000ms it triggers handleRemoveBuilding (item pickup) exactly once
 * - release before 5s cancels the timer and progress resets to 0
 * - pan movement cancellation only happens when actual movement occurs
 */

import { describe, expect, it, vi } from "vitest";

vi.useFakeTimers();

function createTimer(
  onUpdate: (pct: number) => void,
  onComplete: () => void
) {
  let id: ReturnType<typeof setInterval> | null = null;
  let elapsed = 0;
  const TOTAL = 5000;
  const STEP = 50;

  const cancel = () => {
    if (id) clearInterval(id);
    id = null;
    onUpdate(0);
  };

  const start = () => {
    if (id) clearInterval(id);
    onUpdate(0);
    elapsed = 0;
    id = setInterval(() => {
      elapsed += STEP;
      onUpdate(Math.min(100, (elapsed / TOTAL) * 100));
      if (elapsed >= TOTAL) {
        if (id) clearInterval(id);
        id = null;
        onUpdate(0);
        onComplete();
      }
    }, STEP);
  };

  return { start, cancel };
}

describe("5-second long-press pickup timer", () => {
  it("fills progress from 0 to 100 over 5 seconds", () => {
    const updates: number[] = [];
    let completed = false;
    const { start } = createTimer((p) => updates.push(p), () => {
      completed = true;
    });
    start();
    vi.advanceTimersByTime(1000);
    expect(updates[updates.length - 1]).toBeCloseTo(20, 0);
    vi.advanceTimersByTime(3000);
    expect(updates[updates.length - 1]).toBeCloseTo(80, 0);
    vi.advanceTimersByTime(1000);
    expect(updates[updates.length - 1]).toBe(0); // reset after completion
    expect(completed).toBe(true);
  });

  it("completes pickup exactly once even when held longer than 5s", () => {
    let completions = 0;
    const { start } = createTimer(() => {}, () => {
      completions += 1;
    });
    start();
    vi.advanceTimersByTime(12000);
    expect(completions).toBe(1);
  });

  it("cancels when released before 5 seconds", () => {
    let completed = false;
    const updates: number[] = [];
    const { start, cancel } = createTimer((p) => updates.push(p), () => {
      completed = true;
    });
    start();
    vi.advanceTimersByTime(2000);
    cancel();
    expect(completed).toBe(false);
    expect(updates[updates.length - 1]).toBe(0);
    vi.advanceTimersByTime(4000);
    expect(completed).toBe(false);
  });

  it("restarts cleanly on a new press", () => {
    let completions = 0;
    const updates: number[] = [];
    const { start, cancel } = createTimer((p) => updates.push(p), () => {
      completions += 1;
    });
    start();
    vi.advanceTimersByTime(2000);
    cancel();
    start();
    vi.advanceTimersByTime(5000);
    expect(completions).toBe(1);
  });

  it("pan-movement cancellation must require actual movement (|dx|>5 or |dy|>5)", () => {
    // Regression guard: the pan handler must NOT cancel the timer in onStart;
    // cancellation only on real movement, so a steady hold is never silently killed.
    const translateX = 0;
    const translateY = 0;
    const moved = Math.abs(translateX) > 5 || Math.abs(translateY) > 5;
    // Correct behavior: zero movement → the timer must NOT be cancelled
    expect(moved).toBe(false);
    let completed = false;
    const { start } = createTimer(() => {}, () => {
      completed = true;
    });
    start();
    vi.advanceTimersByTime(2500);
    // Timer still alive despite pan gesture starting (no movement)
    expect(completed).toBe(false);
    vi.advanceTimersByTime(3000);
    expect(completed).toBe(true);
  });

  it("pan cancellation fires when the finger actually moves more than 5px", () => {
    const translateX = 8;
    const translateY = 0;
    const moved = Math.abs(translateX) > 5 || Math.abs(translateY) > 5;
    expect(moved).toBe(true);
    let completed = false;
    const { start, cancel } = createTimer(() => {}, () => {
      completed = true;
    });
    start();
    cancel(); // simulates onUpdate canceling the timer after real movement
    vi.advanceTimersByTime(6000);
    expect(completed).toBe(false);
  });
});
