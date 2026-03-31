import { useRepository } from "@/infra/repositories/repository-provider";
import { useAppSuspenseQuery } from "@/infra/use-cases/use-app-suspense-query";

export function usePoolFindAllSuspense() {
  const { poolRepo } = useRepository();

  return useAppSuspenseQuery({
    queryKey: ["pools"],
    fetchData: () => poolRepo.findAll(),
  });
}
