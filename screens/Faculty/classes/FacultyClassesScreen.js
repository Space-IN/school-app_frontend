// screens/Faculty/classes/FacultyClassesScreen.js
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function FacultyClassesScreen({ navigation, route }) {
  const { grades = [], openGrade, userId, redirectedFromHome } = route.params || {};

  useEffect(() => {
    if (openGrade) {
      navigation.navigate('FacultyClassDashboard', {
        grade: openGrade,
        redirectedFromHome,
        userId,
      });
    }
  }, [openGrade]);

  const handlePress = (grade) => {
    navigation.navigate('FacultyClassDashboard', { grade, userId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Assigned Classes</Text>
      <FlatList
        data={grades}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
            <Text style={styles.cardText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: {
    padding: 20,
    backgroundColor: '#4b4bfa',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  cardText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
