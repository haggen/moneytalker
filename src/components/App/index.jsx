import { Debug } from "~/src/components/Debug";
import { useGameContext } from "~/src/lib/state";

import { Customer } from "~/src/features/Customer";
import { Money } from "~/src/features/Money";
import * as classes from "./style.module.css";

export function App() {
  const context = useGameContext();

  return (
    <div className={classes.layout}>
      <main>
        <Debug context={context} />

        <dl>
          <Money context={context} />
          <Customer context={context} />
        </dl>
      </main>
      <footer>
        <nav>
          Feito por <a href="https://twitter.com/haggen">mim</a>. Código aberto
          no <a href="https://github.com/haggen/moneytalker">GitHub</a>.
        </nav>
      </footer>
    </div>
  );
}
