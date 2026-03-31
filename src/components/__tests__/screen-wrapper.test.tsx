import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { ScreenWrapper } from "../screen-wrapper";

function ThrowingComponent(): React.ReactElement {
  throw new Error("Test error");
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("ScreenWrapper", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("renders children when no error", () => {
    const Wrapper = createWrapper(queryClient);

    const { unmount } = render(
      <ScreenWrapper>
        <Text>Hello</Text>
      </ScreenWrapper>,
      { wrapper: Wrapper },
    );

    expect(screen.getByText("Hello")).toBeTruthy();

    unmount();
  });

  it("renders error fallback when child throws", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const Wrapper = createWrapper(queryClient);

    const { unmount } = render(
      <ScreenWrapper>
        <ThrowingComponent />
      </ScreenWrapper>,
      { wrapper: Wrapper },
    );

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByRole("button")).toBeTruthy();

    unmount();
    spy.mockRestore();
  });

  it("retry clears the error boundary and calls React Query reset", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) throw new Error("Test error");
      return <Text>Recovered</Text>;
    }

    const Wrapper = createWrapper(queryClient);

    const { unmount } = render(
      <ScreenWrapper>
        <ConditionalThrower />
      </ScreenWrapper>,
      { wrapper: Wrapper },
    );

    expect(screen.getByText("Something went wrong")).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(screen.getByRole("button"));

    expect(screen.getByText("Recovered")).toBeTruthy();

    unmount();
    spy.mockRestore();
  });
});
