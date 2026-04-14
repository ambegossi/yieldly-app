export interface Pool {
  id: string;
  chain: string;
  project: string;
  symbol: string;
  apy: number;
}

export interface ApyDataPoint {
  timestamp: string;
  apy: number;
}
