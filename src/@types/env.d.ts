import "expo-constants";

declare module "expo-constants" {
  export default interface Constants {
    expoConfig?: {
      extra?: {
        apiBaseUrl?: string;
        eas?: {
          projectId?: string;
        };
      };
    };
  }
}
