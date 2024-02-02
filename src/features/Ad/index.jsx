import { useEffect } from "react";
import { Help } from "~/src/components/Help";
import { currency, percentage } from "~/src/lib/formatter";
import { extendInitialState, reducers } from "~/src/lib/state";

const { random } = Math;

extendInitialState({
  /** Ads contracted. */
  ads: 0,
});

function getAdPrice() {
  return 10;
}

function getAdOdds() {
  return 0.1;
}

function getAdAudience(state) {
  return Math.round(random() * state.ads);
}

function getAdResult(state) {
  if (state.ads === 0) {
    return 0;
  }

  return Math.floor(getAdOdds(state) * getAdAudience(state));
}

function handleAdBought(state) {
  const price = getAdPrice();

  if (state.cash < price) {
    return state;
  }

  return {
    ...state,
    ads: state.ads + 1,
  };
}

function handleAdRolled(state) {
  const converted = getAdResult(state);

  if (converted === 0) {
    return state;
  }

  return {
    ...state,
    customers: state.customers + converted,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "ad/bought":
      return handleAdBought(state, action.payload);
    case "ad/rolled":
      return handleAdRolled(state);
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
      type: "event/scheduled",
      payload: { type: "ad/rolled", interval: 1 },
    });

    return () => {
      dispatch({ type: "event/cancelled", payload: "ad/rolled" });
    };
  }, []);

  return (
    <>
      <dt>
        Publicidade &mdash;
        <button
          onClick={() => dispatch({ type: "ad/bought" })}
          disabled={state.cash < price}
        >
          Anunciar ({currency(price)})
        </button>
      </dt>
      <dd>
        {state.ads}&nbsp;(
        <Help title="Chance de conversão.">{percentage(getAdOdds(state))}</Help>
        )
      </dd>
    </>
  );
}
