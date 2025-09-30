// school-app_frontend/screens/Admin/FacultyPerformanceScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';

export default function FacultyPerformanceScreen({ navigation }) {
  const grades = Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`);
  const sections = ['A', 'B', 'C', 'D'];

  const [selectedGrade, setSelectedGrade] = useState('');
  const [showSectionModal, setShowSectionModal] = useState(false);

  const onSelectGrade = (grade) => {
    setSelectedGrade(grade);
    setShowSectionModal(true);
  };

  const onSelectSection = (section) => {
  setShowSectionModal(false);

  
  const classId = selectedGrade.replace("Grade ", "");

  navigation.navigate("FacultyListScreen", {
    classId,
    section,
  });
};


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>📊 Select Grade</Text>

      <FlatList
        data={grades}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.grid}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gradeTile}
            onPress={() => onSelectGrade(item)}
          >
            <Text style={styles.gradeText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal transparent visible={showSectionModal} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Section</Text>
            {sections.map((sec) => (
              <Pressable
                key={sec}
                style={styles.sectionOption}
                onPress={() => onSelectSection(sec)}
              >
                <Text style={styles.sectionText}>Section {sec}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setShowSectionModal(false)}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    padding: 16,
  },
  grid: {
    paddingHorizontal: 16,
  },
  gradeTile: {
    backgroundColor: '#e0ecff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
  },
  gradeText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1e3a8a',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    marginHorizontal: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e3a8a',
  },
  sectionOption: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  sectionText: {
    fontSize: 16,
    color: '#1e3a8a',
  },
  cancelBtn: {
    marginTop: 10,
    color: 'red',
    fontWeight: 'bold',
  },
});
