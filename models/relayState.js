// models/relayState.js
const state = {
  activeTimer: null,
  endTime:     null,
};

export function getState() {
  return {
    active:      !!state.activeTimer,
    secondsLeft: state.endTime
      ? Math.max(0, Math.round((state.endTime - Date.now()) / 1000))
      : 0,
  };
}

export function setState(timer, endTime) {
  state.activeTimer = timer;
  state.endTime     = endTime;
}

export function clearState() {
  if (state.activeTimer) clearTimeout(state.activeTimer);
  state.activeTimer = null;
  state.endTime     = null;
}

export function getRawState() {
  return state;
}