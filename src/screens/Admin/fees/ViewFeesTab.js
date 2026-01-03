import React, { useState, useEffect, useMemo } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { api } from "../../../api/api";
import AdminFeeSection from "../../../components/admin/AdminFeeSection";
import StudentFeeCard from "../../../components/admin/fees/StudentFeeCard";
import StudentFeeModal from "../../../components/admin/fees/StudentFeeModal";
import StudentFeeFilters from "../../../components/admin/fees/StudentFeeFilters";

export default function ViewFeesTab() {
  const [board, setBoard] = useState("");
  const [cls, setCls] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("2025-2026");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [totalFee, setTotalFee] = useState("");
  const [installments, setInstallments] = useState([]);

 
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");


  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  /*Fetch students*/
  const fetchStudents = async () => {
    if (!board || !cls || !section || !academicYear) return;

    try {
      setLoading(true);
      const res = await api.get(
        `/api/admin/student/student-fee?board=${board}&className=${cls}&section=${section}&academicYear=${academicYear}`
      );
      setStudents(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.log("Fetch students error:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  /*AUTO FETCH*/
  useEffect(() => {
    if (board && cls && section && academicYear) {
      fetchStudents();
    }
  }, [board, cls, section, academicYear]);

  /*FILTER LOGIC*/
  const filteredStudents = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return students.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const userId = (s.userId || "").toLowerCase();

      const searchMatch =
        !search || name.includes(search) || userId.includes(search);

      const statusMatch =
        statusFilter === "ALL"
          ? true
          : statusFilter === "PAID"
          ? s.totalPending === 0
          : statusFilter === "PENDING"
          ? s.totalPaid === 0
          : statusFilter === "OVERDUE"
          ? s.totalPending > 0
          : true;

      return searchMatch && statusMatch;
    });
  }, [students, searchText, statusFilter]);

  /* Open modal*/
  const openModal = async (student) => {
    try {
      const res = await api.get(
        `/api/admin/student/student-fee/${student.studentId}`
      );

      setSelectedStudent(student);
      setTotalFee(String(res.data.totalFee || ""));
      setInstallments(
        (res.data.installments || []).map((i) => ({
          ...i,
          paymentMode: i.paymentMode || "CASH",
          remarks: i.remarks || "",
          }))
      );
      setPaymentHistory(res.data.paymentHistory || []);
      setShowHistory(false);
      setEditMode(false);
      setModalVisible(true);
    } catch (err) {
      console.log("Open modal error:", err);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setSelectedStudent(null);
    setInstallments([]);
    setPaymentHistory([]);
    setShowHistory(false);
  };

  /*Local edit  */
  const updateInstallmentField = (index, field, value) => {
    if (!editMode) return;
    const copy = [...installments];
    copy[index] = { ...copy[index], [field]: value };
    setInstallments(copy);
  };

  /*Save changes */
  const saveChanges = async () => {
    try {
      await api.put(
        `/api/admin/student/student-fee/${selectedStudent.studentId}/override`,
        {
          totalFee: Number(totalFee),
          installments: installments.map((i) => ({
            order: i.order,
            amount: Number(i.amount),
            paid: Number(i.paid),
            dueDate: i.dueDate,
            paymentMode: i.paymentMode || "CASH",
            remarks: i.remarks || "",
          })),
        }
      );

      closeModal();
      fetchStudents();
    } catch (err) {
      console.log("Save changes error:", err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminFeeSection
        selectedBoard={board}
        setSelectedBoard={setBoard}
        selectedClass={cls}
        setSelectedClass={setCls}
        selectedSection={section}
        setSelectedSection={setSection}
        academicYear={academicYear}
        setAcademicYear={setAcademicYear}
      />

      <StudentFeeFilters
        searchText={searchText}
        setSearchText={setSearchText}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : filteredStudents.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 30, color: "#777" }}>
          No students match the selected filters.
        </Text>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(i) => i.studentId}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <StudentFeeCard
              student={item}
              onPress={() => openModal(item)}
            />
          )}
        />
      )}

      <StudentFeeModal
        visible={modalVisible}
        student={selectedStudent}
        totalFee={totalFee}
        installments={installments}
        paymentHistory={paymentHistory}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        editMode={editMode}
        setEditMode={setEditMode}
        setTotalFee={setTotalFee}
        updateInstallmentField={updateInstallmentField}
        onSave={saveChanges}
        onClose={closeModal}
      />
    </View>
  );
}
