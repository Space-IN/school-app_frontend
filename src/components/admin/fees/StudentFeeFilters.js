import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StudentFeeFilters({
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
}) {
  const [open, setOpen] = useState(false);

  const StatusButton = ({ label, value, color }) => (
    <TouchableOpacity
      style={[
        styles.statusBtn,
        statusFilter === value && { backgroundColor: color },
      ]}
      onPress={() => setStatusFilter(value)}
    >
      <Text
        style={[
          styles.statusText,
          statusFilter === value && { color: "#fff" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <TextInput
          placeholder="Search by name or user ID"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

        <TouchableOpacity onPress={() => setOpen(!open)}>
          <Ionicons
            name="filter"
            size={22}
            color={open ? "#007bff" : "#555"}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {open && (
        <View style={styles.filterBox}>
          <StatusButton label="All" value="ALL" color="#6c757d" />
          <StatusButton label="Paid" value="PAID" color="#28a745" />
          <StatusButton label="Pending" value="PENDING" color="#dc3545" />
          <StatusButton label="Overdue" value="OVERDUE" color="#6f42c1" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: "#fff",
  },
  filterBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  statusBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusText: {
    fontWeight: "600",
    color: "#333",
  },
});
