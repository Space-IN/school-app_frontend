import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../api/api'; // Use configured API
import { CommonActions } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment
import { BASE_URL } from '@env';

// ----------------------------------------------------------------------------
// Reusable Student Row Component (Copied for consistency & isolation)
// ----------------------------------------------------------------------------
const StudentRow = React.memo(({ student, subjectName, components, currentMarks, onMarkChange, editable = true }) => {
    return (
        <View style={styles.studentCard}>
            <View style={styles.studentHeader}>
                <LinearGradient colors={['#818cf8', '#4f46e5']} style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{student.name?.charAt(0) || '?'}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.rollNo}>Roll No: {student.rollNo}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: currentMarks?.marksObtained !== undefined ? '#dcfce7' : '#f1f5f9' }]}>
                    <Text style={[styles.statusText, { color: currentMarks?.marksObtained !== undefined ? '#166534' : '#64748b' }]}>
                        {currentMarks?.marksObtained !== undefined ? 'Graded' : 'Pending'}
                    </Text>
                </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowInputs}>
                {components.map((comp, index) => (
                    <View key={index} style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.inputLabel}>{comp.name} (<Text style={{ fontWeight: '400' }}>Max: {comp.maxMarks}</Text>)</Text>

                        {editable ? (
                            <TextInput
                                style={[styles.textInput, { borderColor: '#e2e8f0', backgroundColor: '#fff' }]}
                                placeholder="-"
                                keyboardType="numeric"
                                maxLength={3}
                                editable={editable}
                                placeholderTextColor="#cbd5e1"
                                value={currentMarks[comp.name]?.toString() || ''}
                                onChangeText={v => onMarkChange(student.id, comp.name, v)}
                            />
                        ) : (
                            <View style={styles.readOnlyBox}>
                                <Text style={styles.readOnlyText}>{currentMarks[comp.name] || '-'}</Text>
                            </View>
                        )}

                    </View>
                ))}
            </View>
        </View>
    );
}, (prev, next) => prev.currentMarks === next.currentMarks && prev.components === next.components && prev.editable === next.editable);

// ----------------------------------------------------------------------------
// Main Screen
// ----------------------------------------------------------------------------
export default function MarksViewEditScreen({ navigation, route }) {
    const { board } = route.params || { board: 'CBSE' };

    // UI State
    const [loading, setLoading] = useState(false);
    const [fetchingAssessments, setFetchingAssessments] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [operationMode, setOperationMode] = useState('view');
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    // Data State
    const [classes, setClasses] = useState([]);
    const [sections] = useState(['A', 'B', 'C', 'D']);
    const [assessments, setAssessments] = useState([]);

    // Intermediate State (Subject Selection)
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [tempSelectedAssessment, setTempSelectedAssessment] = useState(null);

    // Final Selection State
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Edit Data State
    const [students, setStudents] = useState([]);
    const [marksData, setMarksData] = useState({});
    const [templateComponents, setTemplateComponents] = useState([]);

    // Initial Load
    useEffect(() => {
        fetchClasses();
        checkUser();
    }, []);

    const checkUser = async () => {
        const user = await AsyncStorage.getItem('user');
        if (user) {
            const parsed = JSON.parse(user);
            setCurrentUserId(parsed.userId || parsed._id);
        }
    };

    // Fetch Assessments when Class/Section changes
    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchAssessments();
        } else {
            setAssessments([]);
        }
    }, [selectedClass, selectedSection]);

    const fetchClasses = async () => {
        const options = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
        setClasses(options);
    };

    const fetchAssessments = async () => {
        setFetchingAssessments(true);
        try {
            // Logic: If current month is Jan/Feb/March (0-2), we are in the session of Previous Year.
            // E.g. Feb 2026 -> Session 2025-2026 -> Send '2025' (Start Year)
            const d = new Date();
            const y = d.getFullYear();
            const m = d.getMonth();
            const academicStartYear = m < 3 ? y - 1 : y;

            const res = await api.get(`${BASE_URL}/api/admin/assessment`, {
                params: {
                    grade: selectedClass,
                    section: selectedSection,
                    board: board,
                    year: academicStartYear // Integer
                }
            });

            if (res.data.exams) {
                setAssessments(res.data.exams);
            } else if (res.data.success && res.data.data) {
                setAssessments(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching assessments:", err);
            Alert.alert("Error", "Failed to fetch assessments.");
        } finally {
            setFetchingAssessments(false);
        }
    };

    // Step 1: Open Assessment -> Fetch Full Details & Template -> Show Subjects
    const handleOpenAssessment = async (assessmentLight) => {
        setLoading(true);
        try {
            // 1. Fetch Full Assessment Details (with records populated)
            // Route: GET /api/admin/assessment/:id maps to getAssessmentScore
            const fullRes = await api.get(`${BASE_URL}/api/admin/assessment/${assessmentLight._id}`);
            const fullAssessment = fullRes.data.data || fullRes.data; // Handle { success: true, data: ... } or direct

            if (!fullAssessment) {
                Alert.alert("Error", "Could not fetch assessment details.");
                setLoading(false);
                return;
            }

            setTempSelectedAssessment(fullAssessment);

            // 2. Fetch Template
            const templateRes = await api.get(`${BASE_URL}/api/admin/assessment/assessment-template/${fullAssessment.assessment_template._id || fullAssessment.assessment_template}`);
            const template = templateRes.data.data;

            if (!template || !template.subjects) {
                Alert.alert("Error", "Invalid Template Data");
                return;
            }

            // Map subjects for selection
            const subjs = template.subjects.map(s => {
                const sObj = (typeof s.subject === 'object') ? s.subject : { _id: s.subject, name: 'Unknown Subject', code: '???' };
                return {
                    subjectId: sObj._id,
                    name: sObj.name,
                    code: sObj.code,
                    components: s.components
                };
            });

            setAvailableSubjects(subjs);
            setShowSubjectModal(true);

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to fetch assessment details.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Select Subject -> Load Students & Marks
    const handleSelectSubject = async (subject) => {
        setShowSubjectModal(false);
        const assessment = tempSelectedAssessment;

        setSelectedAssessment(assessment);
        setSelectedSubject(subject);
        setTemplateComponents(subject.components);
        setSelectedSubjectCode(subject.code);

        setLoading(true);

        try {
            // 1. Fetch Students
            const studentRes = await api.get(`${BASE_URL}/api/admin/students/class/${selectedClass}/section/${selectedSection}`);
            const studentList = studentRes.data.students || [];

            // 2. Map Existing Marks
            const initialMarks = {};
            const oidToUid = {};

            studentList.forEach(s => {
                if (s._id) oidToUid[s._id] = s.userId;
            });

            // Iterate assessment records (if any)
            if (assessment.records) {
                assessment.records.forEach(rec => {
                    const sId = typeof rec.student === 'object' ? rec.student._id : rec.student;
                    const sUid = oidToUid[sId] || (typeof rec.student === 'object' ? rec.student.userId : null);

                    if (!sUid) return;

                    // Find subject record
                    const subRec = rec.subjects.find(s => {
                        const recSId = typeof s.subject === 'object' ? s.subject._id : s.subject;
                        return recSId === subject.subjectId;
                    });

                    if (subRec) {
                        const comps = {};
                        subRec.components.forEach(c => {
                            comps[c.name] = c.marks_obtained;
                        });
                        initialMarks[sUid] = comps;
                    }
                });
            }

            // 3. Prepare View
            const sortedStudents = studentList.sort((a, b) => {
                const rA = parseInt(a.rollNo) || 0;
                const rB = parseInt(b.rollNo) || 0;
                return rA - rB;
            });

            setStudents(sortedStudents.map(s => ({
                id: s.userId,
                name: s.name,
                rollNo: s.rollNo
            })));
            setMarksData(initialMarks);
            setEditMode(true);

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to load marks data.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMark = useCallback((studentId, compName, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [compName]: value
            }
        }));
    }, []);

    const submitUpdates = async () => {
        if (!selectedAssessment || !selectedSubjectCode) {
            Alert.alert("Error", "Missing Info.");
            return;
        }

        setLoading(true);
        try {
            const records = [];
            students.forEach(st => {
                const marks = marksData[st.id] || {};
                const components = [];

                templateComponents.forEach(tc => {
                    const val = marks[tc.name];
                    if (val !== undefined && val !== null && String(val).trim() !== '') {
                        components.push({
                            name: tc.name,
                            marks_obtained: Number(val),
                            markedBy: currentUserId
                        });
                    }
                });

                if (components.length > 0) {
                    records.push({ studentId: st.id, components });
                }
            });

            const payload = {
                assessmentId: selectedAssessment._id,
                subjectCode: selectedSubjectCode,
                records: records
            };

            const res = await api.put(`${BASE_URL}/api/admin/assessment`, payload);

            if (res.data.success) {
                Alert.alert("Success", "Marks updated successfully.");
                setEditMode(false);
                fetchAssessments();
            } else {
                Alert.alert("Error", res.data.message || "Update failed.");
            }

        } catch (err) {
            console.error("Update Error:", err);
            Alert.alert("Error", "Failed to update marks.");
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------------
    // Renders
    // ------------------------------------------------------------------------

    if (editMode) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.detailHeader}>
                    <TouchableOpacity onPress={() => setEditMode(false)} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                        <Text style={styles.detailTitle} numberOfLines={1}>{selectedAssessment?.assessment_name}</Text>
                        <Text style={styles.detailSubtitle}>{selectedSubject?.name || 'Subject'} • {selectedClass}-{selectedSection}</Text>
                    </View>

                    {operationMode === 'edit' ? (
                        <TouchableOpacity onPress={submitUpdates} style={styles.primaryButton}>
                            <Text style={styles.primaryButtonText}>Update Marks</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.viewBadge}>
                            <Text style={styles.viewBadgeText}>Read Only</Text>
                        </View>
                    )}
                </View>

                {loading ? <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 50 }} /> : (
                    <FlatList
                        data={students}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <StudentRow
                                student={item}
                                components={templateComponents}
                                currentMarks={marksData[item.id] || {}}
                                onMarkChange={handleUpdateMark}
                                editable={operationMode === 'edit'}
                            />
                        )}
                    />
                )}
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#4f46e5', '#6366f1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mainHeader}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.pageTitle}>Marks Records</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <Text style={styles.pageSubtitle}>For Board: {board}</Text>

                    {/* View/Edit Toggle */}
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, operationMode === 'view' && styles.toggleBtnActive]}
                            onPress={() => setOperationMode('view')}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.toggleBtnText, operationMode === 'view' && styles.toggleBtnTextActive]}>View Marks</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, operationMode === 'edit' && styles.toggleBtnActive]}
                            onPress={() => setOperationMode('edit')}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.toggleBtnText, operationMode === 'edit' && styles.toggleBtnTextActive]}>Update Marks</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.filterContainer}>
                <View style={[styles.filterRow, { zIndex: 10 }]}>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Class</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedClass}
                                onValueChange={setSelectedClass}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select" value={null} color="#94a3b8" />
                                {classes.map(c => <Picker.Item key={c} label={c} value={c} />)}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Section</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedSection}
                                onValueChange={setSelectedSection}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select" value={null} color="#94a3b8" />
                                {sections.map(s => <Picker.Item key={s} label={s} value={s} />)}
                            </Picker>
                        </View>
                    </View>
                </View>
            </View>

            {fetchingAssessments ? (
                <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={assessments}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    ListHeaderComponent={
                        assessments.length > 0 ? <Text style={styles.listHeader}>Available Assessments</Text> : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBg}>
                                <Ionicons name="documents-outline" size={40} color="#6366f1" />
                            </View>
                            <Text style={styles.emptyTitle}>No Records Found</Text>
                            <Text style={styles.emptyText}>
                                {selectedClass && selectedSection
                                    ? "There are no assessments for this class yet."
                                    : "Please select a Class and Section above."}
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.assessmentCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.assessment_name}</Text>
                                <View style={[styles.badge, { backgroundColor: item.overall_status === 'Fail' ? '#fee2e2' : '#dcfce7' }]}>
                                    <Text style={[styles.badgeText, { color: item.overall_status === 'Fail' ? '#ef4444' : '#166534' }]}>
                                        {item.status || 'Active'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.cardMetaRow}>
                                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                <Text style={styles.cardDate}> Updated: {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</Text>
                            </View>

                            <View style={styles.divider} />

                            <TouchableOpacity
                                style={styles.openButton}
                                onPress={() => handleOpenAssessment(item)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.openButtonText}>{operationMode === 'edit' ? 'Update Marks' : 'View Marks'}</Text>
                                <Ionicons name="arrow-forward" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {/* Subject Selection Modal */}
            <Modal visible={showSubjectModal} transparent animationType="fade" onRequestClose={() => setShowSubjectModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Subject</Text>
                            <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>Which subject do you want to {operationMode === 'edit' ? 'update' : 'view'}?</Text>

                        <FlatList
                            data={availableSubjects}
                            keyExtractor={item => item.subjectId}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleSelectSubject(item)}
                                >
                                    <View style={styles.modalIcon}>
                                        <Ionicons name="book-outline" size={20} color="#4f46e5" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.modalItemTitle}>{item.name}</Text>
                                        <Text style={styles.modalItemCode}>Code: {item.code}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    mainHeader: { paddingHorizontal: 20, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
    pageTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    pageSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', marginBottom: 15 },

    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },

    toggleRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 16 },
    toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    toggleBtnText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 13 },
    toggleBtnTextActive: { color: '#4f46e5', fontWeight: '800', fontSize: 13 },

    filterContainer: { paddingHorizontal: 20, marginTop: -30 },
    filterRow: { flexDirection: 'row', gap: 12 },
    filterItem: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 4, shadowColor: '#6366f1', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    filterLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: '700', letterSpacing: 0.5 },
    pickerWrapper: { marginHorizontal: -8, marginTop: -8 },
    picker: { height: 40 },

    listHeader: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 10, marginBottom: 15, marginLeft: 5 },

    assessmentCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
    cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    cardDate: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },

    openButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5', paddingVertical: 12, borderRadius: 12, gap: 8 },
    openButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    emptyState: { alignItems: 'center', marginTop: 60, padding: 20 },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 8 },
    emptyText: { color: '#94a3b8', textAlign: 'center', lineHeight: 20 },

    detailHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: '#f8fafc' },
    detailTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    detailSubtitle: { fontSize: 12, color: '#64748b' },
    primaryButton: { backgroundColor: '#4f46e5', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
    primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    viewBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    viewBadgeText: { fontSize: 12, fontWeight: '600', color: '#64748b' },

    studentCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
    studentHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    studentName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    rollNo: { fontSize: 12, color: '#64748b', marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '700' },
    rowInputs: { flexDirection: 'row', marginTop: 16 },
    inputLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 8 },
    textInput: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 16, textAlign: 'center', color: '#1e293b' },
    readOnlyBox: { height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    readOnlyText: { fontSize: 16, fontWeight: '600', color: '#334155' }
});
