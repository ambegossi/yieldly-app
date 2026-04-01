import { HttpPoolRepo } from "../http-pool-repo";
import { HttpClient } from "@/infra/http/http-client";
import {
  DefiLlamaGetPoolsResponseDTO,
  DefiLlamaGetChartResponseDTO,
} from "../pool-dto";

describe("HttpPoolRepo", () => {
  describe("findAll", () => {
    it("should fetch pools and map them to domain entities", async () => {
      // Arrange
      const mockHttpClient: HttpClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            status: "success",
            data: [
              {
                pool: "pool-1",
                chain: "ethereum",
                project: "aave",
                symbol: "USDC",
                apy: 5.5,
                url: "https://example.com/pool-1",
              },
              {
                pool: "pool-2",
                chain: "polygon",
                project: "compound",
                symbol: "DAI",
                apy: 3.2,
                url: "https://example.com/pool-2",
              },
            ],
          } as DefiLlamaGetPoolsResponseDTO,
        }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      const repository = new HttpPoolRepo(mockHttpClient);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith("/pools");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "pool-1",
        chain: "ethereum",
        project: "aave",
        symbol: "USDC",
        apy: 5.5,
        url: "https://example.com/pool-1",
      });
      expect(result[1]).toEqual({
        id: "pool-2",
        chain: "polygon",
        project: "compound",
        symbol: "DAI",
        apy: 3.2,
        url: "https://example.com/pool-2",
      });
    });

    it("should return empty array when no pools are returned", async () => {
      // Arrange
      const mockHttpClient: HttpClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            status: "success",
            data: [],
          } as DefiLlamaGetPoolsResponseDTO,
        }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      const repository = new HttpPoolRepo(mockHttpClient);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith("/pools");
      expect(result).toEqual([]);
    });

    it("should propagate errors from httpClient", async () => {
      // Arrange
      const mockError = new Error("Network error");
      const mockHttpClient: HttpClient = {
        get: jest.fn().mockRejectedValue(mockError),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      const repository = new HttpPoolRepo(mockHttpClient);

      // Act & Assert
      await expect(repository.findAll()).rejects.toThrow("Network error");
      expect(mockHttpClient.get).toHaveBeenCalledWith("/pools");
    });
  });

  describe("findApyHistory", () => {
    it("should call httpClient.get with /chart/{poolId}", async () => {
      // Arrange
      const mockHttpClient: HttpClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            status: "success",
            data: [],
          } as DefiLlamaGetChartResponseDTO,
        }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      const repository = new HttpPoolRepo(mockHttpClient);

      // Act
      await repository.findApyHistory("pool-abc");

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith("/chart/pool-abc");
    });

    it("should return mapped APY data points", async () => {
      // Arrange
      const fakeNow = new Date("2024-02-15T00:00:00.000Z");
      jest.useFakeTimers();
      jest.setSystemTime(fakeNow);

      const recentTimestamp = new Date("2024-02-10T00:00:00.000Z").toISOString();

      const mockHttpClient: HttpClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            status: "success",
            data: [
              {
                timestamp: recentTimestamp,
                tvlUsd: 1000000,
                apy: 8.5,
                apyBase: 6.0,
                apyReward: 2.5,
                il7d: null,
                apyBase7d: null,
              },
            ],
          } as DefiLlamaGetChartResponseDTO,
        }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      const repository = new HttpPoolRepo(mockHttpClient);

      // Act
      const result = await repository.findApyHistory("pool-abc");

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].apy).toBe(8.5);
      expect(result[0].timestamp).toBe(recentTimestamp);

      jest.useRealTimers();
    });

    it("should return empty array when API returns no data", async () => {
      // Arrange
      const mockHttpClient: HttpClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            status: "success",
            data: [],
          } as DefiLlamaGetChartResponseDTO,
        }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      const repository = new HttpPoolRepo(mockHttpClient);

      // Act
      const result = await repository.findApyHistory("pool-abc");

      // Assert
      expect(result).toEqual([]);
    });

    it("should propagate errors from httpClient", async () => {
      // Arrange
      const mockHttpClient: HttpClient = {
        get: jest.fn().mockRejectedValue(new Error("Network error")),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      const repository = new HttpPoolRepo(mockHttpClient);

      // Act & Assert
      await expect(repository.findApyHistory("pool-xyz")).rejects.toThrow(
        "Network error",
      );
    });
  });
});
