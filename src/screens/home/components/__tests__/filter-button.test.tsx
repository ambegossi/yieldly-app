import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterButton } from "../filter-button";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Feather: (props: Record<string, unknown>) => (
      <Text testID="filter-icon">{String(props.name)}</Text>
    ),
  };
});

describe("FilterButton", () => {
  it("should render label text when no active filters", () => {
    render(
      <FilterButton label="Network" activeCount={0} onPress={jest.fn()} />,
    );

    expect(screen.getByText("Network")).toBeTruthy();
  });

  it("should render count badge when filters are active", () => {
    render(
      <FilterButton label="Network" activeCount={4} onPress={jest.fn()} />,
    );

    expect(screen.getByText("Network")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("should not render count badge when activeCount is 0", () => {
    render(
      <FilterButton label="Network" activeCount={0} onPress={jest.fn()} />,
    );

    expect(screen.queryByText("0")).toBeNull();
  });

  it("should render filter icon", () => {
    render(
      <FilterButton label="Network" activeCount={0} onPress={jest.fn()} />,
    );

    expect(screen.getByTestId("filter-icon")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    render(
      <FilterButton label="Network" activeCount={0} onPress={onPress} />,
    );

    fireEvent.press(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should have correct accessibility label when inactive", () => {
    render(
      <FilterButton label="Network" activeCount={0} onPress={jest.fn()} />,
    );

    expect(screen.getByLabelText("Network filter")).toBeTruthy();
  });

  it("should have correct accessibility label when active", () => {
    render(
      <FilterButton label="Network" activeCount={3} onPress={jest.fn()} />,
    );

    expect(
      screen.getByLabelText("Network filter, 3 selected"),
    ).toBeTruthy();
  });
});
