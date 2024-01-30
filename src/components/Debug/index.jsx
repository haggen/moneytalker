import { Menu } from "~/src/components/Menu";
import { currency } from "~/src/lib/formatter";

export function Debug({ context }) {
  const enabled = !!new URL(location.href).searchParams.get("debug");

  if (!enabled) {
    return null;
  }

  return (
    <Menu>
      <li>
        <button
          onClick={() =>
            context.dispatch({ type: "cash/income", payload: 1000 })
          }
        >
          +{currency(1000)}
        </button>
      </li>
      <li>
        <button
          onClick={() =>
            context.dispatch({ type: "cash/income", payload: 10_000 })
          }
        >
          +{currency(10_000)}
        </button>
      </li>
      <li>
        <button
          onClick={() =>
            context.dispatch({ type: "cash/income", payload: 100_000 })
          }
        >
          +{currency(100_000)}
        </button>
      </li>
      <li>
        <button
          onClick={() =>
            context.dispatch({ type: "cash/income", payload: 1_000_000 })
          }
        >
          +{currency(1_000_000)}
        </button>
      </li>
      <li>
        <button onClick={() => context.dispatch({ type: "state/reset" })}>
          Reset
        </button>
      </li>
    </Menu>
  );
}
