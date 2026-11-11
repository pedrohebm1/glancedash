import { saveAuthKey, saveData } from "@/lib/SecureStore";
import {
  AuthSigninRequest,
  AuthSigninResponse,
  AuthSignupRequest,
  AuthSignupResponse,
} from "@/types/auth-types";
import { api } from "./api";
import axios from "axios";

export async function signinRequest(credentials: AuthSigninRequest) {
  try {
    console.log("called");
    const response = await api.post("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
    const data: AuthSigninResponse = response.data;
    console.log(data);
    await saveAuthKey(data.token);
    await saveData("user_profile", JSON.stringify(data.userData));
  } catch (err) {
    console.log(err);
  }
}

export async function signupRequest(
  credentials: AuthSignupRequest
): Promise<AuthSignupResponse> {
  try {
    const response = await api.post<AuthSignupResponse>(
      "/auth/register",
      credentials
    );

    const data = response.data;

    await saveAuthKey(data.token);
    await saveData("user_profile", JSON.stringify(data.userData));

    return data;

  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.description ??
        "Failed to signup.";

      throw new Error(errorMessage);
    }

    throw err;
  }
}
