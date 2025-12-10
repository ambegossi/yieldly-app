import { Pool } from "@/domain/pool/Pool";
import { PoolRepo } from "@/domain/pool/PoolRepo";
import { DefiLlamaPoolDataSource } from "@/infra/dataSources/defiLlama/pool";

export class PoolRepoImpl implements PoolRepo {
  constructor(private dataSource: DefiLlamaPoolDataSource) {}

  async findAll(): Promise<Pool[]> {
    return this.dataSource.findAll();
  }
}
