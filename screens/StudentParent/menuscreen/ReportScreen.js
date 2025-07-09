import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';

const Tab = createMaterialTopTabNavigator();

function OverviewScreen() {
  return (
    <ScrollView contentContainerStyle={styles.overviewContainer}>
      <Text style={styles.header}>Student Performance Overview</Text>
      <Text style={styles.subHeader}>Grade Summary</Text>
      <View style={styles.card}><Text style={styles.cardText}>Attendance: 92%</Text></View>
      <View style={styles.card}><Text style={styles.cardText}>Overall Grade: B+</Text></View>
      <View style={styles.card}><Text style={styles.cardText}>Rank in Class: 5 / 40</Text></View>
    </ScrollView>
  );
}

function PerformanceScreen() {
  const data = {
    labels: ['Math', 'Science', 'English', 'History'],
    datasets: [
      {
        data: [68, 85, 76, 59],
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.chartContainer}>
      <Text style={styles.header}>Subject-wise Marks</Text>
      <BarChart
        data={data}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#e0f2fe',
          backgroundGradientFrom: '#e0f2fe',
          backgroundGradientTo: '#e0f2fe',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '6', strokeWidth: '2', stroke: '#2196f3' },
        }}
        verticalLabelRotation={0}
      />
    </ScrollView>
  );
}

function AttendanceScreen() {
  return (
    <View style={styles.centeredContainer}>
      <Ionicons name="calendar-outline" size={50} color="#3b82f6" />
      <Text style={styles.header}>Attendance Details</Text>
      <Text>Total Days: 180</Text>
      <Text>Present: 165</Text>
      <Text>Absent: 15</Text>
    </View>
  );
}

function ActivitiesScreen() {
  return (
    <View style={styles.centeredContainer}>
      <Ionicons name="trophy-outline" size={50} color="#f59e0b" />
      <Text style={styles.header}>Extra-curricular Activities</Text>
      <Text>- Participated in Science Fair</Text>
      <Text>- 2nd Place in Quiz Competition</Text>
      <Text>- Member of School Band</Text>
    </View>
  );
}

export default function ReportScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#2563eb' },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: { backgroundColor: '#e0e7ff' },
      }}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} />
      <Tab.Screen name="Performance" component={PerformanceScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Activities" component={ActivitiesScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  overviewContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#e0e7ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#111827',
  },
  chartContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
});
