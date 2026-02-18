import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterDropdown } from "../filter-dropdown";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Feather: (props: Record<string, unknown>) => (
      <Text testID="filter-icon">{String(props.name)}</Text>
    ),
  };
});

jest.mock("@/components/core/dropdown-menu", () => {
  const React = require("react");
  const { Pressable, View, Text } = require("react-native");

  const DropdownMenuContext = React.createContext({
    open: false,
    setOpen: (_open: boolean) => {},
  });

  function DropdownMenu({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) {
    const [open, setOpen] = React.useState(false);
    const handleSetOpen = React.useCallback(
      (value: boolean) => {
        setOpen(value);
        onOpenChange?.(value);
      },
      [onOpenChange],
    );
    return (
      <DropdownMenuContext.Provider value={{ open, setOpen: handleSetOpen }}>
        <View>{children}</View>
      </DropdownMenuContext.Provider>
    );
  }

  function DropdownMenuTrigger({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) {
    const { setOpen } = React.useContext(DropdownMenuContext);
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        onPress: () => setOpen(true),
      });
    }
    return <Pressable onPress={() => setOpen(true)}>{children}</Pressable>;
  }

  function DropdownMenuContent({ children }: { children: React.ReactNode }) {
    const { open } = React.useContext(DropdownMenuContext);
    if (!open) return null;
    return <View>{children}</View>;
  }

  function DropdownMenuCheckboxItem({
    children,
    checked,
    onCheckedChange,
  }: {
    children: React.ReactNode;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    closeOnPress?: boolean;
  }) {
    return (
      <Pressable
        onPress={() => onCheckedChange(!checked)}
        accessibilityRole="menuitem"
      >
        {children}
        {checked && <Text>✓</Text>}
      </Pressable>
    );
  }

  return {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
  };
});

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

  it("should call onSelect with value when option is pressed", () => {
    const onSelect = jest.fn();
    render(
      <FilterDropdown {...defaultProps} label="Network" onSelect={onSelect} />,
    );

    fireEvent.press(screen.getByRole("button"));
    fireEvent.press(screen.getByText("Ethereum"));

    expect(onSelect).toHaveBeenCalledWith("Ethereum");
  });

  it("should filter options when typing in search", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    fireEvent.press(screen.getByRole("button"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Search network..."),
      "Eth",
    );

    expect(screen.getByText("Ethereum")).toBeTruthy();
    expect(screen.queryByText("Polygon")).toBeNull();
    expect(screen.queryByText("Arbitrum")).toBeNull();
  });

  it("should show no results when search has no matches", () => {
    render(<FilterDropdown {...defaultProps} label="Network" />);

    fireEvent.press(screen.getByRole("button"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Search network..."),
      "xyz",
    );

    expect(screen.getByText("No results")).toBeTruthy();
  });

  it("should call onSelect with null when selected option is pressed again", () => {
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
    fireEvent.press(screen.getByText("Ethereum"));

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
