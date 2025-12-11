import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Provider, Portal, Card, Button, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import AdminFeeSection from "../../components/admin/AdminFeeSection";
import { api } from "../../api/api";

export default function AdminFeesScreen() {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editedStudent, setEditedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [excelModal, setExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const fetchTimeout = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [installmentFilter, setInstallmentFilter] = useState("All"); 
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Animation value for filter modal
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const animateFilterModal = (show) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: show ? 1 : 0, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: show ? 1 : 0.8, friction: 6, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    animateFilterModal(showFilterModal);
  }, [showFilterModal]);

  // Deep clone helper
  const deepClone = (obj) => {
    try {
      if (typeof structuredClone === "function") return structuredClone(obj);
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return Object.assign({}, obj);
    }
  };

  const getPaymentStatus = (amount, paid) => {
    if (!amount) amount = 0;
    if (!paid) paid = 0;
    if (paid === 0) return "Pending";
    if (paid === amount) return "Paid";
    if (paid > amount) return "Overpaid";
    if (paid > 0 && paid < amount) return "Partially Paid";
    return "Pending";
  };

  const fetchStudents = useCallback((cls, section) => {
    if (!cls || !section) {
      setStudents([]);
      return;
    }
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);

    fetchTimeout.current = setTimeout(async () => {
      setLoadingStudents(true);
      try {
        const { data } = await api.get(`/api/student/admin/fees/${cls}/${section}`);
        const mapped = (data || []).map((s) => {
          const inst = s.installments || [];
          const installments = [0, 1, 2].map((i) => ({
            amount: inst[i]?.amount ?? 0,
            paid: inst[i]?.paid ?? 0,
            status: inst[i]?.status ?? "Pending",
            dueDate: inst[i]?.dueDate ?? "N/A",
          }));
          const totalPaid = installments.reduce((sum, i) => sum + (i.paid || 0), 0);
          const totalFee = s.totalFee ?? 0;
          const pending = s.pendingAmount ?? Math.max(0, totalFee - totalPaid);

          return {
            id: s.userId,
            userId: s.userId,
            name: s.name,
            totalFee,
            pendingFee: pending,
            className: String(cls),
            section: String(section),
            installments,
          };
        });
        setStudents(mapped);
      } catch (err) {
        console.error("fetchStudents error:", err);
        Alert.alert("Error", "Failed to fetch students.");
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    }, 300);
  }, []);

  const handleSelectStudent = (student) => {
    if (!student) return;
    const cloned = deepClone(student);
    const installments = cloned.installments?.map((i) => ({
      amount: i?.amount ?? 0,
      paid: i?.paid ?? 0,
      status: i?.status ?? "Pending",
      dueDate: i?.dueDate ?? "N/A",
    })) || [{}, {}, {}];

    const newObj = { ...cloned, installments };
    setSelectedStudent(newObj);
    setEditedStudent(deepClone(newObj));
    setModalVisible(true);
    setIsEditMode(false);
  };

  const handleInputChange = (field, value, index = null) => {
    setEditedStudent((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      const insts = Array.isArray(updated.installments) ? [...updated.installments] : [{}, {}, {}];

      if (index !== null) {
        const val = parseFloat(value) || 0;
        insts[index] = {
          ...insts[index],
          paid: val,
          status: getPaymentStatus(insts[index].amount ?? 0, val),
        };
      } else {
        updated[field] = value;
      }

      const totalPaid = insts.reduce((t, i) => t + (i.paid || 0), 0);
      updated.pendingFee = Math.max(0, (updated.totalFee || 0) - totalPaid);

      return { ...updated, installments: insts };
    });
  };

  const handleSave = async () => {
    if (!editedStudent) return;
    setSaving(true);
    try {
      const payload = {
        fees: {
          total: editedStudent.totalFee,
          installments: editedStudent.installments.map((inst, i) => ({
            _id: inst._id ?? null,
            title: inst.title ?? `Installment ${i + 1}`,
            amount: inst.amount ?? 0,
            paid: inst.paid ?? 0,
            status: inst.status,
            dueDate: inst.dueDate ?? "N/A",
          })),
        },
      };

      await api.put(`/api/student/admin/fees/${editedStudent.userId}`, payload);

      setStudents((prev) =>
        prev.map((s) => (s.userId === editedStudent.userId ? { ...s, ...editedStudent } : s))
      );

      Alert.alert("Success", "Saved changes.");
      setIsEditMode(false);
      setModalVisible(false);
    } catch (err) {
      console.error("handleSave error:", err);
      Alert.alert("Error", "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
      });
      if (!res || res.canceled) {
        Alert.alert("Cancelled", "No file selected");
        return;
      }
      const file = res.type === "success" ? res : res.assets[0];
      setExcelFile({ uri: file.uri, name: file.name, type: file.mimeType });
      setExcelModal(true);
    } catch (err) {
      console.error("Upload Error:", err);
      Alert.alert("Error", "Could not pick file.");
    }
  };

  const confirmUploadExcel = async () => {
    try {
      if (!excelFile) { Alert.alert("Error", "No file selected"); return; }
      const formData = new FormData();
      formData.append("file", { uri: excelFile.uri, name: excelFile.name, type: excelFile.type });
      await api.post("api/student/upload-fees", formData, { headers: { "Content-Type": "multipart/form-data" } });

      Alert.alert("Success", "Excel uploaded successfully!");
      setExcelModal(false);
      setExcelFile(null);
      if (selectedClass && selectedSection) fetchStudents(selectedClass, selectedSection);
    } catch (err) {
      console.error("Excel Upload Error:", err);
      Alert.alert("Error", "Failed to upload Excel file.");
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(searchLower) ||
      student.userId.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (installmentFilter === "All") return true;
    const instIndex = parseInt(installmentFilter.replace("Inst", "")) - 1;
    const inst = student.installments[instIndex];
    return inst && (inst.status === "Pending" || inst.status === "Partially Paid");
  });

  useEffect(() => {
    if (selectedClass && selectedSection) fetchStudents(selectedClass, selectedSection);
    else setStudents([]);
    return () => { if (fetchTimeout.current) clearTimeout(fetchTimeout.current); };
  }, [selectedClass, selectedSection, fetchStudents]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid": return "green";
      case "Partially Paid": return "orange";
      case "Pending": return "red";
      default: return "#777";
    }
  };

  return (
    <Provider>
      {/* Upload Excel Button */}
      <View style={{ padding: 20 }}>
        <Button
          mode="contained"
          icon={() => <Ionicons name="cloud-upload-outline" size={20} color="#fff" />}
          onPress={handleUpload}
          buttonColor="#49a85e"
        >
          Upload Excel Sheet
        </Button>
      </View>

      {/* Search + Filter */}
      <View style={{ paddingHorizontal: 20, flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginRight: 10, height: 40 }}
          placeholder="Search by name or ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <IconButton icon="filter" size={24} onPress={() => setShowFilterModal(true)} />
      </View>

      <AdminFeeSection
        students={filteredStudents}
        onSelect={handleSelectStudent}
        selectedBoard={selectedBoard}
        setSelectedBoard={setSelectedBoard}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
      />

      {loadingStudents && (
        <View style={{ padding: 12, alignItems: "center" }}>
          <ActivityIndicator size="small" />
          <Text style={{ marginTop: 6 }}>Loading students...</Text>
        </View>
      )}

      {/* Filter Modal with animations */}
      <Portal>
        {showFilterModal && (
          <Modal transparent visible animationType="none">
            <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
              <Animated.View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", opacity: fadeAnim, justifyContent: "center", alignItems: "center" }}>
                <Animated.View style={{ width: 250, backgroundColor: "#fff", padding: 20, borderRadius: 10, transform: [{ scale: scaleAnim }] }}>
                  {["All", "Inst1", "Inst2", "Inst3"].map((item) => (
                    <Button
                      key={item}
                      mode={installmentFilter === item ? "contained" : "outlined"}
                      onPress={() => { setInstallmentFilter(item); setShowFilterModal(false); }}
                      buttonColor={installmentFilter === item ? "#ac1d1dff" : undefined}
                      style={{ marginVertical: 5 }}
                    >
                      {item === "All" ? "All Students" : `${item} Pending`}
                    </Button>
                  ))}
                  <Button onPress={() => setShowFilterModal(false)} style={{ marginTop:10 }}>Cancel</Button>
                </Animated.View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </Portal>

      {/* Student Fee Modal */}
      <Portal>
        <Modal visible={modalVisible} transparent animationType="fade">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20 }}>
              <View style={styles.modalBox}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{editedStudent?.name ?? "Student"}</Text>
                  <IconButton icon="close" onPress={() => setModalVisible(false)} />
                </View>

                {editedStudent && Array.isArray(editedStudent.installments) && (
                  <>
                    {!isEditMode ? (
                      <Button mode="contained" onPress={() => setIsEditMode(true)} buttonColor="#ac1d1d">Edit</Button>
                    ) : (
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} buttonColor="#ac1d1d">Save</Button>
                        <Button mode="outlined" onPress={() => { setIsEditMode(false); setEditedStudent(deepClone(selectedStudent)); }}>Cancel</Button>
                      </View>
                    )}

                    <Card style={styles.feeCard}>
                      <Card.Content>
                        <Text>Total Fee: ₹{editedStudent.totalFee}</Text>
                        <Text style={{ color: editedStudent.pendingFee > 0 ? "red" : "green" }}>Pending: ₹{editedStudent.pendingFee}</Text>
                      </Card.Content>
                    </Card>

                    {editedStudent.installments.map((inst, i) => (
                      <Card key={i} style={styles.instCard}>
                        <Card.Title
                          title={`Installment ${i + 1}`}
                          right={() => <Text style={{ color: getStatusColor(inst.status), fontWeight: "600" }}>{inst.status}</Text>}
                        />
                        <Card.Content>
                          <Text>Amount: ₹{inst.amount}</Text>
                          <Text>Due: {inst.dueDate ?? "N/A"}</Text>
                          {isEditMode ? (
                            <TextInput
                              style={styles.input}
                              value={String(inst.paid ?? 0)}
                              onChangeText={(v) => handleInputChange("paid", v, i)}
                              keyboardType="numeric"
                            />
                          ) : (
                            <Text>Paid: ₹{inst.paid ?? 0}</Text>
                          )}
                        </Card.Content>
                      </Card>
                    ))}
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

      {/* Excel Upload Modal */}
      <Portal>
        <Modal visible={excelModal} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.excelModalBox}>
              <Text style={styles.modalTitle}>Upload Excel File</Text>
              <Text style={{ marginVertical: 10 }}>{excelFile?.name}</Text>

              <View style={{ flexDirection: "row", gap: 15, marginTop: 10 }}>
                <Button mode="contained" onPress={confirmUploadExcel} buttonColor="#49a85e">Upload</Button>
                <Button mode="outlined" onPress={() => { setExcelModal(false); setExcelFile(null); }}>Cancel</Button>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </Provider>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { width: 400, maxWidth: "95%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  excelModalBox: { width: "85%", backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  feeCard: { marginVertical: 10 },
  instCard: { marginVertical: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginTop: 8, padding: 8, minHeight: 36 },
});
