import { createRoot } from 'react-dom';
import { useCallback, useEffect, useReducer, useRef } from "react";

function useLiveRef(value) {
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });
  return valueRef;
}

function useIsMounted() {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return useCallback(() => isMounted.current, []);
}

function useInterval(callback, interval) {
  const isMounted = useIsMounted();
  const callbackRef = useLiveRef(callback);
  const intervalRef = useRef();
  useEffect(() => {
    if (intervalRef.current) {
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!isMounted()) {
        clearInterval(intervalRef.current);
        return;
      }
      callbackRef.current();
    }, interval);
  });
}

const costs = {
  ad: 100,
  hire: 1000,
  franchise: 10000,
  investment: 100000,
  merger: 1000000,
};

const yields = {
  ad: 10,
  hire: 100,
  franchise: 1000,
  investment: 10000,
  merger: 100000,
};

function getYield(state) {
  return (
    1 +
    state.ads * yields.ad +
    state.hired * yields.hire +
    state.franchised * yields.franchise +
    state.invested * yields.investment +
    state.merged * yields.merger
  );
}

function format(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function reduce(state, action) {
  console.log(action);

  switch (action.type) {
    case "load":
      return action.state;
    case "yield":
      const balance = state.balance + getYield(state);
      return {
        ...state,
        balance,
        highestBalance:
          balance > state.highestBalance ? balance : state.highestBalance,
      };
    case "ad":
      if (state.balance < costs.ad) {
        return state;
      }
      return {
        ...state,
        balance: state.balance - costs.ad,
        ads: state.ads + 1,
      };
    case "hire":
      if (state.balance < costs.hire) {
        return state;
      }
      return {
        ...state,
        balance: state.balance - costs.hire,
        hired: state.hired + 1,
      };
    case "franchise":
      if (state.balance < costs.franchise) {
        return state;
      }
      return {
        ...state,
        balance: state.balance - costs.franchise,
        franchised: state.franchised + 1,
      };
    case "investment":
      if (state.balance < costs.invest) {
        return state;
      }
      return {
        ...state,
        balance: state.balance - costs.investment,
        invested: state.invested + 1,
      };
    case "merger":
      if (state.balance < costs.merger) {
        return state;
      }
      return {
        ...state,
        balance: state.balance - costs.merger,
        merged: state.merged + 1,
      };
    default:
      return state;
  }
}

function Heading({ type, action, balance, children, dispatch }) {
  return (
    <>
      {children}
      &mdash;
      <button
        onClick={() => dispatch({ type })}
        disabled={balance < costs[type]}
      >
        {action} ({format(costs[type])})
      </button>
    </>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reduce, {}, () => {
    const state = localStorage.getItem("state");
    if (state) {
      return JSON.parse(state);
    }
    return {
      balance: 0,
      highestBalance: 0,
      ads: 0,
      hired: 0,
      franchised: 0,
      invested: 0,
      merged: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem("state", JSON.stringify(state));
  }, [state]);

  useInterval(() => {
    dispatch({ type: "yield" });
  }, 1000);

  return (
    <div>
      <div style={{ float: "right" }}></div>
      <dl>
        <dt>Saldo</dt>
        <dd>
          {format(state.balance)} ({format(getYield(state))})
        </dd>
        {state.highestBalance >= costs.ad ? (
          <>
            <dt>
              <Heading
                type="ad"
                action="Anunciar"
                balance={state.balance}
                dispatch={dispatch}
              >
                Anúncios
              </Heading>
            </dt>
            <dd>{state.ads}</dd>
          </>
        ) : null}
        {state.highestBalance >= costs.hire ? (
          <>
            <dt>
              <Heading
                type="hire"
                action="Contratar"
                balance={state.balance}
                dispatch={dispatch}
              >
                Empregados
              </Heading>
            </dt>
            <dd>{state.hired}</dd>
          </>
        ) : null}
        {state.highestBalance >= costs.franchise ? (
          <>
            <dt>
              <Heading
                type="franchise"
                action="Expandir"
                balance={state.balance}
                dispatch={dispatch}
              >
                Franquias
              </Heading>
            </dt>
            <dd>{state.franchised}</dd>
          </>
        ) : null}
        {state.highestBalance >= costs.investment ? (
          <>
            <dt>
              <Heading
                type="investment"
                action="Investir"
                balance={state.balance}
                dispatch={dispatch}
              >
                Investimentos
              </Heading>
            </dt>
            <dd>{state.invested}</dd>
          </>
        ) : null}
        {state.highestBalance >= costs.merger ? (
          <>
            <dt>
              <Heading
                type="merger"
                action="Fundir"
                balance={state.balance}
                dispatch={dispatch}
              >
                Fusões
              </Heading>
            </dt>
            <dd>{state.merged}</dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}

createRoot(window.root).render(<App />);