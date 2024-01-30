const language = navigator.language || "en-US";

const currencyFormatter = new Intl.NumberFormat(language, {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function currency(value) {
  return "$" + currencyFormatter.format(value);
}

const percentageFormatter = new Intl.NumberFormat(language, {
  style: "decimal",
  minimumFractionDigits: 1,
  maximumFractionDigits: 4,
});

export function percentage(value) {
  return percentageFormatter.format(value * 100) + "%";
}
