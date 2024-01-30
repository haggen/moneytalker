import { useEffect } from "react";
import { currency } from "~/src/lib/formatter";
import {
  handleCashCharged,
  handleCashIncome,
  reducers,
  setInitialState,
} from "~/src/lib/state";

setInitialState({
  /** Helpers hired. */
  helpers: 0,
});

export function getHelperPrice() {
  return 720;
}

export function getHelperIncome(state) {
  const price = getHelperPrice();

  if (state.helpers === 0) {
    return 0;
  }

  return 1 + price * Math.log1p(0.1 * state.helpers);
}

function handleHelperBought(state) {
  const price = getHelperPrice();

  if (state.cash < price) {
    return state;
  }

  return handleCashCharged(
    {
      ...state,
      helpers: state.helpers + 1,
    },
    price
  );
}

function handleHelperIncome(state) {
  const income = getHelperIncome(state);

  if (income === 0) {
    return state;
  }

  return handleCashIncome(state, income);
}

function reducer(state, action) {
  switch (action.type) {
    case "helper/bought":
      return handleHelperBought(state);
    case "helper/income":
      return handleHelperIncome(state);
    default:
      return state;
  }
}
reducers.push(reducer);

export function Helper({ context }) {
  const { state, dispatch } = context;
  const price = getHelperPrice();

  useEffect(() => {
    dispatch({
      type: "clock/scheduled",
      payload: { type: "helper/income", interval: 1 },
    });

    return () => {
      dispatch({ type: "clock/cancelled", payload: "helper/income" });
    };
  }, []);

  if (state.earned < price) {
    return null;
  }

  return (
    <>
      <dt>
        Ajudantes &mdash;
        <button
          onClick={() => dispatch({ type: "helper/bought" })}
          disabled={state.cash < price}
        >
          Contratar ({currency(price)})
        </button>
      </dt>
      <dd>
        &times;{state.helpers}&nbsp;({currency(getHelperIncome(state))})
      </dd>
    </>
  );
}
