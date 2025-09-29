// screens/SubjectDashboard.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import BASE_URL from "../../../config/baseURL";
import { useAuth } from "../../../context/authContext";

export default function SubjectDashboard() {
  const route = useRoute();
  const { subjectName, subjectMasterId, grade, section } = route.params || {};
  const { logout } = useAuth()

  const [activeTab, setActiveTab] = useState("Chapters");
  const [chapters, setChapters] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("📦 Received params in SubjectDashboard:", route.params);

    if (!route.params?.subjectMasterId || !route.params?.grade || !route.params?.section) {
      console.error("❌ Missing required params:", {
        grade: route.params?.grade,
        section: route.params?.section,
        subjectMasterId: route.params?.subjectMasterId,
      });
      return;
    }

    fetchChapters();
  }, [route.params]);

  const fetchChapters = async () => {
    try {
      if (!subjectMasterId || !grade || !section) {
        Alert.alert("Error", "Missing subject/class/section details.");
        return;
      }

      const url = `${BASE_URL}/api/chapters?subjectMasterId=${subjectMasterId}&classAssigned=${grade}&section=${section}`;
      console.log("🔍 Fetching chapters from:", url);

      setLoading(true);
      const res = await fetch(url);

      if (!res.ok) throw new Error(`Failed: ${res.status}`);

      const data = await res.json();
      console.log("✅ Chapters response:", data);

      if (Array.isArray(data)) {
        setChapters(data);

        // 🔹 Extract announcements (PDFs)
        const pdfAnnouncements = data.flatMap((chapter) =>
          (chapter.resources || [])
            .filter((r) => r.type === "pdf")
            .map((r) => ({
              _id: r._id,
              subject: subjectName,
              chapter: chapter.chapterName,
              filename: r.filename,
              pdfUrl: `${BASE_URL}/api/chapters/${chapter._id}/resources/${r._id}/pdf`,
            }))
        );

        setAnnouncements(pdfAnnouncements);
      } else {
        console.warn("⚠️ Unexpected response format:", data);
      }
    } catch (err) {
      Alert.alert("Error", err.message);
      console.error("❌ Error fetching chapters:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderChapter = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellNumber}>
        <Text style={styles.cellText}>{item.chapterNumber}</Text>
      </View>
      <View style={styles.cellName}>
        <Text style={styles.cellText}>{item.chapterName}</Text>
      </View>
      <View style={styles.cellDesc}>
        <Text style={styles.cellText}>{item.description || "No description"}</Text>
      </View>
    </View>
  );

  const renderAnnouncement = ({ item }) => (
    <View style={styles.announcementCard}>
      <Text style={styles.announcementTitle}>
        📘 {item.subject} - {item.chapter}
      </Text>
      <Text style={styles.announcementFile}>{item.filename}</Text>
      <TouchableOpacity
        style={styles.pdfButton}
        onPress={() => Linking.openURL(item.pdfUrl)}
      >
        <Text style={styles.pdfButtonText}>📄 View PDF</Text>
      </TouchableOpacity>
    </View>
  );

  if (!subjectMasterId || !grade || !section) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          ❌ Missing required subject details. Please check navigation params.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a5275" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{subjectName || "Subject"}</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Chapters" && styles.activeTab]}
          onPress={() => setActiveTab("Chapters")}
        >
          <Text
            style={activeTab === "Chapters" ? styles.activeText : styles.inactiveText}
          >
            Chapters
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Announcement" && styles.activeTab]}
          onPress={() => setActiveTab("Announcement")}
        >
          <Text
            style={
              activeTab === "Announcement" ? styles.activeText : styles.inactiveText
            }
          >
            Announcements
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === "Chapters" ? chapters : announcements}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={activeTab === "Chapters" ? renderChapter : renderAnnouncement}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            No {activeTab.toLowerCase()} available.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bbdbfaff", paddingHorizontal: 12, paddingTop: 20 },
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#0b6bd8ff",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#e0edf5",
    borderRadius: 10,
    overflow: "hidden",
  },
  tabButton: { flex: 1, padding: 12, alignItems: "center" },
  activeTab: { backgroundColor: "#4a90e2" },
  activeText: { color: "white", fontWeight: "bold" },
  inactiveText: { color: "#333", fontWeight: "bold" },

  // Table styles
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000000ff",
    backgroundColor: "#f9f9f9",
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  headerRow: {
    backgroundColor: "#0a5275",
    borderRadius: 6,
  },
  cellNumber: { flex: 1, justifyContent: "center", alignItems: "center" },
  cellName: { flex: 2, justifyContent: "center", paddingHorizontal: 6 },
  cellDesc: { flex: 3, justifyContent: "center", paddingHorizontal: 6 },
  cellText: { fontSize: 14, color: "#333" },
  headerText: { color: "white", fontWeight: "bold" },

  // Announcements styles
  announcementCard: {
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#cce7ff",
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#0a5275",
  },
  announcementFile: {
    fontSize: 14,
    marginBottom: 8,
    color: "#444",
  },
  pdfButton: {
    backgroundColor: "#0a5275",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  pdfButtonText: { color: "#fff", fontWeight: "bold" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
