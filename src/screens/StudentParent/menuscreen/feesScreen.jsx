
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export default function FeesScreen() {
  const feeDetails = {
    tuition: 'N/A',
    hostel: 'N/A',
    transport: 'N/A',
    other: 'N/A',
    total: 'N/A'
  };

  return (
    <View
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Fees Details</Text>
        
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.feeRow}>
              <Text style={styles.feeType}>Tuition Fee</Text>
              <Text style={styles.feeAmount}>{feeDetails.tuition}</Text>
            </View>
            <View style={styles.separator} />
            
            <View style={styles.feeRow}>
              <Text style={styles.feeType}>Hostel Fee</Text>
              <Text style={styles.feeAmount}>{feeDetails.hostel}</Text>
            </View>
            <View style={styles.separator} />
            
            <View style={styles.feeRow}>
              <Text style={styles.feeType}>Transport Fee</Text>
              <Text style={styles.feeAmount}>{feeDetails.transport}</Text>
            </View>
            <View style={styles.separator} />
            
            <View style={styles.feeRow}>
              <Text style={styles.feeType}>Other Fees</Text>
              <Text style={styles.feeAmount}>{feeDetails.other}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, styles.totalCard]}>
          <Card.Content>
            <View style={styles.feeRow}>
              <Text style={[styles.feeType, styles.totalText]}>Total Fees</Text>
              <Text style={[styles.feeAmount, styles.totalText]}>{feeDetails.total}</Text>
            </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8f1b1bff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  totalCard: {
    backgroundColor: '#8f1b1bff',
    paddingHorizontal: 10
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  feeType: {
    fontSize: 16,
    color: '#475569',
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8f1b1bff',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  note: {
    textAlign: 'center',
    color: '#475569',
    marginTop: 20,
  },
});
