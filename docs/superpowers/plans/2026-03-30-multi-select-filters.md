# Multi-Select Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert single-select filters to multi-select with count badges, removable filter chips, and a clear-all button.

**Architecture:** Upgrade `useFilteredPools` state from `string | null` to `string[]`. Update FilterButton to show count badge, FilterBottomSheet/FilterDropdown for multi-select, add new FilterChip component for individual removal, and update the home screen layout with a chips row.

**Tech Stack:** React Native, NativeWind v4, Expo, @gorhom/bottom-sheet, @expo/vector-icons (Feather)

---

### Task 1: Update `useFilteredPools` hook to multi-select

**Files:**
- Modify: `src/screens/home/hooks/use-filtered-pools.ts`
- Modify: `src/screens/home/hooks/__tests__/use-filtered-pools.test.ts`

- [ ] **Step 1: Update existing tests for multi-select API**

Replace the entire test file `src/screens/home/hooks/__tests__/use-filtered-pools.test.ts`:

```typescript
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

  it("should filter by single network correctly", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.toggleNetworkFilter("ethereum");
    });

    expect(
      result.current.filteredPools.every((p) => p.chain === "ethereum"),
    ).toBe(true);
    expect(result.current.filteredPools.length).toBeGreaterThan(0);

    unmount();
  });

  it("should filter by multiple networks with OR logic", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.toggleNetworkFilter("ethereum");
      result.current.toggleNetworkFilter("polygon");
    });

    expect(
      result.current.filteredPools.every(
        (p) => p.chain === "ethereum" || p.chain === "polygon",
      ),
    ).toBe(true);
    expect(result.current.networkFilters).toEqual(["ethereum", "polygon"]);

    unmount();
  });

  it("should toggle network filter off when selected again", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.toggleNetworkFilter("ethereum");
    });

    expect(result.current.networkFilters).toEqual(["ethereum"]);

    act(() => {
      result.current.toggleNetworkFilter("ethereum");
    });

    expect(result.current.networkFilters).toEqual([]);
    expect(result.current.filteredPools).toHaveLength(8);

    unmount();
  });

  it("should filter by single protocol correctly", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.toggleProtocolFilter("Aave");
    });

    expect(
      result.current.filteredPools.every((p) => p.project === "Aave"),
    ).toBe(true);
    expect(result.current.filteredPools.length).toBeGreaterThan(0);

    unmount();
  });

  it("should filter by multiple protocols with OR logic", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.toggleProtocolFilter("Aave");
      result.current.toggleProtocolFilter("Compound");
    });

    expect(
      result.current.filteredPools.every(
        (p) => p.project === "Aave" || p.project === "Compound",
      ),
    ).toBe(true);
    expect(result.current.protocolFilters).toEqual(["Aave", "Compound"]);

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
      result.current.toggleNetworkFilter("ethereum");
      result.current.toggleProtocolFilter("Aave");
    });

    expect(result.current.filteredPools).toHaveLength(1);
    expect(result.current.filteredPools[0].id).toBe("1");

    unmount();
  });

  it("should combine multiple networks AND multiple protocols", () => {
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
      {
        id: "5",
        chain: "arbitrum",
        project: "Yearn",
        symbol: "USDC",
        apy: 6.0,
        url: "https://example.com/5",
      },
    ];

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.toggleNetworkFilter("ethereum");
      result.current.toggleNetworkFilter("polygon");
      result.current.toggleProtocolFilter("Aave");
    });

    expect(result.current.filteredPools).toHaveLength(2);
    expect(result.current.filteredPools.map((p) => p.id).sort()).toEqual([
      "1",
      "3",
    ]);

    unmount();
  });

  it("should clear all filters", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.toggleNetworkFilter("ethereum");
      result.current.toggleNetworkFilter("polygon");
      result.current.toggleProtocolFilter("Aave");
    });

    const filteredCount = result.current.filteredPools.length;
    expect(filteredCount).toBeLessThan(8);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filteredPools).toHaveLength(8);
    expect(result.current.networkFilters).toEqual([]);
    expect(result.current.protocolFilters).toEqual([]);
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
      result.current.toggleNetworkFilter("ethereum");
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.toggleNetworkFilter("ethereum");
    });

    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.toggleProtocolFilter("Aave");
    });

    expect(result.current.hasActiveFilters).toBe(true);

    unmount();
  });

  it("should return allActiveFilters with type and value", () => {
    const pools = createMockPools(8);

    const { result, unmount } = renderHook(() => useFilteredPools(pools));

    act(() => {
      result.current.toggleNetworkFilter("ethereum");
      result.current.toggleNetworkFilter("polygon");
      result.current.toggleProtocolFilter("Aave");
    });

    expect(result.current.allActiveFilters).toEqual([
      { type: "network", value: "ethereum" },
      { type: "network", value: "polygon" },
      { type: "protocol", value: "Aave" },
    ]);

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
      result.current.toggleNetworkFilter("nonexistent-network");
    });

    expect(result.current.filteredPools).toHaveLength(0);
    expect(result.current.hasActiveFilters).toBe(true);

    unmount();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test src/screens/home/hooks/__tests__/use-filtered-pools.test.ts`
Expected: FAIL — `toggleNetworkFilter`, `toggleProtocolFilter`, `networkFilters`, `protocolFilters`, `allActiveFilters` don't exist yet.

- [ ] **Step 3: Implement the multi-select hook**

Replace `src/screens/home/hooks/use-filtered-pools.ts`:

```typescript
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

  const filterOptions = useMemo(
    () => ({
      networks: [...new Set(pools.map((p) => p.chain))].sort(),
      protocols: [...new Set(pools.map((p) => p.project))].sort(),
    }),
    [pools],
  );

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test src/screens/home/hooks/__tests__/use-filtered-pools.test.ts`
Expected: All 16 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/home/hooks/use-filtered-pools.ts src/screens/home/hooks/__tests__/use-filtered-pools.test.ts
git commit -m "feat: convert useFilteredPools to multi-select arrays"
```

---

### Task 2: Update FilterButton to show count badge

**Files:**
- Modify: `src/screens/home/components/filter-button.tsx`
- Modify: `src/screens/home/components/__tests__/filter-button.test.tsx`

- [ ] **Step 1: Update tests for count badge API**

Replace `src/screens/home/components/__tests__/filter-button.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterButton } from "../filter-button";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Feather: (props: Record<string, unknown>) => (
      <Text testID="filter-icon">{String(props.name)}</Text>
    ),
  };
});

describe("FilterButton", () => {
  it("should render label text when no active filters", () => {
    render(
      <FilterButton label="Network" activeCount={0} onPress={jest.fn()} />,
    );

    expect(screen.getByText("Network")).toBeTruthy();
  });

  it("should render count badge when filters are active", () => {
    render(
      <FilterButton label="Network" activeCount={4} onPress={jest.fn()} />,
    );

    expect(screen.getByText("Network")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("should not render count badge when activeCount is 0", () => {
    render(
      <FilterButton label="Network" activeCount={0} onPress={jest.fn()} />,
    );

    expect(screen.queryByText("0")).toBeNull();
  });

  it("should render filter icon", () => {
    render(
      <FilterButton label="Network" activeCount={0} onPress={jest.fn()} />,
    );

    expect(screen.getByTestId("filter-icon")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    render(
      <FilterButton label="Network" activeCount={0} onPress={onPress} />,
    );

    fireEvent.press(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should have correct accessibility label when inactive", () => {
    render(
      <FilterButton label="Network" activeCount={0} onPress={jest.fn()} />,
    );

    expect(screen.getByLabelText("Network filter")).toBeTruthy();
  });

  it("should have correct accessibility label when active", () => {
    render(
      <FilterButton label="Network" activeCount={3} onPress={jest.fn()} />,
    );

    expect(
      screen.getByLabelText("Network filter, 3 selected"),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test src/screens/home/components/__tests__/filter-button.test.tsx`
Expected: FAIL — `activeCount` prop doesn't exist yet.

- [ ] **Step 3: Implement updated FilterButton**

Replace `src/screens/home/components/filter-button.tsx`:

```tsx
import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { type ViewProps, View } from "react-native";

interface FilterButtonProps extends ViewProps {
  label: "Network" | "Protocol";
  activeCount: number;
  onPress?: () => void;
}

export const FilterButton = React.forwardRef<View, FilterButtonProps>(
  function FilterButton({ label, activeCount, onPress, ...rest }, ref) {
    const isActive = activeCount > 0;

    return (
      <View ref={ref} {...rest}>
        <Button
          variant="outline"
          size="sm"
          onPress={onPress}
          accessibilityLabel={
            isActive
              ? `${label} filter, ${activeCount} selected`
              : `${label} filter`
          }
        >
          <View className="flex-row items-center gap-1.5">
            <Feather name="filter" size={14} />

            <Text>{label}</Text>

            {isActive && (
              <View className="h-5 w-5 items-center justify-center rounded-full bg-green-500">
                <Text className="text-xs font-bold text-white">
                  {activeCount}
                </Text>
              </View>
            )}
          </View>
        </Button>
      </View>
    );
  },
);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test src/screens/home/components/__tests__/filter-button.test.tsx`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/home/components/filter-button.tsx src/screens/home/components/__tests__/filter-button.test.tsx
git commit -m "feat: update FilterButton with count badge"
```

---

### Task 3: Create FilterChip component

**Files:**
- Create: `src/screens/home/components/filter-chip.tsx`
- Create: `src/screens/home/components/__tests__/filter-chip.test.tsx`

- [ ] **Step 1: Write tests for FilterChip**

Create `src/screens/home/components/__tests__/filter-chip.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterChip } from "../filter-chip";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Feather: (props: Record<string, unknown>) => (
      <Text testID={`icon-${String(props.name)}`}>{String(props.name)}</Text>
    ),
  };
});

describe("FilterChip", () => {
  it("should render the label text", () => {
    render(<FilterChip label="Ethereum" onRemove={jest.fn()} />);

    expect(screen.getByText("Ethereum")).toBeTruthy();
  });

  it("should render the remove icon", () => {
    render(<FilterChip label="Ethereum" onRemove={jest.fn()} />);

    expect(screen.getByTestId("icon-x")).toBeTruthy();
  });

  it("should call onRemove when pressed", () => {
    const onRemove = jest.fn();
    render(<FilterChip label="Ethereum" onRemove={onRemove} />);

    fireEvent.press(screen.getByLabelText("Remove Ethereum filter"));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("should have correct accessibility label", () => {
    render(<FilterChip label="Aave" onRemove={jest.fn()} />);

    expect(screen.getByLabelText("Remove Aave filter")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test src/screens/home/components/__tests__/filter-chip.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement FilterChip**

Create `src/screens/home/components/filter-chip.tsx`:

```tsx
import { Text } from "@/components/core/text";
import { Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <Pressable
      onPress={onRemove}
      accessibilityLabel={`Remove ${label} filter`}
      accessibilityRole="button"
      className="flex-row items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 active:bg-accent"
    >
      <Text className="text-sm text-foreground">{label}</Text>

      <Feather name="x" size={14} />
    </Pressable>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test src/screens/home/components/__tests__/filter-chip.test.tsx`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/home/components/filter-chip.tsx src/screens/home/components/__tests__/filter-chip.test.tsx
git commit -m "feat: add FilterChip component"
```

---

### Task 4: Update FilterBottomSheet for multi-select

**Files:**
- Modify: `src/screens/home/components/filter-bottom-sheet.tsx`
- Modify: `src/screens/home/components/__tests__/filter-bottom-sheet.test.tsx`

- [ ] **Step 1: Update tests for multi-select**

Replace `src/screens/home/components/__tests__/filter-bottom-sheet.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterBottomSheet } from "../filter-bottom-sheet";

jest.mock("@gorhom/bottom-sheet", () => {
  const { View } = require("react-native");
  const MockBottomSheet = jest
    .fn()
    .mockImplementation(({ children }) => (
      <View testID="bottom-sheet">{children}</View>
    ));

  return {
    __esModule: true,
    default: MockBottomSheet,
    BottomSheetBackdrop: jest.fn(() => null),
  };
});

describe("FilterBottomSheet", () => {
  const defaultProps = {
    options: ["Ethereum", "Polygon", "Arbitrum"],
    selectedValues: [] as string[],
    onToggle: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title "Select Network" for network filterType', () => {
    render(<FilterBottomSheet {...defaultProps} filterType="network" />);

    expect(screen.getByText("Select Network")).toBeTruthy();
  });

  it('should render title "Select Protocol" for protocol filterType', () => {
    render(<FilterBottomSheet {...defaultProps} filterType="protocol" />);

    expect(screen.getByText("Select Protocol")).toBeTruthy();
  });

  it("should render all provided options", () => {
    render(<FilterBottomSheet {...defaultProps} filterType="network" />);

    expect(screen.getByText("Ethereum")).toBeTruthy();
    expect(screen.getByText("Polygon")).toBeTruthy();
    expect(screen.getByText("Arbitrum")).toBeTruthy();
  });

  it("should not render All option", () => {
    render(<FilterBottomSheet {...defaultProps} filterType="network" />);

    expect(screen.queryByText("All")).toBeNull();
  });

  it("should call onToggle with option value when option is pressed", () => {
    const onToggle = jest.fn();
    render(
      <FilterBottomSheet
        {...defaultProps}
        filterType="network"
        onToggle={onToggle}
      />,
    );

    fireEvent.press(screen.getByText("Ethereum"));

    expect(onToggle).toHaveBeenCalledWith("Ethereum");
  });

  it("should show checkmarks for all selected values", () => {
    render(
      <FilterBottomSheet
        {...defaultProps}
        filterType="network"
        selectedValues={["Ethereum", "Polygon"]}
      />,
    );

    const allCheckmarks = screen.getAllByText("✓");
    expect(allCheckmarks).toHaveLength(2);
  });

  it("should not auto-close when option is selected", () => {
    const onToggle = jest.fn();
    render(
      <FilterBottomSheet
        {...defaultProps}
        filterType="network"
        onToggle={onToggle}
      />,
    );

    fireEvent.press(screen.getByText("Ethereum"));

    // Sheet should still be visible (bottom-sheet testID still present)
    expect(screen.getByTestID("bottom-sheet")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test src/screens/home/components/__tests__/filter-bottom-sheet.test.tsx`
Expected: FAIL — `selectedValues`, `onToggle` props don't exist.

- [ ] **Step 3: Implement multi-select FilterBottomSheet**

Replace `src/screens/home/components/filter-bottom-sheet.tsx`:

```tsx
import { BottomSheet } from "@/components/bottom-sheet";
import { Text } from "@/components/core/text";
import GorhomBottomSheet from "@gorhom/bottom-sheet";
import React, { useImperativeHandle } from "react";
import { Pressable, ScrollView, View } from "react-native";

interface FilterBottomSheetProps {
  filterType: "network" | "protocol";
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
}

export interface FilterBottomSheetRef {
  open: () => void;
  close: () => void;
}

export const FilterBottomSheet = React.forwardRef<
  FilterBottomSheetRef,
  FilterBottomSheetProps
>(function FilterBottomSheet(
  { filterType, options, selectedValues, onToggle, onClose },
  ref,
) {
  const bottomSheetRef = React.useRef<GorhomBottomSheet>(null);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.snapToIndex(0),
    close: () => bottomSheetRef.current?.close(),
  }));

  const title = filterType === "network" ? "Select Network" : "Select Protocol";

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["50%", "75%"]}
      onClose={onClose}
    >
      <View className="px-4 pb-2 pt-2">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
      </View>

      <ScrollView className="flex-1">
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => onToggle(option)}
            className="flex-row items-center justify-between px-4 py-3 active:bg-accent"
            accessibilityRole="menuitem"
          >
            <Text className="text-base text-foreground">{option}</Text>

            {selectedValues.includes(option) && (
              <Text className="text-primary">✓</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheet>
  );
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test src/screens/home/components/__tests__/filter-bottom-sheet.test.tsx`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/home/components/filter-bottom-sheet.tsx src/screens/home/components/__tests__/filter-bottom-sheet.test.tsx
git commit -m "feat: update FilterBottomSheet for multi-select"
```

---

### Task 5: Update FilterDropdown for multi-select

**Files:**
- Modify: `src/screens/home/components/filter-dropdown.tsx`
- Modify: `src/screens/home/components/__tests__/filter-dropdown.test.tsx`

- [ ] **Step 1: Update tests for multi-select**

Replace `src/screens/home/components/__tests__/filter-dropdown.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterDropdown } from "../filter-dropdown";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Feather: (props: Record<string, unknown>) => (
      <Text testID="filter-icon">{String(props.name)}</Text>
    ),
  };
});

jest.mock("@/components/core/dropdown-menu", () => {
  const React = require("react");
  const { Pressable, View, Text } = require("react-native");

  const DropdownMenuContext = React.createContext({
    open: false,
    setOpen: (_open: boolean) => {},
  });

  function DropdownMenu({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) {
    const [open, setOpen] = React.useState(false);
    const handleSetOpen = React.useCallback(
      (value: boolean) => {
        setOpen(value);
        onOpenChange?.(value);
      },
      [onOpenChange],
    );
    return (
      <DropdownMenuContext.Provider value={{ open, setOpen: handleSetOpen }}>
        <View>{children}</View>
      </DropdownMenuContext.Provider>
    );
  }

  function DropdownMenuTrigger({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) {
    const { setOpen } = React.useContext(DropdownMenuContext);
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        onPress: () => setOpen(true),
      });
    }
    return <Pressable onPress={() => setOpen(true)}>{children}</Pressable>;
  }

  function DropdownMenuContent({ children }: { children: React.ReactNode }) {
    const { open } = React.useContext(DropdownMenuContext);
    if (!open) return null;
    return <View>{children}</View>;
  }

  function DropdownMenuCheckboxItem({
    children,
    checked,
    onCheckedChange,
  }: {
    children: React.ReactNode;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    closeOnPress?: boolean;
  }) {
    return (
      <Pressable
        onPress={() => onCheckedChange(!checked)}
        accessibilityRole="menuitem"
      >
        {children}
        {checked && <Text>✓</Text>}
      </Pressable>
    );
  }

  return {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
  };
});

describe("FilterDropdown", () => {
  const defaultProps = {
    options: ["Ethereum", "Polygon", "Arbitrum"],
    selectedValues: [] as string[],
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render filter button with label", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    expect(screen.getByText("Network")).toBeTruthy();
  });

  it("should open dropdown when button is pressed", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    fireEvent.press(screen.getByRole("button"));

    expect(screen.getByText("Ethereum")).toBeTruthy();
    expect(screen.getByText("Polygon")).toBeTruthy();
    expect(screen.getByText("Arbitrum")).toBeTruthy();
  });

  it("should call onToggle with value when option is pressed", () => {
    const onToggle = jest.fn();
    render(
      <FilterDropdown {...defaultProps} label="Network" onToggle={onToggle} />,
    );

    fireEvent.press(screen.getByRole("button"));
    fireEvent.press(screen.getByText("Ethereum"));

    expect(onToggle).toHaveBeenCalledWith("Ethereum");
  });

  it("should show checkmarks for selected values", () => {
    render(
      <FilterDropdown
        {...defaultProps}
        label="Network"
        selectedValues={["Ethereum", "Polygon"]}
      />,
    );

    fireEvent.press(screen.getByRole("button"));

    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks).toHaveLength(2);
  });

  it("should filter options when typing in search", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    fireEvent.press(screen.getByRole("button"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Search network..."),
      "Eth",
    );

    expect(screen.getByText("Ethereum")).toBeTruthy();
    expect(screen.queryByText("Polygon")).toBeNull();
    expect(screen.queryByText("Arbitrum")).toBeNull();
  });

  it("should show no results when search has no matches", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    fireEvent.press(screen.getByRole("button"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Search network..."),
      "xyz",
    );

    expect(screen.getByText("No results")).toBeTruthy();
  });

  it("should pass activeCount to FilterButton", () => {
    render(
      <FilterDropdown
        {...defaultProps}
        label="Network"
        selectedValues={["Ethereum", "Polygon"]}
      />,
    );

    expect(screen.getByText("2")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test src/screens/home/components/__tests__/filter-dropdown.test.tsx`
Expected: FAIL — `selectedValues`, `onToggle` props don't exist.

- [ ] **Step 3: Implement multi-select FilterDropdown**

Replace `src/screens/home/components/filter-dropdown.tsx`:

```tsx
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu";
import { Text } from "@/components/core/text";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { FilterButton } from "./filter-button";

interface FilterDropdownProps {
  label: "Network" | "Protocol";
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export function FilterDropdown({
  label,
  options,
  selectedValues,
  onToggle,
}: FilterDropdownProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<TextInput>(null);

  const filteredOptions = useMemo(
    () =>
      search
        ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
        : options,
    [options, search],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSearch("");
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <FilterButton label={label} activeCount={selectedValues.length} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="min-w-[200px]"
      >
        <View className="p-2">
          <TextInput
            ref={inputRef}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <ScrollView className="max-h-72">
          {filteredOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              className="hover:bg-brand focus:bg-brand active:bg-transparent"
              checked={selectedValues.includes(option)}
              onCheckedChange={() => onToggle(option)}
            >
              <Text className="group-hover:text-white group-focus:text-white">
                {option}
              </Text>
            </DropdownMenuCheckboxItem>
          ))}

          {filteredOptions.length === 0 && (
            <View className="px-2 py-4">
              <Text className="text-center text-sm text-muted-foreground">
                No results
              </Text>
            </View>
          )}
        </ScrollView>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

Note: Removed `closeOnPress` from `DropdownMenuCheckboxItem` so the dropdown stays open for multi-select.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test src/screens/home/components/__tests__/filter-dropdown.test.tsx`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/home/components/filter-dropdown.tsx src/screens/home/components/__tests__/filter-dropdown.test.tsx
git commit -m "feat: update FilterDropdown for multi-select"
```

---

### Task 6: Update Home screen to wire everything together

**Files:**
- Modify: `src/screens/home/index.tsx`

- [ ] **Step 1: Update the Home screen**

Replace `src/screens/home/index.tsx`:

```tsx
import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { Header } from "@/components/header";
import { Pool } from "@/domain/pool/pool";
import { usePoolFindAllSuspense } from "@/domain/pool/use-cases/use-pool-find-all-suspense";
import { useDeviceLayout } from "@/hooks/use-device-layout";
import { FlashList } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { EmptyState } from "./components/empty-state";
import {
  FilterBottomSheet,
  FilterBottomSheetRef,
} from "./components/filter-bottom-sheet";
import { FilterButton } from "./components/filter-button";
import { FilterChip } from "./components/filter-chip";
import { FilterDropdown } from "./components/filter-dropdown";
import { Header as HomeHeader } from "./components/header";
import { PaginationControls } from "./components/pagination-controls";
import { PoolListItem } from "./components/pool-list-item";
import { useFilteredPools } from "./hooks/use-filtered-pools";
import { useInfiniteScroll } from "./hooks/use-infinite-scroll";
import { useNumberedPagination } from "./hooks/use-numbered-pagination";

export default function Home() {
  const { data: pools } = usePoolFindAllSuspense();
  const { isMobile } = useDeviceLayout();

  const {
    filteredPools,
    filterOptions,
    networkFilters,
    protocolFilters,
    toggleNetworkFilter,
    toggleProtocolFilter,
    clearFilters,
    hasActiveFilters,
    allActiveFilters,
  } = useFilteredPools(pools);

  const {
    displayedItems,
    loadMore,
    hasMore,
    reset: resetInfinite,
  } = useInfiniteScroll(filteredPools);

  const { pageItems, currentPage, totalPages, goToPage } =
    useNumberedPagination(filteredPools);

  const networkSheetRef = useRef<FilterBottomSheetRef>(null);
  const protocolSheetRef = useRef<FilterBottomSheetRef>(null);

  const itemsToDisplay = isMobile ? displayedItems : pageItems;

  const handlePoolPress = useCallback((pool: Pool) => {
    Alert.alert("Details coming soon", `${pool.symbol} on ${pool.project}`);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    resetInfinite();
    goToPage(1);
  }, [networkFilters, protocolFilters, resetInfinite, goToPage]);

  const handleNetworkFilterPress = useCallback(() => {
    if (isMobile) {
      networkSheetRef.current?.open();
    }
  }, [isMobile]);

  const handleProtocolFilterPress = useCallback(() => {
    if (isMobile) {
      protocolSheetRef.current?.open();
    }
  }, [isMobile]);

  return (
    <View className="flex-1 bg-background">
      <Header />

      <View className="flex-1 px-4 pt-6 md:px-6 lg:px-8">
        <HomeHeader />

        {/* Filter buttons */}
        <View className="mb-2 flex-row flex-wrap gap-2">
          {isMobile ? (
            <>
              <FilterButton
                label="Network"
                activeCount={networkFilters.length}
                onPress={handleNetworkFilterPress}
              />

              <FilterButton
                label="Protocol"
                activeCount={protocolFilters.length}
                onPress={handleProtocolFilterPress}
              />
            </>
          ) : (
            <>
              <FilterDropdown
                label="Network"
                options={filterOptions.networks}
                selectedValues={networkFilters}
                onToggle={toggleNetworkFilter}
              />

              <FilterDropdown
                label="Protocol"
                options={filterOptions.protocols}
                selectedValues={protocolFilters}
                onToggle={toggleProtocolFilter}
              />
            </>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onPress={clearFilters}
              accessibilityLabel="Clear all filters"
            >
              <View className="flex-row items-center gap-1">
                <Feather name="x" size={14} />

                <Text>Clear all</Text>
              </View>
            </Button>
          )}
        </View>

        {/* Filter chips */}
        {hasActiveFilters && (
          <View className="mb-4 flex-row flex-wrap gap-2">
            {allActiveFilters.map((filter) => (
              <FilterChip
                key={`${filter.type}-${filter.value}`}
                label={filter.value}
                onRemove={() =>
                  filter.type === "network"
                    ? toggleNetworkFilter(filter.value)
                    : toggleProtocolFilter(filter.value)
                }
              />
            ))}
          </View>
        )}

        {/* List */}
        <FlashList
          data={itemsToDisplay}
          renderItem={({ item }) => (
            <PoolListItem pool={item} onPress={handlePoolPress} />
          )}
          ListEmptyComponent={
            <EmptyState
              message={
                pools.length === 0
                  ? "No stablecoin pools available"
                  : "No stablecoins found for selected filters"
              }
              showClearFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          }
          onEndReached={isMobile && hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.5}
          keyExtractor={(item) => item.id}
        />

        {/* Pagination controls for desktop/tablet */}
        {!isMobile && totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </View>

      {/* Mobile filter bottom sheets */}
      {isMobile && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <FilterBottomSheet
            ref={networkSheetRef}
            filterType="network"
            options={filterOptions.networks}
            selectedValues={networkFilters}
            onToggle={toggleNetworkFilter}
            onClose={() => {}}
          />

          <FilterBottomSheet
            ref={protocolSheetRef}
            filterType="protocol"
            options={filterOptions.protocols}
            selectedValues={protocolFilters}
            onToggle={toggleProtocolFilter}
            onClose={() => {}}
          />
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Run all tests to verify nothing is broken**

Run: `bun run test`
Expected: All tests PASS.

- [ ] **Step 3: Run type check**

Run: `bun run types`
Expected: No type errors.

- [ ] **Step 4: Run lint**

Run: `bun run lint`
Expected: No lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/screens/home/index.tsx
git commit -m "feat: wire multi-select filters into Home screen"
```
