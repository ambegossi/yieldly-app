import { Button } from "@/components/core/button";
import { Loading } from "@/components/core/loading";
import { Text } from "@/components/core/text";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import React, { Suspense, useState } from "react";
import { View } from "react-native";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background p-4">
          <Text className="mb-4 text-center text-lg text-destructive">
            Something went wrong
          </Text>
          <Button onPress={this.props.onRetry}>
            <Text>Retry</Text>
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}

export function ScreenWrapper({ children }: { children: React.ReactNode }) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          key={retryKey}
          onRetry={() => {
            reset();
            setRetryKey((k) => k + 1);
          }}
        >
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
