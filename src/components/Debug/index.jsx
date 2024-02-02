import { Menu } from "~/src/components/Menu";
import { currency, duration } from "~/src/lib/formatter";

export function Debug({ context }) {
  const { state, dispatch } = context;

  const enabled = !!new URL(location.href).searchParams.get("debug");

  if (!enabled) {
    return null;
  }

  function forward(seconds) {
    while (seconds--) {
      dispatch({ type: "event/ticked" });

      for (const entry of state.scheduled) {
        if (entry.elapsed % entry.interval === 0) {
          dispatch({ type: entry.type, payload: entry.payload });
        }
      }
    }
  }

  return (
    <Menu>
      <li>
        {Math.floor(state.elapsed / 60)}:{state.elapsed % 60}
      </li>
      <li>
        <button
          onClick={() => dispatch({ type: "cash/income", payload: 100_000 })}
        >
          +{currency(100_000)}
        </button>
      </li>
      <li>
        <button onClick={() => forward(60)}>+1 minuto</button>
      </li>
      <li>
        <button onClick={() => forward(600)}>+10 minutos</button>
      </li>
      <li>
        <button onClick={() => dispatch({ type: "state/reset" })}>Reset</button>
      </li>
    </Menu>
  );
}
