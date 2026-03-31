import { Pool } from "@/domain/pool/pool";
import { DefiLlamaPoolDTO } from "./pool-dto";

export function defiLlamaPoolDTOToPool(dto: DefiLlamaPoolDTO): Pool {
  return {
    id: dto.pool,
    chain: dto.chain,
    project: dto.project,
    symbol: dto.symbol,
    apy: dto.apy,
    url: dto.url,
  };
}
