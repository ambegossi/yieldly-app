import { ScreenWrapper } from "@/components/screen-wrapper";
import { type Pool } from "@/domain/pool/pool";
import PoolDetailsScreen from "@/screens/pool-details";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PoolDetailsRoute() {
  const params = useLocalSearchParams<{
    id: string;
    chain: string;
    project: string;
    symbol: string;
    apy: string;
  }>();
  const router = useRouter();

  const pool: Pool = {
    id: params.id ?? "",
    chain: params.chain ?? "",
    project: params.project ?? "",
    symbol: params.symbol ?? "",
    apy: parseFloat(params.apy ?? "0"),
  };

  return (
    <ScreenWrapper>
      <PoolDetailsScreen pool={pool} onBack={() => router.back()} />
    </ScreenWrapper>
  );
}
