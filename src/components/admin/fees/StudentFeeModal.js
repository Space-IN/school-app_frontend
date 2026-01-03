import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import PaymentHistoryPanel from "./PaymentHistoryPanel";

const PAYMENT_MODES = [
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
  { label: "Card", value: "OTHER" },
  { label: "Bank Transfer", value: "BANK" },
  { label: "Cheque", value: "CHEQUE" },
];

export default function StudentFeeModal({
  visible,
  student,
  totalFee,
  installments,
  editMode,
  paymentHistory,
  setEditMode,
  setTotalFee,
  updateInstallmentField,
  onSave,
  onClose,
}) {
  const [showHistory, setShowHistory] = useState(false);

  if (!student) return null;

  /* ---------------- Header ---------------- */
  const Header = () => (
    <View>
      {/* Title + Actions */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {student.name} ({student.userId})
        </Text>

        <View style={styles.headerActions}>
          {/* History */}
          <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
            <Text style={styles.icon}>🕘</Text>
          </TouchableOpacity>

          {/* Edit (ONLY when not editing) */}
          {!editMode && (
            <TouchableOpacity
              style={styles.editBtnSmall}
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.btnText}>Edit</Text>
            </TouchableOpacity>
          )}

          {/* Close */}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.icon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Total Fee */}
      <Text style={styles.label}>Total Fee</Text>
      <TextInput
        value={totalFee}
        editable={editMode}
        keyboardType="numeric"
        onChangeText={setTotalFee}
        style={[styles.input, !editMode && styles.disabled]}
      />

      <Text style={styles.label}>Installments</Text>
    </View>
  );

  /* ---------------- Footer ---------------- */
  const Footer = () => (
    <View>
      {/* History */}
      {showHistory && (
        <>
          <Text style={styles.label}>Payment History</Text>
          <PaymentHistoryPanel history={paymentHistory || []} />
        </>
      )}

      {/* Save / Cancel ONLY in edit mode */}
      {editMode && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setEditMode(false)}
          >
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  /* ---------------- Installment Row ---------------- */
  const renderInstallment = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.instTitle}>{item.title}</Text>

      <Row label="Amount">
        <TextInput
          style={[styles.smallInput, !editMode && styles.disabled]}
          editable={editMode}
          keyboardType="numeric"
          value={String(item.amount)}
          onChangeText={(v) =>
            updateInstallmentField(index, "amount", v)
          }
        />
      </Row>

      <Row label="Paid">
        <TextInput
          style={[styles.smallInput, !editMode && styles.disabled]}
          editable={editMode}
          keyboardType="numeric"
          value={String(item.paid)}
          onChangeText={(v) =>
            updateInstallmentField(index, "paid", v)
          }
        />
      </Row>

      {editMode && (
        <>
          <Text style={styles.subLabel}>Payment Mode</Text>
          <RNPickerSelect
            onValueChange={(v) =>
              updateInstallmentField(index, "paymentMode", v)
            }
            value={item.paymentMode || "CASH"}
            items={PAYMENT_MODES}
            style={pickerStyles}
          />

          <Text style={styles.subLabel}>Remarks</Text>
          <TextInput
            style={styles.remarkInput}
            placeholder="Optional remark"
            value={item.remarks || ""}
            onChangeText={(v) =>
              updateInstallmentField(index, "remarks", v)
            }
          />
        </>
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <FlatList
          data={installments}
          keyExtractor={(item) => item.order.toString()}
          renderItem={renderInstallment}
          ListHeaderComponent={Header}
          ListFooterComponent={Footer}
          contentContainerStyle={styles.box}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}

/* ---------- Helpers ---------- */
const Row = ({ label, children }) => (
  <View style={styles.row}>
    <Text>{label}</Text>
    {children}
  </View>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 16,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: "700" },
  icon: { fontSize: 20 },
  label: { marginTop: 12, fontWeight: "600" },
  subLabel: { marginTop: 8, fontSize: 12, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  disabled: { backgroundColor: "#f1f1f1" },
  card: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  instTitle: { fontWeight: "700", marginBottom: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: 90,
    padding: 6,
    borderRadius: 6,
    textAlign: "center",
  },
  remarkInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 6,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  editBtnSmall: {
    backgroundColor: "#007bff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelBtn: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});

const pickerStyles = {
  inputIOS: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
};
