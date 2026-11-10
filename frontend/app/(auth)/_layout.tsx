import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack>
      <Stack.Screen
        name="sign-in"
        options={{
          title: "Signin",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: "Signup",
          headerShown: false
        }}
      />
    </Stack>
    )
}