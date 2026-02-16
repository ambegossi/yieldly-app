import { Pool } from "@/domain/pool/pool";
import { renderHook, act } from "@testing-library/react-native";
import { useFilteredPools } from "../use-filtered-pools";

function createMockPools(count: number): Pool[] {
  const chains = ["ethereum", "polygon", "arbitrum", "optimism"];
  const projects = ["Aave", "Compound", "Yearn", "Uniswap"];

  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    chain: chains[i % chains.length],
    project: projects[i % projects.length],
    symbol: `TOKEN${i + 1}`,
    apy: (i + 1) * 1.5,
    url: `https://example.com/pool/${i + 1}`,
  }));
}

describe("useFilteredPools", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return all pools sorted by APY descending when no filters", () => {
    const pools = createMockPools(5);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    const apys = result.current.filteredPools.map((p) => p.apy);
    expect(apys).toEqual([...apys].sort((a, b) => b - a));
    expect(result.current.filteredPools).toHaveLength(5);

    unmount();
  });

  it("should filter by network correctly", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.setNetworkFilter("ethereum");
    });

    expect(
      result.current.filteredPools.every((p) => p.chain === "ethereum"),
    ).toBe(true);
    expect(result.current.filteredPools.length).toBeGreaterThan(0);

    unmount();
  });

  it("should filter by protocol correctly", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.setProtocolFilter("Aave");
    });

    expect(
      result.current.filteredPools.every((p) => p.project === "Aave"),
    ).toBe(true);
    expect(result.current.filteredPools.length).toBeGreaterThan(0);

    unmount();
  });

  it("should combine network and protocol filters with AND logic", () => {
    const pools: Pool[] = [
      {
        id: "1",
        chain: "ethereum",
        project: "Aave",
        symbol: "USDC",
        apy: 5.0,
        url: "https://example.com/1",
      },
      {
        id: "2",
        chain: "ethereum",
        project: "Compound",
        symbol: "ETH",
        apy: 3.0,
        url: "https://example.com/2",
      },
      {
        id: "3",
        chain: "polygon",
        project: "Aave",
        symbol: "DAI",
        apy: 7.0,
        url: "https://example.com/3",
      },
      {
        id: "4",
        chain: "polygon",
        project: "Compound",
        symbol: "USDT",
        apy: 4.0,
        url: "https://example.com/4",
      },
    ];

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.setNetworkFilter("ethereum");
      result.current.setProtocolFilter("Aave");
    });

    expect(result.current.filteredPools).toHaveLength(1);
    expect(result.current.filteredPools[0].id).toBe("1");
    expect(result.current.filteredPools[0].chain).toBe("ethereum");
    expect(result.current.filteredPools[0].project).toBe("Aave");

    unmount();
  });

  it("should clear all filters", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.setNetworkFilter("ethereum");
      result.current.setProtocolFilter("Aave");
    });

    const filteredCount = result.current.filteredPools.length;
    expect(filteredCount).toBeLessThan(8);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filteredPools).toHaveLength(8);
    expect(result.current.networkFilter).toBeNull();
    expect(result.current.protocolFilter).toBeNull();
    expect(result.current.hasActiveFilters).toBe(false);

    unmount();
  });

  it("should return correct filter options with unique sorted networks and protocols", () => {
    const pools: Pool[] = [
      {
        id: "1",
        chain: "polygon",
        project: "Yearn",
        symbol: "USDC",
        apy: 5.0,
        url: "https://example.com/1",
      },
      {
        id: "2",
        chain: "ethereum",
        project: "Aave",
        symbol: "ETH",
        apy: 3.0,
        url: "https://example.com/2",
      },
      {
        id: "3",
        chain: "ethereum",
        project: "Yearn",
        symbol: "DAI",
        apy: 7.0,
        url: "https://example.com/3",
      },
      {
        id: "4",
        chain: "arbitrum",
        project: "Aave",
        symbol: "USDT",
        apy: 4.0,
        url: "https://example.com/4",
      },
    ];

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    expect(result.current.filterOptions.networks).toEqual([
      "arbitrum",
      "ethereum",
      "polygon",
    ]);
    expect(result.current.filterOptions.protocols).toEqual(["Aave", "Yearn"]);

    unmount();
  });

  it("should reflect filter state in hasActiveFilters", () => {
    const pools = createMockPools(4);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.setNetworkFilter("ethereum");
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.setNetworkFilter(null);
    });

    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.setProtocolFilter("Aave");
    });

    expect(result.current.hasActiveFilters).toBe(true);

    unmount();
  });

  it("should handle empty pools array", () => {
    const { result, unmount } = renderHook(() => useFilteredPools([]));

    expect(result.current.filteredPools).toEqual([]);
    expect(result.current.filterOptions.networks).toEqual([]);
    expect(result.current.filterOptions.protocols).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);

    unmount();
  });

  it("should sort pools with 0% APY at the bottom", () => {
    const pools: Pool[] = [
      {
        id: "1",
        chain: "ethereum",
        project: "Aave",
        symbol: "USDC",
        apy: 0,
        url: "https://example.com/1",
      },
      {
        id: "2",
        chain: "polygon",
        project: "Compound",
        symbol: "USDT",
        apy: 5.0,
        url: "https://example.com/2",
      },
      {
        id: "3",
        chain: "ethereum",
        project: "Spark",
        symbol: "DAI",
        apy: 3.0,
        url: "https://example.com/3",
      },
    ];

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    const apys = result.current.filteredPools.map((p) => p.apy);
    expect(apys).toEqual([5.0, 3.0, 0]);

    unmount();
  });

  it("should sort negative APY pools below positive and zero", () => {
    const pools: Pool[] = [
      {
        id: "1",
        chain: "ethereum",
        project: "Aave",
        symbol: "USDC",
        apy: -2.5,
        url: "https://example.com/1",
      },
      {
        id: "2",
        chain: "polygon",
        project: "Compound",
        symbol: "USDT",
        apy: 5.0,
        url: "https://example.com/2",
      },
      {
        id: "3",
        chain: "ethereum",
        project: "Spark",
        symbol: "DAI",
        apy: 0,
        url: "https://example.com/3",
      },
      {
        id: "4",
        chain: "arbitrum",
        project: "Yearn",
        symbol: "USDC",
        apy: -0.5,
        url: "https://example.com/4",
      },
    ];

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    const apys = result.current.filteredPools.map((p) => p.apy);
    expect(apys).toEqual([5.0, 0, -0.5, -2.5]);

    unmount();
  });

  it("should return empty filtered results when filter matches nothing", () => {
    const pools: Pool[] = [
      {
        id: "1",
        chain: "ethereum",
        project: "Aave",
        symbol: "USDC",
        apy: 5.0,
        url: "https://example.com/1",
      },
    ];

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.setNetworkFilter("nonexistent-network");
    });

    expect(result.current.filteredPools).toHaveLength(0);
    expect(result.current.hasActiveFilters).toBe(true);

    unmount();
  });
});
