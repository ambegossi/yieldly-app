import {
  useSuspenseQuery,
  type DefaultError,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";

interface UseAppSuspenseQueryParams<TData> {
  queryKey: unknown[];
  fetchData: () => Promise<TData>;
  options?: Omit<
    UseSuspenseQueryOptions<TData, DefaultError>,
    "queryKey" | "queryFn"
  >;
}

export function useAppSuspenseQuery<TData>({
  fetchData,
  queryKey,
  options,
}: UseAppSuspenseQueryParams<TData>) {
  return useSuspenseQuery({
    queryKey,
    queryFn: fetchData,
    ...options,
  });
}
