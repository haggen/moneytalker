import { useEffect } from "react";
import { currency } from "~/src/lib/formatter";
import { handleCashCharged, reducers, setInitialState } from "~/src/lib/state";

setInitialState({
  /** Franchises opened. */
  franchises: 0,
});

function getFranchisePrice() {
  return 360_000;
}

function getFranchiseHires(state) {
  return Math.floor(Math.log1p(state.franchises) + state.franchises);
}

function handleFranchiseBought(state) {
  const price = getFranchisePrice();

  if (state.cash < price) {
    return state;
  }

  return handleCashCharged(
    {
      ...state,
      franchises: state.franchises + 1,
    },
    price
  );
}

function handleFranchiseHired(state) {
  if (state.franchises === 0) {
    return state;
  }

  return {
    ...state,
    helpers: state.helpers + getFranchiseHires(state),
    sellers: state.sellers + getFranchiseHires(state),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "franchise/bought":
      return handleFranchiseBought(state, action.payload);
    case "franchise/hired":
      return handleFranchiseHired(state);
    default:
      return state;
  }
}
reducers.push(reducer);

export function Franchise({ context }) {
  const { state, dispatch } = context;
  const price = getFranchisePrice();

  useEffect(() => {
    dispatch({
      type: "clock/scheduled",
      payload: { type: "franchise/hired", interval: 36 },
    });

    return () => {
      dispatch({ type: "clock/cancelled", payload: "franchise/hired" });
    };
  }, []);

  if (state.earned < price) {
    return null;
  }

  return (
    <>
      <dt>
        Franquias &mdash;
        <button
          onClick={() => dispatch({ type: "franchise/bought" })}
          disabled={state.cash < price}
        >
          Abrir ({currency(price)})
        </button>
      </dt>
      <dd>&times;{state.franchises}</dd>
    </>
  );
}
