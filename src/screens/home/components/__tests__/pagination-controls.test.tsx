import { fireEvent, render, screen } from "@testing-library/react-native";
import { PaginationControls } from "../pagination-controls";

describe("PaginationControls", () => {
  const onPageChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render page numbers", () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("should call onPageChange when page clicked", () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.press(screen.getByLabelText("Go to page 2"));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should disable Previous on page 1", () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );

    const prevButton = screen.getByLabelText("Previous page");
    expect(prevButton).toBeDisabled();
  });

  it("should disable Next on last page", () => {
    render(
      <PaginationControls
        currentPage={5}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );

    const nextButton = screen.getByLabelText("Next page");
    expect(nextButton).toBeDisabled();
  });

  it("should show ellipsis for large page ranges", () => {
    render(
      <PaginationControls
        currentPage={5}
        totalPages={10}
        onPageChange={onPageChange}
      />,
    );

    const ellipses = screen.getAllByText("\u2026");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });
});
