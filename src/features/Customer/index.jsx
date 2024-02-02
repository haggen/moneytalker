import { useEffect } from "react";
import { Help } from "~/src/components/Help";
import { currency } from "~/src/lib/formatter";
import {
  initialState,
  reducers
} from "~/src/lib/state";

const { random } = Math;

initialState.set("customers", {
  /** Customers acquired. */
  total: 0,
  /** Customer average ticket. */
  ticket: 0.33,
});

function handleCustomersIncome(state) {
  const income = getCustomerIncome(state);

  if (income === 0) {
    return state;
  }

  return handleCashCharged(state, income);
}

function handleCustomerDefected(state) {
  if (state.customers === 0) {
    return state;
  }

  return { ...state, customers: state.customers - getCustomerChurnRate(state) };
}

function reducer(state, action) {
  switch (action.type) {
    case "customers/income":
      return handleCustomersIncome(state);
    case "customers/defected":
      return handleCustomerDefected(state);
    default:
      return state;
  }
}
reducers.push(reducer);

export function Customer({ context }) {
  const { state, dispatch } = context;

  useEffect(() => {
    dispatch({
      type: "modifier/register",
      payload: { type: "money/income", fn: "n+1", },
    });

    dispatch({
      type: "event/scheduled",
      payload: { type: "customers/defected", interval: 1 },
    });

    return () => {
      dispatch({ type: "event/cancelled", payload: "customers/income" });
      dispatch({ type: "event/cancelled", payload: "customers/defected" });
    };
  }, []);

  return (
    <>
      <dt>Clientes</dt>
      <dd>
        {state.customers}&nbsp;(
        <Help title="Rendimento por cliente.">
          {currency(getCustomerTicket(state))}
        </Help>
        )
      </dd>
    </>
  );
}
