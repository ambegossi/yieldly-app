import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { HttpRepositories } from "@/infra/repositories/http-repository";
import { RepositoryProvider } from "@/infra/repositories/repository-provider";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ErrorBoundaryProps, Stack } from "expo-router";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../global.css";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="mb-4 text-center text-lg text-destructive">
        {error.message || "Something went wrong"}
      </Text>

      <Button onPress={retry}>
        <Text>Try Again</Text>
      </Button>
    </View>
  );
}

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider value={HttpRepositories}>
          <Stack screenOptions={{ headerShown: false }} />

          <PortalHost />
        </RepositoryProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
