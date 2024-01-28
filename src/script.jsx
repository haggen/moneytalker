import { createRoot } from "react-dom";
import { StrictMode, useCallback, useEffect, useReducer, useRef } from "react";

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
  franchise: 10_000,
  investment: 100_000,
  offshore: 1_000_000,
  merger: 10_000_000,
};

const yields = {
  ad: 10,
  hire: 100,
  franchise: 1000,
  investment: 10_000,
  merger: 100_000,
};

function getYield(state, taxed = false) {
  return (
    (1 +
      (state.ads * yields.ad +
        state.hired * yields.hire +
        state.franchised * yields.franchise +
        state.invested * yields.investment +
        state.merged * yields.merger)) *
    (taxed ? 1 - getTax(state) : 1)
  );
}

function getTax(state) {
  return (
    (state.balance > 1_000_000 ? 0.75 : state.balance > 100_000 ? 0.5 : 0.25) *
    Math.pow(0.99, state.offshored)
  );
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const percentage = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function f(value, formatter = currency) {
  return formatter.format(value);
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
        {action} ({f(costs[type])})
      </button>
    </>
  );
}

function reduce(state, action) {
  switch (action.type) {
    case "load":
      return action.state;
    case "yield":
      const balance = state.balance + getYield(state, true);
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
    case "offshore":
      if (state.balance < costs.offshore) {
        return state;
      }
      return {
        ...state,
        balance: state.balance - costs.offshore,
        offshored: state.offshored + 1,
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

const initialState = {
  version: 1,
  balance: 0,
  highestBalance: 0,
  ads: 0,
  hired: 0,
  franchised: 0,
  offshored: 0,
  invested: 0,
  merged: 0,
};

function getInitialState() {
  const storedState = localStorage.getItem("state");
  if (storedState) {
    const savedState = JSON.parse(storedState);

    if (savedState.version === undefined) {
      savedState.offshored = initialState.offshored;
      savedState.version = 1;
    }

    return savedState;
  }

  return { ...initialState };
}

export default function App() {
  const [state, dispatch] = useReducer(reduce, {}, getInitialState);

  useEffect(() => {
    localStorage.setItem("state", JSON.stringify(state));
  }, [state]);

  useInterval(() => {
    dispatch({ type: "yield" });
  }, 1000);

  return (
    <>
      <div style={{ float: "right" }}></div>

      <dl>
        <dt>Saldo</dt>
        <dd>{f(state.balance)}</dd>

        <dt>Rendimento (Imposto)</dt>
        <dd>
          {f(getYield(state))} ({f(getTax(state), percentage)})
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

        {state.highestBalance >= costs.offshore ? (
          <>
            <dt>
              <Heading
                type="offshore"
                action="Abrir"
                balance={state.balance}
                dispatch={dispatch}
              >
                Contas no Exterior
              </Heading>
            </dt>
            <dd>{state.offshored}</dd>
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
    </>
  );
}

createRoot(window.root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
