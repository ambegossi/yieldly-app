import { Pool } from "@/domain/pool/Pool";
import { DefiLlamaPoolDTO } from "./DefiLlamaPoolDTO";

export function defiLlamaPoolToDomain(dto: DefiLlamaPoolDTO): Pool {
  return {
    id: dto.pool,
    chain: dto.chain,
    project: dto.project,
    symbol: dto.symbol,
    apy: dto.apy,
    url: dto.url,
  };
}

export function defiLlamaPoolsToDomain(dtos: DefiLlamaPoolDTO[]): Pool[] {
  return dtos.map(defiLlamaPoolToDomain);
}
