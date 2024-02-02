import { useEffect } from "react";
import { Help } from "~/src/components/Help";
import { currency } from "~/src/lib/formatter";
import {
  handleEffectRegistered,
  reducers,
  extendInitialState,
} from "~/src/lib/state";

const { random, log, floor } = Math;

extendInitialState({
  /** Offices opened. */
  offices: 0,
});

function getOfficePrice() {
  return 100_000;
}

function getOfficeHiringRate(state) {
  return floor(log(state.offices + 1));
}

function handleOfficeBought(state) {
  const price = getOfficePrice();

  if (state.cash < price) {
    return state;
  }

  return handleEffectRegistered(
    {
      ...state,
      offices: state.offices + 1,
    },
    price,
  );
}

function handleOfficeHired(state) {
  if (state.offices === 0) {
    return state;
  }

  return {
    ...state,
    upsellers: state.upsellers + getOfficeHiringRate(state),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "office/bought":
      return handleOfficeBought(state, action.payload);
    case "office/hired":
      return handleOfficeHired(state);
    default:
      return state;
  }
}
reducers.push(reducer);

export function Office({ context }) {
  const { state, dispatch } = context;
  const price = getOfficePrice();

  useEffect(() => {
    dispatch({
      type: "event/scheduled",
      payload: { type: "office/hired", interval: 36 },
    });

    return () => {
      dispatch({ type: "event/cancelled", payload: "office/hired" });
    };
  }, []);

  if (state.earned < price) {
    return null;
  }

  return (
    <>
      <dt>
        Unidades &mdash;
        <button
          onClick={() => dispatch({ type: "office/bought" })}
          disabled={state.cash < price}
        >
          Expandir ({currency(price)})
        </button>
      </dt>
      <dd>
        {state.offices}&nbsp;(
        <Help title="Ritmo de contratações de novos vendedores."></Help>)
      </dd>
    </>
  );
}
