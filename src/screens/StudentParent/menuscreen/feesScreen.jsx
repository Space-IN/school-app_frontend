import { BASE_URL } from '@env';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { useAuth } from "../../../context/authContext"; 
import { api } from '../../../api/api';

export default function FeesScreen() {
  const { decodedToken, accessToken } = useAuth();
  const [feeDetails, setFeeDetails] = useState({ total: 0, installments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("decoded token: ", accessToken)
    const fetchFees = async () => {
      if (!decodedToken?.preferred_username) {
        console.log("❌ No preferred_username found in decodedToken");
        setLoading(false);
        return;
      }

      try {
        const url = `${BASE_URL}/api/student/info/fees/${decodedToken.preferred_username}`;
        console.log("🌐 Fetching URL =", url);

        const response = await api.get(url);
        const data = response.data;

        console.log("🔵 Fee API Response:", data);

        const installments = [
          { id: 1, title: "Installment 1", amount: data.inst1Amount || 0, dueDate: data.inst1Due || "N/A", paid: 0, status: "Pending" },
          { id: 2, title: "Installment 2", amount: data.inst2Amount || 0, dueDate: data.inst2Due || "N/A", paid: 0, status: "Pending" },
          { id: 3, title: "Installment 3", amount: data.inst3Amount || 0, dueDate: data.inst3Due || "N/A", paid: 0, status: "Pending" },
        ];

        setFeeDetails({ total: data.totalFee || 0, installments });
      } catch (err) {
        console.error("❌ ERROR FETCHING FEES:", err);
        setFeeDetails({ total: 0, installments: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [decodedToken]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8f1b1bff" />
      </View>
    );
  }

  if (!feeDetails) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No fee details available.</Text>
      </View>
    );
  }

  const totalPaid = feeDetails.installments.reduce((sum, inst) => sum + inst.paid, 0);
  const totalPending = feeDetails.total - totalPaid;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'green';
      case 'Partially Paid': return 'orange';
      case 'Pending': return 'red';
      case 'Upcoming': return '#1976D2';
      default: return '#aaa';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Fees Summary</Text>

        <View style={styles.row}>
          <Card style={[styles.card, styles.smallCard]}>
            <Card.Content>
              <Text style={styles.label}>Amount Paid</Text>
              <Text style={[styles.value, styles.paid]}>{totalPaid}</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.card, styles.smallCard]}>
            <Card.Content>
              <Text style={[styles.label, styles.pendingText]}>Pending Amount</Text>
              <Text style={[styles.value, styles.pendingText]}>{totalPending}</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.totalCard}>
          <Card.Content>
            <Text style={[styles.label, styles.totalLabel]}>Total Fees</Text>
            <Text style={[styles.value, styles.totalLabel]}>{feeDetails.total}</Text>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Installments</Text>

        {feeDetails.installments.map((inst) => {
          const progressPercent = inst.amount ? (inst.paid / inst.amount) * 100 : 0;

          return (
            <Card key={inst.id} style={styles.installmentCard}>
              <Card.Content>
                <View style={styles.installmentHeader}>
                  <Text style={styles.installmentTitle}>{inst.title}</Text>
                  <Chip
                    style={{ backgroundColor: getStatusColor(inst.status) }}
                    textStyle={{ color: 'white', fontWeight: 'bold' }}
                  >
                    {inst.status}
                  </Chip>
                </View>

                <Text style={styles.instDetail}>Amount: ₹ {inst.amount}</Text>
                <Text style={styles.instDetail}>Due: {inst.dueDate}</Text>

                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPercent}%`, backgroundColor: getStatusColor(inst.status) },
                    ]}
                  />
                </View>

                <Text style={styles.progressText}>
                  Paid: ₹ {inst.paid} | Pending: ₹ {inst.amount - inst.paid}
                </Text>
              </Card.Content>
            </Card>
          );
        })}

        <Text style={styles.note}>* All amounts are in INR (₹)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollViewContent: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#8f1b1bff', marginBottom: 25, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  smallCard: { width: '48%' },
  card: { backgroundColor: 'white', borderRadius: 12, elevation: 3, paddingVertical: 10 },
  label: { fontSize: 15, color: '#475569', marginBottom: 5 },
  value: { fontSize: 20, fontWeight: 'bold', color: '#8f1b1bff' },
  paid: { color: 'green' },
  pendingText: { color: 'red', fontWeight: 'bold' },
  totalCard: { backgroundColor: '#8f1b1bff', borderRadius: 12, paddingVertical: 10, elevation: 3, marginBottom: 20 },
  totalLabel: { color: 'white', fontWeight: 'bold' },
  note: { textAlign: 'center', color: '#475569', marginTop: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginVertical: 15 },
  installmentCard: { marginBottom: 15, borderRadius: 12, elevation: 3 },
  installmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  installmentTitle: { fontSize: 16, fontWeight: 'bold' },
  instDetail: { fontSize: 14, marginBottom: 4, color: '#475569' },
  progressBarBackground: { height: 8, backgroundColor: '#eee', borderRadius: 4, marginTop: 6 },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressText: { fontSize: 12, color: '#475569', marginTop: 4, fontWeight: '500' },
});
