import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
  
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from '@env';
import {api} from '../../api/api'

const FacultyScoreScreen = ({ route }) => {
  const { facultyId, classId, section, subjectName } = route.params;
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTranscript, setExpandedTranscript] = useState(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await api.get(
          `${BASE_URL}/api/admin/lecture-recording/faculty/${facultyId}/class/${classId}/section/${section}`
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
  const value = isRelevant?.toLowerCase?.() ?? "";
  if (value === "highly_relevant") return "#4CAF50";
  if (value === "moderately_relevant") return "#FF9800";
  if (value === "not_relevant") return "#F44336";
  return "#9E9E9E"; 
};

const getRelevanceIcon = (isRelevant) => {
  const value = isRelevant?.toLowerCase?.() ?? "";
  if (value === "highly_relevant") return "checkmark-circle";
  if (value === "moderately_relevant") return "warning";
  if (value === "not_relevant") return "close-circle";
  return "help-circle"; 
};


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const duration = Math.round((new Date(end) - new Date(start)) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const renderTranscriptWithHighlights = (transcript, evidences) => {
    if (!evidences || Object.keys(evidences).length === 0) {
      return <Text style={styles.transcriptText}>{transcript}</Text>;
    }

    let highlightedText = transcript;
    const parts = [];
    const evidenceKeys = Object.keys(evidences);
    let lastIndex = 0;

    evidenceKeys.forEach((sentence) => {
      const idx = highlightedText.indexOf(sentence, lastIndex);
      if (idx !== -1) {
        if (idx > lastIndex) {
          parts.push(
            <Text key={`before-${idx}`} style={styles.transcriptText}>
              {highlightedText.substring(lastIndex, idx)}
            </Text>
          );
        }
        parts.push(
          <Text key={`evidence-${idx}`} style={styles.highlightedText}>
            {sentence}
          </Text>
        );
        lastIndex = idx + sentence.length;
      }
    });

    if (lastIndex < highlightedText.length) {
      parts.push(
        <Text key={`after-${lastIndex}`} style={styles.transcriptText}>
          {highlightedText.substring(lastIndex)}
        </Text>
      );
    }

    return <Text>{parts}</Text>;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={lectures}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isExpanded = expandedTranscript === item._id;
          const evidences = item.sensitivity?.evidences || {};
          const sensitivityScore = item.sensitivity?.sensitivity_score;

          return (
            <View style={styles.lectureCard}>
              <View style={styles.lectureHeader}>
                <Text style={styles.topicName}>{item.topicName}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getRelevanceColor(item.isRelevant) },
                  ]}
                >
                  <Ionicons
                    name={getRelevanceIcon(item.isRelevant)}
                    size={16}
                    color="white"
                  />
                  <Text style={styles.statusText}>
                    {item.score ? `${item.score}%` : "N/A"}
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
                  <Text style={styles.infoText}>Status: {item.status}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="analytics-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    Relevance: {item.isRelevant || "Not checked"}
                  </Text>
                </View>

                {sensitivityScore && (
                  <View style={styles.infoRow}>
                    <Ionicons name="alert-circle-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>
                      Sensitivity Score: {sensitivityScore.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {item.transcriptionFile && (
                <Text
                  style={styles.toggleButton}
                  onPress={() =>
                    setExpandedTranscript(isExpanded ? null : item._id)
                  }
                >
                  {isExpanded ? "Hide Transcript" : "View Transcript"}
                </Text>
              )}

              {isExpanded && (
                <View style={styles.transcriptContainer}>
                  <Text style={styles.transcriptLabel}>Transcript:</Text>
                  {renderTranscriptWithHighlights(
                    item.transcriptionFile,
                    evidences
                  )}
                </View>
              )}

              <View style={styles.modelInfo}>
                <Text style={styles.modelText}>
                  Model: {item.modelVersion || "N/A"}
                </Text>
              </View>
            </View>
          );
        }}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffffff", paddingHorizontal: 16 },
  lectureCard: {
    backgroundColor: "#faebebff",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  topicName: { fontSize: 18, fontWeight: "600", color: "#333", flex: 1 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: { color: "white", fontSize: 12, fontWeight: "600", marginLeft: 4 },
  lectureInfo: { marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { fontSize: 14, color: "#666", marginLeft: 8 },
  toggleButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007bff",
    marginBottom: 8,
  },
  transcriptContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  transcriptText: { fontSize: 13, color: "#555", lineHeight: 18 },
  highlightedText: {
    fontSize: 13,
    color: "#000",
    lineHeight: 18,
    backgroundColor: "yellow",
    fontWeight: "600",
  },
  modelInfo: { alignItems: "flex-end" },
  modelText: { fontSize: 12, color: "#999", fontStyle: "italic" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyText: { fontSize: 18, color: "#888", textAlign: "center", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#aaa", textAlign: "center", marginTop: 8 },
});

export default FacultyScoreScreen;
