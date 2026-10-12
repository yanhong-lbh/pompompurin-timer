export const DEFAULT_DURATION_MS = 25 * 60 * 1000;
export const MAX_DURATION_MS = 99 * 60 * 60 * 1000;

function validDuration(value) {
  return Number.isInteger(value) && value >= 1000 && value <= MAX_DURATION_MS;
}

export function createTimer({ now = Date.now } = {}) {
  let state = { status: 'idle', durationMs: DEFAULT_DURATION_MS };

  function getState() {
    let remainingMs = state.durationMs;
    if (state.status === 'running') {
      remainingMs = Math.max(0, Math.min(state.durationMs, state.deadlineMs - now()));
      if (remainingMs === 0) state = { status: 'finished', durationMs: state.durationMs };
    } else if (state.status === 'paused') {
      remainingMs = state.remainingMs;
    } else if (state.status === 'finished') {
      remainingMs = 0;
    }
    return Object.freeze({ status: state.status, durationMs: state.durationMs, remainingMs });
  }

  function start() {
    const current = getState();
    if (current.status !== 'running') {
      const remainingMs = current.status === 'paused' ? current.remainingMs : current.durationMs;
      state = { status: 'running', durationMs: current.durationMs, deadlineMs: now() + remainingMs };
    }
    return getState();
  }

  function pause() {
    const current = getState();
    if (current.status === 'running') state = { ...current, status: 'paused' };
    return getState();
  }

  function reset(durationMs = state.durationMs) {
    if (!validDuration(durationMs)) throw new RangeError('Duration must be between one second and 99 hours.');
    state = { status: 'idle', durationMs };
    return getState();
  }

  function snapshot() {
    const current = getState();
    return Object.freeze({
      version: 1,
      ...current,
      ...(current.status === 'running' ? { deadlineMs: state.deadlineMs } : {}),
    });
  }

  function restore(saved) {
    if (!saved || typeof saved !== 'object' || saved.version !== 1 || !validDuration(saved.durationMs)) return false;
    const { status, durationMs, remainingMs, deadlineMs } = saved;
    if (!Number.isInteger(remainingMs) || remainingMs < 0 || remainingMs > durationMs) return false;

    switch (status) {
      case 'idle':
        if (remainingMs !== durationMs) return false;
        state = { status, durationMs };
        break;
      case 'finished':
        if (remainingMs !== 0) return false;
        state = { status, durationMs };
        break;
      case 'paused':
        if (remainingMs === 0) return false;
        state = { status, durationMs, remainingMs };
        break;
      case 'running':
        if (remainingMs === 0 || !Number.isSafeInteger(deadlineMs)) return false;
        state = { status, durationMs, deadlineMs };
        break;
      default:
        return false;
    }
    getState();
    return true;
  }

  return Object.freeze({ start, pause, reset, getState, remainingMs: () => getState().remainingMs, snapshot, restore });
}
