import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterBottomSheet } from "../filter-bottom-sheet";

jest.mock("@gorhom/bottom-sheet", () => {
  const { View } = require("react-native");
  const MockBottomSheet = jest
    .fn()
    .mockImplementation(({ children }) => (
      <View testID="bottom-sheet">{children}</View>
    ));

  return {
    __esModule: true,
    default: MockBottomSheet,
    BottomSheetBackdrop: jest.fn(() => null),
  };
});

describe("FilterBottomSheet", () => {
  const defaultProps = {
    options: ["Ethereum", "Polygon", "Arbitrum"],
    selectedValue: null as string | null,
    onSelect: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title "Select Network" for network filterType', () => {
    render(<FilterBottomSheet {...defaultProps} filterType="network" />);

    expect(screen.getByText("Select Network")).toBeTruthy();
  });

  it('should render title "Select Protocol" for protocol filterType', () => {
    render(<FilterBottomSheet {...defaultProps} filterType="protocol" />);

    expect(screen.getByText("Select Protocol")).toBeTruthy();
  });

  it('should render "All" option', () => {
    render(<FilterBottomSheet {...defaultProps} filterType="network" />);

    expect(screen.getByText("All")).toBeTruthy();
  });

  it("should render all provided options", () => {
    render(<FilterBottomSheet {...defaultProps} filterType="network" />);

    expect(screen.getByText("Ethereum")).toBeTruthy();
    expect(screen.getByText("Polygon")).toBeTruthy();
    expect(screen.getByText("Arbitrum")).toBeTruthy();
  });

  it("should call onSelect with option value when option is pressed", () => {
    const onSelect = jest.fn();
    render(
      <FilterBottomSheet
        {...defaultProps}
        filterType="network"
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByText("Ethereum"));

    expect(onSelect).toHaveBeenCalledWith("Ethereum");
  });

  it('should call onSelect with null when "All" is pressed', () => {
    const onSelect = jest.fn();
    render(
      <FilterBottomSheet
        {...defaultProps}
        filterType="network"
        selectedValue="Ethereum"
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByText("All"));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("should show checkmark for selected value", () => {
    render(
      <FilterBottomSheet
        {...defaultProps}
        filterType="network"
        selectedValue="Ethereum"
      />,
    );

    // The checkmark should appear next to Ethereum (and not next to "All")
    const allCheckmarks = screen.getAllByText("✓");
    expect(allCheckmarks).toHaveLength(1);
  });
});
