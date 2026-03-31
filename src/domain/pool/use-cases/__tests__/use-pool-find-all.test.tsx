import { RepositoryProvider } from "@/infra/repositories/repository-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { ReactNode } from "react";
import { Pool } from "../../pool";
import { PoolRepo } from "../../pool-repo";
import { usePoolFindAll } from "../use-pool-find-all";

const createMockPoolRepo = (overrides?: Partial<PoolRepo>): PoolRepo => {
  return {
    findAll: jest.fn(),
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

describe("usePoolFindAll", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch pools successfully", async () => {
    const mockPools: Pool[] = [
      {
        id: "1",
        chain: "ethereum",
        project: "Aave",
        symbol: "USDC",
        apy: 5.2,
        url: "https://aave.com/pool/1",
      },
      {
        id: "2",
        chain: "polygon",
        project: "Yearn",
        symbol: "DAI",
        apy: 8.7,
        url: "https://yearn.finance/pool/2",
      },
    ];

    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockResolvedValue(mockPools),
    });

    const { result, unmount } = renderHook(() => usePoolFindAll(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual(mockPools);
    expect(result.current.error).toBeFalsy();

    unmount();
  });

  it("should handle loading states correctly", async () => {
    const mockPools: Pool[] = [
      {
        id: "1",
        chain: "ethereum",
        project: "Compound",
        symbol: "ETH",
        apy: 3.5,
        url: "https://compound.finance/pool/1",
      },
    ];

    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockResolvedValue(mockPools),
    });

    const { result, unmount } = renderHook(() => usePoolFindAll(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isLoading).toBe(false);

    unmount();
  });

  it("should handle errors from repository", async () => {
    const mockError = new Error("Failed to fetch pools");

    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockRejectedValue(mockError),
    });

    const { result, unmount } = renderHook(() => usePoolFindAll(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();

    unmount();
  });

  it("should handle empty array response", async () => {
    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockResolvedValue([]),
    });

    const { result, unmount } = renderHook(() => usePoolFindAll(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeFalsy();

    unmount();
  });

  it("should use correct query key", async () => {
    const mockPools: Pool[] = [];
    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockResolvedValue(mockPools),
    });

    const { unmount } = renderHook(() => usePoolFindAll(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      const queries = queryClient.getQueryCache().getAll();
      expect(queries.length).toBe(1);
      expect(queries[0].queryKey).toEqual(["pools"]);
    });

    unmount();
  });

  it("should call poolRepo.findAll exactly once", async () => {
    const mockPools: Pool[] = [];
    const findAllMock = jest.fn().mockResolvedValue(mockPools);
    const mockPoolRepo = createMockPoolRepo({
      findAll: findAllMock,
    });

    const { result, unmount } = renderHook(() => usePoolFindAll(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(findAllMock).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("should handle network errors gracefully", async () => {
    const networkError = new Error("Network request failed");

    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockRejectedValue(networkError),
    });

    const { result, unmount } = renderHook(() => usePoolFindAll(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.error).toEqual(networkError);
    expect(result.current.data).toBeUndefined();

    unmount();
  });

  it("should not refetch on component re-render", async () => {
    const mockPools: Pool[] = [
      {
        id: "1",
        chain: "ethereum",
        project: "Uniswap",
        symbol: "UNI",
        apy: 12.5,
        url: "https://uniswap.org/pool/1",
      },
    ];

    const findAllMock = jest.fn().mockResolvedValue(mockPools);
    const mockPoolRepo = createMockPoolRepo({
      findAll: findAllMock,
    });

    const { result, rerender, unmount } = renderHook(() => usePoolFindAll(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(findAllMock).toHaveBeenCalledTimes(1);

    rerender({} as any);

    expect(findAllMock).toHaveBeenCalledTimes(1);

    unmount();
  });
});
