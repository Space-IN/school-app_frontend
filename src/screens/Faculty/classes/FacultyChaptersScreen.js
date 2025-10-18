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
  StatusBar
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/authContext";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from '@env';

export default function FacultyChaptersScreen({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const { grade, section, facultyId, subjectId, subjectName } =
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

  // console.log("ROUTE PARAMS:", route.params);

  // Set header with back button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButtonHeader}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonTextHeader}>Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // ✅ Fetch chapters
  const fetchChapters = async () => {
    try {
      setLoading(true);
      // console.log("fetch data from chapters: ", subjectId, grade, section)
      const res = await fetch(
        `${BASE_URL}/api/chapters?subjectId=${subjectId}&classAssigned=${grade}&section=${section}`
      );
      const text = await res.text();
      // console.log("FETCH CHAPTERS RESPONSE:", text);
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
      formData.append("subjectId", subjectId);
      formData.append("classAssigned", grade);
      formData.append("section", section);
      formData.append("createdBy", facultyId);
      formData.append("mode", "replace");

      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/chapters/upload-excel`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      // console.log("UPLOAD EXCEL RESPONSE:", text);
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
        body: formData,
      });

      const text = await res.text();
      // console.log("UPLOAD PDF RESPONSE:", text);
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
      // console.log("UPDATE RESPONSE:", text);
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
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#9c1006" barStyle="light-content" />
        
        {/* Custom Header with Back Button and Manual Top Safe Area */}
        <View style={[styles.customHeader, { paddingTop: insets.top + 15 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              onPress={handleBackPress}
              style={styles.backButtonContainer}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerTitle}>
            📚 Chapters Management
          </Text>
          <Text style={styles.headerSubtitle}>
            {subjectName} - Class {grade} ({section})
          </Text>
        </View>

        <View style={styles.container}>
          {/* ✅ Upload Button */}
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadExcel}>
            <Text style={styles.uploadText}>Upload Chapters (Excel)</Text>
          </TouchableOpacity>

          {/* ✅ Chapters List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4b4bfa" />
              <Text style={styles.loadingText}>Loading chapters...</Text>
            </View>
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
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No chapters uploaded yet.</Text>
                  <Text style={styles.emptySubtext}>
                    Upload an Excel file to get started
                  </Text>
                </View>
              }
            />
          )}

          {/* ✅ Custom Options Modal */}
          <Modal visible={optionsModalVisible} transparent animationType="fade">
            <View style={styles.optionsModalContainer}>
              <View style={styles.optionsModalContent}>
                <Text style={styles.optionsTitle}>Chapter Options</Text>

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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  customHeader: {
    paddingVertical: 15,
    backgroundColor: '#9c1006',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    padding: 5,
  },
  backButtonTextHeader: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#bbdbfaff" 
  },
  uploadButton: {
    backgroundColor: "#4a90e2",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  uploadText: { 
    color: "#fff", 
    fontWeight: "600" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
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
  chapterTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#222" 
  },
  chapterDesc: { 
    fontSize: 14, 
    color: "#555", 
    marginTop: 4 
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: { 
    fontSize: 16, 
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  noteBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#eef2ff",
    borderRadius: 8,
  },
  noteTitle: { 
    fontWeight: "bold", 
    marginBottom: 6 
  },
  noteText: { 
    fontSize: 13, 
    color: "#444" 
  },

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
  leftActions: { 
    flexDirection: "row", 
    gap: 10 
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 5,
  },
  cancelButtonText: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#fff" 
  },

  // Update Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: { 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 8 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 12 
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: { 
    flexDirection: "row", 
    justifyContent: "flex-end", 
    gap: 10 
  },
  modalButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 6 
  },
});