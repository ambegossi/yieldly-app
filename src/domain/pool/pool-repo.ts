import { Pool } from "./pool";

export interface PoolRepo {
  findAll: () => Promise<Pool[]>;
}
