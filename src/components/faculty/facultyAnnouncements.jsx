// src/components/faculty/facultyAnnouncements.jsx
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import axios from "axios";
import { BASE_URL } from "@env";

export default function FacultyAnnouncements() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/announcement/`);
        // Filter for faculty or all
        const facultyNotices = res.data.filter(
          (notice) => notice.target === "all" || notice.target === "faculty"
        );
        setNotices(facultyNotices);
      } catch (err) {
        console.error("Error fetching notices:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Announcements</Text>
      <FlatList
        data={notices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>{item.title}</Text>
            <Text style={styles.noticeDesc}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  noticeCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4e54c8",
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  noticeDesc: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
});
