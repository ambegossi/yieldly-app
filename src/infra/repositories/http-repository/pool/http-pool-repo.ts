import { ApyDataPoint, Pool } from "@/domain/pool/pool";
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

export class HttpPoolRepo implements PoolRepo {
  constructor(private httpClient: HttpClient) {}

  async findAll(): Promise<Pool[]> {
    const response =
      await this.httpClient.get<DefiLlamaGetPoolsResponseDTO>("/pools");

    return response.data.data.map(defiLlamaPoolDTOToPool);
  }

  async findApyHistory(poolId: string): Promise<ApyDataPoint[]> {
    const response = await this.httpClient.get<DefiLlamaGetChartResponseDTO>(
      `/chart/${poolId}`,
    );

    return defiLlamaChartDTOToApyHistory(response.data.data);
  }
}
