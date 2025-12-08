// ✅ AdminFeesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Card, Chip, Button, Menu, Divider, Provider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function AdminFeesScreen() {
  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C', 'D'];

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Mocked fee details
  const feeDetails = {
    total: 50000,
    installments: [
      { id: 1, title: 'Installment 1', amount: 15000, paid: 10000, status: 'Partially Paid' },
      { id: 2, title: 'Installment 2', amount: 20000, paid: 0, status: 'Pending' },
      { id: 3, title: 'Installment 3', amount: 15000, paid: 0, status: 'Pending' },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'green';
      case 'Partially Paid': return 'orange';
      case 'Pending': return 'red';
      default: return '#aaa';
    }
  };

  return (
    <Provider>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <StatusBar barStyle="dark-content" backgroundColor={Platform.OS === 'android' ? '#fff' : undefined} />

        {/* --- Header --- */}
        <Text style={styles.header}>📚 Admin Fee Management</Text>

        {/* --- Class & Section Selection --- */}
        <View style={styles.dropdownRow}>
          <View style={styles.dropdown}>
            <Text style={styles.label}>Select Class</Text>
            <View style={styles.optionsRow}>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls}
                  style={[styles.optionItem, selectedClass === cls && styles.selectedOption]}
                  onPress={() => setSelectedClass(cls)}
                >
                  <Text style={styles.optionText}>{cls}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.dropdown}>
            <Text style={styles.label}>Select Section</Text>
            <View style={styles.optionsRow}>
              {sections.map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.optionItem, selectedSection === sec && styles.selectedOption]}
                  onPress={() => setSelectedSection(sec)}
                >
                  <Text style={styles.optionText}>{sec}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* --- Fee Details / Placeholder --- */}
        {!selectedClass || !selectedSection ? (
          <Card style={styles.placeholderCard}>
            <Card.Content>
              <Text style={styles.placeholderText}>
                Please select class and section to view fees details.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Fee Details for Class {selectedClass} - Section {selectedSection}
            </Text>

            <Card style={styles.tableCard}>
              <Card.Content>
                <View style={styles.rowHeader}>
                  <Text style={[styles.cell, { flex: 2 }]}>Installment</Text>
                  <Text style={styles.cell}>Amount</Text>
                  <Text style={styles.cell}>Paid</Text>
                  <Text style={styles.cell}>Pending</Text>
                  <Text style={styles.cell}>Status</Text>
                </View>
                <Divider />

                {feeDetails.installments.map((inst, index) => (
                  <View
                    key={inst.id}
                    style={[
                      styles.row,
                      { backgroundColor: index % 2 === 0 ? '#f7f7f7' : '#fff' },
                    ]}
                  >
                    <Text style={[styles.cell, { flex: 2 }]}>{inst.title}</Text>
                    <Text style={styles.cell}>{inst.amount}</Text>
                    <Text style={styles.cell}>{inst.paid}</Text>
                    <Text style={styles.cell}>{inst.amount - inst.paid}</Text>
                    <Chip style={{ backgroundColor: getStatusColor(inst.status) }}>
                      {inst.status}
                    </Chip>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </>
        )}

        {/* --- Upload Excel Button --- */}
        <View style={styles.uploadContainer}>
          <Button
            mode="contained"
            icon={() => <Ionicons name="cloud-upload-outline" size={20} color="#fff" />}
            buttonColor="#8f1b1b"
            onPress={() => alert('Upload Excel clicked')}
            contentStyle={{ paddingVertical: 8 }}
            style={{ borderRadius: 12 }}
          >
            Upload Fees Excel (First Time Entry)
          </Button>
        </View>
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#8f1b1b', textAlign: 'center', marginBottom: 20 },
  dropdownRow: { marginBottom: 20 },
  dropdown: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#1e3a8a', marginBottom: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: { borderColor: '#8f1b1b', borderWidth: 2 },
  optionText: { fontSize: 14, color: '#1e3a8a', fontWeight: '500' },
  placeholderCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffeaea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#8f1b1b', fontSize: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginVertical: 16, textAlign: 'center' },
  tableCard: { marginTop: 10, borderRadius: 12, elevation: 3 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, alignItems: 'center' },
  cell: { flex: 1, textAlign: 'center', fontSize: 14 },
  uploadContainer: { marginTop: 30, alignItems: 'center' },
});
