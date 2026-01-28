import { env } from "@/config/env";
import axios from "axios";

export const defiLlamaHttpClient = axios.create({
  baseURL: env.EXPO_PUBLIC_DEFILLAMA_BASE_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
