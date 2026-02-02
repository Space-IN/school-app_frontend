// screens/AddEventScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../../api/api';

export default function AddEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec',
  ];

  const fetchEvents = async () => {
    try {
      const res = await api.get(`/api/admin/events`);
      setEvents(res.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    if (!title.trim()) {
      return Alert.alert('Validation', 'Event title is required');
    }

    try {
      await api.post(`/api/admin/events/add`, {
        title,
        description,
        date,
      });

      Alert.alert('Success', 'Event added successfully');
      setTitle('');
      setDescription('');
      setDate(new Date());
      fetchEvents();
    } catch {
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/admin/events/delete/${id}`);
            fetchEvents();
          } catch {
            Alert.alert('Error', 'Failed to delete event');
          }
        },
      },
    ]);
  };

  const filteredEvents = events.filter(
    e => new Date(e.date).getMonth() === selectedMonth
  );

  const renderEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>
          {new Date(item.date).toDateString()}
        </Text>
        {item.description ? (
          <Text style={styles.eventDesc}>{item.description}</Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add New Event</Text>

        <TextInput
          style={styles.input}
          placeholder="Event title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateText}>
            {date.toDateString()}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={(e, selected) => {
              setShowPicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleAddEvent}>
          <Text style={styles.primaryBtnText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Events</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {months.map((m, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.monthChip,
              selectedMonth === i && styles.activeMonth,
            ]}
            onPress={() => setSelectedMonth(i)}
          >
            <Text
              style={[
                styles.monthText,
                selectedMonth === i && styles.activeMonthText,
              ]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredEvents.length === 0 ? (
        <Text style={styles.emptyText}>
          No events in {months[selectedMonth]}
        </Text>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item._id}
          renderItem={renderEvent}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f7fb',
    padding: 12,
    flex: 1,
  },

  card: {
    backgroundColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#ac1d1dff',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  dateBtn: {
    borderWidth: 1,
    borderColor: '#ac1d1dff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },

  dateText: {
    color: '#333',
  },

  primaryBtn: {
    backgroundColor: '#ac1d1dff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },

  monthChip: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },

  activeMonth: {
    backgroundColor: '#ac1d1dff',
  },

  monthText: {
    color: '#333',
    fontWeight: '600',
  },

  activeMonthText: {
    color: '#fff',
  },

  eventCard: {
    backgroundColor: '#fecaca',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
    elevation: 2,
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  eventDate: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },

  eventDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  deleteText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },

  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
  },
});
