import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { signinRequest } from "@/services/auth";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const isFormValid = email.trim() !== "" && password.trim() !== "";
  const isButtonDisabled = !isFormValid || isSubmitting;

  const handleSignIn = async () => {
    if (isButtonDisabled) return;

    try {
      setIsSubmitting(true);
      const credentials = { email, password };

      await signinRequest(credentials);
      router.push("/(tabs)/home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to signin';
        Alert.alert('Erro', errorMessage);
      } else {
        Alert.alert('Unexpected error', 'Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestIn = () => {
    router.dismissAll();
    router.replace("/(tabs)/home");
  };

  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.mockIcon}>
            <Feather size={20} name="edit" color={"white"} />
          </View>
          <ThemedText style={styles.title}>Welcome back!</ThemedText>
          <ThemedText style={styles.subtitle}>
            Please enter your credentials.
          </ThemedText>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <View style={styles.inputContainer}>
              <Feather
                name="mail"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
          <View style={styles.formActions}>
            <TouchableOpacity
              disabled={isButtonDisabled}
              style={[
                styles.button,
                isButtonDisabled && styles.disabledButton,
              ]}
              onPress={handleSignIn}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>
            <ThemedText style={{ alignSelf: "center" }}>Or</ThemedText>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleGuestIn}
            >
              <ThemedText style={styles.buttonTextSecondary}>
                Continue as guest
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        <ThemedView style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
            <Text style={styles.linkText}>Sign up</Text>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  mockIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#0055ff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  formContainer: {
    gap: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#0055ff",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#0055ff",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#a0c0ff",
    opacity: 0.6,
  },
  buttonSecondary: {
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  linkText: {
    color: "#0055ff",
    fontWeight: "600",
  },
  formActions: {
    paddingBottom: 30,
  },
});