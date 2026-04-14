# Stack Research: Pool Details Screen

## Chart Library

**Victory Native v41+ (with @shopify/react-native-skia)**
- Confidence: HIGH
- Skia-based rendering for smooth 60fps line charts
- User-selected library
- Requires `@shopify/react-native-skia` as peer dependency
- Supports animated line paths, custom axis formatting

**Key packages:**
- `victory-native` — chart components
- `@shopify/react-native-skia` — rendering engine
- `react-native-reanimated` — already in project (animations)

## API: DefiLlama Yields

**Base URL:** `https://yields.llama.fi`

### GET /chart/{pool}
Returns historical APY data points (daily).

**Response shape:**
```json
{
  "status": "success",
  "data": [
    {
      "timestamp": "2022-05-03T00:00:00.000Z",
      "tvlUsd": 11074372760,
      "apy": 3.6,
      "apyBase": 3.6,
      "apyReward": null,
      "il7d": null,
      "apyBase7d": null
    }
  ]
}
```

**Notes:**
- Returns ALL history (1000+ data points) — must filter to last 30 days client-side
- Pool ID is UUID format (e.g., `747c1d2a-c668-4682-b9f9-296708a3dd90`)
- `apy` field is the total APY (base + reward)
- Timestamps are ISO 8601 strings, daily granularity

### GET /pools (existing)
Pool list with `pool` field as UUID identifier (maps to current `id` in domain).

## Navigation

**Expo Router dynamic route:** `src/app/pool/[id].tsx`
- Pool ID passed as route parameter
- Standard stack push from home screen

## What NOT to use

- `react-native-chart-kit` — older, canvas-based, less performant on RN new arch
- `react-native-svg-charts` — unmaintained
- D3.js directly — too low-level for this use case
