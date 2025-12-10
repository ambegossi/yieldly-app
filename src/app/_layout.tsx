import { createRepositories } from "@/infra/container";
import { RepositoryProvider } from "@/infra/repositories/RepositoryProvider";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import "../../global.css";

const queryClient = new QueryClient();

const repositories = createRepositories();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider value={repositories}>
        <Stack />
        <PortalHost />
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
