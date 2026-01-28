import { HttpRepositories } from "@/infra/repositories/http-repository";
import { RepositoryProvider } from "@/infra/repositories/repository-provider";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import "../../global.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider value={HttpRepositories}>
        <Stack />
        <PortalHost />
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
