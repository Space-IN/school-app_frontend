import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

const months = [
  '01', '02', '03', '04', '05', '06',
  '07', '08', '09', '10', '11', '12',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => `${currentYear - i}`);

export default function MonthlySummaryScreen({ route }) {
  const { grade, section } = route.params;

  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, '0')
  );
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthlySummary();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlySummary = async () => {
    setLoading(true);
    try {
      const monthStr = `${selectedYear}-${selectedMonth}`;
      const response = await axios.get(`${BASE_URL}/api/attendance/monthly-summary-class/class`, {
        params: { classAssigned: grade, section, month: monthStr },
      });

      if (response.data && response.data.summary?.length > 0) {
        setMonthlySummary(response.data);
      } else {
        setMonthlySummary(null);
      }
    } catch (err) {
      setMonthlySummary(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Monthly Attendance Summary</Text>
        <Text style={styles.subHeader}>Class {grade} - Section {section}</Text>
      </View>

      {/* Month & Year Picker */}
      <View style={styles.pickerBox}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Month</Text>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(value) => setSelectedMonth(value)}
          >
            {months.map((month) => (
              <Picker.Item key={month} label={month} value={month} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Year</Text>
          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(value) => setSelectedYear(value)}
          >
            {years.map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Loader or Summary */}
      {loading ? (
        <ActivityIndicator size="large" color="#4b4bfa" style={{ marginTop: 30 }} />
      ) : monthlySummary ? (
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryText}>🗓 Month: {monthlySummary.month}</Text>
          <Text style={styles.summaryText}>📅 Total Days: {monthlySummary.totalCalendarDays}</Text>
          <Text style={styles.summaryText}>📋 Attendance Marked: {monthlySummary.attendanceMarkedDays}</Text>

          <FlatList
            data={monthlySummary.summary}
            keyExtractor={(item) => item.studentId}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.monthCard}>
                <Text style={styles.name}>👤 {item.studentName}</Text>
                <Text>🟢 Present: {item.present}</Text>
                <Text>🔴 Absent: {item.absent}</Text>
                <Text>📊 %: {item.attendancePercentage}%</Text>
              </View>
            )}
          />
        </View>
      ) : (
        <Text style={styles.noData}>
          ⚠️ No records found for {selectedMonth}/{selectedYear}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#4b4bfa',
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subHeader: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 4,
  },


 pickerBox: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  marginTop: 16,
},
pickerWrapper: {
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: 12,
  marginHorizontal: 8,
  paddingHorizontal: 8,
  elevation: 2,
  justifyContent: 'center',
},
pickerLabel: {
  textAlign: 'center',
  marginTop: 8,
  fontWeight: '600',
  color: '#333',
},
picker: {
  width: '100%',
  height: Platform.OS === 'android' ? 50 : 160, // iOS needs taller picker space
},




  summaryText: {
    marginHorizontal: 16,
    marginTop: 10,
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
  },
  monthCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  noData: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
  },
});
