import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import axios from 'axios';

LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthNamesShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],
  dayNames: [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ],
  dayNamesShort: [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ]
};
LocaleConfig.defaultLocale = 'en';

export default function AcademicCalendarScreen() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [monthEvents, setMonthEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://10.221.34.140:5000/api/events');
      setEvents(res.data || []);
      markEventDates(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err.message);
    }
  };

  const markEventDates = (data) => {
    const marks = {};
    data.forEach(event => {
      const dateStr = new Date(event.date).toISOString().split('T')[0];
      marks[dateStr] = {
        marked: true,
        dotColor: '#00adf5'
      };
    });
    setMarkedDates(marks);
  };

  const onDayPress = day => {
    setSelectedDate(day.dateString);
  };

  const onMonthChange = (month) => {
    setCurrentMonth(month.month - 1); // JS months are 0-based
  };

  useEffect(() => {
    const filtered = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getMonth() === currentMonth;
    });
    setMonthEvents(filtered);
  }, [currentMonth, events]);

  const renderEvent = ({ item }) => (
    <View style={styles.eventBox}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDesc}>{item.description}</Text>
    </View>
  );

  const today = new Date().toISOString().split('T')[0];
  const todaysEvents = events.filter(e => new Date(e.date).toISOString().split('T')[0] === today);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>Academic Calendar</Text>

      <Calendar
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, selectedColor: '#00adf5' }
        }}
        markingType={'simple'}
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          todayTextColor: '#00adf5',
          arrowColor: '#00adf5',
          textDayFontWeight: '600',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
        }}
        style={styles.calendar}
      />

      <Text style={styles.sectionTitle}>Today's Events</Text>
      {todaysEvents.length > 0 ? (
        <FlatList
          data={todaysEvents}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderEvent}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noEvents}>No events today.</Text>
      )}

      <Text style={styles.sectionTitle}>Events This Month</Text>
      {monthEvents.length > 0 ? (
        <FlatList
          data={monthEvents}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderEvent}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noEvents}>No events this month.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#f4f6fa',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1e3a8a',
    textAlign: 'center',
  },
  calendar: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1e3a8a',
  },
  eventBox: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  eventDesc: {
    color: '#334155',
    marginTop: 4,
    fontSize: 14,
  },
  noEvents: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 20,
  },
});
