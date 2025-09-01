// screens/Faculty/classes/FacultyChaptersScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import BASE_URL from "../../../config/baseURL";

export default function FacultyChaptersScreen({ route }) {
  const { grade, section, facultyId, subjectMasterId, subjectName } =
    route.params || {};
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);

  // For update modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editNumber, setEditNumber] = useState("");

  // For options modal
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedChapterForOptions, setSelectedChapterForOptions] = useState(null);

  // ✅ Fetch chapters
  const fetchChapters = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/chapters?subjectMasterId=${subjectMasterId}&classAssigned=${grade}&section=${section}`
      );
      const text = await res.text();
      console.log("FETCH CHAPTERS RESPONSE:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return JSON: " + text);
      }
      if (Array.isArray(data)) {
        setChapters(data);
      } else {
        console.warn("Unexpected response:", data);
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  // ✅ Upload Excel
  const handleUploadExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const file = result.assets[0];

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name || "chapters.xlsx",
        type:
          file.mimeType ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      formData.append("subjectMasterId", subjectMasterId);
      formData.append("classAssigned", grade);
      formData.append("section", section);
      formData.append("createdBy", facultyId);
      formData.append("mode", "replace");

      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/chapters/upload-excel`, {
        method: "POST",
        body: formData, // ❌ no Content-Type header
      });

      const text = await res.text();
      console.log("UPLOAD EXCEL RESPONSE:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return JSON: " + text);
      }

      if (res.ok) {
        Alert.alert("Success", data.message || "Chapters uploaded");
        fetchChapters();
      } else {
        Alert.alert("Error", data.error || "Upload failed");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload PDF resource
  const handleUploadPDF = async (chapterId) => {
    setOptionsModalVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const file = result.assets[0];

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name || "resource.pdf",
        type: file.mimeType || "application/pdf",
      });
      formData.append("type", "pdf");

      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/chapters/${chapterId}/upload-pdf`, {
        method: "POST",
        body: formData, // ❌ no Content-Type header
      });

      const text = await res.text();
      console.log("UPLOAD PDF RESPONSE:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return JSON: " + text);
      }

      if (res.ok) {
        Alert.alert("Uploaded", "PDF added successfully");
        fetchChapters();
      } else {
        Alert.alert("Error", data.error || "Upload failed");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete chapter
  const handleDelete = async (id) => {
    setOptionsModalVisible(false);
    Alert.alert("Confirm", "Delete this chapter?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/api/chapters/${id}`, {
              method: "DELETE",
            });
            const text = await res.text();
            console.log("DELETE RESPONSE:", text);
            let data;
            try {
              data = JSON.parse(text);
            } catch {
              throw new Error("Server did not return JSON: " + text);
            }

            if (res.ok) {
              Alert.alert("Deleted", "Chapter deleted successfully");
              fetchChapters();
            } else {
              Alert.alert("Error", data.error || "Delete failed");
            }
          } catch (err) {
            Alert.alert("Error", err.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // ✅ Open update modal
  const openEditModal = (chapter) => {
    setOptionsModalVisible(false);
    setSelectedChapter(chapter);
    setEditName(chapter.chapterName);
    setEditDesc(chapter.description);
    setEditNumber(String(chapter.chapterNumber));
    setEditModalVisible(true);
  };

  // ✅ Open options modal
  const openOptionsModal = (chapter) => {
    setSelectedChapterForOptions(chapter);
    setOptionsModalVisible(true);
  };

  // ✅ Update chapter
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/chapters/${selectedChapter._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterName: editName,
          description: editDesc,
          chapterNumber: Number(editNumber),
        }),
      });

      const text = await res.text();
      console.log("UPDATE RESPONSE:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return JSON: " + text);
      }

      if (res.ok) {
        Alert.alert("Updated", "Chapter updated successfully");
        setEditModalVisible(false);
        fetchChapters();
      } else {
        Alert.alert("Error", data.error || "Update failed");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ Subject & Class Info */}
      <Text style={styles.header}>
        {subjectName} - Class {grade} ({section})
      </Text>

      {/* ✅ Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadExcel}>
        <Text style={styles.uploadText}>Upload Chapters (Excel)</Text>
      </TouchableOpacity>

      {/* ✅ Chapters List */}
      {loading ? (
        <ActivityIndicator size="large" color="#4b4bfa" />
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.chapterCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.chapterTitle}>
                  {item.chapterNumber}. {item.chapterName}
                </Text>
                <Text style={styles.chapterDesc}>{item.description}</Text>
              </View>

              {/* Three-dot menu */}
              <TouchableOpacity onPress={() => openOptionsModal(item)}>
                <Ionicons name="ellipsis-vertical" size={22} color="#555" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center" }}>No chapters uploaded yet.</Text>
          }
        />
      )}

      {/* ✅ Custom Options Modal */}
      <Modal visible={optionsModalVisible} transparent animationType="fade">
        <View style={styles.optionsModalContainer}>
          <View style={styles.optionsModalContent}>
            <Text style={styles.optionsTitle}>Options</Text>

            {/* Upload PDF */}
            <TouchableOpacity
              style={[styles.optionButton, { alignSelf: "stretch" }]}
              onPress={() => handleUploadPDF(selectedChapterForOptions?._id)}
            >
              <Text style={styles.optionButtonText}>UPLOAD PDF</Text>
            </TouchableOpacity>

            {/* Update & Delete */}
            <View style={styles.bottomRow}>
              <View style={styles.leftActions}>
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: "#4b4bfa" }]}
                  onPress={() => openEditModal(selectedChapterForOptions)}
                >
                  <Text style={[styles.optionButtonText, { color: "#fff" }]}>UPDATE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: "#dc3545" }]}
                  onPress={() => handleDelete(selectedChapterForOptions?._id)}
                >
                  <Text style={[styles.optionButtonText, { color: "#fff" }]}>DELETE</Text>
                </TouchableOpacity>
              </View>

              {/* Cancel */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setOptionsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Update Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Chapter</Text>
            <TextInput
              style={styles.input}
              value={editNumber}
              onChangeText={setEditNumber}
              placeholder="Chapter Number"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Chapter Name"
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={editDesc}
              onChangeText={setEditDesc}
              placeholder="Description"
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#4b4bfa" }]}
                onPress={handleUpdate}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Note */}
      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Excel Format Required:</Text>
        <Text style={styles.noteText}>
          - Headers must be: chapterNumber | chapterName | description
        </Text>
        <Text style={styles.noteText}>- Example:</Text>
        <Text style={styles.noteText}>
          1 | Introduction | Basics of subject
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#333" },
  uploadButton: {
    backgroundColor: "#4b4bfa",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  uploadText: { color: "#fff", fontWeight: "600" },
  chapterCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  chapterTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  chapterDesc: { fontSize: 14, color: "#555", marginTop: 4 },
  noteBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#eef2ff",
    borderRadius: 8,
  },
  noteTitle: { fontWeight: "bold", marginBottom: 6 },
  noteText: { fontSize: 13, color: "#444" },

  // Options Modal
  optionsModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  optionsModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f8f9fa",
    marginBottom: 12,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  leftActions: { flexDirection: "row", gap: 10 },
  cancelButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  cancelButtonText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  // Update Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: { backgroundColor: "#fff", padding: 16, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6 },
});
