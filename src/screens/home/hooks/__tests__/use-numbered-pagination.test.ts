import { Pool } from "@/domain/pool/pool";
import { renderHook, act } from "@testing-library/react-native";
import { useNumberedPagination } from "../use-numbered-pagination";

function createMockPools(count: number): Pool[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    chain: ["ethereum", "polygon", "arbitrum", "optimism"][i % 4],
    project: ["Aave", "Compound", "Yearn", "Uniswap"][i % 4],
    symbol: `TOKEN${i + 1}`,
    apy: (i + 1) * 1.5,
  }));
}

describe("useNumberedPagination", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return correct page items for page 1", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    expect(result.current.pageItems).toHaveLength(24);
    expect(result.current.pageItems).toEqual(pools.slice(0, 24));
    expect(result.current.currentPage).toBe(1);

    unmount();
  });

  it("should calculate totalPages correctly", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    expect(result.current.totalPages).toBe(3);

    unmount();
  });

  it("should calculate totalPages as 1 for empty array", () => {
    const { result, unmount } = renderHook(() => useNumberedPagination([]));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.pageItems).toEqual([]);

    unmount();
  });

  it("should change page and return correct items with goToPage", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.pageItems).toEqual(pools.slice(24, 48));

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.pageItems).toEqual(pools.slice(48, 50));
    expect(result.current.pageItems).toHaveLength(2);

    unmount();
  });

  it("should navigate correctly with nextPage", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.pageItems).toEqual(pools.slice(24, 48));

    unmount();
  });

  it("should navigate correctly with prevPage", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.pageItems).toEqual(pools.slice(24, 48));

    unmount();
  });

  it("should set canGoNext to false on last page", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    expect(result.current.canGoNext).toBe(true);

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.canGoNext).toBe(false);

    unmount();
  });

  it("should set canGoPrev to false on page 1", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    expect(result.current.canGoPrev).toBe(false);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.canGoPrev).toBe(true);

    unmount();
  });

  it("should not go beyond last page with nextPage", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    act(() => {
      result.current.goToPage(3);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(3);

    unmount();
  });

  it("should not go below page 1 with prevPage", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);

    unmount();
  });

  it("should clamp invalid page numbers with goToPage", () => {
    const pools = createMockPools(50);

    const { result, unmount } = renderHook(() => useNumberedPagination(pools));

    act(() => {
      result.current.goToPage(0);
    });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPage(-5);
    });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPage(100);
    });

    expect(result.current.currentPage).toBe(3);

    unmount();
  });

  it("should work with custom itemsPerPage", () => {
    const pools = createMockPools(15);

    const { result, unmount } = renderHook(() =>
      useNumberedPagination(pools, 5),
    );

    expect(result.current.totalPages).toBe(3);
    expect(result.current.pageItems).toHaveLength(5);
    expect(result.current.pageItems).toEqual(pools.slice(0, 5));

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.pageItems).toEqual(pools.slice(5, 10));

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.pageItems).toEqual(pools.slice(10, 15));

    unmount();
  });
});
