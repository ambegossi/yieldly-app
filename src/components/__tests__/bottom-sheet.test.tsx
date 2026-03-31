import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { BottomSheet } from "../bottom-sheet";

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

const MockBottomSheet = jest.requireMock<{ default: jest.Mock }>(
  "@gorhom/bottom-sheet",
).default;

describe("BottomSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render children", () => {
    render(
      <BottomSheet snapPoints={["50%"]}>
        <Text>Sheet Content</Text>
      </BottomSheet>,
    );

    expect(screen.getByText("Sheet Content")).toBeTruthy();
  });

  it("should forward snapPoints and onClose to GorhomBottomSheet", () => {
    const onClose = jest.fn();

    render(
      <BottomSheet snapPoints={["50%", "90%"]} onClose={onClose}>
        <Text>Content</Text>
      </BottomSheet>,
    );

    expect(MockBottomSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        snapPoints: ["50%", "90%"],
        onClose,
      }),
      undefined,
    );
  });

  it("should start closed with pan-down-to-close enabled", () => {
    render(
      <BottomSheet snapPoints={["50%"]}>
        <Text>Content</Text>
      </BottomSheet>,
    );

    expect(MockBottomSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        index: -1,
        enablePanDownToClose: true,
        enableDynamicSizing: false,
      }),
      undefined,
    );
  });

  it("should configure backdrop component", () => {
    render(
      <BottomSheet snapPoints={["50%"]}>
        <Text>Content</Text>
      </BottomSheet>,
    );

    expect(MockBottomSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        backdropComponent: expect.any(Function),
      }),
      undefined,
    );
  });

  it("should set accessibility label", () => {
    render(
      <BottomSheet snapPoints={["50%"]}>
        <Text>Content</Text>
      </BottomSheet>,
    );

    expect(MockBottomSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        accessibilityLabel: "Bottom sheet",
      }),
      undefined,
    );
  });
});
