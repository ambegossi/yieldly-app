import { usePoolFindAll } from "@/domain/pool/useCases/usePoolFindAll";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function Index() {
  const { data, isLoading, error } = usePoolFindAll();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-600">Carregando pools...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="font-bold text-red-500">Erro ao carregar pools</Text>
        <Text className="mt-2 text-gray-600">{String(error)}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="mb-4 text-2xl font-bold">Pools DeFi</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-lg bg-gray-100 p-4">
            <Text className="text-lg font-bold">{item.symbol}</Text>
            <Text className="text-gray-600">
              {item.project} • {item.chain}
            </Text>
            <Text className="mt-1 font-semibold text-green-600">
              APY: {item.apy.toFixed(2)}%
            </Text>
          </View>
        )}
      />
    </View>
  );
}
