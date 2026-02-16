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
  it("should render label text when no active filter", () => {
    render(
      <FilterButton label="Network" activeFilter={null} onPress={jest.fn()} />,
    );

    expect(screen.getByText("Network")).toBeTruthy();
  });

  it("should render label with active filter value when set", () => {
    render(
      <FilterButton
        label="Network"
        activeFilter="Ethereum"
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText("Network: Ethereum")).toBeTruthy();
  });

  it("should render filter icon", () => {
    render(
      <FilterButton label="Network" activeFilter={null} onPress={jest.fn()} />,
    );

    expect(screen.getByTestId("filter-icon")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    render(
      <FilterButton label="Network" activeFilter={null} onPress={onPress} />,
    );

    fireEvent.press(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should have correct accessibility label when inactive", () => {
    render(
      <FilterButton label="Network" activeFilter={null} onPress={jest.fn()} />,
    );

    expect(screen.getByLabelText("Network filter")).toBeTruthy();
  });

  it("should have correct accessibility label when active", () => {
    render(
      <FilterButton
        label="Network"
        activeFilter="Ethereum"
        onPress={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText("Network filter, Ethereum selected"),
    ).toBeTruthy();
  });
});
