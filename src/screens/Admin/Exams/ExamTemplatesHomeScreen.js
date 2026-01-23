import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../api/api';
import ExamTemplateDetailsModal from '../../../components/admin/ExamTemplateDetailsModal';

const getCurrentAcademicYear = () => {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
};

export default function ExamTemplatesHomeScreen({ route, navigation }) {
  const { board } = route.params || {};

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const academicYear = getCurrentAcademicYear();


  const fetchTemplates = async () => {
    try {
      const res = await api.get(
        '/api/admin/assessment/assessment-template',
        {
          params: {
            academicYear,
            board,
          },
        }
      );

      if (res.data?.success) {
        setTemplates(res.data.data || []);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error(' Failed to fetch exam templates:', err);
      Alert.alert(
        'Error',
        'Unable to fetch exam templates. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTemplates();
  }, []);


  const handleCreateTemplate = () => {
    navigation.navigate('CreateExamTemplateScreen', {
      board,
      academicYear,
    });
  };

  const openTemplateModal = (template) => {
    setSelectedTemplate(template);
    setModalVisible(true);
  };

  const closeTemplateModal = () => {
    setModalVisible(false);
    setSelectedTemplate(null);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="layers-outline" size={48} color="#999" />
      <Text style={styles.emptyTitle}>No Exam Templates Found</Text>
      <Text style={styles.emptySubtitle}>
        Create an exam template to start entering marks
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Exam Templates</Text>
          <Text style={styles.subtitle}>
            {board} • {academicYear}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTemplate}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={
          templates.length === 0 && styles.flatListContainer
        }
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openTemplateModal(item)}
          >
            <View style={styles.templateCard}>
              <Text style={styles.templateName}>
                {item.assessmentName}
              </Text>

              <Text style={styles.templateMeta}>
                Class {item.grade} • {item.assessmentType}
              </Text>

              <Text style={styles.templateMetaSmall}>
                Max Marks: {item.maxMarks}
              </Text>

              <View style={styles.viewHint}>
                <Ionicons name="eye-outline" size={14} color="#555" />
                <Text style={styles.viewText}>View / Edit</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <ExamTemplateDetailsModal
        visible={modalVisible}
        template={selectedTemplate}
        onClose={closeTemplateModal}
        onUpdated={fetchTemplates}
      />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  createButton: {
    backgroundColor: '#1e3a8a',
    padding: 12,
    borderRadius: 12,
  },

  flatListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    color: '#333',
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 6,
  },

  templateCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  templateMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  templateMetaSmall: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  viewHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  viewText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#555',
  },
});
