import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { ReactNode, Suspense } from "react";
import { Text } from "react-native";
import { useAppSuspenseQuery } from "../use-app-suspense-query";

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
};

const createWrapper = (queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Text>Loading</Text>}>{children}</Suspense>
      </QueryClientProvider>
    );
  };
};

describe("useAppSuspenseQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data successfully", async () => {
    const mockData = [{ id: "1", name: "test" }];
    const fetchData = jest.fn().mockResolvedValue(mockData);

    const { result, unmount } = renderHook(
      () =>
        useAppSuspenseQuery({
          queryKey: ["test"],
          fetchData,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(fetchData).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("should use the correct query key", async () => {
    const fetchData = jest.fn().mockResolvedValue([]);

    const { unmount } = renderHook(
      () =>
        useAppSuspenseQuery({
          queryKey: ["custom-key", "sub-key"],
          fetchData,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      const queries = queryClient.getQueryCache().getAll();
      expect(queries.length).toBe(1);
      expect(queries[0].queryKey).toEqual(["custom-key", "sub-key"]);
    });

    unmount();
  });

  it("should pass additional options to useSuspenseQuery", async () => {
    const fetchData = jest.fn().mockResolvedValue("data");

    const { result, unmount } = renderHook(
      () =>
        useAppSuspenseQuery({
          queryKey: ["with-options"],
          fetchData,
          options: {
            staleTime: 5000,
          },
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.data).toBe("data");
    });

    unmount();
  });

  it("should set error state when fetch fails", async () => {
    const mockError = new Error("Fetch failed");
    const fetchData = jest.fn().mockRejectedValue(mockError);

    renderHook(
      () =>
        useAppSuspenseQuery({
          queryKey: ["error-test"],
          fetchData,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      const queries = queryClient.getQueryCache().getAll();
      expect(queries[0].state.error).toEqual(mockError);
    });
  });
});
