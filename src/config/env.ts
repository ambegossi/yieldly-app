import Constants from "expo-constants";

interface Env {
  EXPO_PUBLIC_DEFILLAMA_BASE_API_URL: string;
}

function getEnv(): Env {
  const extra = Constants.expoConfig?.extra;

  if (!extra) {
    throw new Error("No extra config found");
  }

  return {
    EXPO_PUBLIC_DEFILLAMA_BASE_API_URL:
      extra.EXPO_PUBLIC_DEFILLAMA_BASE_API_URL,
  };
}

export const env = getEnv();
