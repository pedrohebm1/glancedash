import { getAuthKey, deleteAuthKey } from "@/lib/SecureStore";
import axios from "axios";
import Constants from "expo-constants";
import { router } from "expo-router"; 
import { Alert } from "react-native";

export const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_URL,
  timeout: 10000,
});

const bypassUrls = ["/auth/"];

api.interceptors.request.use(
  async (config) => {
    try {
      const shouldBypass = bypassUrls.some((url) => config.url?.includes(url));
      if (!shouldBypass) {
        const token = await getAuthKey();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Erro ao recuperar o token para a requisição:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await deleteAuthKey();
        router.replace("/(auth)/sign-in"); 
        Alert.alert("Token expired", "Session expired, please sign-in.")
      } catch (cleanError) {
        console.error("Unable to clean authentication data:", cleanError);
      }
    }

    return Promise.reject(error);
  }
);