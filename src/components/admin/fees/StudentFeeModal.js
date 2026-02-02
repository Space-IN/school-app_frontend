import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
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
  installments,
  totalFee,
  editMode,
  paymentHistory,
  setEditMode,
  onSave,
  onClose,
}) {
  const [localInstallments, setLocalInstallments] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [remarks, setRemarks] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (visible && student) {
      setLocalInstallments(
        installments.map(i => ({
          ...i,
          amount: Number(i.amount),
          paid: Number(i.paid || 0),
        }))
      );
      setPaymentAmount("");
      setPaymentMode("CASH");
      setRemarks("");
      setShowHistory(false);
    }
  }, [visible, student]);

  const totalPending = useMemo(() => {
    return localInstallments.reduce(
      (sum, i) => sum + Math.max(0, i.amount - i.paid),
      0
    );
  }, [localInstallments]);

  const applyPayment = () => {
    const pay = Number(paymentAmount);

    if (!pay || pay <= 0) {
      Alert.alert("Validation Error", "Enter payment amount");
      return;
    }

    if (pay > totalPending) {
      Alert.alert(
        "Invalid Amount",
        "Entered amount exceeds total pending fee"
      );
      return;
    }

    let remaining = pay;

    const updatedInstallments = localInstallments.map(inst => {
      if (remaining <= 0) return inst;

      const pending = inst.amount - inst.paid;
      if (pending <= 0) return inst;

      const applied = Math.min(pending, remaining);
      remaining -= applied;

      return {
        ...inst,
        paid: inst.paid + applied,
      };
    });

    onSave({
      installments: updatedInstallments,
      payment: {
        amount: pay,
        mode: paymentMode,
        remarks,
        date: new Date(),
      },
    });

    setEditMode(false);
  };

  if (!visible || !student) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <FlatList
          data={localInstallments}
          keyExtractor={i => i.order.toString()}
          contentContainerStyle={styles.box}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {student.name} ({student.userId})
                </Text>

                <View style={styles.headerActions}>
                  {!editMode && (
                    <TouchableOpacity
                      onPress={() => setShowHistory(p => !p)}
                    >
                      <Text style={styles.icon}>🕘</Text>
                    </TouchableOpacity>
                  )}

                  {!editMode && (
                    <TouchableOpacity
                      style={styles.editBtn}
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
              <Text style={styles.readonly}>
                ₹ {totalFee}
              </Text>

              <Text style={styles.label}>Installments</Text>
            </>
          }
          renderItem={({ item }) => {
            const pending = item.amount - item.paid;

            return (
              <View style={styles.card}>
                <Text style={styles.instTitle}>{item.title}</Text>

                <Row label="Amount">
                  <Text>₹ {item.amount}</Text>
                </Row>

                <Row label="Paid">
                  <Text>₹ {item.paid}</Text>
                </Row>

                <Row label="Pending">
                  <Text style={{ color: pending > 0 ? "#dc2626" : "#16a34a" }}>
                    ₹ {pending}
                  </Text>
                </Row>
              </View>
            );
          }}
          ListFooterComponent={
            <>
              {!editMode && showHistory && (
                <>
                  <Text style={styles.label}>Payment History</Text>
                  <PaymentHistoryPanel history={paymentHistory || []} />
                </>
              )}

              {editMode && (
                <>
                  <Text style={styles.label}>Add Payment</Text>

                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Amount Paid"
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                  />

                  <Text style={styles.subLabel}>Payment Mode</Text>
                  <RNPickerSelect
                    value={paymentMode}
                    onValueChange={setPaymentMode}
                    items={PAYMENT_MODES}
                    style={pickerStyles}
                    useNativeAndroidPickerStyle={false}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Remarks (optional)"
                    value={remarks}
                    onChangeText={setRemarks}
                  />

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={applyPayment}
                    >
                      <Text style={styles.btnText}>Save Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setEditMode(false)}
                    >
                      <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          }
        />
      </View>
    </Modal>
  );
}

const Row = ({ label, children }) => (
  <View style={styles.row}>
    <Text>{label}</Text>
    {children}
  </View>
);

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
  label: { marginTop: 14, fontWeight: "600" },
  subLabel: { marginTop: 10, fontSize: 12, fontWeight: "600" },
  readonly: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
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
    marginVertical: 3,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  editBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveBtn: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelBtn: {
    backgroundColor: "#dc2626",
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
    marginTop: 6,
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
};
