import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [deletingId, setDeletingId] = useState(null);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const academicYear = getCurrentAcademicYear();

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/admin/assessment/assessment-template', {
        params: { academicYear, board },
      });

      setTemplates(res.data?.success ? res.data.data || [] : []);
    } catch (err) {
      console.error('Failed to fetch exam templates:', err);
      Alert.alert('Error', 'Unable to fetch exam templates.');
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
    navigation.navigate('CreateExamTemplateScreen', { board, academicYear });
  };

  const openTemplateModal = (template) => {
    setSelectedTemplate(template);
    setModalVisible(true);
  };

  const closeTemplateModal = () => {
    setModalVisible(false);
    setSelectedTemplate(null);
  };

  /* =======================
     DELETE TEMPLATE (SAFE)
  ======================= */
  const handleDeleteTemplate = (templateId) => {
    if (deletingId) return; // prevent double tap

    Alert.alert(
      'Delete Exam Template',
      'Are you sure you want to delete this exam template? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(templateId);
              await api.delete(
                `/api/admin/assessment/assessment-template/${templateId}`
              );
              Alert.alert('Success', 'Exam template deleted successfully.');
              fetchTemplates();
            } catch (err) {
              console.error('Failed to delete template:', err);
              Alert.alert(
                'Error',
                err.response?.data?.message || 'Failed to delete exam template.'
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
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
        <ActivityIndicator size="large" color="#ac1d1dff" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={
          templates.length === 0 && styles.flatListContainer
        }
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <View style={styles.templateCard}>
            {/* DELETE ICON */}
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleDeleteTemplate(item._id)}
              disabled={deletingId === item._id}
              activeOpacity={0.7}
            >
              {deletingId === item._id ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              )}
            </TouchableOpacity>

            {/* CARD CONTENT */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openTemplateModal(item)}
            >
              <Text style={styles.templateName}>
                {item.assessmentName}
              </Text>

              <Text style={styles.templateMeta}>
                Class {item.grade} • {item.assessmentType}
              </Text>

              <View style={styles.viewHint}>
                <Ionicons name="eye-outline" size={14} color="#555" />
                <Text style={styles.viewText}>View / Edit</Text>
              </View>
            </TouchableOpacity>
          </View>
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
    color: '#ac1d1dff',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  createButton: {
    backgroundColor: '#ac1d1dff',
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
    backgroundColor: '#fecaca',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
  },

  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    zIndex: 10,
  },

  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ac1d1dff',
  },

  templateMeta: {
    fontSize: 13,
    color: '#ac1d1dff',
    marginTop: 4,
  },

  viewHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  viewText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#ac1d1dff',
  },
});
