import { Repositories } from "@/domain/repositories";
import { defiLlamaHttpClient } from "@/infra/http/clients";
import { HttpPoolRepo } from "./pool/http-pool-repo";

export const HttpRepositories: Repositories = {
  poolRepo: new HttpPoolRepo(defiLlamaHttpClient),
};
