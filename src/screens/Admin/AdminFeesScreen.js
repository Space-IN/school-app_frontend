import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Card, Button, Provider, Portal, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import RNPickerSelect from 'react-native-picker-select';

const boards = ['CBSE', 'State'];
const classes = ['6', '7', '8', '9', '10'];
const sections = ['A', 'B', 'C', 'D'];

// ✅ Mock students with board, class, and section
const mockStudents = [
  { id: '1', name: 'Aarav Sharma', userId: 'USR101', totalFee: 50000, pendingFee: 20000, board: 'CBSE', class: '6', section: 'A', inst1: { amount: 15000, paid: 15000, status: 'Paid' }, inst2: { amount: 15000, paid: 15000, status: 'Paid' }, inst3: { amount: 20000, paid: 0, status: 'Pending' } },
  { id: '2', name: 'Diya Patel', userId: 'USR102', totalFee: 50000, pendingFee: 50000, board: 'CBSE', class: '6', section: 'B', inst1: { amount: 15000, paid: 0, status: 'Pending' }, inst2: { amount: 15000, paid: 0, status: 'Pending' }, inst3: { amount: 20000, paid: 0, status: 'Pending' } },
  { id: '3', name: 'Rohan Gupta', userId: 'USR103', totalFee: 50000, pendingFee: 0, board: 'CBSE', class: '7', section: 'A', inst1: { amount: 15000, paid: 15000, status: 'Paid' }, inst2: { amount: 15000, paid: 15000, status: 'Paid' }, inst3: { amount: 20000, paid: 20000, status: 'Paid' } },
  { id: '4', name: 'Sneha Reddy', userId: 'USR104', totalFee: 50000, pendingFee: 20000, board: 'State', class: '7', section: 'B', inst1: { amount: 15000, paid: 15000, status: 'Paid' }, inst2: { amount: 15000, paid: 15000, status: 'Paid' }, inst3: { amount: 20000, paid: 0, status: 'Pending' } },
  { id: '5', name: 'Arjun Verma', userId: 'USR105', totalFee: 50000, pendingFee: 50000, board: 'CBSE', class: '8', section: 'A', inst1: { amount: 15000, paid: 0, status: 'Pending' }, inst2: { amount: 15000, paid: 0, status: 'Pending' }, inst3: { amount: 20000, paid: 0, status: 'Pending' } },
];

export default function AdminFeesScreen() {
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      if (result.type === 'success') {
        console.log('File picked:', result.uri);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const filteredStudents = mockStudents.filter(
    s => s.board === selectedBoard && s.class === selectedClass && s.section === selectedSection
  );

  const renderStudentItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelectStudent(item)}>
      <View style={styles.studentItem}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentId}>{item.userId}</Text>
        <Text style={styles.studentFee}>₹{item.totalFee}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'green';
      case 'Partially Paid': return 'orange';
      case 'Pending': return 'red';
      default: return '#aaa';
    }
  };

  const showStudentList = selectedBoard && selectedClass && selectedSection;

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.header}>Admin Fees Management</Text>

        <View style={styles.dropdownContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Board</Text>
            <RNPickerSelect
              onValueChange={(value) => setSelectedBoard(value)}
              items={boards.map(b => ({ label: b, value: b }))}
              style={pickerSelectStyles}
              placeholder={{ label: "Select Board", value: null }}
            />
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Class</Text>
            <RNPickerSelect
              onValueChange={(value) => setSelectedClass(value)}
              items={classes.map(c => ({ label: c, value: c }))}
              style={pickerSelectStyles}
              placeholder={{ label: "Select Class", value: null }}
            />
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Section</Text>
            <RNPickerSelect
              onValueChange={(value) => setSelectedSection(value)}
              items={sections.map(s => ({ label: s, value: s }))}
              style={pickerSelectStyles}
              placeholder={{ label: "Select Section", value: null }}
            />
          </View>
        </View>

        {showStudentList ? (
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={
              <View style={styles.studentListHeader}>
                <Text style={styles.studentListHeaderText}>Name</Text>
                <Text style={styles.studentListHeaderText}>User ID</Text>
                <Text style={styles.studentListHeaderText}>Total Fee</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Please select a board, class, and section to view student fee details.</Text>
          </View>
        )}
      </View>

      {/* Student Fee Modal */}
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          {selectedStudent && (
            <View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedStudent.name}'s Fee Details</Text>
                <IconButton icon="close" size={24} onPress={() => setModalVisible(false)} />
              </View>

              <Card style={styles.feeSummaryCard}>
                <Card.Content>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Total Fee:</Text>
                    <Text style={styles.feeValue}>₹{selectedStudent.totalFee}</Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Pending Fee:</Text>
                    <Text style={[styles.feeValue, { color: 'red' }]}>₹{selectedStudent.pendingFee}</Text>
                  </View>
                </Card.Content>
              </Card>

              {[selectedStudent.inst1, selectedStudent.inst2, selectedStudent.inst3].map((inst, index) => (
                <Card key={index} style={styles.installmentCard}>
                  <Card.Title 
                    title={`Installment ${index + 1}`}
                    right={() => <Text style={[styles.status, { color: getStatusColor(inst.status) }]}>{inst.status}</Text>}
                  />
                  <Card.Content>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>Amount:</Text>
                      <Text style={styles.feeValue}>₹{inst.amount}</Text>
                    </View>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>Paid:</Text>
                      <Text style={styles.feeValue}>₹{inst.paid}</Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </Modal>
      </Portal>

      {/* Upload Excel Button */}
      <View style={styles.uploadContainer}>
        <Button
          mode="contained"
          icon={() => <Ionicons name="cloud-upload-outline" size={20} color="#fff" />}
          onPress={handleFileUpload}
          buttonColor="#49a85eff"
          style={styles.uploadButton}
          labelStyle={styles.uploadButtonText}
        >
          Upload Excel Sheet
        </Button>
      </View>
    </Provider>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  dropdownContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  pickerContainer: { flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  pickerLabel: { fontSize: 14, fontWeight: '500', color: '#666', marginBottom: 5 },
  infoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoText: { fontSize: 16, color: '#666', textAlign: 'center' },
  studentListHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#f9f9f9' },
  studentListHeaderText: { fontWeight: 'bold', fontSize: 16 },
  studentItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  studentName: { fontSize: 16 },
  studentId: { fontSize: 16, color: '#666' },
  studentFee: { fontSize: 16, fontWeight: 'bold' },
  modalContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  feeSummaryCard: { marginBottom: 15, backgroundColor: '#eef' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  feeLabel: { fontSize: 16, color: '#555' },
  feeValue: { fontSize: 16, fontWeight: 'bold' },
  installmentCard: { marginBottom: 10 },
  status: { fontWeight: 'bold', marginRight: 16 },
  uploadContainer: { padding: 16, backgroundColor: '#ac1d1dff'},
  uploadButton: { borderRadius: 8, paddingVertical: 5 },
  uploadButtonText: { fontSize: 16 }
});
