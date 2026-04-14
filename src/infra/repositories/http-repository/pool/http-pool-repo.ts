import { ApyDataPoint, Pool } from "@/domain/pool/pool";
import { STABLECOIN_SYMBOLS } from "@/domain/pool/stablecoin-symbols";
import { PoolRepo } from "@/domain/pool/pool-repo";
import { HttpClient } from "@/infra/http/http-client";
import {
  defiLlamaChartDTOToApyHistory,
  defiLlamaPoolDTOToPool,
} from "./pool-adapter";
import {
  DefiLlamaGetChartResponseDTO,
  DefiLlamaGetPoolsResponseDTO,
} from "./pool-dto";

function hasStablecoinSymbol(symbol: string): boolean {
  const tokens = symbol.split("-").map((token) => token.trim().toUpperCase());
  return tokens.some((token) =>
    (STABLECOIN_SYMBOLS as readonly string[]).includes(token),
  );
}

export class HttpPoolRepo implements PoolRepo {
  constructor(private httpClient: HttpClient) {}

  async findAll(): Promise<Pool[]> {
    const response =
      await this.httpClient.get<DefiLlamaGetPoolsResponseDTO>("/pools");

    return response.data.data
      .filter(
        (dto) => dto.stablecoin === true && hasStablecoinSymbol(dto.symbol),
      )
      .map(defiLlamaPoolDTOToPool);
  }

  async findApyHistory(poolId: string): Promise<ApyDataPoint[]> {
    const response = await this.httpClient.get<DefiLlamaGetChartResponseDTO>(
      `/chart/${poolId}`,
    );

    return defiLlamaChartDTOToApyHistory(response.data.data);
  }
}
