import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterDropdown } from "../filter-dropdown";

describe("FilterDropdown", () => {
  const defaultProps = {
    options: ["Ethereum", "Polygon", "Arbitrum"],
    selectedValue: null as string | null,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render filter button with label", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    expect(screen.getByText("Network")).toBeTruthy();
  });

  it("should open dropdown when button is pressed", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    fireEvent.press(screen.getByRole("button"));

    expect(screen.getByText("Ethereum")).toBeTruthy();
    expect(screen.getByText("Polygon")).toBeTruthy();
    expect(screen.getByText("Arbitrum")).toBeTruthy();
  });

  it("should render all options when opened", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    fireEvent.press(screen.getByRole("button"));

    expect(screen.getByText("Ethereum")).toBeTruthy();
    expect(screen.getByText("Polygon")).toBeTruthy();
    expect(screen.getByText("Arbitrum")).toBeTruthy();
  });

  it('should render "All" option when opened', () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    fireEvent.press(screen.getByRole("button"));

    expect(screen.getByText("All")).toBeTruthy();
  });

  it("should call onSelect with value when option is pressed", () => {
    const onSelect = jest.fn();
    render(
      <FilterDropdown {...defaultProps} label="Network" onSelect={onSelect} />,
    );

    fireEvent.press(screen.getByRole("button"));
    fireEvent.press(screen.getByText("Ethereum"));

    expect(onSelect).toHaveBeenCalledWith("Ethereum");
  });

  it('should call onSelect with null when "All" is pressed', () => {
    const onSelect = jest.fn();
    render(
      <FilterDropdown
        {...defaultProps}
        label="Network"
        selectedValue="Ethereum"
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByRole("button"));
    fireEvent.press(screen.getByText("All"));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("should close dropdown after selection", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    fireEvent.press(screen.getByRole("button"));
    expect(screen.getByText("Ethereum")).toBeTruthy();

    fireEvent.press(screen.getByText("Ethereum"));

    // After selection, the modal should close and options should not be visible
    expect(screen.queryByText("All")).toBeNull();
  });

  it("should show checkmark for selected value", () => {
    render(
      <FilterDropdown
        {...defaultProps}
        label="Network"
        selectedValue="Ethereum"
      />,
    );

    fireEvent.press(screen.getByRole("button"));

    // When Ethereum is selected, checkmark appears next to it (not "All")
    const allCheckmarks = screen.getAllByText("\u2713");
    expect(allCheckmarks).toHaveLength(1);
  });
});
