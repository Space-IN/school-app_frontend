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

  const [feeTemplates, setFeeTemplates] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("CBSE");
  const [expandedCardId, setExpandedCardId] = useState(null);


  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pickedFile, setPickedFile] = useState(null);
  const [uploadType, setUploadType] = useState(null);

  useEffect(() => {
    fetchFeeTemplates();
  }, []);

  const fetchFeeTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/student/fee-template");
      setFeeTemplates(res.data.data || []);
    } catch {
      showResult("Failed to fetch fee templates.", true);
    } finally {
      setLoading(false);
    }
  };


  const pickFile = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) return;

      if (!file.name?.endsWith(".xlsx")) {
        showResult("Invalid file type. Please upload a .xlsx file.", true);
        return;
      }

      setPickedFile(file);
      setUploadType(type);
      setConfirmVisible(true);
    } catch {
      showResult("File selection failed.", true);
    }
  };


  const showResult = (msg, error = false) => {
    setIsError(error);
    setResultMessage(msg);
    setResultModalVisible(true);
  };


  const confirmUpload = async () => {
    if (!pickedFile || !uploadType) return;

    try {
      setConfirmVisible(false);
      setLoading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: pickedFile.uri,
        name: pickedFile.name,
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const endpoint =
        uploadType === "template"
          ? "/api/admin/student/fee-template/upload"
          : "/api/admin/student/student-fee/upload";

      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

   
      if (uploadType === "template") {
        const {
          templatesProcessed = 0,
          studentFeesCreated = 0,
          rowsSkipped = 0,
        } = res.data || {};

        showResult(
          `Fee Template Upload Successful \n\n` +
            `Templates Processed: ${templatesProcessed}\n` +
            `Student Fees Created: ${studentFeesCreated}\n` +
            `Rows Skipped: ${rowsSkipped}`,
          false
        );

        fetchFeeTemplates();
      } else {
        const { updatedCount = 0, skippedCount = 0 } = res.data || {};

        showResult(
          `Bulk Installments Updated \n\n` +
            `Updated Records: ${updatedCount}\n` +
            `Skipped Records: ${skippedCount}`,
          false
        );
      }
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        "Upload failed. Please check Excel format.";

      showResult(`Upload Failed \n\n${backendMessage}`, true);
    } finally {
      setLoading(false);
      setPickedFile(null);
      setUploadType(null);
    }
  };

  const displayedTemplates = feeTemplates
    .filter((t) => t.board === selectedBoard)
    .sort(
      (a, b) =>
        CLASS_ORDER.indexOf(a.className) -
        CLASS_ORDER.indexOf(b.className)
    );

  return (
    <View style={styles.container}>
      <View style={styles.boardSelector}>
        {Object.keys(BOARD_COLORS).map((board) => (
          <TouchableOpacity
            key={board}
            style={[
              styles.boardButton,
              selectedBoard === board && {
                backgroundColor: BOARD_COLORS[board],
              },
            ]}
            onPress={() => setSelectedBoard(board)}
          >
            <Text
              style={[
                styles.boardButtonText,
                selectedBoard === board && {
                  color: "#fff",
                  fontWeight: "700",
                },
              ]}
            >
              {board}
            </Text>
          </TouchableOpacity>
        ))}
      </View>


      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {displayedTemplates.length === 0 ? (
          <Text style={styles.text}>No templates for {selectedBoard}</Text>
        ) : (
          displayedTemplates.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[
                styles.templateCard,
                { borderLeftColor: BOARD_COLORS[item.board] },
              ]}
              onPress={() =>
                setExpandedCardId(
                  expandedCardId === item._id ? null : item._id
                )
              }
            >
              <Text style={styles.cardTitle}>
                {item.academicYear} | Class {item.className}
              </Text>
              <Text>Total Fee: ₹{item.totalFee}</Text>

              {expandedCardId === item._id && (
                <View style={{ marginTop: 8 }}>
                  {item.installments?.map((i, idx) => (
                    <Text key={idx}>
                      {i.title}: ₹{i.amount}
                    </Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

 
      <View style={styles.uploadContainer}>
        <Button
          mode="contained"
          buttonColor="#49a85e"
          icon={() => (
            <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
          )}
          onPress={() => pickFile("template")}
        >
          Upload Fee Template
        </Button>

        <Button
          mode="contained"
          buttonColor="#4a90e2"
          icon={() => (
            <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
          )}
          style={{ marginTop: 8 }}
          onPress={() => pickFile("installment")}
        >
          Upload Installments
        </Button>
      </View>


      <Modal transparent visible={confirmVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Upload</Text>
            <Text>{pickedFile?.name}</Text>

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={confirmUpload}
              >
                <Text style={styles.btnText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={resultModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalText,
                { color: isError ? "#dc3545" : "#16a34a" },
              ]}
            >
              {resultMessage}
            </Text>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setResultModalVisible(false)}
            >
              <Text style={styles.btnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && <ActivityIndicator size="large" style={styles.loading} />}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  boardSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  boardButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  boardButtonText: { fontSize: 14 },
  templateCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginVertical: 6,
    borderLeftWidth: 5,
  },
  cardTitle: { fontWeight: "700" },
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
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalText: { textAlign: "center", marginBottom: 20 },
  confirmBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  loading: { position: "absolute", top: "50%", left: "50%" },
});
