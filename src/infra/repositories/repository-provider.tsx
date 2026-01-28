import { Repositories } from "@/domain/repositories";
import React from "react";

export const RepositoryContext = React.createContext<Repositories>(
  {} as Repositories,
);

export const RepositoryProvider = RepositoryContext.Provider;

export function useRepository(): Repositories {
  return React.useContext(RepositoryContext);
}
