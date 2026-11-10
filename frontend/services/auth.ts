import { saveAuthKey, saveData } from "@/lib/SecureStore";
import {
  AuthSigninRequest,
  AuthSigninResponse,
  AuthSignupRequest,
  AuthSignupResponse,
} from "@/types/auth-types";
import { api } from "./api";

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

export async function signupRequest(credentials: AuthSignupRequest) {
  try {
    const response = await api.post("/auth/register", {
      email: credentials.email,
      username: credentials.username,
      password: credentials.password,
    });

    const data: AuthSignupResponse = response.data;
    await saveAuthKey(data.token);
    await saveData("user_profile", JSON.stringify(data.userData));
  } catch (err) {
    console.log(err);
  }
}