import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "@env"
import { useStudent } from "../../../context/student/studentContext";
import StudentHeader from "../../../components/student/header";
import { useAuth } from "../../../context/authContext";


const StudentProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { studentData } = useStudent()
  const { logout } = useAuth()

  const fetchProfile = async () => {
    try {
      if (studentData) {
        const userId = studentData.userId;
        const response = await axios.get(
          `${BASE_URL}/api/admin/students/${userId}`
        );
        setProfile(response.data);
      }
    } catch (err) {
      console.error("❌ Error loading profile:", err);
      Alert.alert("Error", "Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => logout() },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 10, color: "#333" }}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "red" }}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <StudentHeader></StudentHeader>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🪪 Student ID Card */}
        <LinearGradient colors={["#c01e12ff", "#fad368ff"]} style={styles.idCard}>
          {/* Top Section: Icon + Basic Info */}
          <View style={styles.topRow}>
            <Ionicons name="person-circle-outline" size={70} color="#fff" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.studentName}>{profile.name || "N/A"}</Text>
              <Text style={styles.classText}>
                {profile.className || "N/A"} - {profile.section || "N/A"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Section */}
          <View style={styles.infoSection}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{profile.gender || "N/A"}</Text>
              <Text style={styles.label}>DOB:</Text>
              <Text style={styles.value}>
                {profile.dob?.split("T")[0] || "N/A"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Roll No:</Text>
              <Text style={styles.value}>{profile.rollNo || "N/A"}</Text>
              <Text style={styles.label}>Admission No:</Text>
              <Text style={styles.value}>
                {profile.admissionNumber || "N/A"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={16} color="#fff" />
              <Text style={[styles.value, { marginRight: 15 }]}>
                {profile.fatherContact || "N/A"}
              </Text>

              <MaterialIcons name="email" size={16} color="#fff" />
              <Text style={styles.value}>{profile.fatherEmail || "N/A"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={[styles.value, { flex: 1 }]}>
                {profile.address || "N/A"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Parent Section */}
        <View style={styles.parentSection}>
          <Text style={styles.parentHeader}>Parent / Guardian Details</Text>
          <View style={styles.parentCard}>
            <Text style={styles.parentRole}>Father</Text>
            <Text style={styles.parentName}>{profile.fatherName || "N/A"}</Text>
            <Text style={styles.parentDetail}>
              Occupation: {profile.fatherOccupation || "N/A"}
            </Text>
            <Text style={styles.parentDetail}>
              Contact: {profile.fatherContact || "N/A"}
            </Text>
            <Text style={styles.parentDetail}>
              Email: {profile.fatherEmail || "N/A"}
            </Text>
          </View>
          <View style={styles.parentCard}>
            <Text style={styles.parentRole}>Mother</Text>
            <Text style={styles.parentName}>{profile.motherName || "N/A"}</Text>
            <Text style={styles.parentDetail}>
              Occupation: {profile.motherOccupation || "N/A"}
            </Text>
            <Text style={styles.parentDetail}>
              Contact: {profile.motherContact || "N/A"}
            </Text>
            <Text style={styles.parentDetail}>
              Email: {profile.motherEmail || "N/A"}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffffff",
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { padding: 20, paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },


  idCard: {
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginVertical: 10,
  },
  infoSection: { marginTop: 5 },
  studentName: { fontSize: 20, fontWeight: "700", color: "#fff" },
  classText: { fontSize: 14, color: "#fefefe" },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "nowrap",
    justifyContent: "flex-start",
  },
  label: { fontWeight: "800", color: "#fff", marginRight: 5 },
  value: { color: "#fff", fontWeight: "400", marginRight: 15 },

  
  parentSection: { marginTop: 10 },
  parentHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 12,
  },
  parentCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  parentName: { fontSize: 18, fontWeight: "700", color: "#1e40af" },
  parentRole: { fontSize: 20, color: "#000000ff", marginBottom: 8 },
  parentDetail: { fontSize: 15, color: "#111827", marginBottom: 3 },

  
  logoutButton: {
    backgroundColor: "#f12a2aff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
