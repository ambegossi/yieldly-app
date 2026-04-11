import { ApyDataPoint, Pool } from "@/domain/pool/pool";
import { DefiLlamaApyDataPointDTO, DefiLlamaPoolDTO } from "./pool-dto";

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

export function defiLlamaChartDTOToApyHistory(
  dtos: DefiLlamaApyDataPointDTO[],
): ApyDataPoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  return dtos
    .filter(
      (dto): dto is DefiLlamaApyDataPointDTO & { apy: number } =>
        dto.apy !== null && new Date(dto.timestamp) >= cutoff,
    )
    .map((dto) => ({
      timestamp: dto.timestamp,
      apy: dto.apy,
    }));
}
