import { useReducer, useEffect } from "react";
import { useInterval } from "~/src/lib/useInterval";

let initialState = Object.freeze({
  /** State revision. */
  version: 2,
  /** Seconds elapsed. */
  elapsed: 0,
  /** Scheduled actions. */
  scheduled: [],
  /** Cash at hand. */
  cash: 0,
  /** Total cash earned. */
  earned: 0,
});

export function setInitialState(patch) {
  initialState = Object.freeze({ ...initialState, ...patch });
}

export function getCashCharged(state, amount) {
  return state.cash - amount;
}

function handleStateReset(state) {
  return {
    ...initialState,
    scheduled: state.scheduled.map((entry) => ({ ...entry, elapsed: 0 })),
  };
}

function handleStateLoaded(state, payload) {
  return payload;
}

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

function handleClockScheduled(state, entry) {
  return {
    ...state,
    scheduled: [...state.scheduled, { ...entry, elapsed: 1 }],
  };
}

function handleClockCancelled(state, type) {
  return {
    ...state,
    scheduled: state.scheduled.filter((entry) => entry.type !== type),
  };
}

export function handleCashCharged(state, amount) {
  return {
    ...state,
    cash: state.cash - amount,
  };
}

export function handleCashIncome(state, amount) {
  return {
    ...state,
    cash: state.cash + amount,
    earned: state.earned + amount,
  };
}

function reducer(state, action) {
  console.log(`Action dispatched`, action);

  switch (action.type) {
    case "state/reset":
      return handleStateReset(state);
    case "state/loaded":
      return handleStateLoaded(state, action.payload);
    case "clock/ticked":
      return handleClockTicked(state);
    case "clock/scheduled":
      return handleClockScheduled(state, action.payload);
    case "clock/cancelled":
      return handleClockCancelled(state, action.payload);
    case "cash/charged":
      return handleCashCharged(state, action.payload);
    case "cash/income":
      return handleCashIncome(state, action.payload);
    default:
      return state;
  }
}

/**
 * Reducers.
 */
export const reducers = [];

/**
 * Root reducer of all reducers.
 */
export function root(state, action) {
  return reducers.reduce(
    (state, reducer) => reducer(state, action),
    reducer(state, action)
  );
}

/**
 * Local storage key for saved state.
 */
const savedStateStorageKey = "state";

/**
 * Get initial game state.
 */
export function getInitialState() {
  const storedState = localStorage.getItem(savedStateStorageKey);
  if (storedState) {
    const savedState = JSON.parse(storedState);

    // @todo: We should do migrations. Meanwhile we simply reset the game.
    if (savedState.version === initialState.version) {
      return savedState;
    }
  }

  return { ...initialState };
}

/**
 * Game state.
 */
export function useGameContext() {
  const [state, dispatch] = useReducer(root, {}, getInitialState);

  useEffect(() => {
    localStorage.setItem(savedStateStorageKey, JSON.stringify(state));
  }, [state]);

  useInterval(() => {
    dispatch({ type: "clock/ticked" });

    for (const entry of state.scheduled) {
      if (entry.elapsed % entry.interval === 0) {
        dispatch({ type: entry.type, payload: entry.payload });
      }
    }
  }, 1000);

  return { state, dispatch };
}
