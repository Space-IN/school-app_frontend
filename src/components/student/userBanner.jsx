//src\components\student\userBanner.jsx
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "../../context/authContext";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  else if (hour >= 12 && hour < 17) return "Good Afternoon";
  else return "Good Evening";
};

export default function UserBanner() {
  const [greeting, setGreeting] = useState(getGreeting());
  const scaleAnim = new Animated.Value(1);
  const { user } = useAuth()

  const userName = "Pavan Kumar H";
  const className = "10 A";

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user-circle-o" size={65} color="white" />
        </View>

        <View style={styles.infoContainer}>
            <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" }}>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.userName}>{userName}</Text>
                <View style={styles.divider} />
            </View>
          <Text style={styles.userDetails}>
            ID: {user?.userId} | Class: {className}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#475569",
    width: "90%",
    alignSelf: "center",
    borderRadius: 12,
    padding: 15,
    marginTop: 12,
    borderWidth: 1,
    // borderColor: "#f0f0f0",
    height: 120
  },
  avatarContainer: {
    width: "25%",
    // backgroundColor: "white",
    height: "100%",
    marginRight: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  infoContainer: {
    flex: 1,
    padding: 4
  },
  greeting: {
    fontSize: 13,
    color: "#f5f5f5",
    marginRight: 5
  },
  userName: {
    fontSize: 23,
    fontWeight: "700",
    color: "white",
    marginTop: -5,
  },
  userDetails: {
    fontSize: 14,
    color: "white",
    marginTop: 2,
    fontWeight: "500",
    marginTop: 10,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 8,
  },
});
