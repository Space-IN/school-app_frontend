import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';

export default function FeesScreen() {
  const feeDetails = {
    total: "N/A",
    paid: "N/A",
    pending: "N/A",
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Fees Summary</Text>

        <View style={styles.row}>
          
          <Card style={[styles.card, styles.smallCard]}>
            <Card.Content>
              <Text style={styles.label}>Amount Paid</Text>
              <Text style={[styles.value, styles.paid]}>{feeDetails.paid}</Text>
            </Card.Content>
          </Card>

          
          <Card style={[styles.card, styles.smallCard]}>
            <Card.Content>
              <Text style={[styles.label, styles.pendingText]}>Pending Amount</Text>
              <Text style={[styles.value, styles.pendingText]}>{feeDetails.pending}</Text>
            </Card.Content>
          </Card>
        </View>

        
        <Card style={styles.totalCard}>
          <Card.Content>
            <Text style={[styles.label, styles.totalLabel]}>Total Fees</Text>
            <Text style={[styles.value, styles.totalLabel]}>{feeDetails.total}</Text>
          </Card.Content>
        </Card>

        <Text style={styles.note}>* All amounts are in INR (₹)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollViewContent: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8f1b1bff",
    marginBottom: 25,
    textAlign: "center",
  },

  
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  smallCard: {
    width: "48%",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 3,
    paddingVertical: 10,
  },

  label: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 5,
  },

  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8f1b1bff",
  },

  paid: {
    color: "green",
  },

  pendingText: {
    color: "red",
    fontWeight: "bold",
  },

  
  totalCard: {
    backgroundColor: "#8f1b1bff",
    borderRadius: 12,
    paddingVertical: 10,
    elevation: 3,
  },

  totalLabel: {
    color: "white",
    fontWeight: "bold",
  },

  note: {
    textAlign: "center",
    color: "#475569",
    marginTop: 15,
  },
});
