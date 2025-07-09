// screens/StudentProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const iconMap = {
  studentName: 'person',
  className: 'school',
  section: 'layers',
  medium: 'language',
  rollNumber: 'reader',
  dob: 'calendar',
  currentAddress: 'home',
  permanentAddress: 'location',
  bloodGroup: 'water',
  weight: 'fitness',
  height: 'barbell',
};

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());

const StudentProfileScreen = ({ route }) => {
  const { profile } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Student Profile</Text>

      {Object.entries(profile).map(([key, value]) => (
        <View key={key} style={styles.itemContainer}>
          <View style={styles.item}>
            <Ionicons
              name={iconMap[key] || 'information-circle-outline'}
              size={24}
              color="#2c3e50"
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.label}>{formatLabel(key)}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default StudentProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4ff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#2c3e50',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  textContainer: {
    flexShrink: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  value: {
    fontSize: 17,
    color: '#4a4a4a',
  },
});
