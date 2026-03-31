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
    selectedValues: [] as string[],
    onToggle: jest.fn(),
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

  it("should render all provided options", () => {
    render(<FilterBottomSheet {...defaultProps} filterType="network" />);

    expect(screen.getByText("Ethereum")).toBeTruthy();
    expect(screen.getByText("Polygon")).toBeTruthy();
    expect(screen.getByText("Arbitrum")).toBeTruthy();
  });

  it("should not render All option", () => {
    render(<FilterBottomSheet {...defaultProps} filterType="network" />);

    expect(screen.queryByText("All")).toBeNull();
  });

  it("should call onToggle with option value when option is pressed", () => {
    const onToggle = jest.fn();
    render(
      <FilterBottomSheet
        {...defaultProps}
        filterType="network"
        onToggle={onToggle}
      />,
    );

    fireEvent.press(screen.getByText("Ethereum"));

    expect(onToggle).toHaveBeenCalledWith("Ethereum");
  });

  it("should show checkmarks for all selected values", () => {
    render(
      <FilterBottomSheet
        {...defaultProps}
        filterType="network"
        selectedValues={["Ethereum", "Polygon"]}
      />,
    );

    const allCheckmarks = screen.getAllByText("✓");
    expect(allCheckmarks).toHaveLength(2);
  });

  it("should not auto-close when option is selected", () => {
    const onToggle = jest.fn();
    render(
      <FilterBottomSheet
        {...defaultProps}
        filterType="network"
        onToggle={onToggle}
      />,
    );

    fireEvent.press(screen.getByText("Ethereum"));

    expect(screen.getByTestId("bottom-sheet")).toBeTruthy();
  });
});
