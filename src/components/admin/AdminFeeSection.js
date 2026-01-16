// src/components/admin/AdminFeeSection.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import RNPickerSelect from "react-native-picker-select";

const boards = ["CBSE", "STATE"];
const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const sections = ["A", "B", "C", "D"];
const academicYears = ["2024-2025", "2025-2026", "2026-2027"];

export default function AdminFeeSection({
  selectedBoard,
  setSelectedBoard,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  academicYear,
  setAcademicYear,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Fees Management</Text>

      <View style={styles.dropdownContainer}>
        {/* Board */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Board</Text>
          <RNPickerSelect
            onValueChange={setSelectedBoard}
            value={selectedBoard}
            items={boards.map((b) => ({ label: b, value: b }))}
            placeholder={{ label: "Select Board", value: null }}
            style={pickerSelectStyles}
          />
        </View>

        {/* Class */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Class</Text>
          <RNPickerSelect
            onValueChange={setSelectedClass}
            value={selectedClass}
            items={classes.map((c) => ({ label: c, value: c }))}
            placeholder={{ label: "Select Class", value: null }}
            style={pickerSelectStyles}
          />
        </View>

        {/* Section */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Section</Text>
          <RNPickerSelect
            onValueChange={setSelectedSection}
            value={selectedSection}
            items={sections.map((s) => ({ label: s, value: s }))}
            placeholder={{ label: "Select Section", value: null }}
            style={pickerSelectStyles}
          />
        </View>

        {/* Academic Year */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Academic Year</Text>
          <RNPickerSelect
            onValueChange={setAcademicYear}
            value={academicYear}
            items={academicYears.map((y) => ({ label: y, value: y }))}
            placeholder={{ label: "Select Year", value: null }}
            style={pickerSelectStyles}
          />
        </View>
      </View>
    </View>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  inputAndroid: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
});

const styles = StyleSheet.create({
  container: { padding: 15 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },

  dropdownContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pickerContainer: { width: "48%", marginBottom: 12 },
  pickerLabel: { marginBottom: 6, fontWeight: "600" },
});
