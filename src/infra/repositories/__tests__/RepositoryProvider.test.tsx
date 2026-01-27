import React from "react";
import { renderHook } from "@testing-library/react-native";
import { RepositoryProvider, useRepository } from "../RepositoryProvider";
import { Repositories } from "@/domain/Repositories";

describe("RepositoryProvider", () => {
  describe("useRepository", () => {
    it("should return repositories when used within RepositoryProvider", () => {
      // Arrange
      const mockRepositories: Repositories = {
        poolRepo: {
          findAll: jest.fn(),
        },
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RepositoryProvider value={mockRepositories}>
          {children}
        </RepositoryProvider>
      );

      // Act
      const { result } = renderHook(() => useRepository(), { wrapper });

      // Assert
      expect(result.current).toBe(mockRepositories);
      expect(result.current.poolRepo).toBeDefined();
    });

    it("should return default context value when used outside RepositoryProvider", () => {
      // Act
      const { result } = renderHook(() => useRepository());

      // Assert
      // The context has a default value of empty object, so no error is thrown
      expect(result.current).toBeDefined();
      expect(result.current).toEqual({});
    });
  });
});
