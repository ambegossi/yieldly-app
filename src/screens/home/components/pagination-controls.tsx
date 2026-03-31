import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { useCallback, useMemo } from "react";
import { View } from "react-native";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handlePrev = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  return (
    <View
      className="flex-row items-center justify-center gap-1 py-4"
      accessibilityRole="none"
      accessibilityLabel="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onPress={handlePrev}
        disabled={currentPage <= 1}
        accessibilityLabel="Previous page"
      >
        <Text>←</Text>
      </Button>

      {visiblePages.map((page, index) =>
        page === "ellipsis" ? (
          <Text
            key={`ellipsis-${index}`}
            className="px-2 text-muted-foreground"
          >
            …
          </Text>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onPress={() => onPageChange(page)}
            accessibilityLabel={`Go to page ${page}`}
            accessibilityState={{ selected: page === currentPage }}
          >
            <Text>{String(page)}</Text>
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        onPress={handleNext}
        disabled={currentPage >= totalPages}
        accessibilityLabel="Next page"
      >
        <Text>→</Text>
      </Button>
    </View>
  );
}
