import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { Header } from "@/components/header";
import { Pool } from "@/domain/pool/pool";
import { usePoolFindAllSuspense } from "@/domain/pool/use-cases/use-pool-find-all-suspense";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useEffect, useRef } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { EmptyState } from "./components/empty-state";
import {
  FilterBottomSheet,
  FilterBottomSheetRef,
} from "./components/filter-bottom-sheet";
import { FilterButton } from "./components/filter-button";
import { FilterDropdown } from "./components/filter-dropdown";
import { HomeHeader } from "./components/home-header";
import { PaginationControls } from "./components/pagination-controls";
import { PoolListItem } from "./components/pool-list-item";
import { useDeviceLayout } from "./hooks/use-device-layout";
import { useFilteredPools } from "./hooks/use-filtered-pools";
import { useInfiniteScroll } from "./hooks/use-infinite-scroll";
import { useNumberedPagination } from "./hooks/use-numbered-pagination";

export default function Home() {
  const { data: pools } = usePoolFindAllSuspense();
  const { isMobile } = useDeviceLayout();

  const {
    filteredPools,
    filterOptions,
    networkFilter,
    protocolFilter,
    setNetworkFilter,
    setProtocolFilter,
    clearFilters,
    hasActiveFilters,
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
  }, [networkFilter, protocolFilter, resetInfinite, goToPage]);

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

        {/* Filters */}
        <View className="mb-4 flex-row flex-wrap gap-2">
          {isMobile ? (
            <>
              <FilterButton
                label="Network"
                activeFilter={networkFilter}
                onPress={handleNetworkFilterPress}
              />

              <FilterButton
                label="Protocol"
                activeFilter={protocolFilter}
                onPress={handleProtocolFilterPress}
              />
            </>
          ) : (
            <>
              <FilterDropdown
                label="Network"
                options={filterOptions.networks}
                selectedValue={networkFilter}
                onSelect={setNetworkFilter}
              />

              <FilterDropdown
                label="Protocol"
                options={filterOptions.protocols}
                selectedValue={protocolFilter}
                onSelect={setProtocolFilter}
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
              <Text>Clear all</Text>
            </Button>
          )}
        </View>

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
            selectedValue={networkFilter}
            onSelect={setNetworkFilter}
            onClose={() => {}}
          />

          <FilterBottomSheet
            ref={protocolSheetRef}
            filterType="protocol"
            options={filterOptions.protocols}
            selectedValue={protocolFilter}
            onSelect={setProtocolFilter}
            onClose={() => {}}
          />
        </View>
      )}
    </View>
  );
}
