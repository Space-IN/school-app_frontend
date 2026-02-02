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

export default function AllStudentsScreen({ navigation, route }) {
  const { board } = route.params || {};

  const grades = Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`);
  const sections = ['A', 'B', 'C'];

  const [selectedGrade, setSelectedGrade] = useState('');
  const [showSectionModal, setShowSectionModal] = useState(false);

  const onSelectGrade = (grade) => {
    setSelectedGrade(grade);
    setShowSectionModal(true);
  };

  const onSelectSection = (section) => {
    setShowSectionModal(false);
    navigation.navigate('FilteredStudentsScreen', {
      grade: selectedGrade,
      section,
      board,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Select Grade {board ? `(${board})` : ''}</Text>


      <FlatList
        data={grades}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.grid}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.gradeTile} onPress={() => onSelectGrade(item)}>
            <Text style={styles.gradeText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.tabToggle}>
        <TouchableOpacity onPress={() => navigation.navigate('DeletedStudentsScreen')}>
          <Text style={styles.tabToggleText}> View Soft Deleted Students</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showSectionModal} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Section</Text>
            {sections.map((sec) => (
              <Pressable key={sec} style={styles.sectionOption} onPress={() => onSelectSection(sec)}>
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
    backgroundColor: '#ffffffff',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    padding: 16,
  },
  grid: {
    paddingHorizontal: 16,
  },
  gradeTile: {
    backgroundColor: '#fecaca',
    padding: 20,
    borderRadius: 10,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
  },
  gradeText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
  },
  tabToggle: {
    alignItems: 'center',
    marginVertical: 16,
  },
  tabToggleText: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: 'bold',
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
    color: '#17171a',
  },
  sectionOption: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  sectionText: {
    fontSize: 16,
    color: '#111111',
  },
  cancelBtn: {
    marginTop: 10,
    color: 'red',
    fontWeight: 'bold',
  },
});
