import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import BASE_URL from "../../config/baseURL";

const FacultyScoreScreen = ({ route, navigation }) => {
  const { facultyId, classId, section, subjectName } = route.params;
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        // Use the new endpoint with class and section filter
        const res = await axios.get(
          `${BASE_URL}/api/lecture-recording/faculty/${facultyId}/class/${classId}/section/${section}`
        );
        setLectures(res.data);
      } catch (error) {
        console.error("Error fetching lectures:", error);
        setLectures([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, [facultyId, classId, section]);

  const getRelevanceColor = (isRelevant) => {
    switch (isRelevant) {
      case 'highly_related':
        return '#4CAF50'; // Green
      case 'moderately_related':
        return '#FF9800'; // Orange
      case 'not_relevant':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const getRelevanceIcon = (isRelevant) => {
    switch (isRelevant) {
      case 'highly_related':
        return 'checkmark-circle';
      case 'moderately_related':
        return 'warning';
      case 'not_relevant':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const duration = Math.round((new Date(end) - new Date(start)) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Lecture Recordings</Text>
          <Text style={styles.subtitle}>
            {facultyId} • Class {classId}-{section} • {subjectName}
          </Text>
        </View>
      </View>

      <FlatList
        data={lectures}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.lectureCard}>
            <View style={styles.lectureHeader}>
              <Text style={styles.topicName}>{item.topicName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getRelevanceColor(item.isRelevant) }]}>
                <Ionicons 
                  name={getRelevanceIcon(item.isRelevant)} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.statusText}>
                  {item.score ? `${item.score}%` : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.lectureInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.infoText}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="hourglass-outline" size={16} color="#666" />
                <Text style={styles.infoText}>
                  Duration: {formatDuration(item.startTime, item.endTime)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={16} color="#666" />
                <Text style={styles.infoText}>
                  Status: {item.status}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="analytics-outline" size={16} color="#666" />
                <Text style={styles.infoText}>
                  Relevance: {item.isRelevant || 'Not checked'}
                </Text>
              </View>
            </View>

            {item.transcriptionFile && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptLabel}>Transcript:</Text>
                <Text style={styles.transcriptText} numberOfLines={3}>
                  {item.transcriptionFile}
                </Text>
              </View>
            )}

            <View style={styles.modelInfo}>
              <Text style={styles.modelText}>
                Model: {item.modelVersion || 'N/A'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              No lecture recordings found for this faculty
            </Text>
            <Text style={styles.emptySubtext}>
              Class {classId} - Section {section}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f9f9f9" 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  lectureCard: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  lectureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  lectureInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  transcriptContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  modelInfo: {
    alignItems: 'flex-end',
  },
  modelText: {
    fontSize: 12,
    color: "#999",
    fontStyle: 'italic',
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 40,
  },
  emptyText: { 
    fontSize: 18, 
    color: "#888",
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: 'center',
    marginTop: 8,
  },
});

export default FacultyScoreScreen;