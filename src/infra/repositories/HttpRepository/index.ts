import { Repositories } from "@/domain/Repositories";
import { defiLlamaHttpClient } from "@/infra/http/clients";
import { HttpPoolRepo } from "./pool/HttpPoolRepo";

export const HttpRepositories: Repositories = {
  poolRepo: new HttpPoolRepo(defiLlamaHttpClient),
};
