import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { signupRequest } from "@/services/auth";
import { validateSignupCredentials } from "@/utils/validations/credentials";
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

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const isFormValid = () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      return false;
    }

    try {
      const isValid = validateSignupCredentials({ email, password, username });
      return isValid !== false;
    } catch (error) {
      return false;
    }
  };

  const formIsValid = isFormValid();
  const isButtonDisabled = !formIsValid || isSubmitting;

  const handleSignup = async () => {
    if (isButtonDisabled) return;

    try {
      setIsSubmitting(true);
      const credentials = { email, username, password };
      await signupRequest(credentials);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to signup.';
        Alert.alert('Erro', errorMessage);
      } else {
        Alert.alert('Unexpected error', 'Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.mockIcon}>
            <Feather size={20} name="edit" color={"white"} />
          </View>
          <ThemedText style={styles.title}>Create account</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your details to get started.
          </ThemedText>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <View style={styles.inputContainer}>
              <Feather
                name="user"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

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
                placeholder="Create a password"
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

          <TouchableOpacity
            disabled={isButtonDisabled}
            style={[
              styles.button,
              isButtonDisabled && styles.disabledButton,
            ]}
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.linkText}>Sign in</Text>
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
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
  button: {
    backgroundColor: "#0055ff",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#a0c0ff",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 32,
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
});