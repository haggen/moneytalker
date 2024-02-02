import { currency } from "~/src/lib/formatter";
import { initialState, reducers } from "~/src/lib/state";

initialState.set("money", {
    balance: 0,
    earned: 0,
});

function handleMoneyIncome(state) {
  const amount = applyModifiers(state, "money/income");
  
  if (amount <= 0) {
    return state;
  }

  return {
    ...state,
    balance: state.balance + amount,
    earned: state.earned + amount,
  };
}

function handleMoneyCharge(state, amount) {
  if (amount <= 0) {
    return state;
  }

  return {
    ...state, 
    balance: state.balance - amount,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "money/income":
      return handleMoneyIncome(state, action.payload);
    case "money/charge":
      return handleMoneyCharge(state, action.payload);
    default:
      return state;
  }
}
reducers.set("money", reducer);

export function Money({ context }) {
  const { state } = context;

  return (
    <>
      <dt>Saldo</dt>
      <dd>{currency(state.money.balance)}</dd>
    </>
  );
}
