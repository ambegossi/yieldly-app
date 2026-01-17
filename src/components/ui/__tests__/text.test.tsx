import { render, screen } from "@testing-library/react-native";
import { Text } from "../text";

describe("Text Component", () => {
  it("should render text content", () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  it("should apply default variant", () => {
    const { getByText } = render(<Text>Default Text</Text>);
    const textElement = getByText("Default Text");
    expect(textElement).toBeTruthy();
  });

  it("should render with h1 variant and heading role", () => {
    const { getByText } = render(<Text variant="h1">Heading 1</Text>);
    const heading = getByText("Heading 1");
    expect(heading).toBeTruthy();
    expect(heading.props.role).toBe("heading");
    expect(heading.props["aria-level"]).toBe("1");
  });

  it("should render with h2 variant and heading role", () => {
    const { getByText } = render(<Text variant="h2">Heading 2</Text>);
    const heading = getByText("Heading 2");
    expect(heading).toBeTruthy();
    expect(heading.props.role).toBe("heading");
    expect(heading.props["aria-level"]).toBe("2");
  });

  it("should render with muted variant", () => {
    const { getByText } = render(<Text variant="muted">Muted text</Text>);
    expect(getByText("Muted text")).toBeTruthy();
  });

  it("should accept custom className", () => {
    const { getByText } = render(
      <Text className="custom-class">Custom styled text</Text>,
    );
    expect(getByText("Custom styled text")).toBeTruthy();
  });

  it("should support accessibility props", () => {
    const { getByLabelText } = render(
      <Text accessibilityLabel="test-label">Accessible text</Text>,
    );
    expect(getByLabelText("test-label")).toBeTruthy();
  });
});
