import { useRepository } from "@/infra/repositories/RepositoryProvider";
import { useAppQuery } from "@/infra/useCases/useAppQuery";

export function usePoolFindAll() {
  const { poolRepo } = useRepository();

  return useAppQuery({
    queryKey: ["pools"],
    fetchData: () => poolRepo.findAll(),
  });
}
