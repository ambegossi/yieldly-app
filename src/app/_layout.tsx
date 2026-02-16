import { HttpRepositories } from "@/infra/repositories/http-repository";
import { RepositoryProvider } from "@/infra/repositories/repository-provider";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../global.css";

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
