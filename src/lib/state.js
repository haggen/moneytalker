import { useModifier, useReducer } from "react";
import { useInterval } from "~/src/lib/useInterval";

/**
 * Initial state patches.
 */
export const initialState = [
  Object.freeze({
    /** State revision. */
    version: 3,
    /** Seconds elapsed. */
    elapsed: 0,
    /** Scheduled actions. */
    scheduled: [],
    /** Modifiers. */
    modifiers: [],
  }),
];

/**
 * Build initial state.
 */
function getInitialState() {
  return initialState.reduce(
    (state, patch) => Object.freeze({ ...state, ...patch }),
    {},
  );
}

/**
 * Handle state reset.
 */
function handleStateReset(state) {
  return getInitialState();
}

/**
 * Handle clock tick.
 */
function handleClockTicked(state) {
  return {
    ...state,
    elapsed: state.elapsed + 1,
    scheduled: state.scheduled.map((entry) => ({
      ...entry,
      elapsed: entry.elapsed + 1,
    })),
  };
}

/**
 * Handle event scheduled.
 */
function handleEventScheduled(state, entry) {
  return {
    ...state,
    scheduled: [...state.scheduled, { ...entry, elapsed: 1 }],
  };
}

/**
 * Handle event cancelled.
 */
function handleEventCancelled(state, type) {
  return {
    ...state,
    scheduled: state.scheduled.filter((entry) => entry.type !== type),
  };
}

/**
 * Handle modifier registered.
 */
function handleModifierRegistered(state, modifier) {
  return {
    ...state,
    modifiers: [...state.modifiers, modifier],
  };
}

/**
 * Handle modifier changed.
 */
function handleModifierChanged(state, modifier) {
  const modifiers = [...state.modifiers];

  for (const m of modifiers) {
    if (m.type === modifier.type) {
      m.fn = modifier.fn;
    }
  }

  return {
    ...state,
    modifiers,
  };
}

/**
 * Handle modifier removed.
 */
function handleModifierRemoved(state, type) {
  return {
    ...state,
    modifiers: state.modifiers.filter((modifier) => modifier.type !== type),
  };
}

/**
 * Apply value modifiers.
 */
export function applyModifiers(modifiers, value) {
  return modifiers.reduce((value, modifier) => {
    if (modifier.type === value.type) {
      return Function("state", "value", `return ${modifier.fn};`)(state, value);
    }
    return value;
  }, value);
}

/**
 * Initial reducer.
 */
function initialReducer(state, action) {
  switch (action.type) {
    case "state/reset":
      return handleStateReset(state);
    case "clock/ticked":
      return handleClockTicked(state);
    case "event/scheduled":
      return handleEventScheduled(state, action.payload);
    case "event/cancelled":
      return handleEventCancelled(state, action.payload);
    case "modifier/registered":
      return handleModifierRegistered(state, action.payload);
    case "modifier/changed":
      return handleModifierChanged(state, action.payload);
    case "modifier/removed":
      return handleModifierRemoved(state, action.payload);
    default:
      return state;
  }
}

/**
 * Additional reducers.
 */
export const reducers = new Map();

/**
 * Root reducer.
 */
function root(state, action) {
  console.log(`Action dispatched`, action);

  return reducers.reduce(
    (state, reducer) => reducer(state, action),
    initialReducer(state, action),
  );
}

/**
 * Local storage key for saved state.
 */
function getStoredStateKey(state) {
  return `state-${state.version}`;
}

/**
 * Load or initialize game state.
 */
function load() {
  const initialState = getInitialState();

  const storedState = localStorage.getItem(getStoredStateKey(initialState));
  if (storedState) {
    return JSON.parse(storedState);
  }

  return initialState;
}

/**
 * Game state.
 */
export function useGameContext() {
  const [state, dispatch] = useReducer(root, {}, load);

  useModifier(() => {
    localStorage.setItem(getStoredStateKey(state), JSON.stringify(state));
  }, [state]);

  useInterval(() => {
    dispatch({ type: "clock/ticked" });

    for (const entry of state.scheduled) {
      if (entry.elapsed % entry.interval === 0) {
        dispatch({ type: entry.type });
      }
    }
  }, 1000);

  return { state, dispatch };
}
