# Features Research: Pool Details Screen

## Table Stakes

| Feature | Complexity | Notes |
|---------|-----------|-------|
| Current APY display (large, prominent) | Low | Existing data from Pool entity |
| Project name and chain badge | Low | Existing data |
| Token symbol icon | Low | Reuse home screen component |
| Historical APY chart (30d) | Medium | Victory Native line chart, DefiLlama API |
| External link to pool platform | Low | Existing `url` field, opens in browser |
| Back navigation | Low | Expo Router stack navigation |
| Loading state | Low | Suspense/skeleton while chart loads |
| Error handling | Low | Error boundary for failed API calls |

## Differentiators (not in v1 scope)

| Feature | Complexity | Notes |
|---------|-----------|-------|
| Multiple time ranges (7d/30d/90d/1y) | Low-Med | Filter existing data, add tab selector |
| TVL display and chart | Medium | Data available in API response |
| APY breakdown (base vs reward) | Low | Data available in API response |
| Price predictions/trends | Low | Available in pools API |
| Impermanent loss indicator | Low | Available in API (`ilRisk` field) |
| Compare pools side-by-side | High | New screen, multiple data fetches |
| Favorite/bookmark | Medium | Local storage, new UI |
| Share pool link | Low | Share API |

## Anti-Features (do NOT build for v1)

| Feature | Reason |
|---------|--------|
| In-app trading/swapping | Way out of scope, requires wallet integration |
| Push notifications for APY changes | Backend infrastructure needed |
| User accounts/auth | Not needed for a yield aggregator |
| Token price charts | Different domain, confuses scope |

## Dependencies

- Chart depends on: APY history API integration, Victory Native setup
- Navigation depends on: Expo Router dynamic route setup
- External link depends on: existing `url` field (Linking API)
