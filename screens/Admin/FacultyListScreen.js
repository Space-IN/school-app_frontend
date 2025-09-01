// screens/Admin/FacultyListScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import BASE_URL from "../../config/baseURL";

const FacultyListScreen = ({ route, navigation }) => {
  const { classId, section } = route.params; // passed from previous screen
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/subject/subjects/class/${classId}/section/${section}`
        );
        // Keep both facultyId and subjectName
        const facultyData = res.data.map((item) => ({
          id: item.facultyId,
          subject: item.subjectName || item.subjectMasterId?.name || "N/A",
        }));
        setFaculty(facultyData);
      } catch (error) {
        console.error("Error fetching faculty:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [classId, section]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Faculty for Class {classId} - {section}
      </Text>
      <FlatList
        data={faculty}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("FacultyScore", {
                facultyId: item.id,
                classId: classId,        // ✅ Pass class
                section: section,        // ✅ Pass section
                subjectName: item.subject // ✅ Pass subject for display
              })
            }
          >
            <Ionicons name="person-circle-outline" size={36} color="#007bff" />
            <View style={styles.cardText}>
              <Text style={styles.facultyId}>Faculty ID: {item.id}</Text>
              <Text style={styles.subject}>Subject: {item.subject}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#888" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No faculty found for this class.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
  },
  facultyId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  subject: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  emptyText: { fontSize: 16, color: "#888" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default FacultyListScreen;