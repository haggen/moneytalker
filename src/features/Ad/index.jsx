import { useEffect } from "react";
import { currency } from "~/src/lib/formatter";
import {
  handleCashCharged,
  handleCashIncome,
  reducers,
  setInitialState,
} from "~/src/lib/state";

setInitialState({
  /** Ads contracted. */
  ads: 0,
});

export function getAdPrice() {
  return 12;
}

export function getAdIncome(state) {
  const price = getAdPrice();

  if (state.ads === 0) {
    return 0;
  }

  return 1 + price * Math.log1p(0.1 * state.ads);
}

function handleAdBought(state) {
  const price = getAdPrice();

  if (state.cash < price) {
    return state;
  }

  return handleCashCharged(
    {
      ...state,
      ads: state.ads + 1,
    },
    price
  );
}

function handleAdIncome(state) {
  const income = getAdIncome(state);

  if (income === 0) {
    return state;
  }

  return handleCashIncome(state, income);
}

function reducer(state, action) {
  switch (action.type) {
    case "ad/bought":
      return handleAdBought(state, action.payload);
    case "ad/income":
      return handleAdIncome(state);
    default:
      return state;
  }
}
reducers.push(reducer);

export function Ad({ context }) {
  const { state, dispatch } = context;
  const price = getAdPrice();

  useEffect(() => {
    dispatch({
      type: "clock/scheduled",
      payload: { type: "ad/income", interval: 1 },
    });

    return () => {
      dispatch({ type: "clock/cancelled", payload: "ad/income" });
    };
  }, []);

  if (state.earned < price) {
    return null;
  }

  return (
    <>
      <dt>
        Anúncios &mdash;
        <button
          onClick={() => dispatch({ type: "ad/bought" })}
          disabled={state.cash < price}
        >
          Anunciar ({currency(price)})
        </button>
      </dt>
      <dd>
        &times;{state.ads}&nbsp;({currency(getAdIncome(state))})
      </dd>
    </>
  );
}
