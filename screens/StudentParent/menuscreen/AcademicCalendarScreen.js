import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configure calendar locale (optional)
LocaleConfig.locales['en'] = {
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
};
LocaleConfig.defaultLocale = 'en';

export default function AcademicCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [events, setEvents] = useState({}); // { date: [{id, title, type}] }
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('Class');

  // Event types with colors
  const eventTypes = {
    Class: '#4a90e2',
    Exam: '#e94e77',
    Event: '#f5a623',
  };

  // Mark selected date with circle around
  const getMarkedDates = () => {
    let marks = {};
    Object.keys(events).forEach(date => {
      marks[date] = { dots: events[date].map(e => ({ key: e.id, color: eventTypes[e.type] || '#777' })) };
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: '#00adf5'
      };
    }
    return marks;
  };

  const onDayPress = day => {
    setSelectedDate(day.dateString);
  };

  const openAddEventModal = () => {
    if (!selectedDate) {
      Alert.alert('Select a date first', 'Please select a date on the calendar to add an event.');
      return;
    }
    setNewEventTitle('');
    setNewEventType('Class');
    setModalVisible(true);
  };

  const addEvent = () => {
    if (!newEventTitle.trim()) {
      Alert.alert('Event title required', 'Please enter a title for the event.');
      return;
    }
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEventTitle.trim(),
      type: newEventType,
    };
    setEvents(prev => {
      const updatedEvents = { ...prev };
      if (!updatedEvents[selectedDate]) {
        updatedEvents[selectedDate] = [];
      }
      updatedEvents[selectedDate].push(newEvent);
      return updatedEvents;
    });
    setModalVisible(false);
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <View style={[styles.eventTypeIndicator, { backgroundColor: eventTypes[item.type] || '#777' }]} />
      <Text style={styles.eventTitle}>{item.title} <Text style={styles.eventType}>({item.type})</Text></Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Academic Calendar</Text>
      <Calendar
        onDayPress={onDayPress}
        markedDates={getMarkedDates()}
        markingType={'multi-dot'}
        style={styles.calendar}
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          todayTextColor: '#00adf5',
          arrowColor: '#00adf5',
          textDayFontWeight: '600',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
        }}
      />
      <TouchableOpacity style={styles.addButton} onPress={openAddEventModal} activeOpacity={0.7}>
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>
      <Text style={styles.eventsTitle}>
        {selectedDate ? `Events on ${selectedDate}` : 'Select a date to see events'}
      </Text>
      {selectedDate && events[selectedDate] && events[selectedDate].length > 0 ? (
        <FlatList
          style={styles.eventsList}
          data={events[selectedDate]}
          keyExtractor={item => item.id}
          renderItem={renderEventItem}
          ListEmptyComponent={<Text style={styles.noEvents}>No events for this date.</Text>}
        />
      ) : (
        <Text style={styles.noEvents}>
          {selectedDate ? 'No events for this date.' : ''}
        </Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Event</Text>
            <Text style={styles.inputLabel}>Event Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Math Exam"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              maxLength={50}
              autoFocus={true}
            />
            <Text style={styles.inputLabel}>Event Type</Text>
            <View style={styles.eventTypesContainer}>
              {Object.keys(eventTypes).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.eventTypeButton,
                    newEventType === type && { backgroundColor: eventTypes[type] }
                  ]}
                  onPress={() => setNewEventType(type)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.eventTypeButtonText, newEventType === type && { color: '#fff', fontWeight: '700' }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={addEvent}>
                <Text style={styles.modalBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fa',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  calendar: {
    borderRadius: 8,
    elevation: 3,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#00adf5',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 40,
    shadowColor: '#00adf5',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  eventsList: {
    paddingHorizontal: 8,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    elevation: 1,
  },
  eventTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  eventType: {
    fontSize: 14,
    color: '#888',
  },
  noEvents: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginTop: 6,
    color: '#333',
  },
  eventTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  eventTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  eventTypeButtonText: {
    fontSize: 16,
    color: '#555',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelBtn: {
    backgroundColor: '#eee',
  },
  addBtn: {
    backgroundColor: '#00adf5',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

