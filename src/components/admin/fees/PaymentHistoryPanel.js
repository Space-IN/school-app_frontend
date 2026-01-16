import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PaymentHistoryPanel({ history = [] }) {
  if (!history.length) {
    return (
      <Text style={styles.emptyText}>
        No payment history available.
      </Text>
    );
  }

  const sorted = [...history].sort(
    (a, b) => new Date(b.paidOn) - new Date(a.paidOn)
  );

  return (
    <View style={styles.container}>
      {sorted.map((h, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.amount}>₹{h.amountPaid}</Text>
            <Text style={styles.mode}>{h.paymentMode}</Text>
          </View>

          <Text style={styles.meta}>
            Installment {h.installmentOrder}
          </Text>

          <Text style={styles.date}>
            {new Date(h.paidOn).toLocaleString()}
          </Text>

          {h.remarks ? (
            <Text style={styles.remarks}>“{h.remarks}”</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },

  card: {
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  amount: {
    fontSize: 16,
    fontWeight: "700",
  },

  mode: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#e0e7ff",
  },

  meta: {
    marginTop: 4,
    color: "#4b5563",
  },

  date: {
    fontSize: 12,
    color: "#6b7280",
  },

  remarks: {
    marginTop: 6,
    fontStyle: "italic",
  },

  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 10,
  },
});
