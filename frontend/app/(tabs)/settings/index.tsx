import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { storeData } from "@/lib/AsyncStorage";
import { getAuthKey, getDataAsync } from "@/lib/SecureStore";
import { UserData } from "@/types/auth-types";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Appearance, Pressable, StyleSheet, Switch, View } from "react-native";

export default function settings() {
  const [isDarkTheme, setDarkTheme] = useState(
    Appearance.getColorScheme() === "dark" ? true : false,
  );
  const [userData, setUserData] = useState<UserData>();
  const [authKey, setAuthKey] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDataAsync("user_profile");
      if (data) {
        setUserData(JSON.parse(data));
      }
    };
    const fetchAuthKey = async () => {
      const key = await getAuthKey();
      if (key) {
        setAuthKey(key);
      }
    };
    fetchAuthKey();
    fetchData();
  }, []);

  const changeAppearance = () => {
    const currentTheme = Appearance.getColorScheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setDarkTheme(newTheme === "dark" ? true : false);
    storeData("color_preference", newTheme);
    Appearance.setColorScheme(newTheme);
  };

  const getAuthenticationKey = async () => {
    return await getAuthKey();
  };

  return (
    <ThemedSafeAreaView style={{ flex: 1 }}>
      <View style={styles.pageContainer}>
        <ThemedText style={styles.textHeader}>Settings</ThemedText>
        <ThemedText style={styles.textSubheader}>
          Customize your workspace experience.
        </ThemedText>
        <View style={styles.sectionView}>
          <ThemedText style={styles.sectionHeader}>appearance</ThemedText>
          <View style={styles.section}>
            <View style={styles.sectionItem}>
              <Feather
                style={[styles.sectionItemIcon, { backgroundColor: "#5856d6" }]}
                name="moon"
                size={30}
                color={"white"}
              />
              <View style={styles.sectionItemContent}>
                <ThemedText style={styles.itemContentTitle}>
                  Dark mode
                </ThemedText>
                <ThemedText style={styles.itemContentDesc}>
                  Reduces eye strain
                </ThemedText>
              </View>
              <View style={styles.itemInteraction}>
                <Switch value={isDarkTheme} onValueChange={changeAppearance} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionView}>
          <ThemedText style={styles.sectionHeader}>account & sync</ThemedText>
          {!authKey && (
            <View style={styles.section}>
              <View style={styles.sectionItem}>
                <Feather
                  style={[
                    styles.sectionItemIcon,
                    {
                      backgroundColor: "#5856d6",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                  name="log-in"
                  size={28}
                  color={"white"}
                />
                <View style={styles.sectionItemContent}>
                  <ThemedText style={styles.itemContentTitle}>
                    Sign in
                  </ThemedText>
                  <ThemedText style={styles.itemContentDesc}>
                    Sync your notes across devices.
                  </ThemedText>
                </View>
                <Pressable
                  style={styles.itemInteraction}
                  onPress={() => router.push("/(auth)/sign-in")}
                >
                  <Feather name="chevron-right" size={20} color="#5856d6" />
                </Pressable>
              </View>
            </View>
          )}
          {authKey && (
            <View style={styles.section}>
              <View style={styles.sectionItem}>
                <Feather
                  style={[
                    styles.sectionItemIcon,
                    {
                      backgroundColor: "#5856d6",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                  name="user"
                  size={28}
                  color={"white"}
                />
                <View style={styles.sectionItemContent}>
                  <ThemedText style={styles.itemContentTitle}>
                    Profile settings
                  </ThemedText>
                  <ThemedText style={styles.itemContentDesc}>
                    {userData?.email}
                  </ThemedText>
                </View>
                <Pressable style={styles.itemInteraction}>
                  <Feather name="chevron-right" size={20} color="#5856d6" />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    paddingHorizontal: 20,
  },
  textHeader: {
    fontSize: 30,
    fontWeight: "600",
    color: "#0f172a",
    fontFamily: "Manrope_Bold",
    lineHeight: 40,
  },
  textSubheader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    fontFamily: "Manrope_Regular",
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5856d6",
    fontFamily: "Manrope_Bold",
    textTransform: "uppercase",
  },
  sectionView: {
    paddingTop: 15,
    gap: 5,
  },
  section: {
    backgroundColor: "#e9e9e9",
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#d8d8d8",
    height: 90,
  },
  sectionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    paddingLeft: 20,
  },
  sectionItemIcon: {
    padding: 5,
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  sectionItemContent: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  itemContentTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
    fontFamily: "Manrope_Bold",
  },
  itemContentDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#0f172a",
    fontFamily: "Manrope_Regular",
  },
  itemInteraction: {
    paddingRight: 20,
    justifyContent: "center",
    marginLeft: "auto",
    height: "100%",
  },
});
