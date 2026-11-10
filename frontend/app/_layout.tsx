import { ThemedText } from "@/components/themed-text";
import CustomHeader from "@/components/ui/custom-header";
import { migrateDbIfNeeded } from "@/db/database";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";

function AppContent({ colorScheme }: { colorScheme: any }) {
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            header: () => <CustomHeader />,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loadedFonts] = useFonts({
    Inter_Regular: require("./fonts/Inter_18pt-Regular.ttf"),
    Inter_Bold: require("./fonts/Inter_24pt-Bold.ttf"),
    Manrope_Regular: require("./fonts/Manrope-Regular.ttf"),
    Manrope_Bold: require("./fonts/Manrope-Bold.ttf"),
    JetbrainsMono_Regular: require("./fonts/JetBrainsMono-Regular.ttf"),
    JetbrainsMono_Bold: require("./fonts/JetBrainsMono-Bold.ttf"),
  });

  if (!loadedFonts) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={{ marginTop: 10, fontSize: 16 }}>
          Carregando app...
        </ThemedText>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="myapp.db" onInit={migrateDbIfNeeded}>
        <KeyboardProvider>
          <AppContent colorScheme={colorScheme} />
        </KeyboardProvider>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
