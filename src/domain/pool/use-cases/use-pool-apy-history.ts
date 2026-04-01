import { useRepository } from "@/infra/repositories/repository-provider";
import { useAppQuery } from "@/infra/use-cases/use-app-query";

export function usePoolApyHistory(poolId: string) {
  const { poolRepo } = useRepository();

  return useAppQuery({
    queryKey: ["pools", poolId, "apy-history"],
    fetchData: () => poolRepo.findApyHistory(poolId),
    options: {
      staleTime: 5 * 60 * 1000,
    },
  });
}
