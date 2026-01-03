// screens/AddEventScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { BASE_URL } from '@env';
import {api} from '../../../api/api'


export default function AddEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const fetchEvents = async () => {
    try {
      const res = await api.get(`${BASE_URL}/api/admin/events`);
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    try {

      await api.post(`${BASE_URL}/api/events/add`, {

        title,
        description,
        date,
      });
      Alert.alert('Success', 'Event added successfully!');
      setTitle('');
      setDescription('');
      setDate(new Date());
      fetchEvents(); // Refresh events list
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await api.delete(`${BASE_URL}/api/events/delete/${eventId}`);
      Alert.alert('Deleted', 'Event deleted successfully');
      fetchEvents();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  const filteredEvents = events.filter((event) => {
    const eventMonth = new Date(event.date).getMonth();
    return eventMonth === selectedMonth;
  });

  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
      <View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>📅 {new Date(item.date).toDateString()}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

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

      <View style={{ marginTop: 20, marginBottom: 30 }}>
        <Button title="Add Event" onPress={handleAddEvent} />
      </View>

      <Text style={styles.sectionTitle}>Current Events - Select Month</Text>

      {/* Month Grid */}
      <View style={styles.monthGrid}>
        {months.map((month, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.monthButton,
              selectedMonth === index && styles.selectedMonthButton,
            ]}
            onPress={() => setSelectedMonth(index)}
          >
            <Text
              style={[
                styles.monthText,
                selectedMonth === index && styles.selectedMonthText,
              ]}
            >
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Event List */}
      {filteredEvents.length > 0 ? (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item._id}
          renderItem={renderEventItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#777' }}>
          No events in {months[selectedMonth]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    backgroundColor: '#ffffffff',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 5,
    width: '30%',
    alignItems: 'center',
  },
  selectedMonthButton: {
    backgroundColor: '#4e73df',
  },
  monthText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMonthText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
