import { defiLlamaPoolDTOToPool } from "../pool-adapter";
import { DefiLlamaPoolDTO } from "../pool-dto";

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
        url: "https://example.com/pool",
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
        url: "https://example.com/pool",
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
        url: "https://example.com/pool-2",
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
        url: "https://example.com/pool-3",
      };

      // Act
      const result = defiLlamaPoolDTOToPool(dto);

      // Assert
      expect(result.chain).toBe(dto.chain);
      expect(result.project).toBe(dto.project);
      expect(result.symbol).toBe(dto.symbol);
      expect(result.apy).toBe(dto.apy);
      expect(result.url).toBe(dto.url);
    });
  });
});
