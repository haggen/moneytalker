import { currency } from "~/src/lib/formatter";
import { Debug } from "~/src/components/Debug";
import { useGameContext } from "~/src/lib/state";
import { Ad } from "~/src/features/Ad";
import { Investment } from "~/src/features/Investment";
import { useEffect } from "react";
import { Helper } from "~/src/features/Helper";
import { Seller } from "~/src/features/Seller";
import { Franchise } from "~/src/features/Franchise";

export function App() {
  const context = useGameContext();

  useEffect(() => {
    context.dispatch({
      type: "clock/scheduled",
      payload: { type: "cash/income", payload: 1, interval: 1 },
    });

    return () => {
      context.dispatch({ type: "clock/cancelled", payload: "cash/income" });
    };
  }, []);

  return (
    <>
      <Debug context={context} />

      <dl>
        <dt>Saldo</dt>
        <dd>{currency(context.state.cash)}</dd>

        {/* <dt>Imposto</dt>
        <dd>{percentage(features.tax.getTax(state))}</dd> */}

        <Ad context={context} />
        <Helper context={context} />
        <Seller context={context} />
        <Investment context={context} />
        <Franchise context={context} />
      </dl>
    </>
  );
}
