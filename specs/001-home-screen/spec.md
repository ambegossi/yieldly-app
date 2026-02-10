# Feature Specification: Home Screen

**Feature Branch**: `001-home-screen`
**Created**: 2026-02-03
**Status**: Draft
**Input**: User description: "Build the home screen of the app. The home screen should have a title and a subtitle, and show to the user a list of stablecoins sorted by the biggest APY. The list should have two filters (network and protocol). Each item of the list should have the stablecoin symbol, protocol, network, and the APY. Check the images for references from the home screen on desktop, tablet and phone. Build the app header too, with the Yieldly logo and name."

## Clarifications

### Session 2026-02-03

- Q: Data Source for Stablecoin Yields → A: Use existing backend API endpoint that provides aggregated yield data
- Q: Filter Selection UI Pattern → A: Dropdown menu for desktop and tablet, bottom sheet for phone
- Q: Data Refresh Strategy → A: Auto-refresh on app foreground with cached data shown immediately
- Q: Offline Behavior → A: Show cached data with offline indicator
- Q: Maximum List Size → A: Paginated with 24 items per page

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Best Stablecoin Yields (Priority: P1)

Users can see a ranked list of stablecoin yield opportunities across DeFi protocols to identify the best returns for their investment.

**Why this priority**: This is the core value proposition of the app - helping users find the highest APY for stablecoins. Without this, the app has no purpose.

**Independent Test**: Can be fully tested by launching the app and verifying that a list of stablecoins appears sorted by APY (highest first), with each item showing symbol, protocol, network, and APY percentage.

**Acceptance Scenarios**:

1. **Given** the user opens the app, **When** the home screen loads, **Then** they see a title "Find the Best Stablecoin Yields" and subtitle "Compare lending rates across DeFi protocols and maximize your returns"
2. **Given** the home screen has loaded, **When** the user views the stablecoin list, **Then** they see the first 24 items sorted by APY from highest to lowest
3. **Given** the user views a stablecoin item, **When** they look at the item details, **Then** they see the stablecoin symbol (e.g., USDT), protocol name (e.g., Aave), network name (e.g., Optimism), and APY percentage (e.g., 5.67%)
4. **Given** multiple stablecoins have yields, **When** the list displays, **Then** each item shows a visual indicator (icon/badge) for the stablecoin symbol
5. **Given** the user views the highest APY, **When** they look at the percentage, **Then** it is displayed prominently in green with "Best APY" label positioned below the percentage value
6. **Given** the user scrolls to the bottom of the first page, **When** more results are available, **Then** the next 24 items load automatically

---

### User Story 2 - Filter by Network (Priority: P2)

Users can filter the stablecoin list by blockchain network to focus on opportunities available on their preferred network.

**Why this priority**: Users may have assets on specific networks or prefer certain networks for gas fees and ecosystem familiarity. This helps them find relevant opportunities faster.

**Independent Test**: Can be fully tested by tapping the "Network" filter button and selecting a network (e.g., "Optimism"), then verifying that only stablecoins on that network appear in the list.

**Acceptance Scenarios**:

1. **Given** the user is on the home screen, **When** they tap the "Network" filter button, **Then** a list of available networks appears in a bottom sheet (phone) or dropdown menu (tablet/desktop)
2. **Given** the network filter is open, **When** the user selects a specific network, **Then** the list updates to show only stablecoins available on that network
3. **Given** a network filter is active, **When** the user views the list, **Then** all items display the selected network
4. **Given** a network filter is active, **When** the user taps the filter button again, **Then** they can clear the filter to see all networks
5. **Given** no stablecoins exist for a selected network, **When** the filter is applied, **Then** the user sees an appropriate message indicating no results

---

### User Story 3 - Filter by Protocol (Priority: P2)

Users can filter the stablecoin list by DeFi protocol to compare yields within a specific platform or focus on protocols they trust.

**Why this priority**: Users may have existing relationships with specific protocols or want to diversify/concentrate their holdings. This enables protocol-specific research and comparison.

**Independent Test**: Can be fully tested by tapping the "Protocol" filter button and selecting a protocol (e.g., "Aave"), then verifying that only stablecoins on that protocol appear in the list.

**Acceptance Scenarios**:

1. **Given** the user is on the home screen, **When** they tap the "Protocol" filter button, **Then** a list of available protocols appears in a bottom sheet (phone) or dropdown menu (tablet/desktop)
2. **Given** the protocol filter is open, **When** the user selects a specific protocol, **Then** the list updates to show only stablecoins available on that protocol
3. **Given** a protocol filter is active, **When** the user views the list, **Then** all items display the selected protocol
4. **Given** a protocol filter is active, **When** the user taps the filter button again, **Then** they can clear the filter to see all protocols
5. **Given** no stablecoins exist for a selected protocol, **When** the filter is applied, **Then** the user sees an appropriate message indicating no results

---

### User Story 4 - View App Branding (Priority: P1)

Users see consistent Yieldly branding in the app header to build trust and recognize the platform.

**Why this priority**: Branding establishes identity and trust. As part of the initial screen users see, it's critical for user confidence and professional appearance.

**Independent Test**: Can be fully tested by opening the app and verifying that the header displays the Yieldly logo (green circle with "Y") and "Yieldly" name.

**Acceptance Scenarios**:

1. **Given** the user opens the app, **When** the home screen loads, **Then** they see a header at the top with the Yieldly logo and name
2. **Given** the user views the header, **When** they look at the logo, **Then** it displays as a green circular icon with a white "Y" letter
3. **Given** the user views the header, **When** they look at the app name, **Then** it displays "Yieldly" in the app's brand font next to the logo

---

### User Story 5 - Combine Multiple Filters (Priority: P3)

Users can apply both network and protocol filters simultaneously to narrow down to specific yield opportunities.

**Why this priority**: Power users may want to find yields for a specific combination (e.g., "Aave on Optimism"). This is a nice-to-have enhancement but not critical for MVP.

**Independent Test**: Can be fully tested by selecting both a network filter (e.g., "Polygon") and protocol filter (e.g., "Aave"), then verifying that only items matching both criteria appear.

**Acceptance Scenarios**:

1. **Given** the user has selected a network filter, **When** they also select a protocol filter, **Then** the list shows only stablecoins that match both the network AND protocol
2. **Given** multiple filters are active, **When** the user views the filter buttons, **Then** both buttons show an active/selected state
3. **Given** multiple filters are active, **When** no results match both criteria, **Then** the user sees a message indicating no matching results
4. **Given** multiple filters are active, **When** the user clears one filter, **Then** the list updates to show results matching the remaining filter

---

### Edge Cases

- What happens when the API fails to load stablecoin data?
  - User should see an error message with option to retry
  - App should not crash or show blank screen

- What happens when a stablecoin has 0% APY?
  - Item should still display with "0.00%" shown clearly
  - Should not be hidden from the list

- What happens when filter results return zero items?
  - User sees "No stablecoins found for selected filters" message
  - Filters remain active so user can adjust them

- What happens when APY values are extremely long (e.g., 123.456789%)?
  - APY should be formatted to 2 decimal places maximum

- What happens when APY values are negative?
  - Negative APY should be displayed as red text with minus sign (e.g., "-2.50%")
  - Item should still appear in the list, sorted by actual value
  - No special warning needed (market reality)

- What happens when network/protocol names are very long?
  - Text should truncate with ellipsis if needed to prevent layout breaking

- What happens on slow network connections?
  - Show loading indicator while data is being fetched
  - List items should not flicker or jump during loading

- What happens when user taps on a stablecoin item?
  - User should see visual feedback (e.g., highlight/press state) when tapping an item
  - Item shows a toast message "Details coming soon" (detail screen is out of scope for this feature)
  - Navigation to detail screen will be implemented in a future feature

- What happens when cached data is displayed but fresh data fails to load?
  - Cached data remains visible
  - User sees a subtle error indicator (e.g., banner or toast)
  - Retry option is available without disrupting the cached view

- What happens when device goes offline while user is viewing the list?
  - Cached data remains visible
  - Offline indicator appears immediately
  - Filters continue to work with cached data
  - Refresh actions are disabled until connection is restored

- What happens when user opens the app for the first time while offline?
  - User sees "No internet connection" message with clear explanation
  - User is prompted to connect to internet to load initial data
  - No functionality is available until connection is established

- What happens when user scrolls to the end of a page?
  - System automatically loads the next page (infinite scroll pattern)
  - Loading indicator appears at the bottom of the list
  - New items are appended smoothly without disrupting scroll position

- What happens when pagination fails to load the next page?
  - Current page remains visible
  - Error message appears with retry option
  - User can continue viewing current results and retry loading more

- What happens when filters are changed while viewing page 2 or later?
  - List resets to page 1 with new filter criteria
  - Previous pagination state is cleared
  - Fresh results matching new filters are loaded

## Requirements *(mandatory)*

### Functional Requirements

#### Header
- **FR-001**: App MUST display a header component at the top of the screen containing the Yieldly logo and name
- **FR-002**: Logo MUST be a green circular icon with white "Y" letter
- **FR-003**: App name "Yieldly" MUST appear next to the logo in brand typography

#### Content Area
- **FR-004**: Home screen MUST display the title "Find the Best Stablecoin Yields"
- **FR-005**: Home screen MUST display the subtitle "Compare lending rates across DeFi protocols and maximize your returns"
- **FR-006**: Title and subtitle MUST be positioned above the filters and list

#### Filters
- **FR-007**: Home screen MUST provide a "Network" filter button
- **FR-008**: Home screen MUST provide a "Protocol" filter button
- **FR-009**: Filter buttons MUST display a filter icon alongside the label
- **FR-010**: When a filter button is tapped, it MUST open a selection interface showing available options
- **FR-011**: On phone screens, filter selection MUST use a bottom sheet UI pattern
- **FR-012**: On tablet and desktop screens, filter selection MUST use a dropdown menu UI pattern
- **FR-013**: Network filter MUST show all unique networks present in the stablecoin data
- **FR-014**: Protocol filter MUST show all unique protocols present in the stablecoin data
- **FR-015**: Users MUST be able to select one network at a time from the Network filter
- **FR-016**: Users MUST be able to select one protocol at a time from the Protocol filter
- **FR-017**: Users MUST be able to clear an active filter to return to unfiltered view
- **FR-018**: Active filters MUST show a visual indication that they are applied
- **FR-019**: Multiple filters (network + protocol) MUST work together with AND logic

#### Stablecoin List
- **FR-020**: Home screen MUST display a list of stablecoin yield opportunities
- **FR-021**: List MUST be sorted by APY in descending order (highest APY first)
- **FR-022**: Each list item MUST display the stablecoin symbol (e.g., USDT, USDC, DAI)
- **FR-023**: Each list item MUST display the protocol name (e.g., Aave, Spark)
- **FR-024**: Each list item MUST display the network name (e.g., Optimism, Polygon, Ethereum)
- **FR-025**: Each list item MUST display the APY as a percentage with 2 decimal places
- **FR-026**: Each list item MUST show a visual icon or badge representing the stablecoin
- **FR-027**: APY percentage MUST be displayed prominently, larger than other text
- **FR-028**: APY MUST be displayed in green color to indicate positive yield
- **FR-029**: APY MUST show "Best APY" label positioned below the percentage value for clarity
- **FR-030**: When filters are applied, list MUST update to show only matching items
- **FR-031**: When no items match the filters, system MUST display a "No results" message
- **FR-032**: Each list item MUST be tappable/clickable
- **FR-033**: When a list item is tapped, system MUST show visual press feedback and display a "Details coming soon" toast message (detail screen navigation will be implemented in a future feature)
- **FR-034**: List MUST be paginated with 24 items displayed per page
- **FR-035**: System MUST provide a way to load the next page of results
- **FR-036**: System MUST show a loading indicator while loading additional pages
- **FR-037**: When user reaches the last page, system MUST indicate no more results are available
- **FR-038**: Pagination state MUST reset when filters are changed

**Note**: The detail screen is out of scope for this feature and will be specified separately.

#### Data & State
- **FR-039**: System MUST fetch stablecoin yield data from the backend API endpoint that provides aggregated yield data
- **FR-040**: System MUST cache fetched stablecoin data locally
- **FR-041**: On app launch, system MUST display cached data immediately (if available) while fetching fresh data in the background
- **FR-042**: When app returns to foreground, system MUST automatically fetch fresh data and update the displayed list
- **FR-043**: System MUST show a full-screen loading indicator with Suspense boundary during initial data fetch (when no cached data exists)
- **FR-044**: System MUST show a subtle pull-to-refresh indicator or top-of-screen spinner during background refresh (when cached data is already displayed and visible)
- **FR-045**: System MUST handle data fetching errors gracefully with user-friendly error messages
- **FR-046**: System MUST allow user to retry data fetching if it fails
- **FR-047**: Stablecoin data MUST include: symbol, protocol, network, and APY for each item
- **FR-048**: When device is offline, system MUST display cached data (if available)
- **FR-049**: When device is offline, system MUST show a persistent banner at the top of the screen with text "Offline - showing cached data" and an offline icon
- **FR-050**: When device is offline, system MUST disable refresh functionality until connection is restored
- **FR-051**: When device is offline and no cached data exists, system MUST show an appropriate message indicating offline state

#### Integration & External Dependencies
- **FR-052**: System MUST integrate with backend API endpoint for stablecoin yield data
- **FR-053**: API response MUST support pagination with page size parameter and page number
- **FR-054**: API response MUST provide a list of yield opportunities with at minimum: stablecoin symbol, protocol name, network name, and APY value
- **FR-055**: API response MUST include total count of available items and current page information
- **FR-056**: System MUST handle API response delays gracefully with loading states
- **FR-057**: System MUST handle API failures (network errors, 5xx errors, timeouts) with retry capability

#### Layout & Responsiveness
- **FR-058**: Layout MUST adapt to phone, tablet, and desktop screen sizes
- **FR-059**: On phone screens, list items MUST stack vertically in a single column
- **FR-060**: On tablet and desktop screens, list items MUST remain in single column but with appropriate width constraints
- **FR-061**: Header MUST remain visible at the top across all screen sizes
- **FR-062**: Filters MUST be positioned below the title/subtitle and above the list

### Key Entities

- **Stablecoin Yield**: Represents a yield opportunity for a specific stablecoin on a specific protocol and network
  - Attributes: symbol (e.g., "USDT"), protocol (e.g., "Aave"), network (e.g., "Optimism"), APY (e.g., 5.67)

- **Network**: Represents a blockchain network where stablecoins can be deposited
  - Attributes: name (e.g., "Ethereum", "Polygon", "Optimism", "Arbitrum")

- **Protocol**: Represents a DeFi protocol offering yield on stablecoins
  - Attributes: name (e.g., "Aave", "Spark", "Compound", "Yearn")

## Success Criteria *(mandatory)*

### User-Observable Outcomes

- **SC-001**: Highest APY pool is visible in viewport on initial render without scrolling
- **SC-002**: Filter updates apply immediately with no perceived delay (client-side filtering)
- **SC-003**: Filter updates apply immediately with no perceived delay (client-side filtering)
- **SC-004**: App displays data successfully on 95% of page loads (when API is available and returns 200 status)
- **SC-005**: List remains readable and usable on phone screens (width 320px - 428px), tablet screens (width 768px - 1024px), and desktop screens (width 1280px+)
- **SC-006**: Users can distinguish between different stablecoins at a glance through clear visual symbols
- **SC-007**: Loading indicator displays before any blank screen is visible to user
- **SC-008**: Error states provide clear next steps (retry button) for 100% of error scenarios

### Performance Targets

Technical benchmarks for validation (measured with profiling tools on iPhone 12 baseline device):

- **Time to Interactive**: < 3s on WiFi with cached data available
- **Filter Response Time**: < 100ms (client-side filtering, measured from state update to re-render)
- **Scrolling Performance**: Maintain 60 FPS during scroll with FlashList virtualization
- **Loading Indicator Render**: < 100ms from query initiation to Suspense fallback display
