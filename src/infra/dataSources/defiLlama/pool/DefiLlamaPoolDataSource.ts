import { Pool } from "@/domain/pool/Pool";
import { HttpClient } from "@/infra/http/HttpClient";
import { defiLlamaPoolsToDomain } from "./DefiLlamaPoolAdapter";
import { DefiLlamaGetPoolsResponseDTO } from "./DefiLlamaPoolDTO";

export class DefiLlamaPoolDataSource {
  constructor(private httpClient: HttpClient) {}

  async findAll(): Promise<Pool[]> {
    const response =
      await this.httpClient.get<DefiLlamaGetPoolsResponseDTO>("/pools");

    return defiLlamaPoolsToDomain(response.data.data);
  }
}
