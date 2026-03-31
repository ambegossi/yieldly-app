import { Pool } from "@/domain/pool/pool";
import { renderHook, act } from "@testing-library/react-native";
import { useInfiniteScroll } from "../use-infinite-scroll";

function createMockPools(count: number): Pool[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    chain: ["ethereum", "polygon", "arbitrum", "optimism"][i % 4],
    project: ["Aave", "Compound", "Yearn", "Uniswap"][i % 4],
    symbol: `TOKEN${i + 1}`,
    apy: (i + 1) * 1.5,
    url: `https://example.com/pool/${i + 1}`,
  }));
}

describe("useInfiniteScroll", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return first 24 items initially", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useInfiniteScroll(pools));

    expect(result.current.displayedItems).toHaveLength(24);
    expect(result.current.displayedItems).toEqual(pools.slice(0, 24));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasMore).toBe(true);

    unmount();
  });

  it("should add next page of items on loadMore", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useInfiniteScroll(pools));

    expect(result.current.displayedItems).toHaveLength(24);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(48);
    expect(result.current.displayedItems).toEqual(pools.slice(0, 48));
    expect(result.current.currentPage).toBe(2);
    expect(result.current.hasMore).toBe(true);

    unmount();
  });

  it("should set hasMore to false when all items are shown", () => {
    const pools = createMockPools(20);

    const { result, unmount } = renderHook(() => useInfiniteScroll(pools));

    expect(result.current.displayedItems).toHaveLength(20);
    expect(result.current.hasMore).toBe(false);

    unmount();
  });

  it("should reset to page 1", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useInfiniteScroll(pools));

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.displayedItems).toHaveLength(48);

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.displayedItems).toHaveLength(24);

    unmount();
  });

  it("should work with custom itemsPerPage", () => {
    const pools = createMockPools(15);

    const { result, unmount } = renderHook(() => useInfiniteScroll(pools, 5));

    expect(result.current.displayedItems).toHaveLength(5);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(10);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(15);
    expect(result.current.hasMore).toBe(false);

    unmount();
  });

  it("should not load more when there are no more items", () => {
    const pools = createMockPools(10);

    const { result, unmount } = renderHook(() => useInfiniteScroll(pools, 10));

    expect(result.current.displayedItems).toHaveLength(10);
    expect(result.current.hasMore).toBe(false);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.displayedItems).toHaveLength(10);
    expect(result.current.currentPage).toBe(1);

    unmount();
  });

  it("should handle empty items array", () => {
    const { result, unmount } = renderHook(() => useInfiniteScroll([]));

    expect(result.current.displayedItems).toEqual([]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.currentPage).toBe(1);

    unmount();
  });

  it("should handle items fewer than one page", () => {
    const pools = createMockPools(5);

    const { result, unmount } = renderHook(() => useInfiniteScroll(pools));

    expect(result.current.displayedItems).toHaveLength(5);
    expect(result.current.displayedItems).toEqual(pools);
    expect(result.current.hasMore).toBe(false);

    unmount();
  });
});
