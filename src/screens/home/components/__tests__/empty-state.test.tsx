import { fireEvent, render, screen } from "@testing-library/react-native";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("should render message text", () => {
    render(<EmptyState message="No pools found" />);

    expect(screen.getByText("No pools found")).toBeTruthy();
  });

  it("should show clear button when showClearFilters is true", () => {
    const onClearFilters = jest.fn();
    render(
      <EmptyState
        message="No results"
        showClearFilters={true}
        onClearFilters={onClearFilters}
      />,
    );

    expect(screen.getByText("Clear Filters")).toBeTruthy();
  });

  it("should hide clear button when showClearFilters is false", () => {
    render(
      <EmptyState
        message="No results"
        showClearFilters={false}
        onClearFilters={jest.fn()}
      />,
    );

    expect(screen.queryByText("Clear Filters")).toBeNull();
  });

  it("should call onClearFilters when button pressed", () => {
    const onClearFilters = jest.fn();
    render(
      <EmptyState
        message="No results"
        showClearFilters={true}
        onClearFilters={onClearFilters}
      />,
    );

    fireEvent.press(screen.getByLabelText("Clear filters"));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
