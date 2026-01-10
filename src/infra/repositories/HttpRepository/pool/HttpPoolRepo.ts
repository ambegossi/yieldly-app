import { Pool } from "@/domain/pool/Pool";
import { PoolRepo } from "@/domain/pool/PoolRepo";
import { HttpClient } from "@/infra/http/HttpClient";
import { defiLlamaPoolDTOToPool } from "./PoolAdapter";
import { DefiLlamaGetPoolsResponseDTO } from "./PoolDTO";

export class HttpPoolRepo implements PoolRepo {
  constructor(private httpClient: HttpClient) {}

  async findAll(): Promise<Pool[]> {
    const response =
      await this.httpClient.get<DefiLlamaGetPoolsResponseDTO>("/pools");

    return response.data.data.map(defiLlamaPoolDTOToPool);
  }
}
