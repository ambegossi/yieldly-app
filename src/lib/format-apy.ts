export function formatAPY(apy: number): string {
  const abs = Math.abs(apy);
  const sign = apy < 0 ? "-" : "";

  if (abs >= 10000) {
    return `${sign}${(abs / 1000).toFixed(1)}K%`;
  }

  if (abs >= 1000) {
    return `${sign}${Math.round(abs).toLocaleString("en-US")}%`;
  }

  return `${apy.toFixed(2)}%`;
}
