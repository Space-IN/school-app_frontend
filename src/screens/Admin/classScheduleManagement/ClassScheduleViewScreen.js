import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "../../../api/api";

export default function ClassScheduleViewScreen() {
  const [classList, setClassList] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  useEffect(() => {
    if (selectedBoard && selectedClass && selectedSection) {
      fetchSchedule(selectedClass, selectedSection, selectedBoard);
    } else {
      setSchedule([]);
    }
  }, [selectedBoard, selectedClass, selectedSection]);

  const fetchAssignedClasses = async () => {
    try {
      const res = await api.get(`/api/admin/subject/assigned-classes`);
      setClassList(res.data || []);
    } catch (err) {
      console.error("Error loading class list:", err);
    }
  };

  const fetchSchedule = async (cls, section, board) => {
    try {
      setLoading(true);
      const url = `/api/student/schedule/class/${cls}/section/${section}/board/${board}`;
      const res = await api.get(url);
      setSchedule(res.data.weeklySchedule || []);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not fetch schedule"
      );
    } finally {
      setLoading(false);
    }
  };

  const uniqueClasses = [...new Set(classList.map(i => i.classAssigned))];
  const uniqueSections = [
    ...new Set(
      classList
        .filter(i => i.classAssigned === selectedClass)
        .map(i => i.section)
    ),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterCard}>
        <Text style={styles.title}>Class Schedule</Text>

        <View style={styles.row}>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedBoard}
              onValueChange={(val) => {
                setSelectedBoard(val);
                setSelectedClass("");
                setSelectedSection("");
              }}
            >
              <Picker.Item label="Board" value="" />
              <Picker.Item label="STATE" value="STATE" />
              <Picker.Item label="CBSE" value="CBSE" />
            </Picker>
          </View>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedClass}
              onValueChange={(val) => {
                setSelectedClass(val);
                setSelectedSection("");
              }}
            >
              <Picker.Item label="Class" value="" />
              {uniqueClasses.map((cls, idx) => (
                <Picker.Item key={idx} label={cls} value={cls} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedSection}
              onValueChange={setSelectedSection}
            >
              <Picker.Item label="Section" value="" />
              {uniqueSections.map((sec, idx) => (
                <Picker.Item key={idx} label={sec} value={sec} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      <ScrollView style={styles.scheduleArea}>
        {loading ? (
          <ActivityIndicator size="large" color="#ac1d1dff" />
        ) : schedule.length === 0 ? (
          <Text style={styles.infoText}>
            {selectedBoard && selectedClass && selectedSection
              ? "No schedule available"
              : "Select board, class and section"}
          </Text>
        ) : (
          schedule.map((dayObj, index) => (
            <View key={index} style={styles.dayCard}>
              <Text style={styles.dayTitle}>{dayObj.day}</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.cell, styles.colPeriod]}>Period</Text>
                    <Text style={[styles.cell, styles.colTime]}>Time</Text>
                    <Text style={[styles.cell, styles.colSubject]}>Subject</Text>
                    <Text style={[styles.cell, styles.colFaculty]}>Faculty</Text>
                  </View>

                  {dayObj.periods.map((period, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <Text style={[styles.cell, styles.colPeriod]}>
                        {period.periodNumber}
                      </Text>
                      <Text style={[styles.cell, styles.colTime]}>
                        {period.timeSlot}
                      </Text>
                      <Text style={[styles.cell, styles.colSubject]}>
                        {period.subjectName || "N/A"}
                      </Text>
                      <Text style={[styles.cell, styles.colFaculty]}>
                        {period.facultyNames?.join(", ") || "N/A"}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  filterCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ac1d1dff",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ac1d1dff",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  pickerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ac1d1dff",
    borderRadius: 8,
    overflow: "hidden",
  },

  scheduleArea: {
    flex: 1,
    padding: 12,
  },

  infoText: {
    textAlign: "center",
    marginTop: 40,
    color: "#000000",
  },

  dayCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  dayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ac1d1dff",
    marginBottom: 8,
  },

  tableHeader: {
    backgroundColor: "#fecaca",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#fecaca",
  },

  cell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
  },

  colPeriod: {
    width: 70,
    textAlign: "center",
    fontWeight: "600",
  },

  colTime: {
    width: 120,
  },

  colSubject: {
    width: 180,
  },

  colFaculty: {
    width: 220,
  },
});
