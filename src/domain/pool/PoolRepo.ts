import { Pool } from "./Pool";

export interface PoolRepo {
  findAll: () => Promise<Pool[]>;
}
