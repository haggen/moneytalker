import * as classes from "./style.module.css";

export function Help({ title, children }) {
  return (
    <span className={classes.help} title={title}>
      {children}
    </span>
  );
}
