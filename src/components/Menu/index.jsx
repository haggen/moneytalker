import * as classes from "./style.module.css";

export function Menu({ children }) {
  return <menu className={classes.menu}>{children}</menu>;
}
