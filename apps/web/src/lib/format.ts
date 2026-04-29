export function formatNumberFa(value: number) {
  return Number.isFinite(value) ? value.toLocaleString("fa-IR") : "۰";
}

export function formatIRR(value: number) {
  return formatNumberFa(Math.round(value));
}

