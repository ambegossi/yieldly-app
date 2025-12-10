export interface DefiLlamaPoolDTO {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  apy: number;
  url: string;
}

export interface DefiLlamaGetPoolsResponseDTO {
  status: string;
  data: DefiLlamaPoolDTO[];
}
