import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Animated,
  TextInput,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import {BASE_URL} from '@env';

import {api} from '../../../api/api';

// --- LOCALE CONFIGURATION ---
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

// --- UI CONSTANTS ---
const COLORS = {
  background: '#FDF4F3',      
  heading: '#7a0f09',        
  primary: '#c01e12',        
  holiday: '#d33f2f',        
  deepBlue: '#590905',        
  textPrimary: '#2b0a08',     
  textSecondary: '#fff5f5',   
};


// --- MAIN COMPONENT ---
export default function AcademicCalendarScreen() {
  // --- STATE MANAGEMENT ---
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNoEventMsg, setShowNoEventMsg] = useState(false);
  const { height: screenHeight } = useWindowDimensions();

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const calendarAnim = useRef(new Animated.Value(0)).current;
  const isChangingMonth = useRef(false); // Ref to prevent race condition

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get(`/api/student/events`);
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to fetch events:', err.message);
    }
  };

  // --- MEMOIZED DERIVED STATE ---
  const eventMarkers = useMemo(() => {
    const markers = {};
    events.forEach(event => {
      const dateStr = new Date(event.date).toISOString().split('T')[0];
      markers[dateStr] = { marked: true, dotColor: event.isHoliday ? COLORS.holiday : COLORS.primary };
    });
    return markers;
  }, [events]);

  const markedDates = useMemo(() => ({
    ...eventMarkers,
    [selectedDate]: { ...eventMarkers[selectedDate], selected: true, selectedColor: COLORS.deepBlue }
  }), [eventMarkers, selectedDate]);

  const monthEvents = useMemo(() => {
    const viewedDate = new Date(currentMonthDate);
    const viewedMonth = viewedDate.getMonth();
    const viewedYear = viewedDate.getFullYear();
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getMonth() === viewedMonth && eventDate.getFullYear() === viewedYear;
    });
  }, [events, currentMonthDate]);

  const todaysEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(e => new Date(e.date).toISOString().split('T')[0] === today);
  }, [events]);

  // --- HANDLERS ---
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    const hasEvent = events.some(e => new Date(e.date).toISOString().split('T')[0] === day.dateString);
    if (!hasEvent) {
      setShowNoEventMsg(true);
      setTimeout(() => setShowNoEventMsg(false), 3000);
    }
  };

  const onMonthChange = (month) => {
    if (isChangingMonth.current) {
      isChangingMonth.current = false;
      return;
    }
    const firstDayOfMonth = new Date(month.year, month.month - 1, 1).toISOString().split('T')[0];
    setCurrentMonthDate(firstDayOfMonth);
  };

  const changeMonth = (delta) => {
    isChangingMonth.current = true;
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + delta, 1);
    setCurrentMonthDate(newDate.toISOString().split('T')[0]);
  };

  const scrollToToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setCurrentMonthDate(todayStr);
    setSelectedDate(todayStr);
  };

  // --- RENDER ---
  const renderEvent = ({ item }) => <EventItem item={item} highlighted={selectedDate === new Date(item.date).toISOString().split('T')[0]} />;

  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.rootContainer}>
      <ScrollView contentContainerStyle={{ paddingBottom: screenHeight * 0.12 }}>
        <View style={styles.headerContainer}>
            <Text style={styles.heading}>Academic Calendar</Text>
        </View>

        {/* Top Controls */}
        <View style={styles.topControls}>
            <View style={styles.monthControls}>
              <Pressable onPress={() => changeMonth(-1)} style={styles.navButton}><Text style={styles.navText}>‹</Text></Pressable>
              <View style={styles.monthCardSmall}>
                <Text style={styles.monthNameSmall}>{new Date(currentMonthDate).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</Text>
              </View>
              <Pressable onPress={() => changeMonth(1)} style={styles.navButton}><Text style={styles.navText}>›</Text></Pressable>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput placeholder="Search events this month" value={searchQuery} onChangeText={setSearchQuery} style={styles.searchInput} />
              </View>
            </View>

            <View style={styles.chipsRow}>
              <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
              <Chip label="Events" active={filter === 'events'} onPress={() => setFilter('events')} />
              <Chip label="Holiday" active={filter === 'holiday'} onPress={() => setFilter('holiday')} />
            </View>
        </View>

        {/* Calendar Component */}
        <Animated.View style={[styles.calendarWrap, { transform: [{ scale: calendarAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.995] }) }] }]}>
          <Calendar
            key={currentMonthDate}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            markedDates={markedDates}
            current={currentMonthDate}
            markingType={'simple'}
            theme={styles.calendarTheme}
            style={styles.calendar}
          />
        </Animated.View>
        
        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} /><Text style={styles.legendText}>Event</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.holiday }]} /><Text style={styles.legendText}>Holiday</Text></View>
        </View>

        {showNoEventMsg && (
          <View style={styles.noEventPopup}><Text style={styles.noEventPopupText}>No events on this date</Text></View>
        )}

        <View style={styles.eventListContainer}>
            <Text style={styles.sectionTitle}>Today's Events</Text>
            {todaysEvents.length > 0 ? (
              <FlatList data={todaysEvents} keyExtractor={item => item.title + item.date} renderItem={renderEvent} scrollEnabled={false} />
            ) : (
              <Text style={styles.noEvents}>No events today.</Text>
            )}

            <Text style={styles.sectionTitle}>Events This Month</Text>
            {monthEvents.length > 0 ? (
              <FlatList data={filteredAndSearchedEvents(monthEvents, filter, searchQuery)} keyExtractor={item => item.title + item.date} renderItem={renderEvent} scrollEnabled={false} />
            ) : (
              <Text style={styles.noEvents}>No events this month.</Text>
            )}
        </View>

        <Pressable style={styles.fab} onPress={scrollToToday}><Text style={styles.fabText}>Today</Text></Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

// --- Helper Components & Functions ---
function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function filteredAndSearchedEvents(list, filter, query) {
  let out = [...list];
  if (filter === 'events') out = out.filter(e => !e.isHoliday);
  else if (filter === 'holiday') out = out.filter(e => e.isHoliday);

  if (query && query.trim()) {
    const q = query.toLowerCase();
    out = out.filter(e => (e.title || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q));
  }
  return out;
}

function EventItem({ item, highlighted }) {
  const [expanded, setExpanded] = useState(false);
  const formattedDate = new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Pressable onPress={() => setExpanded(!expanded)} style={[styles.eventBox, highlighted && styles.highlightedEvent]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eventTitle, item.isHoliday && { color: COLORS.holiday }]}>{item.title}</Text>
        {expanded && <Text style={styles.eventDesc}>{item.description}</Text>}
        <Text style={styles.eventDate}>{formattedDate}</Text>
      </View>
    </Pressable>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#ffffff' },
  headerContainer: { paddingHorizontal: 16, paddingTop: 5 },
  eventListContainer: { paddingHorizontal: 16 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 10, color: COLORS.heading, textAlign: 'center' },
  topControls: { marginBottom: 12, backgroundColor: '#fff', padding: 12, borderRadius: 12, elevation: 2, marginHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  calendar: { borderRadius: 12, backgroundColor: '#fff', elevation: 3 },
  calendarTheme: { selectedDayBackgroundColor: COLORS.deepBlue, todayTextColor: COLORS.primary, arrowColor: COLORS.primary, textDayFontWeight: '600', textMonthFontWeight: '700', textDayHeaderFontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginVertical: 12, color: COLORS.heading },
  eventBox: { backgroundColor: '#fff', padding: 12, marginBottom: 10, borderRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#e2e8f0' },
  highlightedEvent: { borderColor: COLORS.deepBlue, borderWidth: 2 },
  eventTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  eventDesc: { color: '#334155', marginTop: 4, fontSize: 14, lineHeight: 20 },
  eventDate: { color: '#1e40af', marginTop: 6, fontSize: 13, fontStyle: 'italic' },
  noEvents: { color: '#6b7280', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  noEventPopup: { backgroundColor: '#e6f7ff', padding: 10, borderRadius: 8, marginBottom: 10, position: 'absolute', top: 60, alignSelf: 'center', zIndex: 10, elevation: 5 },
  noEventPopupText: { color: COLORS.deepBlue, textAlign: 'center', fontWeight: '500' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { color: '#334155', fontSize: 13 },
  calendarWrap: { borderRadius: 12, overflow: 'hidden', marginBottom: 8, marginHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  monthControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  navButton: { padding: 8, borderRadius: 8, backgroundColor: '#f1f5f9', elevation: 1 },
  navText: { fontSize: 20, color: COLORS.heading, fontWeight: '700' },
  monthCardSmall: { flex: 1, alignItems: 'center', paddingVertical: 6, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  monthNameSmall: { fontSize: 16, fontWeight: '700', color: COLORS.heading },
  searchRow: { marginBottom: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  searchIcon: { marginRight: 8, color: '#94a3b8' },
  searchInput: { flex: 1, padding: 8, color: COLORS.textPrimary },
  chipsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, backgroundColor: '#f1f5f9', marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: '#334155', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  fab: { position: 'absolute', right: 18, bottom: 36, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 30, elevation: 4 },
  fabText: { color: '#fff', fontWeight: '700' },
});
