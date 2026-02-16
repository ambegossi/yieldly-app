import { Pool } from "@/domain/pool/pool";
import { useCallback, useMemo, useState } from "react";

const DEFAULT_ITEMS_PER_PAGE = 24;

export function useInfiniteScroll(
  items: Pool[],
  itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE,
) {
  const [currentPage, setCurrentPage] = useState(1);

  const displayedItems = useMemo(() => {
    return items.slice(0, currentPage * itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const hasMore = displayedItems.length < items.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setCurrentPage((prev) => prev + 1);
  }, [hasMore]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    displayedItems,
    currentPage,
    hasMore,
    isLoadingMore: false,
    loadMore,
    reset,
  };
}
