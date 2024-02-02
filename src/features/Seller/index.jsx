import { useEffect } from "react";
import { currency } from "~/src/lib/formatter";
import {
    extendInitialState,
    handleCashCharged,
    handleEffectRegistered,
    reducers,
} from "~/src/lib/state";

extendInitialState({
  /** Sellers hired. */
  sellers: 0,
});

export function getSellerPrice() {
  return 5400;
}

export function getSellerIncome(state) {
  const price = getSellerPrice();

  if (state.sellers === 0) {
    return 0;
  }

  return 1 + price * Math.log1p(0.1 * state.sellers);
}

function handleSellerBought(state) {
  const price = getSellerPrice();

  if (state.cash < price) {
    return state;
  }

  return handleEffectRegistered(
    {
      ...state,
      sellers: state.sellers + 1,
    },
    price,
  );
}

function handleSellerIncome(state) {
  const income = getSellerIncome(state);

  if (income === 0) {
    return state;
  }

  return handleCashCharged(state, income);
}

function reducer(state, action) {
  switch (action.type) {
    case "seller/bought":
      return handleSellerBought(state);
    case "seller/income":
      return handleSellerIncome(state);
    default:
      return state;
  }
}
reducers.push(reducer);

export function Seller({ context }) {
  const { state, dispatch } = context;
  const price = getSellerPrice();

  useEffect(() => {
    dispatch({
      type: "event/scheduled",
      payload: { type: "seller/income", interval: 1 },
    });

    return () => {
      dispatch({ type: "event/cancelled", payload: "seller/income" });
    };
  }, []);

  if (state.earned < price) {
    return null;
  }

  return (
    <>
      <dt>
        Vendedores &mdash;
        <button
          onClick={() => dispatch({ type: "seller/bought" })}
          disabled={state.cash < price}
        >
          Contratar ({currency(price)})
        </button>
      </dt>
      <dd>
        &times;{state.sellers}&nbsp;({currency(getSellerIncome(state))})
      </dd>
    </>
  );
}
