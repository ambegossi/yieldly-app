import { RepositoryProvider } from "@/infra/repositories/repository-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { ReactNode } from "react";
import { ApyDataPoint } from "../../pool";
import { PoolRepo } from "../../pool-repo";
import { usePoolApyHistory } from "../use-pool-apy-history";

const createMockPoolRepo = (overrides?: Partial<PoolRepo>): PoolRepo => {
  return {
    findAll: jest.fn(),
    findApyHistory: jest.fn(),
    ...overrides,
  };
};

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

const createWrapper = (poolRepo: PoolRepo, queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider value={{ poolRepo }}>{children}</RepositoryProvider>
      </QueryClientProvider>
    );
  };
};

describe("usePoolApyHistory", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch APY history successfully", async () => {
    const mockHistory: ApyDataPoint[] = [
      { timestamp: "2024-01-15T00:00:00.000Z", apy: 5.0 },
    ];

    const mockPoolRepo = createMockPoolRepo({
      findApyHistory: jest.fn().mockResolvedValue(mockHistory),
    });

    const { result, unmount } = renderHook(
      () => usePoolApyHistory("pool-123"),
      {
        wrapper: createWrapper(mockPoolRepo, queryClient),
      },
    );

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual(mockHistory);
    expect(result.current.error).toBeFalsy();

    unmount();
  });

  it("should handle loading states correctly", async () => {
    const mockPoolRepo = createMockPoolRepo({
      findApyHistory: jest
        .fn()
        .mockResolvedValue([
          { timestamp: "2024-01-15T00:00:00.000Z", apy: 5.0 },
        ]),
    });

    const { result, unmount } = renderHook(
      () => usePoolApyHistory("pool-123"),
      {
        wrapper: createWrapper(mockPoolRepo, queryClient),
      },
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isLoading).toBe(false);

    unmount();
  });

  it("should handle errors from repository", async () => {
    const mockError = new Error("Failed to fetch APY history");

    const mockPoolRepo = createMockPoolRepo({
      findApyHistory: jest.fn().mockRejectedValue(mockError),
    });

    const { result, unmount } = renderHook(
      () => usePoolApyHistory("pool-123"),
      {
        wrapper: createWrapper(mockPoolRepo, queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();

    unmount();
  });

  it("should return empty array for pool with no history", async () => {
    const mockPoolRepo = createMockPoolRepo({
      findApyHistory: jest.fn().mockResolvedValue([]),
    });

    const { result, unmount } = renderHook(
      () => usePoolApyHistory("pool-123"),
      {
        wrapper: createWrapper(mockPoolRepo, queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeFalsy();

    unmount();
  });

  it("should use correct query key", async () => {
    const mockPoolRepo = createMockPoolRepo({
      findApyHistory: jest.fn().mockResolvedValue([]),
    });

    const { unmount } = renderHook(() => usePoolApyHistory("pool-123"), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      const queries = queryClient.getQueryCache().getAll();
      expect(queries.length).toBe(1);
      expect(queries[0].queryKey).toEqual(["pools", "pool-123", "apy-history"]);
    });

    unmount();
  });

  it("should call poolRepo.findApyHistory exactly once with poolId", async () => {
    const findApyHistoryMock = jest.fn().mockResolvedValue([]);
    const mockPoolRepo = createMockPoolRepo({
      findApyHistory: findApyHistoryMock,
    });

    const { result, unmount } = renderHook(
      () => usePoolApyHistory("pool-123"),
      {
        wrapper: createWrapper(mockPoolRepo, queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(findApyHistoryMock).toHaveBeenCalledTimes(1);
    expect(findApyHistoryMock).toHaveBeenCalledWith("pool-123");

    unmount();
  });

  it("should not refetch on component re-render", async () => {
    const findApyHistoryMock = jest.fn().mockResolvedValue([]);
    const mockPoolRepo = createMockPoolRepo({
      findApyHistory: findApyHistoryMock,
    });

    const { result, rerender, unmount } = renderHook(
      () => usePoolApyHistory("pool-123"),
      {
        wrapper: createWrapper(mockPoolRepo, queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(findApyHistoryMock).toHaveBeenCalledTimes(1);

    rerender({} as any);

    expect(findApyHistoryMock).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("should pass staleTime option", async () => {
    const mockPoolRepo = createMockPoolRepo({
      findApyHistory: jest.fn().mockResolvedValue([]),
    });

    const { unmount } = renderHook(() => usePoolApyHistory("pool-123"), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      const queries = queryClient.getQueryCache().getAll();
      expect(queries.length).toBe(1);
    });

    const queries = queryClient.getQueryCache().getAll();

    expect((queries[0].options as any).staleTime).toBe(300000);

    unmount();
  });
});
