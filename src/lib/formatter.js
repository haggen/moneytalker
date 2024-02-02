const language = "pt-BR"; //navigator.language;

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
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function percentage(value) {
  return percentageFormatter.format(value * 100) + "%";
}
