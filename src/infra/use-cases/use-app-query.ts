import { useQuery } from "@tanstack/react-query";

interface UseAppQueryReturn<DataT> {
  data?: DataT;
  isLoading: boolean;
  isPending: boolean;
  error: unknown;
}

interface UseAppQueryParams<DataT> {
  queryKey: (string | null | undefined | number)[];
  fetchData: () => Promise<DataT>;
}

export function useAppQuery<DataT>({
  fetchData,
  queryKey,
}: UseAppQueryParams<DataT>): UseAppQueryReturn<DataT> {
  const { data, isLoading, isPending, error } = useQuery({
    queryKey,
    queryFn: fetchData,
  });

  return {
    data,
    isLoading,
    isPending,
    error,
  };
}
