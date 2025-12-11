import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TextInput, Alert } from "react-native";
import { Provider, Portal, Card, Button, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import AdminFeeSection from "../../components/admin/AdminFeeSection";
import { api } from "../../api/api";

export default function AdminFeesScreen() {
  const [students, setStudents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editedStudent, setEditedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Excel Modal State
  const [excelModal, setExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const getPaymentStatus = (amount, paid) => {
    if (paid === 0) return "Pending";
    if (paid === amount) return "Paid";
    if (paid > amount) return "Overpaid";
    if (paid > 0 && paid < amount) return "Partially Paid";
    return "Pending";
  };

  const fetchStudents = async (cls, section) => {
    if (!cls || !section) return;

    try {
      const endpoint = `api/student/admin/fees/${cls}/${section}`;
      const { data } = await api.get(endpoint);

      const mapped = (data || []).map((s) => {
        if (!s) return null;

        const i1 = {
          amount: s.inst1Amount || 0,
          paid: s.inst1Paid || 0,
          status: getPaymentStatus(s.inst1Amount, s.inst1Paid),
          dueDate: s.inst1Due || "N/A",
        };
        const i2 = {
          amount: s.inst2Amount || 0,
          paid: s.inst2Paid || 0,
          status: getPaymentStatus(s.inst2Amount, s.inst2Paid),
          dueDate: s.inst2Due || "N/A",
        };
        const i3 = {
          amount: s.inst3Amount || 0,
          paid: s.inst3Paid || 0,
          status: getPaymentStatus(s.inst3Amount, s.inst3Paid),
          dueDate: s.inst3Due || "N/A",
        };

        return {
          id: s.userId,
          userId: s.userId,
          name: s.name,
          totalFee: s.totalFee || 0,
          pendingFee:
            s.pendingAmount ?? s.totalFee - (i1.paid + i2.paid + i3.paid),
          className: String(cls),
          section: String(section),
          inst1: i1,
          inst2: i2,
          inst3: i3,
        };
      });

      setStudents(mapped.filter(Boolean));
    } catch (err) {
      console.log("Error fetching:", err);
    }
  };

  const handleSelectStudent = (student) => {
    const installments = [
      student.inst1 || { amount: 0, paid: 0, status: "Pending" },
      student.inst2 || { amount: 0, paid: 0, status: "Pending" },
      student.inst3 || { amount: 0, paid: 0, status: "Pending" },
    ];

    const newObj = {
      ...student,
      installments,
    };

    setSelectedStudent(newObj);
    setEditedStudent(JSON.parse(JSON.stringify(newObj)));
    setModalVisible(true);
    setIsEditMode(false);
  };

  const handleInputChange = (field, value, index = null) => {
    setEditedStudent((prev) => {
      const updated = { ...prev };
      const insts = [...updated.installments];

      if (index !== null) {
        insts[index] = {
          ...insts[index],
          paid: parseFloat(value) || 0,
          status: getPaymentStatus(insts[index].amount, parseFloat(value) || 0),
        };
      } else {
        updated[field] = value;
      }

      const totalPaid = insts.reduce((t, i) => t + (i.paid || 0), 0);
      updated.pendingFee = updated.totalFee - totalPaid;

      return { ...updated, installments: insts };
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        inst1Paid: editedStudent.installments[0].paid,
        inst1Status: editedStudent.installments[0].status,
        inst2Paid: editedStudent.installments[1].paid,
        inst2Status: editedStudent.installments[1].status,
        inst3Paid: editedStudent.installments[2].paid,
        inst3Status: editedStudent.installments[2].status,
      };

      await api.put(`api/student/admin/fees/${editedStudent.userId}`, payload);

      await fetchStudents(selectedClass, selectedSection);

      setIsEditMode(false);
    } catch (err) {
      Alert.alert("Error", "Failed to update fee details.");
    }
  };

  // Excel Upload
  const handleUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
      });

      console.log("PICKED:", res);

      if (!res || res.canceled) {
        Alert.alert("Cancelled", "No file selected");
        return;
      }

      const file = res.assets[0];

      setExcelFile({
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });

      setExcelModal(true);
    } catch (error) {
      console.log("Upload Error:", error);
      Alert.alert("Error", "Could not pick file.");
    }
  };

  const confirmUploadExcel = async () => {
    try {
      if (!excelFile) {
        Alert.alert("Error", "No file selected");
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: excelFile.uri,
        name: excelFile.name,
        type:
          excelFile.type ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      await api.post("api/student/upload-fees", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Excel uploaded successfully!");
      setExcelModal(false);
      setExcelFile(null);

      if (selectedClass && selectedSection) {
        fetchStudents(selectedClass, selectedSection);
      }
    } catch (err) {
      console.log("Excel Upload Error:", err);
      Alert.alert("Error", "Failed to upload Excel file.");
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSection)
      fetchStudents(selectedClass, selectedSection);
    else setStudents([]);
  }, [selectedClass, selectedSection]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "green";
      case "Partially Paid":
        return "orange";
      case "Pending":
        return "red";
      default:
        return "#777";
    }
  };

  return (
    <Provider>
      <AdminFeeSection
        students={students}
        onSelect={handleSelectStudent}
        selectedBoard={selectedBoard}
        setSelectedBoard={setSelectedBoard}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
      />

      {/* Student Edit Modal */}
      <Portal>
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editedStudent?.name}</Text>
                <IconButton icon="close" onPress={() => setModalVisible(false)} />
              </View>

              {editedStudent && Array.isArray(editedStudent.installments) && (
                <>
                  {!isEditMode ? (
                    <Button
                      mode="contained"
                      onPress={() => setIsEditMode(true)}
                      buttonColor="#ac1d1d"
                    >
                      Edit
                    </Button>
                  ) : (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Button
                        mode="contained"
                        onPress={handleSave}
                        buttonColor="#ac1d1d"
                      >
                        Save
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => setIsEditMode(false)}
                        textColor="#ac1d1d"
                      >
                        Cancel
                      </Button>
                    </View>
                  )}

                  <Card style={styles.feeCard}>
                    <Card.Content>
                      <Text>Total Fee: ₹{editedStudent.totalFee}</Text>
                      <Text
                        style={{
                          color: editedStudent.pendingFee > 0 ? "red" : "green",
                        }}
                      >
                        Pending: ₹{editedStudent.pendingFee}
                      </Text>
                    </Card.Content>
                  </Card>

                  {editedStudent.installments.map((inst, i) => (
                    <Card key={i} style={styles.instCard}>
                      <Card.Title
                        title={`Installment ${i + 1}`}
                        right={() => (
                          <Text
                            style={{ color: getStatusColor(inst.status), fontWeight: 600 }}
                          >
                            {inst.status}
                          </Text>
                        )}
                      />
                      <Card.Content>
                        <Text>Amount: ₹{inst.amount}</Text>
                        <Text>Due: {inst.dueDate}</Text>
                        {isEditMode ? (
                          <TextInput
                            style={styles.input}
                            value={String(inst.paid)}
                            onChangeText={(v) => handleInputChange("paid", v, i)}
                            keyboardType="numeric"
                          />
                        ) : (
                          <Text>Paid: ₹{inst.paid}</Text>
                        )}
                      </Card.Content>
                    </Card>
                  ))}
                </>
              )}
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Excel Modal */}
      <Portal>
        <Modal visible={excelModal} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.excelModalBox}>
              <Text style={styles.modalTitle}>Upload Excel File</Text>
              <Text style={{ marginVertical: 10 }}>{excelFile?.name}</Text>

              <View style={{ flexDirection: "row", gap: 15, marginTop: 10 }}>
                <Button
                  mode="contained"
                  onPress={confirmUploadExcel}
                  buttonColor="#49a85e"
                >
                  Upload
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setExcelModal(false);
                    setExcelFile(null);
                  }}
                >
                  Cancel
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>

      <View style={styles.uploadBox}>
        <Button
          mode="contained"
          icon={() => <Ionicons name="cloud-upload-outline" size={20} color="#fff" />}
          onPress={handleUpload}
          buttonColor="#49a85e"
        >
          Upload Excel Sheet
        </Button>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: { width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  excelModalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: 700 },
  feeCard: { marginVertical: 10 },
  instCard: { marginVertical: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginTop: 5, padding: 6 },
  uploadBox: { padding: 20 },
});
