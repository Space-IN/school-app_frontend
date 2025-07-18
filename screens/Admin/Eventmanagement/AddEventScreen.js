// screens/AddEventScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

export default function AddEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleAddEvent = async () => {
    try {
      await axios.post('http://10.221.34.145:5000/api/events/add', {
        title,
        description,
        date,
      });
      Alert.alert('Success', 'Event added successfully!');
      navigation.goBack(); // Go back to AdminDashboard
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add event');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Event Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Enter event description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Select Date</Text>
      <Button title={date.toDateString()} onPress={() => setShowPicker(true)} />

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Add Event" onPress={handleAddEvent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4ff',
    flex: 1,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: '#fff',
  },
});
