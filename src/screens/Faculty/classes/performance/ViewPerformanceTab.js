import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../../../api/api";

const ViewPerformanceTab = ({ route }) => {
  const { grade, section, board, year, subjectName } = route.params || {};

  const [assessments, setAssessments] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch available assessments
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/student/assessment/`, {
        params: { year, board, grade, section },
      });

      console.log("📘 Assessments:", response.data);

      if (response.data.exams?.length) {
        setAssessments(response.data.exams);
      } else {
        setError("No assessments found.");
      }
    } catch (err) {
      console.error("❌ Error fetching assessments:", err);
      setError("Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch performance for selected assessment
  const fetchAssessmentScores = async (assessmentId) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/faculty/assessment/faculty/assessmentScore/${assessmentId}`
      );

      console.log("📊 Raw score response:", response.data);

      if (response.data.success) {
        const records = response.data.data.records || [];

      const flattenedScores = records.flatMap((record) =>
        (record.subjects || [])
          // ✅ FILTER BY subjectName
          .filter(
            (subj) =>
              !subjectName || subj.subject?.name === subjectName
          )
          .map((subj) => {
            const firstComponent = subj.components?.[0] || {};

            return {
              student: record.student,
              subjectName: subj.subject?.name,
              marks_obtained: subj.marks_obtained,
              max_marks: subj.max_marks,
              grade_obtained: subj.grade_obtained,
              status: subj.status,
              marked_by: firstComponent.marked_by || null,
            };
          })
      );


        setScores(flattenedScores);
      } else {
        setScores([]);
        setError(response.data.message || "Failed to load scores.");
      }
    } catch (err) {
      console.error("❌ Error fetching scores:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Error fetching scores");
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAssessments();
    }, [])
  );

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    setModalVisible(false);
    fetchAssessmentScores(test._id);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.studentName}>
        🎓 {item.student.name} ({item.student.userId})
      </Text>
      <Text style={styles.subText}>Subject: {item.subjectName}</Text>
      <Text style={styles.subText}>
        Marks: {item.marks_obtained} / {item.max_marks}
      </Text>
      <Text style={styles.subText}>Grade: {item.grade_obtained}</Text>
      <Text
        style={[
          styles.subText,
          { color: item.status === "Pass" ? "green" : "red", fontWeight: "bold" },
        ]}
      >
        Status: {item.status}
      </Text>
      <Text style={styles.subText}>
        Marked By: {item.marked_by?.name || "—"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedTest ? selectedTest.assessment_name : "Select Assessment"}
        </Text>
        <Ionicons name="caret-down" size={20} color="#000" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalBox}>
            <FlatList
              data={assessments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectTest(item)}
                >
                  <Text style={styles.modalText}>{item.assessment_name}</Text>
                  <Text style={styles.modalSubText}>{item.test_type}</Text>
                  <Text style={styles.modalSubText}>
                    {new Date(item.date).toISOString().split("T")[0]}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.errorText}>No assessments found.</Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={scores}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            selectedTest ? (
              <Text style={styles.errorText}>No scores found.</Text>
            ) : (
              <Text style={styles.errorText}>
                Select an assessment to view results.
              </Text>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  dropdownText: { fontSize: 16, color: "#000", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "80%",
    padding: 10,
    maxHeight: "70%",
  },
  modalItem: {
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    paddingVertical: 10,
  },
  modalText: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  modalSubText: { fontSize: 14, color: "#555", textAlign: "center" },
  card: {
    backgroundColor: "#f4f7fb",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  studentName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  subText: { fontSize: 14, color: "#444", marginBottom: 2 },
  errorText: { textAlign: "center", color: "red", marginTop: 20, fontSize: 16 },
});

export default ViewPerformanceTab;
