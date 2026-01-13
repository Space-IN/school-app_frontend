import React, { useState, useEffect, memo, useMemo } from "react";
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

/* ---------------- Installment Row ---------------- */
const InstallmentRow = memo(({ item, index, editMode, onLocalChange }) => (
  <View style={styles.card}>
    <Text style={styles.instTitle}>{item.title}</Text>

    <Row label="Amount">
      <TextInput
        style={[styles.smallInput, !editMode && styles.disabled]}
        editable={editMode}
        keyboardType="numeric"
        blurOnSubmit={false}
        returnKeyType="done"
        value={item.amount}
        onChangeText={(v) => onLocalChange(index, "amount", v)}
      />
    </Row>

    <Row label="Paid">
      <TextInput
        style={[styles.smallInput, !editMode && styles.disabled]}
        editable={editMode}
        keyboardType="numeric"
        blurOnSubmit={false}
        returnKeyType="done"
        value={item.paid}
        onChangeText={(v) => onLocalChange(index, "paid", v)}
      />
    </Row>

    {editMode && (
      <>
        <Text style={styles.subLabel}>Payment Mode</Text>
        <RNPickerSelect
          value={item.paymentMode}
          onValueChange={(v) =>
            onLocalChange(index, "paymentMode", v)
          }
          items={PAYMENT_MODES}
          style={pickerStyles}
          useNativeAndroidPickerStyle={false}
          fixAndroidTouchableBug
        />

        <Text style={styles.subLabel}>Remarks</Text>
        <TextInput
          style={styles.remarkInput}
          value={item.remarks}
          onChangeText={(v) =>
            onLocalChange(index, "remarks", v)
          }
        />
      </>
    )}
  </View>
));

/* ---------------- MAIN MODAL ---------------- */
export default function StudentFeeModal({
  visible,
  student,
  installments,
  totalFee,
  editMode,
  paymentHistory,
  setEditMode,
  onSave,
  onClose,
}) {
  const [localInstallments, setLocalInstallments] = useState([]);
  const [localTotalFee, setLocalTotalFee] = useState("");
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (visible && student) {
      const prepared = installments.map((i) => ({
        ...i,
        amount: String(i.amount ?? ""),
        paid: String(i.paid ?? ""),
        remarks: i.remarks ?? "",
        paymentMode: i.paymentMode || "CASH",
      }));

      setLocalInstallments(prepared);
      setLocalTotalFee(String(totalFee ?? ""));
      setInitialSnapshot(
        JSON.stringify(prepared) + String(totalFee ?? "")
      );
      setShowHistory(false); // reset history on open
    }
  }, [visible, student]);

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(localInstallments) + localTotalFee !==
      initialSnapshot
    );
  }, [localInstallments, localTotalFee, initialSnapshot]);

  const onLocalChange = (index, field, value) => {
    setLocalInstallments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value ?? "" };
      return copy;
    });
  };

  const handleSave = () => {
    if (!hasChanges) return;

    onSave({
      totalFee: localTotalFee,
      installments: localInstallments,
    });
  };

  if (!visible || !student) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <FlatList
          data={localInstallments}
          keyExtractor={(i) => i.order.toString()}
          renderItem={({ item, index }) => (
            <InstallmentRow
              item={item}
              index={index}
              editMode={editMode}
              onLocalChange={onLocalChange}
            />
          )}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {student.name} ({student.userId})
                </Text>

                <View style={styles.headerActions}>
                  {/* 🕘 History (ONLY in view mode) */}
                  {!editMode && (
                    <TouchableOpacity
                      onPress={() => setShowHistory((p) => !p)}
                    >
                      <Text style={styles.icon}>🕘</Text>
                    </TouchableOpacity>
                  )}

                  {!editMode && (
                    <TouchableOpacity
                      style={styles.editBtnSmall}
                      onPress={() => setEditMode(true)}
                    >
                      <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.icon}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>Total Fee</Text>
              <TextInput
                value={localTotalFee}
                editable={editMode}
                keyboardType="numeric"
                onChangeText={setLocalTotalFee}
                style={[styles.input, !editMode && styles.disabled]}
              />

              <Text style={styles.label}>Installments</Text>
            </>
          }
          ListFooterComponent={
            <>
              {/* 🧾 Payment History */}
              {!editMode && showHistory && (
                <>
                  <Text style={styles.label}>Payment History</Text>
                  <PaymentHistoryPanel history={paymentHistory || []} />
                </>
              )}

              {/* Actions */}
              {editMode && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      !hasChanges && styles.saveDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!hasChanges}
                  >
                    <Text style={styles.btnText}>
                      {hasChanges ? "Save" : "No Changes"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          }
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
  saveDisabled: {
    backgroundColor: "#9ca3af",
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
