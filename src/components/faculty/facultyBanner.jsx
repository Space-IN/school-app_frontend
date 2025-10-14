// src/components/faculty/facultyBanner.jsx
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Image, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { BASE_URL } from "@env"; 

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  else if (hour >= 12 && hour < 17) return "Good Afternoon";
  else return "Good Evening";
};

export default function FacultyBanner({ navigation }) {
  const [greeting, setGreeting] = useState(getGreeting());
  const [facultyName, setFacultyName] = useState("Faculty");
  const [loading, setLoading] = useState(true);

  const scaleAnim = new Animated.Value(1);
  const { user } = useAuth();
  const facultyId = user?.userId || "UserID";

  
  useEffect(() => {
    const fetchFacultyName = async () => {
      if (!facultyId) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/faculty/${facultyId}`);
        setFacultyName(res.data?.name || "Faculty");
      } catch (err) {
        console.error("Error fetching faculty name:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFacultyName();
  }, [facultyId]);

 
  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate("FacultyProfileScreen");
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{facultyName}</Text>
          <View style={styles.divider} />
          <Text style={styles.details}>ID: {facultyId}</Text>
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
    height: 120,
  },
  avatarContainer: {
    width: "25%",
    height: "100%",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
  },
  infoContainer: {
    flex: 1,
    padding: 4,
  },
  greeting: {
    fontSize: 13,
    color: "#f5f5f5",
  },
  name: {
    fontSize: 23,
    fontWeight: "700",
    color: "white",
    marginTop: -5,
  },
  details: {
    fontSize: 14,
    color: "white",
    marginTop: 10,
    fontWeight: "500",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 6,
  },
});
