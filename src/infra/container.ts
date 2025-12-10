import { Repositories } from "@/domain/Repositories";
import { DefiLlamaPoolDataSource } from "./dataSources/defiLlama/pool";
import { defiLlamaClient } from "./http/clients";
import { PoolRepoImpl } from "./repositories/pool";

export function createRepositories(): Repositories {
  // Data Sources
  const defiLlamaPoolDataSource = new DefiLlamaPoolDataSource(defiLlamaClient);

  // Repositories
  const poolRepo = new PoolRepoImpl(defiLlamaPoolDataSource);

  return {
    poolRepo,
  };
}
