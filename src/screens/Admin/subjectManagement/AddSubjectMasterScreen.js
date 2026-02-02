import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { api } from '../../../api/api';

const CURRICULUM_OPTIONS = [
  'School STATE',
  'School CBSE',
  'PUC Science STATE',
  'PUC Commerce STATE',
  'PUC Science CBSE',
  'PUC Commerce CBSE',
];

const FILTER_OPTIONS = ['All', ...CURRICULUM_OPTIONS];

const AddSubjectMasterScreen = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [curriculum, setCurriculum] = useState('');
  const [stream, setStream] = useState('');
  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [fetching, setFetching] = useState(false);

  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const fetchSubjects = async () => {
    try {
      setFetching(true);
      const res = await api.get('/api/admin/subject');
      const list = res.data?.data || [];
      list.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSubjects(list);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filteredSubjects = useMemo(() => {
    if (selectedFilter === 'All') return subjects;
    return subjects.filter(
      s => s.category?.curriculum === selectedFilter
    );
  }, [subjects, selectedFilter]);

  const handleSubmit = async () => {
    if (!name || !code || !curriculum || !stream) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/api/admin/subject', {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        category: {
          curriculum,
          stream: stream.trim(),
        },
      });

      Alert.alert('Success', res.data.message);

      setName('');
      setCode('');
      setCurriculum('');
      setStream('');

      fetchSubjects();
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSubject = ({ item, index }) => {
    return (
      <View
        style={[
          styles.subjectCard,
          index === 0 && styles.latestSubjectCard,
        ]}
      >
        <Text style={styles.subjectName}>
          {item.name}{' '}
          <Text style={styles.subjectCode}>({item.code})</Text>
        </Text>

        <Text style={styles.metaText}>
          {item.category?.curriculum} • {item.category?.stream}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Add New Subject</Text>

        <TextInput
          placeholder="Subject Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Subject Code"
          value={code}
          onChangeText={setCode}
          style={styles.input}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowCurriculumModal(true)}
        >
          <Text
            style={
              curriculum ? styles.dropdownText : styles.dropdownPlaceholder
            }
          >
            {curriculum || 'Select Curriculum'}
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Stream"
          value={stream}
          onChangeText={setStream}
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Subject'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listHeader}>
          Existing Subjects ({filteredSubjects.length})
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {FILTER_OPTIONS.map(item => {
            const active = selectedFilter === item;
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {fetching ? (
          <ActivityIndicator size="large" color="#1e3a8a" />
        ) : filteredSubjects.length === 0 ? (
          <Text style={styles.emptyText}>No subjects found.</Text>
        ) : (
          <FlatList
            data={filteredSubjects}
            keyExtractor={item => item._id}
            renderItem={renderSubject}
            scrollEnabled={false}
          />
        )}
      </View>

      <Modal visible={showCurriculumModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Curriculum</Text>

            {CURRICULUM_OPTIONS.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.modalItem}
                onPress={() => {
                  setCurriculum(item);
                  setShowCurriculumModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowCurriculumModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AddSubjectMasterScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },

  container: {
    width: width > 400 ? 360 : '92%',
    alignSelf: 'center',
    backgroundColor: '#fecaca',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    marginTop: 20,
  },

  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ac1d1dff',
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },

  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },

  dropdownText: { color: '#000' },
  dropdownPlaceholder: { color: '#999' },

  button: {
    backgroundColor: '#ac1d1dff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  listContainer: {
    width: width > 400 ? 360 : '92%',
    alignSelf: 'center',
    marginTop: 30,
  },

  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ac1d1dff',
    marginBottom: 10,
  },

  filterRow: {
    marginBottom: 14,
  },

  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    marginRight: 10,
  },

  filterChipActive: {
    backgroundColor: '#ac1d1dff',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ac1d1dff',
  },

  filterTextActive: {
    color: '#fff',
  },

  subjectCard: {
    backgroundColor: '#fecaca',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#ac1d1dff',
  },

  latestSubjectCard: {
    backgroundColor: '#fecaca',
  },

  subjectName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  subjectCode: { fontSize: 14, color: '#555' },
  metaText: { marginTop: 4, color: '#555' },

  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e3a8a',
  },

  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalItemText: { fontSize: 15 },

  modalCancel: { marginTop: 15, alignItems: 'center' },
  modalCancelText: { color: '#d00', fontWeight: 'bold' },
});
