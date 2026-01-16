import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function StudentFeeCard({ student, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {student.name}
        </Text>
        <Text style={styles.userId}>
          {student.userId}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Fee Summary */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>₹{student.totalFee}</Text>
        </View>

        <View style={styles.col}>
          <Text style={styles.label}>Paid</Text>
          <Text style={styles.paid}>₹{student.totalPaid ?? 0}</Text>
        </View>

        <View style={styles.col}>
          <Text style={styles.label}>Pending</Text>
          <Text style={styles.pending}>₹{student.totalPending ?? 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },

  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  userId: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    alignItems: "center",
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#777",
  },
  total: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginTop: 2,
  },
  paid: {
    fontSize: 14,
    fontWeight: "700",
    color: "#28a745",
    marginTop: 2,
  },
  pending: {
    fontSize: 14,
    fontWeight: "700",
    color: "#dc3545",
    marginTop: 2,
  },
});
