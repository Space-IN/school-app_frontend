// src/screens/Admin/fees/ManageFeesTab.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Button } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../api/api";

const CLASS_ORDER = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const BOARD_COLORS = {
  CBSE: "#49a85e",
  STATE: "#4a90e2",
};

export default function ManageFeesTab() {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [feeTemplates, setFeeTemplates] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("CBSE"); 
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    fetchFeeTemplates();
  }, []);

  const fetchFeeTemplates = async () => {
    try {
      setLoading(true);
      console.log("API BASE URL:", api.defaults.baseURL);
      const res = await api.get("/api/admin/student/fee-template");
      const templates = res.data.data || [];
      setFeeTemplates(templates);
    } catch (err) {
      console.log("Error fetching fee templates:", err);
      setResultMessage("Failed to fetch fee templates.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type) => {
    try {
      const file = await DocumentPicker.getDocumentAsync({
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (file.type === "success") {
        setLoading(true);

        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        let endpoint = "";
        if (type === "template") endpoint = "api/admin/student/fee-template/upload";
        if (type === "installment") endpoint = "/api/admin/student/student-fee/upload";

        const res = await api.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const { updated, skipped } = res.data || {};
        setResultMessage(
          `${type === "template" ? "Fee Template" : "Installments"} Upload Complete!\nUpdated: ${
            updated || 0
          }\nSkipped: ${skipped || 0}`
        );
        setModalVisible(true);

        if (type === "template") fetchFeeTemplates(); 
      }
    } catch (err) {
      console.log("Upload error:", err);
      setResultMessage("Upload failed. Please try again.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const displayedTemplates = feeTemplates
    .filter((t) => t.board === selectedBoard)
    .sort((a, b) => CLASS_ORDER.indexOf(a.className) - CLASS_ORDER.indexOf(b.className));

  const renderTemplateCard = (item) => {
    const isExpanded = expandedCardId === item._id;

    return (
      <TouchableOpacity
        key={item._id}
        style={[styles.templateCard, { borderLeftColor: BOARD_COLORS[item.board] || "#000" }]}
        onPress={() => setExpandedCardId(isExpanded ? null : item._id)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>
          Academic Year: {item.academicYear} | Class: {item.className}
        </Text>
        <Text>Board: {item.board}</Text>
        <Text>Total Fee: ₹{item.totalFee}</Text>
        <Text>Status: {item.active ? "Active" : "Inactive"}</Text>

        {isExpanded && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: "600" }}>Installments:</Text>
            {item.installments && item.installments.length > 0 ? (
              item.installments.map((inst, index) => (
                <Text key={index}>
                  {inst.title}: ₹{inst.amount} | Due:{" "}
                  {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : "N/A"}
                </Text>
              ))
            ) : (
              <Text>No installments defined</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Board Selector */}
      <View style={styles.boardSelector}>
        {Object.keys(BOARD_COLORS).map((board) => (
          <TouchableOpacity
            key={board}
            style={[
              styles.boardButton,
              selectedBoard === board && { backgroundColor: BOARD_COLORS[board] },
            ]}
            onPress={() => setSelectedBoard(board)}
          >
            <Text
              style={[
                styles.boardButtonText,
                selectedBoard === board && { color: "#fff", fontWeight: "700" },
              ]}
            >
              {board}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fee Template List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        {displayedTemplates.length === 0 ? (
          <Text style={styles.text}>No templates uploaded for {selectedBoard}.</Text>
        ) : (
          displayedTemplates.map(renderTemplateCard)
        )}
      </ScrollView>

      {/* Upload Buttons at Bottom */}
      <View style={styles.uploadContainer}>
        <Button
          mode="contained"
          icon={() => <Ionicons name="cloud-upload-outline" size={18} color="#fff" />}
          buttonColor="#49a85e"
          style={styles.button}
          onPress={() => handleUpload("template")}
          loading={loading}
        >
          Upload Fee Template
        </Button>

        <Button
          mode="contained"
          icon={() => <Ionicons name="cloud-upload-outline" size={18} color="#fff" />}
          buttonColor="#4a90e2"
          style={styles.button}
          onPress={() => handleUpload("installment")}
          loading={loading}
        >
          Upload Installments
        </Button>
      </View>

      {/* Result Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{resultMessage}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  button: { marginVertical: 8 },
  boardSelector: { flexDirection: "row", marginBottom: 12, justifyContent: "space-around" },
  boardButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  boardButtonText: { fontSize: 14 },
  listContainer: { flex: 1 },
  text: { color: "#777", textAlign: "center", marginTop: 20 },
  templateCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
  },
  cardTitle: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
  uploadContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: { width: "80%", backgroundColor: "#fff", borderRadius: 12, padding: 20, alignItems: "center" },
  modalText: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  closeButton: { backgroundColor: "#49a85e", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  loading: { position: "absolute", top: "50%", left: "50%" },
});
