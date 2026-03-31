import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterChip } from "../filter-chip";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Feather: (props: Record<string, unknown>) => (
      <Text testID={`icon-${String(props.name)}`}>{String(props.name)}</Text>
    ),
  };
});

describe("FilterChip", () => {
  it("should render the label text", () => {
    render(<FilterChip label="Ethereum" onRemove={jest.fn()} />);

    expect(screen.getByText("Ethereum")).toBeTruthy();
  });

  it("should render the remove icon", () => {
    render(<FilterChip label="Ethereum" onRemove={jest.fn()} />);

    expect(screen.getByTestId("icon-x")).toBeTruthy();
  });

  it("should call onRemove when pressed", () => {
    const onRemove = jest.fn();
    render(<FilterChip label="Ethereum" onRemove={onRemove} />);

    fireEvent.press(screen.getByLabelText("Remove Ethereum filter"));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("should have correct accessibility label", () => {
    render(<FilterChip label="Aave" onRemove={jest.fn()} />);

    expect(screen.getByLabelText("Remove Aave filter")).toBeTruthy();
  });
});
