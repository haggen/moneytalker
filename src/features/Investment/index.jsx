import { useEffect } from "react";
import { Menu } from "~/src/components/Menu";
import { currency, percentage } from "~/src/lib/formatter";
import {
    extendInitialState,
    handleCashCharged,
    handleEffectRegistered,
    reducers,
} from "~/src/lib/state";

extendInitialState({
  /** Cash invested. */
  invested: 0,
});

function getInvestmentPrice(state) {
  return 100_000;
}

function getInvestmentInterest(state) {
  if (state.invested === 0) {
    return 0;
  }
  return 1 / Math.pow(Math.log(state.invested), 2);
}

function handleInvestmentBought(state) {
  const price = getInvestmentPrice(state);

  if (state.cash < price) {
    return state;
  }

  return handleEffectRegistered(
    {
      ...state,
      invested: state.invested + price,
    },
    price,
  );
}

function handleInvestmentInterest(state) {
  if (state.invested === 0) {
    return state;
  }

  return {
    ...state,
    invested: state.invested + state.invested * getInvestmentInterest(state),
  };
}

function handleInvestmentClaimed(state) {
  if (state.invested === 0) {
    return state;
  }

  return handleCashCharged({ ...state, invested: 0 }, state.invested);
}

function reducer(state, action) {
  switch (action.type) {
    case "investment/bought":
      return handleInvestmentBought(state);
    case "investment/interest":
      return handleInvestmentInterest(state);
    case "investment/claimed":
      return handleInvestmentClaimed(state);
    default:
      return state;
  }
}
reducers.push(reducer);

export function Investment({ context }) {
  const { state, dispatch } = context;
  const price = getInvestmentPrice(state);

  useEffect(() => {
    dispatch({
      type: "event/scheduled",
      payload: { type: "investment/interest", interval: 12 },
    });

    return () => {
      dispatch({ type: "event/cancelled", payload: "investment/interest" });
    };
  }, []);

  if (state.earned < price) {
    return null;
  }

  return (
    <>
      <dt>
        Investimentos &mdash;
        <Menu>
          <li>
            <button
              onClick={() => dispatch({ type: "investment/bought" })}
              disabled={state.cash < price}
            >
              Investir ({currency(price)})
            </button>
          </li>
          <li>
            <button
              onClick={() => dispatch({ type: "investment/claimed" })}
              disabled={state.invested === 0}
            >
              Resgatar
            </button>
          </li>
        </Menu>
      </dt>
      <dd>
        {currency(state.invested)}&nbsp;(
        {percentage(getInvestmentInterest(state))})
      </dd>
    </>
  );
}
