import { ApyDataPoint, Pool } from "./pool";

export interface PoolRepo {
  findAll: () => Promise<Pool[]>;
  findApyHistory: (poolId: string) => Promise<ApyDataPoint[]>;
}
