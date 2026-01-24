// src/components/faculty/facultyAnnouncements.jsx
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Foundation from "@expo/vector-icons/Foundation";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
 

import { api } from "../../api/api";

export default function FacultyAnnouncements() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get(`/api/announcement/active/`);
        // Filter for faculty or all
        const facultyNotices = res.data.filter(
          (notice) => notice.target === "all" || notice.target === "faculty"
        );
        setNotices(facultyNotices);
      } catch (err) {
        console.error("Error fetching notices:", err.message);
        setErr("Failed to load announcements. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Foundation name="megaphone" size={21} color="white" />
        <Text style={styles.heading}>FACULTY ANNOUNCEMENTS</Text>
      </View>

      <View style={styles.announcementsContainer}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#9c1006" />
            <Text style={styles.loadingText}>Loading announcements...</Text>
          </View>
        ) : err ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{err}</Text>
          </View>
        ) : notices.length === 0 ? (
          <View style={styles.noDataCard}>
            <Text style={styles.noData}>No notices available</Text>
          </View>
        ) : (
          notices.map((item) => (
            <View style={styles.card} key={item._id}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="calendar-day" size={12} color="#64748b" />
                <Text style={styles.date}>
                  {new Date(item.date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.message}</Text>
            </View>
          ))
        )}

        <LinearGradient
          colors={["transparent", "#f8f8f8"]}
          style={styles.bottomFade}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "95%",
    alignSelf: "center",
    borderRadius: 16,
    backgroundColor: "#fff",
    marginVertical: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    backgroundColor: "#ac1d1dff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  heading: {
    fontWeight: "700",
    fontSize: 16,
    color: "white",
  },
  announcementsContainer: {
    backgroundColor: "#f8f8f8",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#f5f5f5ff",
    borderLeftWidth: 4,
    borderLeftColor: "#9c1006",
    borderRadius: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  date: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    color: "#101c2e",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  bottomFade: {
    height: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 8,
  },
  errorCard: {
    alignItems: "center",
    padding: 10,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
  },
  noDataCard: {
    alignItems: "center",
    padding: 10,
  },
  noData: {
    color: "#64748b",
    fontSize: 14,
  },
});
