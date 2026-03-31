import { cn } from "@/lib/utils";
import { ActivityIndicator, View } from "react-native";

interface LoadingProps {
  size?: "small" | "large";
  className?: string;
}

export function Loading({ size = "large", className }: LoadingProps) {
  return (
    <View
      className={cn(
        "flex-1 items-center justify-center bg-background",
        className,
      )}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <ActivityIndicator size={size} />
    </View>
  );
}
