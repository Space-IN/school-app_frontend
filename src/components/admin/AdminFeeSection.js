import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import RNPickerSelect from "react-native-picker-select";

const boards = ["CBSE", "State"];
const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const sections = ["A", "B", "C", "D"];

export default function AdminFeeSection({
  students = [],
  onSelect,
  selectedBoard,
  setSelectedBoard,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
}) {
  // Safety: ensure students is always an array
  const safeStudents = Array.isArray(students) ? students : [];

  const filtered = safeStudents.filter(
    (s) =>
      String(s.className).trim() === String(selectedClass).trim() &&
      String(s.section).trim() === String(selectedSection).trim()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Fees Management</Text>

      <View style={styles.dropdownContainer}>
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
      </View>

      {selectedClass && selectedSection ? (
        filtered.length > 0 ? (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item?.id || Math.random().toString()}
            ListHeaderComponent={
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeadText}>Name</Text>
                <Text style={styles.tableHeadText}>User ID</Text>
                <Text style={styles.tableHeadText}>Total Fee</Text>
              </View>
            }
            renderItem={({ item }) =>
              item ? (
                <TouchableOpacity onPress={() => onSelect(item)}>
                  <View style={styles.row}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.id}>{item.userId}</Text>
                    <Text style={styles.fee}>₹{item.totalFee ?? 0}</Text>
                  </View>
                </TouchableOpacity>
              ) : null
            }
          />
        ) : (
          <Text style={styles.infoText}>There is no student in this class.</Text>
        )
      ) : (
        <Text style={styles.infoText}>Please select class & section.</Text>
      )}
    </View>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  inputAndroid: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  header: { fontSize: 20, fontWeight: "700", marginBottom: 15 },

  dropdownContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },

  pickerContainer: { flex: 1, marginHorizontal: 5 },

  pickerLabel: { marginBottom: 5, fontWeight: "600" },

  tableHeader: { flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "#eee" },

  tableHeadText: { fontWeight: "700" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
  },

  name: { width: "40%" },
  id: { width: "30%" },
  fee: { width: "30%", textAlign: "right" },

  infoText: { textAlign: "center", marginTop: 40, color: "#777" },

  uploadConfirmBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
});
