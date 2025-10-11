import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Pressable, Animated, ActivityIndicator } from "react-native"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useNavigation } from "@react-navigation/native"

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Good Morning"
  else if (hour >= 12 && hour < 17) return "Good Afternoon"
  else return "Good Evening"
};

export default function UserBanner({ studentData, loading }) {
  const [greeting, setGreeting] = useState(getGreeting())
  const scaleAnim = new Animated.Value(1)
  const navigation = useNavigation()


  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => navigation.navigate("Profile"))
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user-circle-o" size={65} color="white" />
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#9c1006" />
        ) : (
          <View style={styles.infoContainer}>
              <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" }}>
                  <Text style={styles.greeting}>{greeting},</Text>
                  <Text style={styles.userName}>{studentData?.name?.toUpperCase() || <ActivityIndicator size="small" color="#9c1006" />}</Text>
                  <View style={styles.divider} />
              </View>
            <Text style={styles.userDetails}>
              ID: {studentData?.userId} | Class: "{studentData?.className}" | Section: "{studentData?.section}"
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#475569",
    width: "97%",
    alignSelf: "center",
    borderRadius: 12,
    padding: 15,
    height: 120
  },
  avatarContainer: {
    width: "25%",
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
    marginTop: -2,
  },
  userDetails: {
    fontSize: 12,
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
    marginTop: 3,
  },
});
