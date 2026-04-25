# Yieldly Favorites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users mark pools as favorites and access a dedicated Favorites screen with summary stats; persist across app restarts.

**Architecture:** Zustand store with MMKV-backed `persist` middleware (sync hydration → no loading flicker). UI consumes via domain-flavored selector hooks. Responsive nav: header tabs on web (≥md), bottom tab bar on mobile (<md). All 13 implementation units in TDD red→green→refactor cadence with frequent commits.

**Tech Stack:** React Native, Expo SDK 54, Expo Router v6, NativeWind v4, Zustand, react-native-mmkv, react-native-reanimated (v4), Lucide icons, Jest + React Native Testing Library.

**Reference:** Design doc at `docs/superpowers/plans/2026-04-25-favorites-design.md`.

---

### Task 1: Setup — install deps and add global test mocks

**Files:**
- Modify: `package.json` (via `bun add`)
- Modify: `jest.setup.js`

- [ ] **Step 1: Install Zustand and MMKV**

```bash
bun add zustand
bunx expo install react-native-mmkv
```

Expected: both installed successfully. MMKV installs with `bun` (the SDK 54 compatible version).

- [ ] **Step 2: Add Reanimated and MMKV mocks to jest.setup.js**

Replace the entire content of `jest.setup.js`:

```javascript
import "@testing-library/jest-native/extend-expect";

// Polyfill for structuredClone (required by Expo Winter Runtime)
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock Expo Winter Runtime
global.__ExpoImportMetaRegistry = {
  registerImportMeta: jest.fn(),
  getImportMeta: jest.fn(() => ({})),
};

// Reanimated mock — provided by the library itself
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

// MMKV mock — in-memory Map shim, instance-scoped
jest.mock("react-native-mmkv", () => {
  class MMKV {
    constructor() {
      this.store = new Map();
    }
    getString(key) {
      return this.store.has(key) ? this.store.get(key) : undefined;
    }
    set(key, value) {
      this.store.set(key, String(value));
    }
    delete(key) {
      this.store.delete(key);
    }
    clearAll() {
      this.store.clear();
    }
  }
  return { MMKV };
});
```

- [ ] **Step 3: Verify existing tests still pass**

Run: `bun run test`
Expected: all 133+ existing tests pass (the new mocks are no-ops for tests that don't touch MMKV/Reanimated).

If any test fails, the mocks are conflicting with existing ones. Fix by gating: e.g., move per-test mocks of Reanimated above the global mock or switch them to the global one.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock jest.setup.js
git commit -m "chore(favorites): install zustand and mmkv, add jest mocks"
```

---

### Task 2: `mmkvStorage` adapter (Zustand `StateStorage` interface)

**Files:**
- Create: `src/infra/state/storage/mmkv-storage.ts`
- Test: `src/infra/state/storage/__tests__/mmkv-storage.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/infra/state/storage/__tests__/mmkv-storage.test.ts`:

```typescript
import { mmkvStorage } from "../mmkv-storage";

describe("mmkvStorage", () => {
  beforeEach(() => {
    mmkvStorage.removeItem("k");
  });

  it("returns null when key is missing", () => {
    expect(mmkvStorage.getItem("k")).toBeNull();
  });

  it("round-trips a string value", () => {
    mmkvStorage.setItem("k", "value");

    expect(mmkvStorage.getItem("k")).toBe("value");
  });

  it("removes a value", () => {
    mmkvStorage.setItem("k", "value");
    mmkvStorage.removeItem("k");

    expect(mmkvStorage.getItem("k")).toBeNull();
  });

  it("conforms to Zustand's StateStorage shape", () => {
    expect(typeof mmkvStorage.getItem).toBe("function");
    expect(typeof mmkvStorage.setItem).toBe("function");
    expect(typeof mmkvStorage.removeItem).toBe("function");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test --testPathPatterns mmkv-storage`
Expected: FAIL with "Cannot find module '../mmkv-storage'".

- [ ] **Step 3: Implement the adapter**

Create `src/infra/state/storage/mmkv-storage.ts`:

```typescript
import { StateStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";

const mmkv = new MMKV({ id: "yieldly" });

export const mmkvStorage: StateStorage = {
  getItem: (key) => {
    const value = mmkv.getString(key);
    return value === undefined ? null : value;
  },
  setItem: (key, value) => {
    mmkv.set(key, value);
  },
  removeItem: (key) => {
    mmkv.delete(key);
  },
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test --testPathPatterns mmkv-storage`
Expected: PASS, 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/infra/state/storage/
git commit -m "feat(favorites): add mmkv storage adapter for zustand persist"
```

---

### Task 3: `useFavoritesStore` (Zustand store with persist)

**Files:**
- Create: `src/infra/state/favorites-store.ts`
- Test: `src/infra/state/__tests__/favorites-store.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/infra/state/__tests__/favorites-store.test.ts`:

```typescript
import { act } from "@testing-library/react-native";
import { useFavoritesStore } from "../favorites-store";

describe("useFavoritesStore", () => {
  beforeEach(() => {
    act(() => {
      useFavoritesStore.setState({ ids: new Set<string>() });
    });
  });

  it("starts with an empty Set", () => {
    expect(useFavoritesStore.getState().ids.size).toBe(0);
  });

  it("toggle adds an id when missing", () => {
    act(() => {
      useFavoritesStore.getState().toggle("pool-1");
    });

    expect(useFavoritesStore.getState().ids.has("pool-1")).toBe(true);
  });

  it("toggle removes an id when present", () => {
    act(() => {
      useFavoritesStore.getState().toggle("pool-1");
      useFavoritesStore.getState().toggle("pool-1");
    });

    expect(useFavoritesStore.getState().ids.has("pool-1")).toBe(false);
  });

  it("toggle replaces the Set immutably so selectors fire", () => {
    const before = useFavoritesStore.getState().ids;

    act(() => {
      useFavoritesStore.getState().toggle("pool-1");
    });

    const after = useFavoritesStore.getState().ids;

    expect(after).not.toBe(before);
  });

  it("isFavorite reflects current state", () => {
    expect(useFavoritesStore.getState().isFavorite("pool-1")).toBe(false);

    act(() => {
      useFavoritesStore.getState().toggle("pool-1");
    });

    expect(useFavoritesStore.getState().isFavorite("pool-1")).toBe(true);
  });

  it("toggle handles multiple ids independently", () => {
    act(() => {
      useFavoritesStore.getState().toggle("a");
      useFavoritesStore.getState().toggle("b");
      useFavoritesStore.getState().toggle("c");
      useFavoritesStore.getState().toggle("b");
    });

    const ids = useFavoritesStore.getState().ids;
    expect(ids.has("a")).toBe(true);
    expect(ids.has("b")).toBe(false);
    expect(ids.has("c")).toBe(true);
    expect(ids.size).toBe(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test --testPathPatterns favorites-store`
Expected: FAIL with "Cannot find module '../favorites-store'".

- [ ] **Step 3: Implement the store**

Create `src/infra/state/favorites-store.ts`:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "./storage/mmkv-storage";

interface FavoritesState {
  ids: Set<string>;
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: new Set<string>(),
      toggle: (id) =>
        set((state) => {
          const next = new Set(state.ids);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return { ids: next };
        }),
      isFavorite: (id) => get().ids.has(id),
    }),
    {
      name: "yieldly:favorites:v1",
      storage: createJSONStorage(() => mmkvStorage, {
        replacer: (_key, value) =>
          value instanceof Set ? { __type: "Set", value: [...value] } : value,
        reviver: (_key, value) => {
          if (
            value &&
            typeof value === "object" &&
            "__type" in value &&
            (value as { __type: string }).__type === "Set"
          ) {
            return new Set((value as { value: string[] }).value);
          }
          return value;
        },
      }),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test --testPathPatterns favorites-store`
Expected: PASS, 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/infra/state/favorites-store.ts src/infra/state/__tests__/
git commit -m "feat(favorites): add zustand store with mmkv persistence"
```

---

### Task 4: `useFavorites` selector hooks (public API)

**Files:**
- Create: `src/domain/favorites/use-cases/use-favorites.ts`
- Test: `src/domain/favorites/use-cases/__tests__/use-favorites.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/domain/favorites/use-cases/__tests__/use-favorites.test.tsx`:

```typescript
import { useFavoritesStore } from "@/infra/state/favorites-store";
import { act, renderHook } from "@testing-library/react-native";
import {
  useFavoriteIds,
  useFavoritesCount,
  useFavoriteToggle,
  useIsFavorite,
} from "../use-favorites";

describe("favorites hooks", () => {
  beforeEach(() => {
    act(() => {
      useFavoritesStore.setState({ ids: new Set<string>() });
    });
  });

  describe("useIsFavorite", () => {
    it("returns false for an unfavorited id", () => {
      const { result, unmount } = renderHook(() => useIsFavorite("pool-1"));

      expect(result.current).toBe(false);

      unmount();
    });

    it("returns true after toggle", () => {
      const { result, unmount } = renderHook(() => useIsFavorite("pool-1"));

      act(() => {
        useFavoritesStore.getState().toggle("pool-1");
      });

      expect(result.current).toBe(true);

      unmount();
    });

    it("does not re-render when an unrelated id toggles", () => {
      let renders = 0;
      const { unmount } = renderHook(() => {
        renders++;
        return useIsFavorite("pool-1");
      });

      const initial = renders;

      act(() => {
        useFavoritesStore.getState().toggle("pool-2");
      });

      expect(renders).toBe(initial);

      unmount();
    });
  });

  describe("useFavoriteToggle", () => {
    it("returns a toggle function that mutates store", () => {
      const { result, unmount } = renderHook(() => useFavoriteToggle());

      act(() => {
        result.current("pool-1");
      });

      expect(useFavoritesStore.getState().ids.has("pool-1")).toBe(true);

      unmount();
    });

    it("returns a stable reference across re-renders", () => {
      const { result, rerender, unmount } = renderHook(() =>
        useFavoriteToggle(),
      );
      const first = result.current;

      rerender({});

      expect(result.current).toBe(first);

      unmount();
    });
  });

  describe("useFavoritesCount", () => {
    it("returns 0 initially", () => {
      const { result, unmount } = renderHook(() => useFavoritesCount());

      expect(result.current).toBe(0);

      unmount();
    });

    it("increments and decrements with toggles", () => {
      const { result, unmount } = renderHook(() => useFavoritesCount());

      act(() => {
        useFavoritesStore.getState().toggle("a");
        useFavoritesStore.getState().toggle("b");
      });

      expect(result.current).toBe(2);

      act(() => {
        useFavoritesStore.getState().toggle("a");
      });

      expect(result.current).toBe(1);

      unmount();
    });
  });

  describe("useFavoriteIds", () => {
    it("returns the current Set of favorited ids", () => {
      const { result, unmount } = renderHook(() => useFavoriteIds());

      act(() => {
        useFavoritesStore.getState().toggle("a");
        useFavoritesStore.getState().toggle("b");
      });

      expect(result.current.has("a")).toBe(true);
      expect(result.current.has("b")).toBe(true);
      expect(result.current.size).toBe(2);

      unmount();
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test --testPathPatterns use-favorites`
Expected: FAIL with "Cannot find module '../use-favorites'".

- [ ] **Step 3: Implement the hooks**

Create `src/domain/favorites/use-cases/use-favorites.ts`:

```typescript
import { useFavoritesStore } from "@/infra/state/favorites-store";

export function useIsFavorite(id: string): boolean {
  return useFavoritesStore((state) => state.ids.has(id));
}

export function useFavoriteToggle(): (id: string) => void {
  return useFavoritesStore((state) => state.toggle);
}

export function useFavoritesCount(): number {
  return useFavoritesStore((state) => state.ids.size);
}

export function useFavoriteIds(): Set<string> {
  return useFavoritesStore((state) => state.ids);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test --testPathPatterns use-favorites`
Expected: PASS, 8 passed.

- [ ] **Step 5: Commit**

```bash
git add src/domain/favorites/
git commit -m "feat(favorites): add domain selector hooks consuming store"
```

---

### Task 5: `<FavoriteButton />` component (icon + pill variants)

**Files:**
- Create: `src/components/favorite-button.tsx`
- Test: `src/components/__tests__/favorite-button.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/favorite-button.test.tsx`:

```typescript
import { useFavoritesStore } from "@/infra/state/favorites-store";
import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";
import React from "react";
import { Pressable, Text } from "react-native";
import { FavoriteButton } from "../favorite-button";

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return {
    Star: ({ fill }: { fill?: string }) => (
      <Text testID={`star-${fill && fill !== "none" ? "filled" : "outline"}`}>
        star
      </Text>
    ),
  };
});

describe("FavoriteButton", () => {
  beforeEach(() => {
    act(() => {
      useFavoritesStore.setState({ ids: new Set<string>() });
    });
  });

  it("renders an outline star when not favorited", () => {
    render(<FavoriteButton poolId="pool-1" />);

    expect(screen.getByTestId("star-outline")).toBeTruthy();
  });

  it("renders a filled star when favorited", () => {
    act(() => {
      useFavoritesStore.getState().toggle("pool-1");
    });

    render(<FavoriteButton poolId="pool-1" />);

    expect(screen.getByTestId("star-filled")).toBeTruthy();
  });

  it("toggles the store on press", () => {
    render(<FavoriteButton poolId="pool-1" />);

    fireEvent.press(screen.getByLabelText("Add to favorites"));

    expect(useFavoritesStore.getState().ids.has("pool-1")).toBe(true);
  });

  it("updates accessibility label when favorited", () => {
    act(() => {
      useFavoritesStore.getState().toggle("pool-1");
    });

    render(<FavoriteButton poolId="pool-1" />);

    expect(screen.getByLabelText("Remove from favorites")).toBeTruthy();
  });

  it("stops propagation so parent press is not fired", () => {
    const onParentPress = jest.fn();

    render(
      <Pressable onPress={onParentPress} testID="parent">
        <Text>parent</Text>

        <FavoriteButton poolId="pool-1" />
      </Pressable>,
    );

    fireEvent.press(screen.getByLabelText("Add to favorites"));

    expect(onParentPress).not.toHaveBeenCalled();
    expect(useFavoritesStore.getState().ids.has("pool-1")).toBe(true);
  });

  it("renders pill variant with 'Add to favorites' label when not favorited", () => {
    render(<FavoriteButton poolId="pool-1" variant="pill" />);

    expect(screen.getByText("Add to favorites")).toBeTruthy();
  });

  it("renders pill variant with 'Favorited' label when favorited", () => {
    act(() => {
      useFavoritesStore.getState().toggle("pool-1");
    });

    render(<FavoriteButton poolId="pool-1" variant="pill" />);

    expect(screen.getByText("Favorited")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test --testPathPatterns favorite-button`
Expected: FAIL with "Cannot find module '../favorite-button'".

- [ ] **Step 3: Implement the component**

Create `src/components/favorite-button.tsx`:

```typescript
import { Text } from "@/components/core/text";
import {
  useFavoriteToggle,
  useIsFavorite,
} from "@/domain/favorites/use-cases/use-favorites";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react-native";
import { useCallback } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const BRAND = "#00AD69";
const GRAY_400 = "#9ca3af";

interface FavoriteButtonProps {
  poolId: string;
  variant?: "icon" | "pill";
  size?: number;
}

export function FavoriteButton({
  poolId,
  variant = "icon",
  size = 18,
}: FavoriteButtonProps) {
  const isFavorite = useIsFavorite(poolId);
  const toggle = useFavoriteToggle();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();
      scale.value = withSequence(
        withTiming(1.4, { duration: 180 }),
        withSpring(1, { damping: 6, stiffness: 200 }),
      );
      toggle(poolId);
    },
    [poolId, toggle, scale],
  );

  const label = isFavorite ? "Remove from favorites" : "Add to favorites";

  if (variant === "pill") {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label}
        className={cn(
          "h-9 flex-row items-center gap-2 rounded-md border px-3.5",
          isFavorite
            ? "border-brand/20 bg-brand/10"
            : "border-border bg-card hover:bg-muted",
        )}
      >
        <Animated.View style={animatedStyle}>
          <Star
            size={size - 4}
            color={isFavorite ? BRAND : GRAY_400}
            fill={isFavorite ? BRAND : "none"}
          />
        </Animated.View>

        <Text
          className={cn(
            "text-sm font-medium",
            isFavorite ? "text-brand" : "text-muted-foreground",
          )}
        >
          {isFavorite ? "Favorited" : "Add to favorites"}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      className={cn(
        "h-8 w-8 items-center justify-center rounded-md border",
        isFavorite
          ? "border-brand/20 bg-brand/10"
          : "border-transparent hover:border-border hover:bg-muted",
      )}
    >
      <Animated.View style={animatedStyle}>
        <View>
          <Star
            size={size}
            color={isFavorite ? BRAND : GRAY_400}
            fill={isFavorite ? BRAND : "none"}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test --testPathPatterns favorite-button`
Expected: PASS, 7 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/favorite-button.tsx src/components/__tests__/favorite-button.test.tsx
git commit -m "feat(favorites): add favorite button with icon and pill variants"
```

---

### Task 6: `<FavoritesBanner />` component

**Files:**
- Create: `src/components/favorites-banner.tsx`
- Test: `src/components/__tests__/favorites-banner.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/favorites-banner.test.tsx`:

```typescript
import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";
import React from "react";
import { FavoritesBanner } from "../favorites-banner";

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return {
    Star: () => <Text testID="banner-star">star</Text>,
  };
});

describe("FavoritesBanner", () => {
  it("returns null when count is 0", () => {
    const { toJSON } = render(<FavoritesBanner count={0} onPress={jest.fn()} />);

    expect(toJSON()).toBeNull();
  });

  it("renders singular text for count=1", () => {
    render(<FavoritesBanner count={1} onPress={jest.fn()} />);

    expect(screen.getByText("1 pool favorited")).toBeTruthy();
  });

  it("renders plural text for count>1", () => {
    render(<FavoritesBanner count={3} onPress={jest.fn()} />);

    expect(screen.getByText("3 pools favorited")).toBeTruthy();
  });

  it("calls onPress when 'View favorites' is tapped", () => {
    const onPress = jest.fn();
    render(<FavoritesBanner count={2} onPress={onPress} />);

    fireEvent.press(screen.getByLabelText("View favorites"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders the star icon", () => {
    render(<FavoritesBanner count={2} onPress={jest.fn()} />);

    expect(screen.getByTestId("banner-star")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test --testPathPatterns favorites-banner`
Expected: FAIL with "Cannot find module '../favorites-banner'".

- [ ] **Step 3: Implement the component**

Create `src/components/favorites-banner.tsx`:

```typescript
import { Text } from "@/components/core/text";
import { Star } from "lucide-react-native";
import { Pressable, View } from "react-native";

const BRAND = "#00AD69";

interface FavoritesBannerProps {
  count: number;
  onPress: () => void;
}

export function FavoritesBanner({ count, onPress }: FavoritesBannerProps) {
  if (count === 0) return null;

  return (
    <View className="mb-4 flex-row items-center justify-between rounded-xl border border-brand/20 bg-brand/10 px-4 py-2.5">
      <View className="flex-row items-center gap-2">
        <Star size={14} color={BRAND} fill={BRAND} />

        <Text className="text-sm font-medium text-foreground">
          {count === 1 ? "1 pool favorited" : `${count} pools favorited`}
        </Text>
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="View favorites"
      >
        <Text className="text-xs font-semibold text-brand underline">
          View favorites →
        </Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test --testPathPatterns favorites-banner`
Expected: PASS, 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/favorites-banner.tsx src/components/__tests__/favorites-banner.test.tsx
git commit -m "feat(favorites): add favorites banner shown when count > 0"
```

---

### Task 7: `<FavoritesEmptyState />` component

**Files:**
- Create: `src/screens/favorites/components/favorites-empty-state.tsx`
- Test: `src/screens/favorites/components/__tests__/favorites-empty-state.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/favorites/components/__tests__/favorites-empty-state.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { FavoritesEmptyState } from "../favorites-empty-state";

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return {
    Star: () => <Text testID="empty-state-star">star</Text>,
  };
});

describe("FavoritesEmptyState", () => {
  it("renders the title", () => {
    render(<FavoritesEmptyState />);

    expect(screen.getByText("No favorites yet")).toBeTruthy();
  });

  it("renders the body copy", () => {
    render(<FavoritesEmptyState />);

    expect(
      screen.getByText(
        "Tap the star icon on any pool to save it here for quick access.",
      ),
    ).toBeTruthy();
  });

  it("renders a decorative star icon", () => {
    render(<FavoritesEmptyState />);

    expect(screen.getByTestId("empty-state-star")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test --testPathPatterns favorites-empty-state`
Expected: FAIL with "Cannot find module '../favorites-empty-state'".

- [ ] **Step 3: Implement the component**

Create `src/screens/favorites/components/favorites-empty-state.tsx`:

```typescript
import { Text } from "@/components/core/text";
import { Star } from "lucide-react-native";
import { View } from "react-native";

export function FavoritesEmptyState() {
  return (
    <View className="items-center rounded-2xl border border-dashed border-border bg-muted px-8 py-16">
      <View className="mb-4 opacity-25">
        <Star size={48} color="#0a0a0a" />
      </View>

      <Text className="mb-1.5 text-base font-semibold text-foreground">
        No favorites yet
      </Text>

      <Text className="max-w-[280px] text-center text-sm text-muted-foreground">
        Tap the star icon on any pool to save it here for quick access.
      </Text>
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test --testPathPatterns favorites-empty-state`
Expected: PASS, 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/screens/favorites/components/favorites-empty-state.tsx src/screens/favorites/components/__tests__/favorites-empty-state.test.tsx
git commit -m "feat(favorites): add favorites empty state component"
```

---

### Task 8: `<FavoritesStats />` component

**Files:**
- Create: `src/screens/favorites/components/favorites-stats.tsx`
- Test: `src/screens/favorites/components/__tests__/favorites-stats.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/favorites/components/__tests__/favorites-stats.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { FavoritesStats } from "../favorites-stats";

describe("FavoritesStats", () => {
  it("renders saved pool count", () => {
    render(<FavoritesStats count={3} bestApy={9.5} avgApy={5.5} />);

    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Saved pools")).toBeTruthy();
  });

  it("renders best APY formatted", () => {
    render(<FavoritesStats count={3} bestApy={12.3456} avgApy={5.5} />);

    expect(screen.getByText("12.35%")).toBeTruthy();
    expect(screen.getByText("Best APY")).toBeTruthy();
  });

  it("renders average APY formatted", () => {
    render(<FavoritesStats count={3} bestApy={9.5} avgApy={5.6789} />);

    expect(screen.getByText("5.68%")).toBeTruthy();
    expect(screen.getByText("Avg APY")).toBeTruthy();
  });

  it("uses red text for negative APY values", () => {
    render(<FavoritesStats count={1} bestApy={-2} avgApy={-2} />);

    const best = screen.getByText("-2.00%");
    const avg = screen.getAllByText("-2.00%");

    expect(best.props.className).toContain("text-red-500");
    expect(avg.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test --testPathPatterns favorites-stats`
Expected: FAIL with "Cannot find module '../favorites-stats'".

- [ ] **Step 3: Implement the component**

Create `src/screens/favorites/components/favorites-stats.tsx`:

```typescript
import { Text } from "@/components/core/text";
import { formatAPY } from "@/lib/format-apy";
import { cn } from "@/lib/utils";
import { View } from "react-native";

interface FavoritesStatsProps {
  count: number;
  bestApy: number;
  avgApy: number;
}

interface StatCardProps {
  label: string;
  value: string;
  isBrand?: boolean;
  isNegative?: boolean;
}

function StatCard({ label, value, isBrand, isNegative }: StatCardProps) {
  return (
    <View className="flex-1 rounded-xl border border-border bg-card px-4 py-3.5 shadow shadow-black/5">
      <Text className="mb-1 text-xs text-muted-foreground">{label}</Text>

      <Text
        className={cn(
          "text-2xl font-bold",
          isNegative ? "text-red-500" : isBrand ? "text-brand" : "text-foreground",
        )}
      >
        {value}
      </Text>
    </View>
  );
}

export function FavoritesStats({ count, bestApy, avgApy }: FavoritesStatsProps) {
  return (
    <View className="mb-5 flex-row gap-2">
      <StatCard label="Saved pools" value={String(count)} />

      <StatCard
        label="Best APY"
        value={formatAPY(bestApy)}
        isBrand={bestApy >= 0}
        isNegative={bestApy < 0}
      />

      <StatCard
        label="Avg APY"
        value={formatAPY(avgApy)}
        isBrand={avgApy >= 0}
        isNegative={avgApy < 0}
      />
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test --testPathPatterns favorites-stats`
Expected: PASS, 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/screens/favorites/components/favorites-stats.tsx src/screens/favorites/components/__tests__/favorites-stats.test.tsx
git commit -m "feat(favorites): add favorites stats summary component"
```

---

### Task 9: `<BottomTabBar />` component (mobile-only nav)

**Files:**
- Create: `src/components/bottom-tab-bar.tsx`
- Test: `src/components/__tests__/bottom-tab-bar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/bottom-tab-bar.test.tsx`:

```typescript
import { useFavoritesStore } from "@/infra/state/favorites-store";
import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";
import React from "react";
import { BottomTabBar } from "../bottom-tab-bar";

const pushMock = jest.fn();
let mockPathname = "/";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return {
    Home: ({ color }: { color: string }) => (
      <Text testID={`home-${color}`}>home</Text>
    ),
    Star: ({ color, fill }: { color: string; fill?: string }) => (
      <Text testID={`star-${color}-${fill ?? "nofill"}`}>star</Text>
    ),
  };
});

describe("BottomTabBar", () => {
  beforeEach(() => {
    pushMock.mockClear();
    mockPathname = "/";
    act(() => {
      useFavoritesStore.setState({ ids: new Set<string>() });
    });
  });

  it("renders Home and Favorites tabs", () => {
    render(<BottomTabBar />);

    expect(screen.getByLabelText("All pools")).toBeTruthy();
    expect(screen.getByLabelText("Favorites")).toBeTruthy();
  });

  it("navigates to / when Home tab is pressed", () => {
    mockPathname = "/favorites";
    render(<BottomTabBar />);

    fireEvent.press(screen.getByLabelText("All pools"));

    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("navigates to /favorites when Favorites tab is pressed", () => {
    render(<BottomTabBar />);

    fireEvent.press(screen.getByLabelText("Favorites"));

    expect(pushMock).toHaveBeenCalledWith("/favorites");
  });

  it("does not show a count badge when count is 0", () => {
    render(<BottomTabBar />);

    expect(screen.queryByTestId("favorites-tab-badge")).toBeNull();
  });

  it("shows count badge when favorites > 0", () => {
    act(() => {
      useFavoritesStore.getState().toggle("a");
      useFavoritesStore.getState().toggle("b");
    });

    render(<BottomTabBar />);

    expect(screen.getByTestId("favorites-tab-badge")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test --testPathPatterns bottom-tab-bar`
Expected: FAIL with "Cannot find module '../bottom-tab-bar'".

- [ ] **Step 3: Implement the component**

Create `src/components/bottom-tab-bar.tsx`:

```typescript
import { Text } from "@/components/core/text";
import { useFavoritesCount } from "@/domain/favorites/use-cases/use-favorites";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "expo-router";
import { Home, Star } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND = "#00AD69";
const MUTED = "#737373";

interface TabConfig {
  label: string;
  href: "/" | "/favorites";
  Icon: typeof Home;
  showBadge?: boolean;
}

const TABS: TabConfig[] = [
  { label: "All pools", href: "/", Icon: Home },
  { label: "Favorites", href: "/favorites", Icon: Star, showBadge: true },
];

export function BottomTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const count = useFavoritesCount();

  return (
    <View
      className="flex-row border-t border-border bg-card"
      style={{ paddingBottom: insets.bottom }}
    >
      {TABS.map(({ label, href, Icon, showBadge }) => {
        const active = pathname === href;
        const color = active ? BRAND : MUTED;

        return (
          <Pressable
            key={href}
            onPress={() => router.push(href)}
            accessibilityRole="button"
            accessibilityLabel={label}
            className="flex-1 items-center justify-center gap-1 py-2"
          >
            <View className="relative">
              <Icon
                size={22}
                color={color}
                fill={active && showBadge ? color : undefined}
              />

              {showBadge && count > 0 && (
                <View
                  testID="favorites-tab-badge"
                  className="absolute -right-3 -top-1.5 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1"
                >
                  <Text className="text-[10px] font-bold text-white">
                    {count}
                  </Text>
                </View>
              )}
            </View>

            <Text
              className={cn(
                "text-[11px]",
                active ? "font-semibold text-brand" : "text-muted-foreground",
              )}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test --testPathPatterns bottom-tab-bar`
Expected: PASS, 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/bottom-tab-bar.tsx src/components/__tests__/bottom-tab-bar.test.tsx
git commit -m "feat(favorites): add bottom tab bar with home and favorites tabs"
```

---

### Task 10: Extend `<Header />` with web tabs

**Files:**
- Modify: `src/components/header.tsx`
- Modify: `src/components/__tests__/header.test.tsx`

- [ ] **Step 1: Read the existing test to know what to preserve**

Run: `cat src/components/__tests__/header.test.tsx`

Note the existing assertions about logo and brand name — they must continue passing.

- [ ] **Step 2: Append failing tests for web tabs**

Append the following block to the existing `src/components/__tests__/header.test.tsx` (inside the existing `describe("Header", ...)` block, before the closing `})`). If the file does not yet have the imports/mocks below, add them at the top:

Top of file (replace existing imports/mocks if absent):

```typescript
import { useFavoritesStore } from "@/infra/state/favorites-store";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const pushMock = jest.fn();
let mockPathname = "/";
let windowWidth = 375;

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: windowWidth, height: 812 }),
}));

jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return { Image: (p: Record<string, unknown>) => <View testID="logo" {...p} /> };
});

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return { Star: () => <Text testID="header-star">star</Text> };
});

import { Header } from "../header";
```

Then add these tests inside the existing `describe("Header", () => { ... })` (or replace the whole `describe` if cleaner):

```typescript
describe("Header — web tabs", () => {
  beforeEach(() => {
    pushMock.mockClear();
    mockPathname = "/";
    windowWidth = 375;
    act(() => {
      useFavoritesStore.setState({ ids: new Set<string>() });
    });
  });

  it("hides nav tabs on mobile (<768)", () => {
    windowWidth = 375;

    render(<Header />);

    expect(screen.queryByLabelText("All pools tab")).toBeNull();
    expect(screen.queryByLabelText("Favorites tab")).toBeNull();
  });

  it("shows nav tabs on web (>=768)", () => {
    windowWidth = 1024;

    render(<Header />);

    expect(screen.getByLabelText("All pools tab")).toBeTruthy();
    expect(screen.getByLabelText("Favorites tab")).toBeTruthy();
  });

  it("marks the All pools tab active on / route", () => {
    windowWidth = 1024;
    mockPathname = "/";

    render(<Header />);

    expect(
      screen.getByLabelText("All pools tab").props.accessibilityState?.selected,
    ).toBe(true);
  });

  it("marks the Favorites tab active on /favorites route", () => {
    windowWidth = 1024;
    mockPathname = "/favorites";

    render(<Header />);

    expect(
      screen.getByLabelText("Favorites tab").props.accessibilityState?.selected,
    ).toBe(true);
  });

  it("navigates on tab press", () => {
    windowWidth = 1024;

    render(<Header />);

    fireEvent.press(screen.getByLabelText("Favorites tab"));

    expect(pushMock).toHaveBeenCalledWith("/favorites");
  });

  it("hides count badge when 0 favorites", () => {
    windowWidth = 1024;

    render(<Header />);

    expect(screen.queryByTestId("header-favorites-badge")).toBeNull();
  });

  it("shows count badge when favorites > 0", () => {
    windowWidth = 1024;
    act(() => {
      useFavoritesStore.getState().toggle("a");
    });

    render(<Header />);

    expect(screen.getByTestId("header-favorites-badge")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `bun run test --testPathPatterns components/__tests__/header.test`
Expected: FAILS — at least the new tests fail because the Header doesn't render tabs yet. Existing assertions (logo, brand) continue passing.

- [ ] **Step 4: Implement the Header changes**

Replace the entire content of `src/components/header.tsx`:

```typescript
import { Text } from "@/components/core/text";
import { useFavoritesCount } from "@/domain/favorites/use-cases/use-favorites";
import { useDeviceLayout } from "@/hooks/use-device-layout";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import { Star } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const logo = require("@/assets/svgs/logo.svg");

const BRAND = "#00AD69";
const MUTED = "#737373";

interface NavTab {
  label: string;
  href: "/" | "/favorites";
  showStar?: boolean;
  showBadge?: boolean;
}

const TABS: NavTab[] = [
  { label: "All pools", href: "/" },
  { label: "Favorites", href: "/favorites", showStar: true, showBadge: true },
];

export function Header() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useDeviceLayout();
  const pathname = usePathname();
  const router = useRouter();
  const count = useFavoritesCount();

  return (
    <View
      className="flex-row items-center border-b border-border bg-card px-4 md:px-6"
      style={{ paddingTop: insets.top, height: 64 + insets.top }}
      accessibilityRole="header"
    >
      <Image
        source={logo}
        style={{ width: 40, height: 40, borderRadius: 10 }}
        contentFit="contain"
        accessibilityLabel="Yieldly logo"
      />

      <Text className="ml-3 text-xl font-bold text-foreground">Yieldly</Text>

      {!isMobile && (
        <View className="ml-6 flex-row gap-1">
          {TABS.map(({ label, href, showStar, showBadge }) => {
            const active = pathname === href;

            return (
              <Pressable
                key={href}
                onPress={() => router.push(href)}
                accessibilityRole="button"
                accessibilityLabel={`${label} tab`}
                accessibilityState={{ selected: active }}
                className={cn(
                  "h-9 flex-row items-center gap-1.5 rounded-md px-3.5",
                  active ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                {showStar && (
                  <Star
                    size={13}
                    color={active ? BRAND : MUTED}
                    fill={active ? BRAND : "none"}
                  />
                )}

                <Text
                  className={cn(
                    "text-sm",
                    active
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground",
                  )}
                >
                  {label}
                </Text>

                {showBadge && count > 0 && (
                  <View
                    testID="header-favorites-badge"
                    className={cn(
                      "ml-0.5 h-[18px] min-w-[18px] items-center justify-center rounded-full px-1",
                      active ? "bg-brand" : "bg-border",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-[10px] font-bold",
                        active ? "text-white" : "text-muted-foreground",
                      )}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `bun run test --testPathPatterns components/__tests__/header.test`
Expected: PASS — all existing tests + 7 new ones.

- [ ] **Step 6: Commit**

```bash
git add src/components/header.tsx src/components/__tests__/header.test.tsx
git commit -m "feat(favorites): add nav tabs to header on web breakpoint"
```

---

### Task 11: Wire `<FavoriteButton />` into `<PoolListItem />`

**Files:**
- Modify: `src/screens/home/components/pool-list-item.tsx`
- Modify: `src/screens/home/components/__tests__/pool-list-item.test.tsx`

- [ ] **Step 1: Append failing tests to existing test file**

Open `src/screens/home/components/__tests__/pool-list-item.test.tsx`. At the top of the file, ensure these mocks are present (add if missing):

```typescript
import { useFavoritesStore } from "@/infra/state/favorites-store";
import { act } from "@testing-library/react-native";

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return {
    Star: ({ fill }: { fill?: string }) => (
      <Text testID={`star-${fill && fill !== "none" ? "filled" : "outline"}`}>
        star
      </Text>
    ),
  };
});
```

Inside the existing `describe("PoolListItem", () => { ... })`, add these tests (and also reset the store in `afterEach`):

```typescript
afterEach(() => {
  act(() => {
    useFavoritesStore.setState({ ids: new Set<string>() });
  });
});

it("renders a star button next to the row content", () => {
  render(<PoolListItem pool={makePool()} onPress={onPress} />);

  expect(screen.getByLabelText("Add to favorites")).toBeTruthy();
});

it("renders filled star when pool is in favorites", () => {
  act(() => {
    useFavoritesStore.getState().toggle("1");
  });

  render(<PoolListItem pool={makePool({ id: "1" })} onPress={onPress} />);

  expect(screen.getByTestId("star-filled")).toBeTruthy();
});

it("does not call onPress when only the star is tapped", () => {
  render(<PoolListItem pool={makePool({ id: "1" })} onPress={onPress} />);

  fireEvent.press(screen.getByLabelText("Add to favorites"));

  expect(onPress).not.toHaveBeenCalled();
  expect(useFavoritesStore.getState().ids.has("1")).toBe(true);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test --testPathPatterns pool-list-item.test`
Expected: FAILS — new tests fail because PoolListItem doesn't render FavoriteButton yet.

- [ ] **Step 3: Modify `pool-list-item.tsx` to render the star**

Replace `src/screens/home/components/pool-list-item.tsx` with:

```typescript
import { Badge } from "@/components/core/badge";
import { Text } from "@/components/core/text";
import { FavoriteButton } from "@/components/favorite-button";
import { Pool } from "@/domain/pool/pool";
import { formatAPY } from "@/lib/format-apy";
import { Feather } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Pressable, View } from "react-native";

interface PoolListItemProps {
  pool: Pool;
  onPress: (pool: Pool) => void;
}

export const PoolListItem = React.memo(
  function PoolListItem({ pool, onPress }: PoolListItemProps) {
    const handlePress = useCallback(() => {
      onPress(pool);
    }, [pool, onPress]);

    const isNegative = pool.apy < 0;

    return (
      <View className="mb-3 flex-row items-center gap-2 rounded-xl border border-border bg-card p-4 shadow shadow-black/5 transition-shadow duration-200 hover:shadow-lg hover:shadow-black/10 md:mb-4 md:rounded-2xl md:p-5">
        <Pressable
          onPress={handlePress}
          className="flex-1 flex-row items-center"
          accessibilityRole="button"
          accessibilityLabel={`${pool.symbol} on ${pool.project} via ${pool.chain}, ${formatAPY(pool.apy)} APY`}
        >
          {/* Symbol Icon */}
          <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-brand/20 bg-brand/10 dark:border-brand/20 dark:bg-brand/10 md:h-14 md:w-14 md:rounded-2xl">
            <Text
              className="text-base font-semibold text-brand dark:text-brand md:text-lg"
              numberOfLines={1}
            >
              {pool.symbol}
            </Text>
          </View>

          {/* Pool Info */}
          <View className="ml-3 mr-3 flex-1 md:ml-4 md:mr-4">
            <Text
              className="text-lg font-semibold text-foreground md:text-xl"
              numberOfLines={1}
            >
              {pool.project}
            </Text>

            <Badge variant="subtle" className="self-start">
              <Text className="text-brand dark:text-brand">{"• "}</Text>

              <Text>{pool.chain}</Text>
            </Badge>
          </View>

          {/* APY */}
          <View className="items-end">
            <Text
              className={`text-xl font-bold md:text-2xl ${isNegative ? "text-red-500" : "text-brand"}`}
            >
              {formatAPY(pool.apy)}
            </Text>

            <Text className="text-xs text-muted-foreground md:text-sm">
              Best APY
            </Text>
          </View>

          {/* Chevron */}
          <View className="ml-2 md:ml-3">
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </View>
        </Pressable>

        <FavoriteButton poolId={pool.id} />
      </View>
    );
  },
  (prevProps, nextProps) => prevProps.pool.id === nextProps.pool.id,
);
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun run test --testPathPatterns pool-list-item.test`
Expected: PASS — all existing + 3 new.

- [ ] **Step 5: Commit**

```bash
git add src/screens/home/components/pool-list-item.tsx src/screens/home/components/__tests__/pool-list-item.test.tsx
git commit -m "feat(favorites): wire favorite toggle into pool list item"
```

---

### Task 12: Wire pill `<FavoriteButton />` into `<PoolDetailsHeader />`

**Files:**
- Modify: `src/screens/pool-details/components/pool-details-header.tsx`
- Modify: `src/screens/pool-details/components/__tests__/pool-details-header.test.tsx`

- [ ] **Step 1: Append failing tests**

Update the top of `src/screens/pool-details/components/__tests__/pool-details-header.test.tsx` to ensure these mocks exist:

```typescript
import { useFavoritesStore } from "@/infra/state/favorites-store";
import { act } from "@testing-library/react-native";

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return {
    ArrowLeft: () => <Text testID="back-arrow">arrow</Text>,
    ExternalLink: () => null,
    Star: ({ fill }: { fill?: string }) => (
      <Text testID={`star-${fill && fill !== "none" ? "filled" : "outline"}`}>
        star
      </Text>
    ),
  };
});
```

Add these tests inside the existing `describe`:

```typescript
afterEach(() => {
  act(() => {
    useFavoritesStore.setState({ ids: new Set<string>() });
  });
});

it("renders the favorite pill button when poolId is provided", () => {
  render(<PoolDetailsHeader onBack={jest.fn()} poolId="pool-1" />);

  expect(screen.getByText("Add to favorites")).toBeTruthy();
});

it("renders 'Favorited' label when pool is favorited", () => {
  act(() => {
    useFavoritesStore.getState().toggle("pool-1");
  });

  render(<PoolDetailsHeader onBack={jest.fn()} poolId="pool-1" />);

  expect(screen.getByText("Favorited")).toBeTruthy();
});

it("toggles favorite state on pill press without calling onBack", () => {
  const onBack = jest.fn();
  render(<PoolDetailsHeader onBack={onBack} poolId="pool-1" />);

  fireEvent.press(screen.getByLabelText("Add to favorites"));

  expect(useFavoritesStore.getState().ids.has("pool-1")).toBe(true);
  expect(onBack).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test --testPathPatterns pool-details-header.test`
Expected: FAILS — new tests fail.

- [ ] **Step 3: Modify the header**

Replace `src/screens/pool-details/components/pool-details-header.tsx`:

```typescript
import { Text } from "@/components/core/text";
import { FavoriteButton } from "@/components/favorite-button";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

interface PoolDetailsHeaderProps {
  onBack: () => void;
  poolId?: string;
}

export function PoolDetailsHeader({ onBack, poolId }: PoolDetailsHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Pressable
        onPress={onBack}
        className="flex-row items-center gap-2"
        style={{ minHeight: 44 }}
        accessibilityRole="button"
        accessibilityLabel="Navigate back to pool list"
      >
        <ArrowLeft size={16} className="text-foreground" />

        <Text className="text-sm text-foreground">Back to all coins</Text>
      </Pressable>

      {poolId && <FavoriteButton poolId={poolId} variant="pill" />}
    </View>
  );
}
```

- [ ] **Step 4: Pass the poolId from the parent screen**

Modify `src/screens/pool-details/index.tsx` — change the `<PoolDetailsHeader>` line from:

```typescript
<PoolDetailsHeader onBack={onBack} />
```

to:

```typescript
<PoolDetailsHeader onBack={onBack} poolId={pool.id} />
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `bun run test --testPathPatterns "pool-details-header.test|pool-details-screen"`
Expected: PASS — all existing + 3 new.

- [ ] **Step 6: Commit**

```bash
git add src/screens/pool-details/
git commit -m "feat(favorites): wire favorite pill into pool details header"
```

---

### Task 13: Build `<FavoritesScreen />` (integration test + impl)

**Files:**
- Create: `src/screens/favorites/index.tsx`
- Test: `src/screens/favorites/__tests__/favorites-screen.integration.test.tsx`

- [ ] **Step 1: Write the failing integration test**

Create `src/screens/favorites/__tests__/favorites-screen.integration.test.tsx`:

```typescript
import { Pool } from "@/domain/pool/pool";
import { useFavoritesStore } from "@/infra/state/favorites-store";
import { RepositoryProvider } from "@/infra/repositories/repository-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React, { Suspense } from "react";
import { Text } from "react-native";

const pushMock = jest.fn();

jest.mock("@shopify/flash-list", () => {
  const { FlatList } = require("react-native");
  return { __esModule: true, FlashList: FlatList };
});

jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    Image: (props: Record<string, unknown>) => (
      <View testID="expo-image" {...props} />
    ),
  };
});

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Feather: (props: Record<string, unknown>) => (
      <Text testID="feather-icon">{String(props.name)}</Text>
    ),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: 375, height: 812 }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/favorites",
}));

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return {
    Star: ({ fill }: { fill?: string }) => (
      <Text testID={`star-${fill && fill !== "none" ? "filled" : "outline"}`}>
        star
      </Text>
    ),
    ArrowLeft: () => null,
    Home: () => null,
  };
});

const POOLS: Pool[] = [
  { id: "1", chain: "Ethereum", project: "Aave", symbol: "USDC", apy: 5.25 },
  { id: "2", chain: "Polygon", project: "Compound", symbol: "USDT", apy: 9.4 },
  { id: "3", chain: "Ethereum", project: "Curve", symbol: "DAI", apy: 3.75 },
];

function setup() {
  const mockPoolRepo = {
    findAll: jest.fn().mockResolvedValue(POOLS),
    findApyHistory: jest.fn(),
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider value={{ poolRepo: mockPoolRepo }}>
          <Suspense fallback={<Text>Loading</Text>}>{children}</Suspense>
        </RepositoryProvider>
      </QueryClientProvider>
    );
  }

  return { Wrapper, mockPoolRepo, queryClient };
}

let FavoritesScreen: React.ComponentType;

beforeAll(() => {
  FavoritesScreen = require("../index").default as React.ComponentType;
});

describe("FavoritesScreen Integration", () => {
  beforeEach(() => {
    pushMock.mockClear();
    act(() => {
      useFavoritesStore.setState({ ids: new Set<string>() });
    });
  });

  it("renders empty state when no favorites", async () => {
    const { Wrapper } = setup();

    render(<FavoritesScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("No favorites yet")).toBeTruthy();
    });
  });

  it("renders sorted favorited pools (APY desc)", async () => {
    act(() => {
      useFavoritesStore.getState().toggle("1");
      useFavoritesStore.getState().toggle("2");
    });

    const { Wrapper } = setup();

    render(<FavoritesScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Compound")).toBeTruthy();
      expect(screen.getByText("Aave")).toBeTruthy();
    });

    // Sorted: Compound (9.4) before Aave (5.25)
    const projects = screen.getAllByText(/Compound|Aave|Curve/);
    expect(projects[0].props.children).toBe("Compound");
    expect(projects[1].props.children).toBe("Aave");
  });

  it("renders stats summary when favorites exist", async () => {
    act(() => {
      useFavoritesStore.getState().toggle("1");
      useFavoritesStore.getState().toggle("2");
    });

    const { Wrapper } = setup();

    render(<FavoritesScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Saved pools")).toBeTruthy();
      expect(screen.getByText("Best APY")).toBeTruthy();
      expect(screen.getByText("Avg APY")).toBeTruthy();
    });

    // 2 favs
    expect(screen.getByText("2")).toBeTruthy();
    // best = 9.40%
    expect(screen.getByText("9.40%")).toBeTruthy();
    // avg = 7.33%
    expect(screen.getByText("7.33%")).toBeTruthy();
  });

  it("navigates to pool details when row is pressed", async () => {
    act(() => {
      useFavoritesStore.getState().toggle("1");
    });

    const { Wrapper } = setup();

    render(<FavoritesScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Aave")).toBeTruthy();
    });

    fireEvent.press(
      screen.getByLabelText("USDC on Aave via Ethereum, 5.25% APY"),
    );

    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/pool-details",
        params: expect.objectContaining({ id: "1" }),
      }),
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test --testPathPatterns favorites-screen.integration`
Expected: FAIL — module `../index` does not exist.

- [ ] **Step 3: Implement the screen**

Create `src/screens/favorites/index.tsx`:

```typescript
import { Header } from "@/components/header";
import { useFavoriteIds } from "@/domain/favorites/use-cases/use-favorites";
import { Pool } from "@/domain/pool/pool";
import { usePoolFindAllSuspense } from "@/domain/pool/use-cases/use-pool-find-all-suspense";
import { Text } from "@/components/core/text";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import { PoolListItem } from "../home/components/pool-list-item";
import { FavoritesEmptyState } from "./components/favorites-empty-state";
import { FavoritesStats } from "./components/favorites-stats";

export default function FavoritesScreen() {
  const { data: pools } = usePoolFindAllSuspense();
  const ids = useFavoriteIds();
  const router = useRouter();

  const favPools = useMemo(
    () =>
      pools.filter((p) => ids.has(p.id)).sort((a, b) => b.apy - a.apy),
    [pools, ids],
  );

  const stats = useMemo(() => {
    if (favPools.length === 0) return null;

    const best = Math.max(...favPools.map((p) => p.apy));
    const avg = favPools.reduce((s, p) => s + p.apy, 0) / favPools.length;

    return { count: favPools.length, bestApy: best, avgApy: avg };
  }, [favPools]);

  const handlePoolPress = useCallback(
    (pool: Pool) => {
      router.push({
        pathname: "/pool-details",
        params: {
          id: pool.id,
          chain: pool.chain,
          project: pool.project,
          symbol: pool.symbol,
          apy: String(pool.apy),
        },
      });
    },
    [router],
  );

  return (
    <View className="flex-1 bg-background">
      <Header />

      <View className="flex-1">
        <FlashList
          data={favPools}
          renderItem={({ item }) => (
            <View className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
              <PoolListItem pool={item} onPress={handlePoolPress} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View className="mx-auto w-full max-w-7xl px-4 pb-4 pt-6 md:px-6 lg:px-8">
              <View className="mb-5">
                <Text className="text-3xl font-bold text-foreground">
                  Favorites
                </Text>

                <Text className="mt-1 text-sm text-muted-foreground">
                  Your saved pools, sorted by best APY
                </Text>
              </View>

              {stats && (
                <FavoritesStats
                  count={stats.count}
                  bestApy={stats.bestApy}
                  avgApy={stats.avgApy}
                />
              )}
            </View>
          }
          ListEmptyComponent={
            <View className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
              <FavoritesEmptyState />
            </View>
          }
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test --testPathPatterns favorites-screen.integration`
Expected: PASS — 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/screens/favorites/index.tsx src/screens/favorites/__tests__/
git commit -m "feat(favorites): add favorites screen with stats and empty state"
```

---

### Task 14: Add `/favorites` route

**Files:**
- Create: `src/app/favorites.tsx`

- [ ] **Step 1: Create the route file**

Create `src/app/favorites.tsx`:

```typescript
import { ScreenWrapper } from "@/components/screen-wrapper";
import FavoritesScreen from "@/screens/favorites";

export default function FavoritesRoute() {
  return (
    <ScreenWrapper>
      <FavoritesScreen />
    </ScreenWrapper>
  );
}
```

- [ ] **Step 2: Run lint and types to verify no breakage**

Run: `bun run types && bun run lint`
Expected: green.

- [ ] **Step 3: Commit**

```bash
git add src/app/favorites.tsx
git commit -m "feat(favorites): add /favorites route"
```

---

### Task 15: Wire `<BottomTabBar />` into root layout

**Files:**
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Modify root layout to render BottomTabBar conditionally**

Replace `src/app/_layout.tsx`:

```typescript
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { useDeviceLayout } from "@/hooks/use-device-layout";
import { HttpRepositories } from "@/infra/repositories/http-repository";
import { RepositoryProvider } from "@/infra/repositories/repository-provider";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ErrorBoundaryProps, Stack } from "expo-router";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../global.css";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="mb-4 text-center text-lg text-destructive">
        {error.message || "Something went wrong"}
      </Text>

      <Button onPress={retry}>
        <Text>Try Again</Text>
      </Button>
    </View>
  );
}

const queryClient = new QueryClient();

function MobileBottomTabs() {
  const { isMobile } = useDeviceLayout();
  if (!isMobile) return null;
  return <BottomTabBar />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider value={HttpRepositories}>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />

            <MobileBottomTabs />
          </View>

          <PortalHost />
        </RepositoryProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 2: Run lint and types**

Run: `bun run types && bun run lint`
Expected: green.

- [ ] **Step 3: Run all tests to verify nothing regressed**

Run: `bun run test`
Expected: all tests pass (existing + new).

- [ ] **Step 4: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat(favorites): render bottom tab bar on mobile in root layout"
```

---

### Task 16: Show `<FavoritesBanner />` on Home when count > 0

**Files:**
- Modify: `src/screens/home/index.tsx`
- Modify: `src/screens/home/__tests__/home.integration.test.tsx`

- [ ] **Step 1: Append failing test to home integration test**

Open `src/screens/home/__tests__/home.integration.test.tsx`. At the top with the other mocks, add (if missing):

```typescript
import { useFavoritesStore } from "@/infra/state/favorites-store";

jest.mock("lucide-react-native", () => {
  const { Text } = require("react-native");
  return {
    Star: () => <Text testID="star-icon">star</Text>,
    Home: () => null,
    ArrowLeft: () => null,
  };
});
```

Inside the existing `describe("HomeScreen Integration", ...)`, add:

```typescript
it("does not render the favorites banner when no favorites", async () => {
  act(() => {
    useFavoritesStore.setState({ ids: new Set() });
  });

  const { Wrapper } = createTestSetup();
  render(<HomeScreen />, { wrapper: Wrapper });

  await waitFor(() => {
    expect(screen.getByText("Aave")).toBeTruthy();
  });

  expect(screen.queryByText(/pools? favorited/)).toBeNull();
});

it("renders the favorites banner when count > 0", async () => {
  act(() => {
    useFavoritesStore.setState({ ids: new Set(["1", "2"]) });
  });

  const { Wrapper } = createTestSetup();
  render(<HomeScreen />, { wrapper: Wrapper });

  await waitFor(() => {
    expect(screen.getByText("2 pools favorited")).toBeTruthy();
  });
});

it("navigates to /favorites when banner link is tapped", async () => {
  const pushMock = jest.fn();

  // Override the existing mock for this test
  const expoRouter = jest.requireMock("expo-router") as {
    useRouter: jest.Mock;
  };
  expoRouter.useRouter.mockReturnValueOnce({ push: pushMock });

  act(() => {
    useFavoritesStore.setState({ ids: new Set(["1"]) });
  });

  const { Wrapper } = createTestSetup();
  render(<HomeScreen />, { wrapper: Wrapper });

  await waitFor(() => {
    expect(screen.getByLabelText("View favorites")).toBeTruthy();
  });

  fireEvent.press(screen.getByLabelText("View favorites"));

  expect(pushMock).toHaveBeenCalledWith("/favorites");
});
```

Make sure `act`, `fireEvent` are imported from `@testing-library/react-native` at the top.

- [ ] **Step 2: Run tests to verify failure**

Run: `bun run test --testPathPatterns home.integration`
Expected: FAILS — banner is not yet rendered.

- [ ] **Step 3: Modify Home screen to render banner**

In `src/screens/home/index.tsx`:

1. Add imports near the top:

```typescript
import { FavoritesBanner } from "@/components/favorites-banner";
import {
  useFavoriteIds,
  useFavoritesCount,
} from "@/domain/favorites/use-cases/use-favorites";
```

2. Inside `Home()` component, before the existing `useFilteredPools` line, add:

```typescript
const favoritesCount = useFavoritesCount();
```

3. In the `listHeader` `useMemo`, add `<FavoritesBanner />` between the `<HomeHeader />` line and the `Filter buttons` View. The new chunk:

```tsx
<HomeHeader />

<FavoritesBanner
  count={favoritesCount}
  onPress={() => router.push("/favorites")}
/>

{/* Filter buttons */}
<View className="mb-2 flex-row flex-wrap gap-2">
```

4. Add `favoritesCount`, `router` to the dependency array of `listHeader`'s `useMemo` (router is already declared via `useRouter()`).

5. The full updated `listHeader` deps array becomes:

```typescript
[
  isMobile,
  networkFilters,
  protocolFilters,
  filterOptions,
  toggleNetworkFilter,
  toggleProtocolFilter,
  hasActiveFilters,
  allActiveFilters,
  clearFilters,
  handleNetworkFilterPress,
  handleProtocolFilterPress,
  favoritesCount,
  router,
],
```

- [ ] **Step 4: Run tests to verify pass**

Run: `bun run test --testPathPatterns home.integration`
Expected: PASS — all existing + 3 new.

- [ ] **Step 5: Commit**

```bash
git add src/screens/home/
git commit -m "feat(favorites): show favorites banner on home when count > 0"
```

---

### Task 17: Final verification gates

**No new files. This task is pure verification.**

- [ ] **Step 1: Run TypeScript check**

Run: `bun run types`
Expected: no errors.

If errors: read each, fix, re-run until green. Common cause: missing import, mismatched type.

- [ ] **Step 2: Run ESLint**

Run: `bun run lint`
Expected: no errors, no warnings (besides pre-existing ones).

If errors: read each, fix in the offending file, re-run until green.

- [ ] **Step 3: Run the full test suite**

Run: `bun run test`
Expected: ALL tests green — both existing and the new ones added in Tasks 2–13, 16.

- [ ] **Step 4: Manual verification on web**

Run: `bun run web` (or `bun start` then choose w)
- Open the app at `http://localhost:8081`.
- Confirm Header shows logo + "Yieldly" + "All pools" + "Favorites" tabs (no badge yet).
- Tap a star icon on a pool row → star turns brand-green and a pop animation fires.
- Verify the badge appears next to the Favorites tab.
- Verify the green banner appears at the top of the Home screen with "1 pool favorited" and a "View favorites →" link.
- Tap "View favorites →" → routes to `/favorites`. Stats card row shows count=1, best=avg=that pool's APY.
- Tap a row in Favorites → routes to pool-details. The "Add to favorites" pill in the top right shows "Favorited" because the pool is already favorited.
- Tap "Favorited" in details → label flips to "Add to favorites"; back to favorites → empty state appears.
- Reload the page → favorites persist across the reload (toggle some, reload, verify).

- [ ] **Step 5: Manual verification on iOS simulator**

Run: `bun run ios`
- Confirm Header shows only logo + "Yieldly" (no tabs).
- Confirm a `<BottomTabBar />` is fixed at the bottom with Home (icon) and Favorites (star icon) tabs.
- Tap a star on a pool row → pop animation, badge on bottom tab.
- Tap the Favorites tab in the bottom bar → routes to favorites screen.
- Banner on home should also appear.
- Kill the app (close from app switcher), reopen → favorites preserved.

- [ ] **Step 6: Confirm completion**

Once everything above is green and verified, the feature is done. No commit on this task — verification only.

---

## Self-Review

**Spec coverage check:**
- Star toggle on pool rows → Tasks 5, 11
- Favorites tab in header (web) with count badge → Task 10
- Bottom tab bar (mobile) with count badge → Task 9, 15
- Banner on Home → Tasks 6, 16
- Favorites screen with stats + sorted list + empty state → Tasks 7, 8, 13
- Add to favorites pill on pool details → Tasks 5, 12
- Persistence across app restarts → Tasks 1–3 (MMKV + persist middleware)
- Pop animation → Task 5 (Reanimated `withSequence`)
- TDD with frequent commits → every task has the red-green-refactor flow + commit
- Cleanup of premature scaffolding → already reverted in the design phase (working tree clean before this plan begins)

**Placeholder scan:** None. Every step contains exact code or commands.

**Type/method consistency:**
- `useFavoritesStore` exports the store hook; `useIsFavorite`, `useFavoriteToggle`, `useFavoritesCount`, `useFavoriteIds` are the public selectors — used consistently in Tasks 5, 9, 10, 11, 13, 16.
- `FavoriteButton` accepts `{ poolId, variant?, size? }` — matches usages in Tasks 11, 12.
- `FavoritesBanner` accepts `{ count, onPress }` — matches usage in Task 16.
- `BottomTabBar` is parameterless — Task 15 wires it without props.
- `PoolDetailsHeader` extended with optional `poolId` — back-compat preserved.

The plan is internally consistent and complete.
