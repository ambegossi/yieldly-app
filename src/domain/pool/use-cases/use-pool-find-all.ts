import { useRepository } from "@/infra/repositories/repository-provider";
import { useAppQuery } from "@/infra/use-cases/use-app-query";

export function usePoolFindAll() {
  const { poolRepo } = useRepository();

  return useAppQuery({
    queryKey: ["pools"],
    fetchData: () => poolRepo.findAll(),
  });
}
