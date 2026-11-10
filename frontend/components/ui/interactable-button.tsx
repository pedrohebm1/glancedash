import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  isOpened: boolean;
  handlePress: () => void;
  onGenerateCards?: () => void; // Optional action handler for the cards option
}

export default function InteractableButton({
  isOpened,
  handlePress,
  onGenerateCards,
}: Props) {
  return (
    <View style={styles.container}>
      {isOpened && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onGenerateCards}
            activeOpacity={0.8}
          >
            <Text style={styles.menuText}>Generate Cards</Text>
            <View style={styles.miniIcon}>
              <Ionicons name="sparkles" size={16} color="#5856d6" />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={styles.bannerButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Feather name={isOpened ? "x" : "list"} size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 32,
    bottom: 32,
    alignItems: "flex-end",
  },
  bannerButton: {
    width: 48,
    height: 48,
    backgroundColor: "#5856d6",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5856d6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  menuContainer: {
    marginBottom: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 10,
  },
  miniIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f0effc",
    alignItems: "center",
    justifyContent: "center",
  },
});
