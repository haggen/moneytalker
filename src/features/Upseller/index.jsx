import { Help } from "~/src/components/Help";
import { currency, percentage } from "~/src/lib/formatter";
import {
  handleEffectRegistered,
  reducers,
  extendInitialState,
} from "~/src/lib/state";

const { min, log } = Math;

extendInitialState({
  /** Upsellers hired. */
  upsellers: 0,
});

/**
 * Price of a upseller.
 */
function getUpsellerPrice() {
  return 1800;
}

/**
 * Tell if the upseller feature has been unlocked.
 */
function isUpsellerLocked(state) {
  return state.earned < getUpsellerPrice();
}

export function getUpsellerTicketIncrease(state) {
  if (state.upsellers === 0) {
    return 0;
  }

  const x = state.upsellers;

  return (log(x + 1) + x) * 0.01;
}

function handleUpsellerHired(state) {
  const price = getUpsellerPrice();

  if (state.cash < price) {
    return state;
  }

  const upsellers = state.upsellers + 1;

  return handleEffectRegistered({ ...state, upsellers }, price);
}

function reducer(state, action) {
  switch (action.type) {
    case "upseller/hired":
      return handleUpsellerHired(state);
    default:
      return state;
  }
}
reducers.push(reducer);

export function Upseller({ context }) {
  const { state, dispatch } = context;
  const price = getUpsellerPrice();

  if (isUpsellerLocked(state)) {
    return null;
  }

  return (
    <>
      <dt>
        Vendedores &mdash;
        <button
          onClick={() => dispatch({ type: "upseller/hired" })}
          disabled={state.cash < price}
        >
          Contratar ({currency(price)})
        </button>
      </dt>
      <dd>
        {state.upsellers}&nbsp;(
        <Help title="Adicional de rendimento por cliente.">
          {percentage(getUpsellerTicketIncrease(state))}
        </Help>
        )
      </dd>
    </>
  );
}
