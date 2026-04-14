import {
  defiLlamaPoolDTOToPool,
  defiLlamaChartDTOToApyHistory,
} from "../pool-adapter";
import { DefiLlamaPoolDTO, DefiLlamaApyDataPointDTO } from "../pool-dto";

describe("PoolAdapter", () => {
  describe("defiLlamaPoolDTOToPool", () => {
    it("should correctly map DefiLlamaPoolDTO to Pool", () => {
      // Arrange
      const dto: DefiLlamaPoolDTO = {
        pool: "pool-123",
        chain: "ethereum",
        project: "aave",
        symbol: "USDC",
        apy: 5.5,
        stablecoin: true,
      };

      // Act
      const result = defiLlamaPoolDTOToPool(dto);

      // Assert
      expect(result).toEqual({
        id: "pool-123",
        chain: "ethereum",
        project: "aave",
        symbol: "USDC",
        apy: 5.5,
      });
    });

    it("should map pool field to id field", () => {
      // Arrange
      const dto: DefiLlamaPoolDTO = {
        pool: "unique-pool-id",
        chain: "polygon",
        project: "compound",
        symbol: "DAI",
        apy: 3.2,
        stablecoin: true,
      };

      // Act
      const result = defiLlamaPoolDTOToPool(dto);

      // Assert
      expect(result.id).toBe(dto.pool);
    });

    it("should preserve all other fields unchanged", () => {
      // Arrange
      const dto: DefiLlamaPoolDTO = {
        pool: "test-pool",
        chain: "arbitrum",
        project: "curve",
        symbol: "USDT",
        apy: 12.75,
        stablecoin: true,
      };

      // Act
      const result = defiLlamaPoolDTOToPool(dto);

      // Assert
      expect(result.chain).toBe(dto.chain);
      expect(result.project).toBe(dto.project);
      expect(result.symbol).toBe(dto.symbol);
      expect(result.apy).toBe(dto.apy);
    });
  });
});

describe("defiLlamaChartDTOToApyHistory", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-30T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should include data points within the last 30 days", () => {
    // Arrange
    const dtos: DefiLlamaApyDataPointDTO[] = [
      {
        timestamp: "2024-01-15T00:00:00.000Z",
        tvlUsd: 1000,
        apy: 5.0,
        apyBase: 4.0,
        apyReward: 1.0,
        il7d: null,
        apyBase7d: null,
      },
    ];

    // Act
    const result = defiLlamaChartDTOToApyHistory(dtos);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      timestamp: "2024-01-15T00:00:00.000Z",
      apy: 5.0,
    });
  });

  it("should exclude data points older than 30 days", () => {
    // Arrange
    const dtos: DefiLlamaApyDataPointDTO[] = [
      {
        timestamp: "2023-12-01T00:00:00.000Z",
        tvlUsd: 500,
        apy: 3.0,
        apyBase: 2.0,
        apyReward: 1.0,
        il7d: null,
        apyBase7d: null,
      },
    ];

    // Act
    const result = defiLlamaChartDTOToApyHistory(dtos);

    // Assert
    expect(result).toHaveLength(0);
  });

  it("should filter out data points with null apy", () => {
    // Arrange
    const dtos: DefiLlamaApyDataPointDTO[] = [
      {
        timestamp: "2024-01-25T00:00:00.000Z",
        tvlUsd: 800,
        apy: null,
        apyBase: null,
        apyReward: null,
        il7d: null,
        apyBase7d: null,
      },
    ];

    // Act
    const result = defiLlamaChartDTOToApyHistory(dtos);

    // Assert
    expect(result).toHaveLength(0);
  });

  it("should return empty array for empty input", () => {
    // Act
    const result = defiLlamaChartDTOToApyHistory([]);

    // Assert
    expect(result).toEqual([]);
  });

  it("should only include timestamp and apy in output", () => {
    // Arrange
    const dtos: DefiLlamaApyDataPointDTO[] = [
      {
        timestamp: "2024-01-20T00:00:00.000Z",
        tvlUsd: 1000,
        apy: 6.0,
        apyBase: 5.0,
        apyReward: 1.0,
        il7d: 0.5,
        apyBase7d: 4.5,
      },
    ];

    // Act
    const result = defiLlamaChartDTOToApyHistory(dtos);

    // Assert
    expect(result).toHaveLength(1);
    expect(Object.keys(result[0])).toEqual(["timestamp", "apy"]);
  });

  it("should handle mixed old, recent, and null data points", () => {
    // Arrange
    const dtos: DefiLlamaApyDataPointDTO[] = [
      {
        // 31 days ago — should be excluded
        timestamp: "2023-12-30T00:00:00.000Z",
        tvlUsd: 1000,
        apy: 4.0,
        apyBase: 3.0,
        apyReward: 1.0,
        il7d: null,
        apyBase7d: null,
      },
      {
        // 10 days ago, apy 7.5 — should be included
        timestamp: "2024-01-20T00:00:00.000Z",
        tvlUsd: 2000,
        apy: 7.5,
        apyBase: 6.0,
        apyReward: 1.5,
        il7d: null,
        apyBase7d: null,
      },
      {
        // 5 days ago, null apy — should be excluded
        timestamp: "2024-01-25T00:00:00.000Z",
        tvlUsd: 1500,
        apy: null,
        apyBase: null,
        apyReward: null,
        il7d: null,
        apyBase7d: null,
      },
    ];

    // Act
    const result = defiLlamaChartDTOToApyHistory(dtos);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].apy).toBe(7.5);
  });
});
