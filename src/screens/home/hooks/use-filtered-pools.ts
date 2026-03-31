import { Pool } from "@/domain/pool/pool";
import { useCallback, useMemo, useState } from "react";

export interface ActiveFilter {
  type: "network" | "protocol";
  value: string;
}

export interface FilterOptions {
  networks: string[];
  protocols: string[];
}

export function useFilteredPools(pools: Pool[]) {
  const [networkFilters, setNetworkFilters] = useState<string[]>([]);
  const [protocolFilters, setProtocolFilters] = useState<string[]>([]);

  const sortedPools = useMemo(() => {
    return [...pools].sort((a, b) => b.apy - a.apy);
  }, [pools]);

  const filteredPools = useMemo(() => {
    let result = sortedPools;
    if (networkFilters.length > 0) {
      result = result.filter((p) => networkFilters.includes(p.chain));
    }
    if (protocolFilters.length > 0) {
      result = result.filter((p) => protocolFilters.includes(p.project));
    }
    return result;
  }, [sortedPools, networkFilters, protocolFilters]);

  const filterOptions = useMemo(() => {
    const poolsForNetworks =
      protocolFilters.length > 0
        ? pools.filter((p) => protocolFilters.includes(p.project))
        : pools;

    const poolsForProtocols =
      networkFilters.length > 0
        ? pools.filter((p) => networkFilters.includes(p.chain))
        : pools;

    return {
      networks: [...new Set(poolsForNetworks.map((p) => p.chain))].sort(),
      protocols: [...new Set(poolsForProtocols.map((p) => p.project))].sort(),
    };
  }, [pools, networkFilters, protocolFilters]);

  const toggleNetworkFilter = useCallback((value: string) => {
    setNetworkFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const toggleProtocolFilter = useCallback((value: string) => {
    setProtocolFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setNetworkFilters([]);
    setProtocolFilters([]);
  }, []);

  const hasActiveFilters =
    networkFilters.length > 0 || protocolFilters.length > 0;

  const allActiveFilters = useMemo<ActiveFilter[]>(
    () => [
      ...networkFilters.map((value) => ({ type: "network" as const, value })),
      ...protocolFilters.map((value) => ({ type: "protocol" as const, value })),
    ],
    [networkFilters, protocolFilters],
  );

  return {
    filteredPools,
    filterOptions,
    networkFilters,
    protocolFilters,
    toggleNetworkFilter,
    toggleProtocolFilter,
    clearFilters,
    hasActiveFilters,
    allActiveFilters,
  };
}
