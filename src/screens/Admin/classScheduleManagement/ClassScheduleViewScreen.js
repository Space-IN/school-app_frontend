import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import axios from "axios";
import { BASE_URL } from '@env';
import { Picker } from "@react-native-picker/picker";
import {api} from '../../../api/api'


export default function ClassScheduleViewScreen() {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchSchedule(selectedClass, selectedSection);
    } else {
      setSchedule([]);
    }
  }, [selectedClass, selectedSection]);

  const fetchAssignedClasses = async () => {
    try {
      const res = await api.get(`${BASE_URL}/api/subject/assigned-classes`);
      console.log("✅ Class list fetched:", res.data);
      setClassList(res.data || []);
    } catch (err) {
      console.error("❌ Error loading class list:", err);
    }
  };

  const fetchSchedule = async (classAssigned, section) => {
    try {
      setLoading(true);
      const encodedClass = encodeURIComponent(classAssigned.trim());
      const encodedSection = encodeURIComponent(section.trim());
      const url = `${BASE_URL}/api/schedule/class/${encodedClass}/section/${encodedSection}`;
      const res = await api.get(url);
      console.log("📅 Schedule data:", res.data);
      setSchedule(res.data.weeklySchedule || []);
    } catch (err) {
      console.error(
        "❌ Error fetching schedule:",
        err.message,
        err.response?.data
      );
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not fetch schedule"
      );
    } finally {
      setLoading(false);
    }
  };

  const uniqueClasses = [...new Set(classList.map((i) => i.classAssigned))];
  const sectionsForClass = classList
    .filter((i) => i.classAssigned === selectedClass)
    .map((i) => i.section);
  const uniqueSections = [...new Set(sectionsForClass)];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📘 View Class Schedule</Text>

        <Text style={styles.label}>Select Class:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedClass}
            style={styles.picker}
            onValueChange={(val) => {
              setSelectedClass(val);
              setSelectedSection("");
              setSchedule([]);
            }}
          >
            <Picker.Item label="Select Class" value="" />
            {uniqueClasses.map((cls, idx) => (
              <Picker.Item key={idx} label={cls} value={cls} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Select Section:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedSection}
            style={styles.picker}
            onValueChange={(val) => setSelectedSection(val)}
          >
            <Picker.Item label="Select Section" value="" />
            {uniqueSections.map((sec, idx) => (
              <Picker.Item key={idx} label={sec} value={sec} />
            ))}
          </Picker>
        </View>
      </View>

      <ScrollView style={styles.scrollSection}>
        {loading ? (
          <Text style={styles.infoText}>⏳ Loading schedule...</Text>
        ) : schedule.length === 0 ? (
          selectedClass && selectedSection ? (
            <Text style={styles.infoText}>📭 No schedule available.</Text>
          ) : (
            <Text style={styles.infoText}>
              ℹ️ Please select class and section.
            </Text>
          )
        ) : (
          schedule.map((dayObj, index) => (
            <View key={index} style={styles.dayBlock}>
              <Text style={styles.dayTitle}>{dayObj.day}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.table}>

                 <View style={styles.tableRow}>
  <View style={[styles.cell, styles.headerCell, styles.col1]}>
    <Text style={styles.headerText}>Period NO</Text>
  </View>
  <View style={[styles.cell, styles.headerCell, styles.col2]}>
    <Text style={styles.headerText}>Time</Text>
  </View>
  <View style={[styles.cell, styles.headerCell, styles.col3]}>
    <Text style={styles.headerText}>Subject</Text>
  </View>
  <View style={[styles.cell, styles.headerCell, styles.col4]}>
    <Text style={styles.headerText}>Faculty</Text>
  </View>
</View>


                  {dayObj.periods.map((period, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <View style={[styles.cell, styles.col1]}>
                        <Text style={styles.cellText}>{period.periodNumber}</Text>
                      </View>
                      <View style={[styles.cell, styles.col2]}>
                        <Text style={styles.cellText}>{period.timeSlot}</Text>
                      </View>
                      <View style={[styles.cell, styles.col3]}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cellText}>
                          {period.subjectName || 'N/A'}
                            {/* period.subjectMasterId}
                        </Text>
                      </View>
                      <View style={[styles.cell, styles.col3]}>
  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cellText}>
    {period.subjectName || 'N/A'} */}
  </Text>
</View>

<View style={[styles.cell, styles.col4]}>
  {period.facultyNames?.length ? (
    period.facultyNames.map((name, i) => (
      <Text key={i} style={styles.cellText}>
        {name}
      </Text>
    ))
  ) : (
    <Text style={styles.cellText}>N/A</Text>
  )}
</View>


                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    zIndex: 10,
  },
  scrollSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1d4ed8",
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
    color: "#111827",
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  infoText: {
    marginTop: 20,
    color: "#6b7280",
    textAlign: "center",
  },
  dayBlock: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    overflow: "hidden",
    elevation: 2,
  },
  dayTitle: {
    backgroundColor: "#e0f2fe",
    fontWeight: "bold",
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#1e40af",
    borderBottomWidth: 1,
    borderColor: "#cbd5e1",
  },
  table: {
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: "#d1d5db",
  },

  tableRow: {
    flexDirection: "row",
    flexWrap: "nowrap", // prevents line breaks
    minWidth: 500, // force horizontal scroll container width
  },

  cell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    fontSize: 14,
    color: "#111827",
    textAlign: "center",
    backgroundColor: "#ffffff",
    flexShrink: 0,
    minHeight: 50, // ✅ Ensures consistent height
    overflow: "hidden", // ✅ Avoids extra wrapping
    justifyContent: "center",
    alignItems: "center",
  },
 cellText: {
  fontSize: 14,
  color: '#111827',
  textAlign: 'center',
},

  headerCell: {
  backgroundColor: "#f3f4f6",
  borderRightWidth: 1,
  borderBottomWidth: 1,
  borderColor: "#d1d5db",
  justifyContent: "center",
  alignItems: "center",
},

headerText: { 
fontSize:15,
fontWeight: 'bold',
  textAlign: 'center',
  color:'#173ca2ff',

},


  col1: { width: 70 },
  col2: { width: 110 },
  col3: { width: 180 },
  col4: { width: 160 },
});
