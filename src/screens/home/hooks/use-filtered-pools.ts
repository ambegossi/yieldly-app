import { Pool } from "@/domain/pool/pool";
import { useCallback, useMemo, useState } from "react";

export interface FilterState {
  network: string | null;
  protocol: string | null;
}

export interface FilterOptions {
  networks: string[];
  protocols: string[];
}

export function useFilteredPools(pools: Pool[]) {
  const [networkFilter, setNetworkFilter] = useState<string | null>(null);
  const [protocolFilter, setProtocolFilter] = useState<string | null>(null);

  const sortedPools = useMemo(() => {
    return [...pools].sort((a, b) => b.apy - a.apy);
  }, [pools]);

  const filteredPools = useMemo(() => {
    let result = sortedPools;
    if (networkFilter) {
      result = result.filter((p) => p.chain === networkFilter);
    }
    if (protocolFilter) {
      result = result.filter((p) => p.project === protocolFilter);
    }
    return result;
  }, [sortedPools, networkFilter, protocolFilter]);

  const filterOptions = useMemo(
    () => ({
      networks: [...new Set(pools.map((p) => p.chain))].sort(),
      protocols: [...new Set(pools.map((p) => p.project))].sort(),
    }),
    [pools],
  );

  const clearFilters = useCallback(() => {
    setNetworkFilter(null);
    setProtocolFilter(null);
  }, []);

  const hasActiveFilters = networkFilter !== null || protocolFilter !== null;

  return {
    filteredPools,
    filterOptions,
    networkFilter,
    protocolFilter,
    setNetworkFilter,
    setProtocolFilter,
    clearFilters,
    hasActiveFilters,
  };
}
