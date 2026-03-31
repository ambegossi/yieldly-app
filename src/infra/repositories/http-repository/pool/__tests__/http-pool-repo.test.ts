import { HttpPoolRepo } from "../http-pool-repo";
import { HttpClient } from "@/infra/http/http-client";
import { DefiLlamaGetPoolsResponseDTO } from "../pool-dto";

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
});
