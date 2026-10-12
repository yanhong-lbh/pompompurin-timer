import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimer, DEFAULT_DURATION_MS, MAX_DURATION_MS } from './timer.js';

function clock() {
  let time = 1_000_000;
  return { now: () => time, advance: (milliseconds) => { time += milliseconds; } };
}

test('starts at 25 minutes and uses elapsed wall time even without intermediate updates', () => {
  const time = clock();
  const timer = createTimer(time);
  assert.deepEqual(timer.getState(), { status: 'idle', durationMs: DEFAULT_DURATION_MS, remainingMs: DEFAULT_DURATION_MS });
  timer.start();
  time.advance(73_123);
  assert.equal(timer.remainingMs(), DEFAULT_DURATION_MS - 73_123);
  timer.start();
  time.advance(1000);
  assert.equal(timer.remainingMs(), DEFAULT_DURATION_MS - 74_123);
});

test('pause freezes the remaining time and resume continues from it', () => {
  const time = clock();
  const timer = createTimer(time);
  timer.reset(60_000);
  timer.start();
  time.advance(12_345);
  assert.deepEqual(timer.pause(), { status: 'paused', durationMs: 60_000, remainingMs: 47_655 });
  time.advance(600_000);
  assert.equal(timer.remainingMs(), 47_655);
  timer.pause();
  timer.start();
  time.advance(7000);
  assert.equal(timer.remainingMs(), 40_655);
});

test('reset returns to the same selected duration, or accepts a new duration', () => {
  const time = clock();
  const timer = createTimer(time);
  timer.reset(90_000);
  timer.start();
  time.advance(1000);
  assert.deepEqual(timer.reset(), { status: 'idle', durationMs: 90_000, remainingMs: 90_000 });
  assert.deepEqual(timer.reset(1000), { status: 'idle', durationMs: 1000, remainingMs: 1000 });
  assert.equal(timer.pause().status, 'idle');
});

test('completion clamps at zero, pause preserves completion, and start begins another countdown', () => {
  const time = clock();
  const timer = createTimer(time);
  timer.reset(1000);
  timer.start();
  time.advance(1000);
  assert.deepEqual(timer.getState(), { status: 'finished', durationMs: 1000, remainingMs: 0 });
  time.advance(999_999);
  assert.equal(timer.pause().status, 'finished');
  assert.equal(timer.remainingMs(), 0);
  assert.deepEqual(timer.start(), { status: 'running', durationMs: 1000, remainingMs: 1000 });
});

test('running snapshots preserve the deadline across reload and finish while closed', () => {
  const time = clock();
  const timer = createTimer(time);
  timer.reset(60_000);
  timer.start();
  time.advance(10_000);
  const saved = JSON.parse(JSON.stringify(timer.snapshot()));
  assert.equal(saved.deadlineMs, 1_060_000);
  time.advance(20_000);
  const reloaded = createTimer(time);
  assert.equal(reloaded.restore(saved), true);
  assert.deepEqual(reloaded.getState(), { status: 'running', durationMs: 60_000, remainingMs: 30_000 });
  time.advance(40_000);
  const expired = createTimer(time);
  assert.equal(expired.restore(saved), true);
  assert.deepEqual(expired.getState(), { status: 'finished', durationMs: 60_000, remainingMs: 0 });
});

test('idle, paused, and finished snapshots round trip without a deadline', () => {
  const time = clock();
  const timer = createTimer(time);
  const reloaded = createTimer(time);
  for (const status of ['idle', 'paused', 'finished']) {
    timer.reset(10_000);
    if (status !== 'idle') {
      timer.start();
      time.advance(status === 'paused' ? 2000 : 10_000);
      if (status === 'paused') timer.pause();
    }
    const saved = JSON.parse(JSON.stringify(timer.snapshot()));
    assert.equal(saved.status, status);
    assert.equal(Object.hasOwn(saved, 'deadlineMs'), false);
    time.advance(50_000);
    assert.equal(reloaded.restore(saved), true);
    assert.deepEqual(reloaded.getState(), timer.getState());
  }
});

test('invalid persisted input cannot overwrite a valid countdown', () => {
  const time = clock();
  const timer = createTimer(time);
  timer.reset(60_000);
  timer.start();
  const before = timer.snapshot();
  for (const saved of [
    null, undefined, '', [], {},
    { ...before, version: 2 },
    { ...before, status: 'unknown' },
    { ...before, durationMs: 0 },
    { ...before, durationMs: MAX_DURATION_MS + 1 },
    { ...before, durationMs: '60000' },
    { ...before, remainingMs: -1 },
    { ...before, remainingMs: 60_001 },
    { ...before, remainingMs: 0 },
    { ...before, remainingMs: 1.5 },
    { ...before, deadlineMs: Infinity },
    { ...before, deadlineMs: undefined },
    { ...before, status: 'idle', remainingMs: 1000 },
    { ...before, status: 'finished' },
    { ...before, status: 'paused', remainingMs: 0 },
  ]) {
    assert.equal(timer.restore(saved), false);
    assert.deepEqual(timer.snapshot(), before);
  }
});

test('duration bounds are enforced and returned states are immutable', () => {
  const timer = createTimer();
  for (const duration of [0, -1, 999, MAX_DURATION_MS + 1, NaN, Infinity, '1000', 1000.5]) {
    assert.throws(() => timer.reset(duration), RangeError);
  }
  timer.reset(MAX_DURATION_MS);
  const state = timer.getState();
  assert.equal(Object.isFrozen(state), true);
  assert.equal(Object.isFrozen(timer.snapshot()), true);
  assert.throws(() => { state.remainingMs = 0; }, TypeError);
  assert.equal(timer.remainingMs(), MAX_DURATION_MS);
});
