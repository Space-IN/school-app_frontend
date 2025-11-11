import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/authContext"; 
import { BASE_URL } from "@env"

export default function FacultyTodaySchedule({ navigation }) {
  const { decodedToken } = useAuth();              
  const facultyId = decodedToken?.userId;           
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        console.log("Fetching schedule for facultyId:", facultyId);
        const res = await axios.get(`${BASE_URL}/api/schedule/faculty/${facultyId}`);
        setSchedule(res.data?.schedule || []);
      } catch (err) {
        console.error("Error fetching schedule:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    if (facultyId) {
      fetchSchedule();
    } else {
      console.warn("No facultyId available yet in useAuth — will wait.");
      setLoading(false); 
    }
  }, [facultyId]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const todaySchedule = schedule.find(
    (d) =>
      d?.day?.toString().trim().toLowerCase() === today?.toString().trim().toLowerCase()
  );
  const periodsToday = todaySchedule?.periods || [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Schedule ({today})</Text>

      {periodsToday.length > 0 ? (
        <FlatList
          data={periodsToday}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View
              style={styles.card}
             
            >
              <View style={styles.cardContent}>
                <Text style={styles.subject}>{item.subjectMasterId?.name}</Text>
                <Text style={styles.time}>{item.timeSlot}</Text>
                <Text style={styles.classInfo}>
                  Class {todaySchedule.classAssigned} - {todaySchedule.section}
                </Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No classes scheduled for today</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#faebebff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  card: {
    backgroundColor: "#e0f2fe",
    borderRadius: 10,
    padding: 14,
    marginVertical: 6,
  },
  cardContent: { flexDirection: "column" },
  subject: { fontSize: 16, fontWeight: "700", color: "#1e3a8a" },
  time: { fontSize: 14, color: "#475569", marginTop: 4 },
  classInfo: { fontSize: 13, color: "#6b7280", marginTop: 3 },
  emptyContainer: { alignItems: "center", paddingVertical: 20 },
  emptyText: { color: "#6b7280", fontSize: 14 },
});
