# Feature Specification: Home Screen - Stablecoin Yield Comparison

**Feature Branch**: `001-home-screen`
**Created**: 2026-01-24
**Status**: Draft
**Input**: User description: "Build the home screen of the app. The home screen should show a list of stablecoins sorted by the biggest APY. The list should have two filters (network and protocol). When the user touch one item of the list, he should be navigated to the details of that stablecoin. Each item of the list should have the stablecoin symbol, name, protocol, network, and the APY. Check the images for references from the home screen on desktop, tablet and phone."

## Clarifications

### Session 2026-01-24

- Q: How should the multi-select filter interface work? → A: Filter is a modal/bottom sheet with checkboxes and "Apply" or "Done" button to commit selections
- Q: How should users refresh stablecoin yield data? → A: Pull-to-refresh gesture on the list with visual feedback (standard mobile pattern)
- Q: What uniquely identifies a stablecoin opportunity in the list? → A: The combination of symbol + protocol + network (e.g., USDT on Aave on Optimism is different from USDT on Compound on Optimism)
- Q: Should the filter modal include a way to clear selections before applying? → A: Include a "Clear All" or "Reset" action within the filter modal to deselect all checkboxes
- Q: How should the list handle large numbers of stablecoins? → A: Display all items in a scrollable list with efficient rendering (virtualized list for performance)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Top Stablecoin Yields (Priority: P1)

A user opens the app to quickly see which stablecoins offer the highest APY across all available DeFi protocols and networks. The list is automatically sorted by APY from highest to lowest, allowing users to immediately identify the best opportunities.

**Why this priority**: This is the core value proposition of the app - helping users find the best yields. Without this, the app has no purpose. Users must be able to see yield data immediately upon opening the app.

**Independent Test**: Can be fully tested by launching the app and verifying that stablecoins are displayed in descending APY order. Delivers immediate value by showing comparative yield data.

**Acceptance Scenarios**:

1. **Given** the app is opened for the first time, **When** the home screen loads, **Then** a list of stablecoins sorted by highest APY is displayed
2. **Given** stablecoin data is available, **When** viewing the list, **Then** each item shows symbol, full name, protocol name, network name, and APY percentage
3. **Given** multiple stablecoins exist, **When** comparing list items, **Then** items are ordered from highest to lowest APY
4. **Given** the list is displayed, **When** viewing APY values, **Then** percentages are formatted with two decimal places and labeled as "Best APY"
5. **Given** the list is displayed, **When** the user performs a pull-to-refresh gesture, **Then** a loading indicator appears and the stablecoin data is refreshed with the latest APY values

---

### User Story 2 - Filter by Network (Priority: P2)

A user only wants to see stablecoin opportunities on specific blockchain networks (e.g., Ethereum, Polygon, Optimism) that they currently use or prefer. They can filter the list to show only stablecoins available on their selected network(s).

**Why this priority**: Important for user experience and relevance. Users often have network preferences based on their existing holdings, gas fees, or technical constraints. This prevents information overload and improves decision-making efficiency.

**Independent Test**: Can be fully tested by selecting network filters and verifying the list updates to show only matching stablecoins. Delivers value by personalizing the results to user needs.

**Acceptance Scenarios**:

1. **Given** the home screen is displayed, **When** a user taps the "Network" filter button, **Then** a modal or bottom sheet appears with checkboxes showing all available networks and a "Clear All" or "Reset" action
2. **Given** the network filter modal is opened, **When** the user selects one or more network checkboxes and taps "Apply" or "Done", **Then** the modal closes and the list updates to show only stablecoins available on the selected network(s)
3. **Given** the network filter modal has one or more checkboxes selected, **When** the user taps "Clear All" or "Reset", **Then** all checkboxes are deselected within the modal
4. **Given** network filters are active, **When** viewing the list, **Then** all displayed items match the selected network criteria and remain sorted by APY
5. **Given** network filters are active, **When** the user clears the filter, **Then** the full list of stablecoins is restored, still sorted by APY
6. **Given** a network filter is applied, **When** no stablecoins match the criteria, **Then** an empty state message is displayed
7. **Given** the network filter modal is opened with existing selections, **When** the user dismisses the modal without tapping "Apply" or "Done", **Then** the previous filter selections remain unchanged

---

### User Story 3 - Filter by Protocol (Priority: P2)

A user wants to see opportunities only from specific DeFi protocols (e.g., Aave, Spark, Compound) that they trust or are familiar with. They can filter the list to show only stablecoins from their selected protocol(s).

**Why this priority**: Important for risk management and user trust. Users often have strong preferences for specific protocols based on security audits, reputation, or past experience. This helps users stay within their comfort zone.

**Independent Test**: Can be fully tested by selecting protocol filters and verifying the list updates to show only matching stablecoins. Delivers value by reducing perceived risk and focusing on trusted options.

**Acceptance Scenarios**:

1. **Given** the home screen is displayed, **When** a user taps the "Protocol" filter button, **Then** a modal or bottom sheet appears with checkboxes showing all available protocols and a "Clear All" or "Reset" action
2. **Given** the protocol filter modal is opened, **When** the user selects one or more protocol checkboxes and taps "Apply" or "Done", **Then** the modal closes and the list updates to show only stablecoins available on the selected protocol(s)
3. **Given** the protocol filter modal has one or more checkboxes selected, **When** the user taps "Clear All" or "Reset", **Then** all checkboxes are deselected within the modal
4. **Given** protocol filters are active, **When** viewing the list, **Then** all displayed items match the selected protocol criteria and remain sorted by APY
5. **Given** protocol filters are active, **When** the user clears the filter, **Then** the full list of stablecoins is restored, still sorted by APY
6. **Given** a protocol filter is applied, **When** no stablecoins match the criteria, **Then** an empty state message is displayed
7. **Given** the protocol filter modal is opened with existing selections, **When** the user dismisses the modal without tapping "Apply" or "Done", **Then** the previous filter selections remain unchanged

---

### User Story 4 - Combine Multiple Filters (Priority: P3)

A user wants to see stablecoin opportunities that match both specific networks AND specific protocols simultaneously (e.g., only show Aave opportunities on Polygon). They can apply both network and protocol filters together, with results showing only items that satisfy both criteria.

**Why this priority**: Nice-to-have enhancement for power users. Most users will use filters individually, but combining them provides advanced targeting for sophisticated users with specific requirements.

**Independent Test**: Can be fully tested by applying both network and protocol filters and verifying only items matching both criteria are shown. Delivers value by enabling precise opportunity discovery.

**Acceptance Scenarios**:

1. **Given** the home screen is displayed, **When** a user selects both network and protocol filters, **Then** the list shows only stablecoins that match both criteria simultaneously
2. **Given** both filters are active, **When** viewing the list, **Then** results remain sorted by highest APY among the filtered subset
3. **Given** combined filters result in no matches, **When** viewing the list, **Then** an empty state message is displayed
4. **Given** both filters are active, **When** the user clears one filter type, **Then** the list updates to show all items matching the remaining active filter

---

### Edge Cases

- What happens when the API fails to load stablecoin data?
  - Display error state with retry option
  - Preserve any previously loaded data if available (stale data better than no data)

- What happens when there are no stablecoins available (empty data set)?
  - Display empty state message explaining no opportunities are currently available

- What happens when filters eliminate all results?
  - Display empty state message indicating no stablecoins match the selected criteria
  - Provide quick action to clear filters

- What happens when APY values are identical for multiple stablecoins?
  - Secondary sort by stablecoin symbol alphabetically

- What happens when network or protocol names are very long?
  - Truncate with ellipsis while ensuring key information remains visible

- What happens when the user has slow or unstable internet connection?
  - Show loading state with spinner
  - Implement reasonable timeout (10 seconds) before showing error
  - Allow retry without restarting the app

- What happens when new data arrives while filters are active?
  - Maintain current filter state and apply to new data
  - Keep user's scroll position if possible

- What happens when the user rotates their device (orientation change)?
  - Preserve filter state and scroll position
  - Adapt layout responsively (as shown in desktop/tablet/phone references)

- What happens when pull-to-refresh fails due to network error?
  - Show error message but preserve existing data in the list
  - User can attempt pull-to-refresh again

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of stablecoins sorted by APY in descending order (highest first)
- **FR-002**: System MUST display all available stablecoin opportunities in a single scrollable list without pagination
- **FR-003**: System MUST use efficient rendering techniques (e.g., virtualization) to maintain smooth scrolling performance with large data volumes
- **FR-004**: System MUST treat each combination of symbol + protocol + network as a unique entry in the list (e.g., USDT on Aave on Optimism is a separate entry from USDT on Compound on Optimism)
- **FR-005**: System MUST show the following information for each stablecoin in the list: symbol (e.g., "USDT"), full name (e.g., "Tether"), protocol name (e.g., "Aave"), network name (e.g., "Optimism"), and APY percentage
- **FR-006**: System MUST format APY values as percentages with exactly two decimal places
- **FR-007**: System MUST label APY values with "Best APY" text
- **FR-008**: System MUST provide a "Network" filter button that opens a modal or bottom sheet for network selection
- **FR-009**: System MUST provide a "Protocol" filter button that opens a modal or bottom sheet for protocol selection
- **FR-010**: System MUST display network options as checkboxes within the filter modal allowing multiple selections
- **FR-011**: System MUST display protocol options as checkboxes within the filter modal allowing multiple selections
- **FR-012**: System MUST provide an "Apply" or "Done" button in filter modals that commits the selected filters and closes the modal
- **FR-013**: System MUST preserve existing filter selections if the user dismisses the filter modal without tapping "Apply" or "Done"
- **FR-014**: System MUST provide a "Clear All" or "Reset" action within each filter modal that deselects all checkboxes
- **FR-015**: System MUST keep the filter modal open when the user taps "Clear All" or "Reset" (does not auto-apply or close)
- **FR-016**: System MUST apply both network and protocol filters simultaneously when both are active
- **FR-017**: System MUST maintain APY-based sorting (highest first) even when filters are applied
- **FR-018**: System MUST display an empty state message when no stablecoins match the current filter criteria
- **FR-019**: System MUST display an error state with retry option when data loading fails
- **FR-020**: System MUST display a loading state while fetching stablecoin data
- **FR-021**: System MUST support pull-to-refresh gesture on the stablecoin list to manually trigger data refresh
- **FR-022**: System MUST display a visual loading indicator during pull-to-refresh and update the list with refreshed data when complete
- **FR-023**: System MUST maintain active filter selections when performing pull-to-refresh (refresh applies to filtered data)
- **FR-024**: System MUST provide visual indication (e.g., icon, badge) when filters are active
- **FR-025**: System MUST allow users to clear active filters to restore the full unfiltered list
- **FR-026**: System MUST display stablecoin icons/logos in each list item
- **FR-027**: System MUST adapt layout responsively across phone, tablet, and desktop screen sizes as shown in reference designs
- **FR-028**: System MUST use a card-based layout for list items with clear visual separation
- **FR-029**: System MUST show a prominent heading "Find the Best Stablecoin Yields" on the home screen
- **FR-030**: System MUST show a descriptive subtitle "Compare lending rates across DeFi protocols and maximize your returns"
- **FR-031**: System MUST apply secondary alphabetical sorting by symbol when multiple stablecoins have identical APY values

### Key Entities

- **Stablecoin**: Represents a stablecoin yield opportunity with attributes: symbol (short identifier like "USDT"), name (full name like "Tether"), protocol (DeFi protocol name like "Aave"), network (blockchain network like "Optimism"), APY (annual percentage yield as decimal number), and icon/logo (visual identifier). Each entry is uniquely identified by the combination of symbol + protocol + network, meaning the same stablecoin can appear multiple times in the list if it's available across different protocols or networks with different APY rates.

- **Network**: Represents a blockchain network with attributes: name (e.g., "Ethereum", "Polygon", "Optimism"), identifier (unique ID), and display order

- **Protocol**: Represents a DeFi protocol with attributes: name (e.g., "Aave", "Compound", "Spark"), identifier (unique ID), and display order

- **Filter State**: Represents the current user filter selections with attributes: selected networks (array of network identifiers), selected protocols (array of protocol identifiers), and active status (boolean indicating if any filters are applied)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view the complete list of stablecoins sorted by APY within 3 seconds of opening the app on a standard mobile connection
- **SC-002**: Users can apply network or protocol filters and see updated results within 500 milliseconds
- **SC-003**: The home screen displays correctly and remains functional across phone (320px-428px width), tablet (768px-1024px width), and desktop (1024px+ width) screen sizes
- **SC-004**: 95% of users can identify the highest APY stablecoin within 5 seconds of viewing the home screen
- **SC-005**: Users can successfully apply and clear filters with zero failed interactions
- **SC-006**: The app handles no-network scenarios gracefully, displaying appropriate error messages to 100% of users experiencing connection issues
- **SC-007**: Empty states and error states are displayed correctly in 100% of applicable scenarios
- **SC-008**: All stablecoin data (symbol, name, protocol, network, APY) is displayed accurately with zero data omissions per list item

## Assumptions

1. **Data Source**: Stablecoin yield data is provided by a backend API or data service (implementation details out of scope for this specification)
2. **Real-time Updates**: APY data is relatively static and does not require real-time updates (polling or refresh strategy is an implementation detail)
3. **Authentication**: No authentication is required to view the home screen - it is publicly accessible
4. **Network Icons**: Icon/logo assets for networks and protocols are available from the backend or are bundled with the app
5. **Filter Persistence**: Filter selections are session-based and do not persist between app restarts (persistent filters would be a future enhancement)
6. **Accessibility**: Standard mobile accessibility features (screen readers, dynamic text sizing) are supported following platform guidelines
7. **Language**: Initial version supports English only (internationalization is a future consideration)
8. **Data Freshness**: Users accept that APY data may be slightly delayed (exact refresh rate is an implementation detail)
9. **Network Types**: The set of available networks and protocols is determined by the data source and may change over time

## Dependencies

- **Backend API**: Requires a functional API endpoint that provides stablecoin yield data including symbol, name, protocol, network, and APY
- **Design Assets**: Requires stablecoin, network, and protocol logo/icon assets

## Out of Scope

- **Detail Screen Navigation**: Tapping on list items to view detailed stablecoin information (will be added in a future feature)
- **User Accounts**: User registration, authentication, and personalized settings
- **Favorites/Watchlists**: Ability to save or bookmark specific stablecoins
- **Historical Data**: Viewing historical APY trends or charts
- **Notifications**: Push notifications or alerts for APY changes
- **Search Functionality**: Text-based search for specific stablecoins
- **Sorting Options**: Alternative sorting methods (by name, protocol, etc.)
- **Detailed Protocol Information**: In-depth protocol descriptions, risk ratings, or audit reports
- **Transaction Features**: Ability to invest or interact with protocols directly from the app
- **Comparison Tools**: Side-by-side comparison of multiple stablecoins
- **Advanced Filtering**: Range filters for APY, date-based filters, or complex boolean logic
- **Data Export**: Downloading or sharing yield data
- **Offline Mode**: Full functionality without internet connection (basic error handling is in scope)
