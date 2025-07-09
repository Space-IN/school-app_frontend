import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

export default function ParentProfileScreen() {
  // Sample initial parent/guardian data
  const [guardians, setGuardians] = useState([
    {
      id: '1',
      name: 'John Doe',
      relationship: 'Father',
      phone: '+91 123-456-7890',
      address: '123 Main St, Bengaluru, Karnataka, India.',
      occupation: 'Civil Engineer',
      email: 'john_doe@workdomain.com',
    },
    {
      id: '2',
      name: 'Jane Doe',
      relationship: 'Mother',
      phone: '+91 098-765-4321',
      address: '123 Main St, Bengaluru, Karnataka, India.',
      occupation: 'School Teacher',
      email: 'jane@gmail.com',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newGuardian, setNewGuardian] = useState({
    name: '',
    relationship: '',
    phone: '',
    address: '',
    occupation: '',
    email: '',
  });

  // Validate email
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleAddGuardian = () => {
    if (
      !newGuardian.name.trim() ||
      !newGuardian.relationship.trim() ||
      !newGuardian.phone.trim() ||
      !newGuardian.address.trim() ||
      !newGuardian.occupation.trim() ||
      !newGuardian.email.trim()
    ) {
      Alert.alert('All fields required', 'Please fill out all fields to add a guardian.');
      return;
    }

    if (!validateEmail(newGuardian.email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Add new guardian
    setGuardians((prev) => [
      ...prev,
      { id: Date.now().toString(), ...newGuardian }
    ]);
    setNewGuardian({
      name: '',
      relationship: '',
      phone: '',
      address: '',
      occupation: '',
      email: '',
    });
    setModalVisible(false);
  };

  const handleChange = (field, value) => {
    setNewGuardian((prev) => ({ ...prev, [field]: value }));
  };

  const renderGuardian = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name} <Text style={styles.relationship}>({item.relationship})</Text></Text>
      <Text style={styles.info}><Text style={styles.label}>Phone:</Text> {item.phone}</Text>
      <Text style={styles.info}><Text style={styles.label}>Address:</Text> {item.address}</Text>
      <Text style={styles.info}><Text style={styles.label}>Occupation:</Text> {item.occupation}</Text>
      <Text style={styles.info}><Text style={styles.label}>Email:</Text> {item.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent / Guardian Profiles</Text>
      <FlatList
        data={guardians}
        keyExtractor={(item) => item.id}
        renderItem={renderGuardian}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Parent/Guardian</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>Add Parent / Guardian</Text>

              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={newGuardian.name}
                onChangeText={(text) => handleChange('name', text)}
                maxLength={50}
              />

              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Father, Aunt"
                value={newGuardian.relationship}
                onChangeText={(text) => handleChange('relationship', text)}
                maxLength={30}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={newGuardian.phone}
                onChangeText={(text) => handleChange('phone', text)}
                keyboardType="phone-pad"
                maxLength={20}
              />

              <Text style={styles.inputLabel}>Permanent Address</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Permanent Address"
                value={newGuardian.address}
                onChangeText={(text) => handleChange('address', text)}
                multiline
              />

              <Text style={styles.inputLabel}>Occupation / Profession</Text>
              <TextInput
                style={styles.input}
                placeholder="Occupation / Profession"
                value={newGuardian.occupation}
                onChangeText={(text) => handleChange('occupation', text)}
                maxLength={50}
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={newGuardian.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={50}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handleAddGuardian}>
                  <Text style={styles.modalBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fb',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2e3a59',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  relationship: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  info: {
    fontSize: 16,
    color: '#444',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2e3a59',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#4a4a4a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 6,
    color: '#1e293b',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelBtn: {
    backgroundColor: '#e2e8f0',
  },
  addBtn: {
    backgroundColor: '#3b82f6',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

