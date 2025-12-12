// screens/Admin/FacultyListScreen.js 
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
 
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from '@env';
import { api } from '../../../api/api';

const FacultyListScreen = ({ route, navigation }) => {
  const { classId, section } = route.params; // passed from previous screen
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await api.get(
          `${BASE_URL}/api/admin/schedule/class/${classId}/section/${section}/subjects-with-faculty`
        );

        console.log("API Response 👉", res.data);

        // ✅ Corrected: access res.data.subjects
        const facultyList =
          res.data && Array.isArray(res.data.subjects)
            ? res.data.subjects.map((item) => ({
                id: item.facultyId || "N/A",
                name: item.facultyName || "Unknown Faculty",
                subject:
                  item.subjectName ||
                  item.subjectMasterId?.name ||
                  "N/A",
              }))
            : [];

        setFaculty(facultyList);
      } catch (error) {
        console.error("❌ Error fetching faculty:", error);
        setFaculty([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [classId, section]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Highlighted Class & Section */}
      <View style={styles.headerBox}>
        <Text style={styles.headerText}>Class {classId}</Text>
        <Text style={styles.headerText}>Section {section}</Text>
      </View>

      <FlatList
        data={faculty}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("FacultyScore", {
                facultyId: item.id,
                classId: classId,
                section: section,
                subjectName: item.subject,
              })
            }
          >
            <Ionicons
              name="person-circle-outline"
              size={36}
              color="#007bff"
            />
            <View style={styles.cardText}>
              {/* Faculty Name as main heading */}
              <Text style={styles.facultyName}>{item.name}</Text>
              {/* Faculty ID + Subject as subheading */}
              <Text style={styles.subText}>
                ID: {item.id} | Subject: {item.subject}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No faculty found for this class.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ffffffff" },

  headerBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    backgroundColor: "#faebebff",
    paddingVertical: 12,
    borderRadius: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginHorizontal: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faebebff",
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
  facultyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  emptyText: { fontSize: 16, color: "#888" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default FacultyListScreen;
