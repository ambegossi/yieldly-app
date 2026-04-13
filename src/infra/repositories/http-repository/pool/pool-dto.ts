export interface DefiLlamaPoolDTO {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  apy: number;
}

export interface DefiLlamaGetPoolsResponseDTO {
  status: string;
  data: DefiLlamaPoolDTO[];
}

export interface DefiLlamaApyDataPointDTO {
  timestamp: string;
  tvlUsd: number;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
  il7d: number | null;
  apyBase7d: number | null;
}

export interface DefiLlamaGetChartResponseDTO {
  status: string;
  data: DefiLlamaApyDataPointDTO[];
}
