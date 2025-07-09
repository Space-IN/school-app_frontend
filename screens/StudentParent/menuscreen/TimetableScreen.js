import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const subjects = [
  { name: 'Physics', color: '#8e44ad' },
  { name: 'Chemistry', color: '#6a0dad' },
  { name: 'Mathematics', color: '#9b59b6' },
  { name: 'Biology', color: '#7d3c98' },
  { name: 'English', color: '#a569bd' },
  { name: 'Language', color: '#d2b4de' },
];

const times = [
  '9:00', '10:00', 'Break', '10:30', '11:30',
  'Break', 'Lunch', '1:00', '2:00', '3:00', '4:00', '5:00',
];

const timetableData = {
  Mon: ['Physics', 'Physics', null, 'Chemistry', 'Chemistry', null, null, 'Math', 'Math', 'English', 'English', 'Lang'],
  Tue: ['Chemistry', 'Chemistry', null, 'Physics', 'Physics', null, null, 'Biology', 'Biology', 'Math', 'Math', 'Lang'],
  Wed: ['Math', 'Math', null, 'English', 'English', null, null, 'Physics', 'Physics', 'Chemistry', 'Chemistry', 'Lang'],
  Thu: ['Biology', 'Biology', null, 'Physics', 'Physics', null, null, 'Math', 'Math', 'English', 'English', 'Lang'],
  Fri: ['Physics', 'Physics', null, 'Chemistry', 'Chemistry', null, null, 'Biology', 'Biology', 'Math', 'Math', 'Lang'],
  Sat: ['English', 'English', null, 'Math', 'Math', null, null, 'Physics', 'Physics', 'Chemistry', 'Chemistry', 'Lang'],
};

const screenWidth = Dimensions.get('window').width;
const timeColWidth = 60;
const dayColWidth = (screenWidth - timeColWidth - 16) / 6;

export default function TimetableScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Timetable</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Row */}
          <View style={styles.row}>
            <View style={[styles.timeCell, styles.headerCell]}>
              <Text style={styles.headerText}>Time</Text>
            </View>
            {days.map((day, i) => (
              <View key={`header-${day}-${i}`} style={[styles.dayCell, styles.headerCell]}>
                <Text style={styles.headerText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Timetable Rows */}
          <ScrollView style={{ maxHeight: '80%' }}>
            {times.map((time, rowIndex) => (
              <View key={`row-${time}-${rowIndex}`} style={styles.row}>
                <View
                  style={[
                    styles.timeCell,
                    time === 'Break' ? styles.breakCell : time === 'Lunch' ? styles.lunchCell : styles.timeSlotCell,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      time === 'Break' || time === 'Lunch' ? styles.breakText : null,
                    ]}
                  >
                    {time}
                  </Text>
                </View>

                {days.map((day, dayIndex) => {
                  const subject = timetableData[day][rowIndex];
                  const isBreak = time === 'Break';
                  const isLunch = time === 'Lunch';

                  if (isBreak) {
                    return (
                      <View key={`break-${day}-${rowIndex}`} style={[styles.dayCell, styles.breakCell]}>
                        <Text style={styles.breakText}>Break</Text>
                      </View>
                    );
                  }
                  if (isLunch) {
                    return (
                      <View key={`lunch-${day}-${rowIndex}`} style={[styles.dayCell, styles.lunchCell]}>
                        <Text style={styles.lunchText}>Lunch</Text>
                      </View>
                    );
                  }
                  if (!subject) {
                    return <View key={`empty-${day}-${rowIndex}`} style={[styles.dayCell, styles.emptyCell]} />;
                  }

                  const subj = subjects.find((s) => s.name.startsWith(subject)) || {};
                  return (
                    <View
                      key={`cell-${day}-${rowIndex}`}
                      style={[styles.dayCell, { backgroundColor: subj.color || '#b794f4' }]}
                    >
                      <Text numberOfLines={1} style={styles.subjectText}>
                        {subject}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e8ff',
    paddingTop: 40,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6a0dad',
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeCell: {
    width: timeColWidth,
    height: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  timeSlotCell: {
    backgroundColor: '#e9d5ff',
  },
  dayCell: {
    width: dayColWidth,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  headerCell: {
    backgroundColor: '#6a0dad',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#6a0dad',
  },
  subjectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  breakCell: {
    backgroundColor: '#ede9fe',
  },
  breakText: {
    color: '#5b21b6',
    fontSize: 12,
    fontWeight: '600',
  },
  lunchCell: {
    backgroundColor: '#fcd34d',
  },
  lunchText: {
    color: '#78350f',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCell: {
    backgroundColor: '#faf5ff',
  },
});
