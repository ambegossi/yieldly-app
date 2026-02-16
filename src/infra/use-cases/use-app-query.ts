import {
  useQuery,
  type DefaultError,
  type UseQueryOptions,
} from "@tanstack/react-query";

interface UseAppQueryParams<TData> {
  queryKey: unknown[];
  fetchData: () => Promise<TData>;
  options?: Omit<UseQueryOptions<TData, DefaultError>, "queryKey" | "queryFn">;
}

export function useAppQuery<TData>({
  fetchData,
  queryKey,
  options,
}: UseAppQueryParams<TData>) {
  return useQuery({
    queryKey,
    queryFn: fetchData,
    ...options,
  });
}
