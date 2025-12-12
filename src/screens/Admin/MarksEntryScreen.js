import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    Modal,
    FlatList,
    LayoutAnimation,
    UIManager,
    ActivityIndicator,
    KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { read, utils } from 'xlsx';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MarksEntryScreen({ navigation }) {
    // Top Level State
    const [gradeGroup, setGradeGroup] = useState('1-10'); // '1-10' or '11-12'

    // Selection State
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // Exam & Subject State
    const [examType, setExamType] = useState('');
    const [subjectName, setSubjectName] = useState('');

    // UI State for Modals
    const [mode, setMode] = useState('manual');
    const [showClassModal, setShowClassModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showExamModal, setShowExamModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial dummy data
    useEffect(() => {
        setStudents([
            { id: '1', name: 'Aarav Kumar', rollNo: '101' },
            { id: '2', name: 'Vivaan Singh', rollNo: '102' },
            { id: '3', name: 'Aditya Sharma', rollNo: '103' },
            { id: '4', name: 'Vihaan Gupta', rollNo: '104' },
            { id: '5', name: 'Arjun Reddy', rollNo: '105' },
        ]);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [gradeGroup]);

    const grades1To10 = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
    const grades11To12 = ['11', '12'];
    const sections = ['A', 'B', 'C', 'D'];

    const getAvailableClasses = () => gradeGroup === '1-10' ? grades1To10 : grades11To12;

    const examTypes1To10 = [
        { id: 'formative', label: 'Formative Assessment (20)' },
        { id: 'midterm', label: 'Mid-Term Examination (80+20)' },
        { id: 'annual', label: 'Annual Examination (80+20)' },
    ];

    const examTypes11To12 = [
        { id: 'midterm_prep', label: 'Mid-term / Preparatory' },
        { id: 'neet', label: 'NEET (720)' },
        { id: 'jee', label: 'JEE (300)' },
        { id: 'kcet', label: 'KCET' },
    ];

    const subjects11To12 = [
        'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Kannada', 'Hindi'
    ];

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            setLoading(true);
            const file = result.assets[0];
            const fileContent = await FileSystem.readAsStringAsync(file.uri, {
                encoding: FileSystem.EncodingType.Base64
            });

            const workbook = read(fileContent, { type: 'base64' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = utils.sheet_to_json(sheet);

            console.log('Parsed Excel Data:', data);
            setTimeout(() => {
                setLoading(false);
                Alert.alert('Success', `Successfully parsed ${data.length} records from ${file.name}`);
            }, 1000);

        } catch (err) {
            setLoading(false);
            console.error('Excel Error:', err);
            Alert.alert('Error', 'Failed to read Excel file');
        }
    };

    const toggleGradeGroup = (group) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setGradeGroup(group);
        setSelectedClass(''); // Reset class on group switch
        setExamType('');
        setSubjectName('');
    };

    const renderManualEntry = () => {
        if (!selectedClass || !selectedSection) {
            return (
                <View style={[styles.emptyStateContainer, { marginTop: 20 }]}>
                    <Ionicons name="school-outline" size={48} color="#cbd5e1" />
                    <Text style={styles.emptyStateText}>
                        Select a Class and Section above to view students
                    </Text>
                </View>
            );
        }

        return (
            <View>
                {students.map((student, index) => (
                    <View key={student.id} style={styles.studentCard}>
                        <View style={styles.studentHeader}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.rollNo}>Roll No: {student.rollNo}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />
                        {renderExamInputs(student.id)}
                    </View>
                ))}

                <View style={{ height: 100 }} />
            </View>
        );
    };

    const renderExamInputs = (studentId) => {
        if (gradeGroup === '1-10') {
            if (examType === 'formative') {
                return (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Marks (Max 20)</Text>
                        <TextInput style={styles.textInput} placeholder="0" keyboardType="numeric" maxLength={2} />
                    </View>
                );
            }
            return (
                <View style={styles.rowInputs}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.inputLabel}>Written (80)</Text>
                        <TextInput style={styles.textInput} placeholder="0" keyboardType="numeric" maxLength={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Internal (20)</Text>
                        <TextInput style={styles.textInput} placeholder="0" keyboardType="numeric" maxLength={2} />
                    </View>
                </View>
            );
        } else {
            if (examType === 'midterm_prep') {
                return (
                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>Theory (70/100)</Text>
                            <TextInput style={styles.textInput} placeholder="Marks" keyboardType="numeric" maxLength={3} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Practical (30)</Text>
                            <TextInput style={styles.textInput} placeholder="Marks" keyboardType="numeric" maxLength={2} />
                        </View>
                    </View>
                );
            }
            if (examType === 'neet') {
                return (
                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.inputLabel}>Bio (360)</Text>
                            <TextInput style={styles.textInput} placeholder="0" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.inputLabel}>Chem (180)</Text>
                            <TextInput style={styles.textInput} placeholder="0" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Phy (180)</Text>
                            <TextInput style={styles.textInput} placeholder="0" keyboardType="numeric" />
                        </View>
                    </View>
                );
            }
            if (examType === 'jee' || examType === 'kcet') {
                const max = examType === 'jee' ? 100 : 60;
                return (
                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.inputLabel}>Phy ({max})</Text>
                            <TextInput style={styles.textInput} placeholder="0" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.inputLabel}>Chem ({max})</Text>
                            <TextInput style={styles.textInput} placeholder="0" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Math ({max})</Text>
                            <TextInput style={styles.textInput} placeholder="0" keyboardType="numeric" />
                        </View>
                    </View>
                );
            }
            return <Text style={styles.emptyStateText}>Select an exam type above to enter marks</Text>;
        }
    };

    const handleSubmit = () => {
        if (!selectedClass || !selectedSection) {
            Alert.alert("Missing Details", "Please select a Class and Section first.");
            return;
        }

        Alert.alert(
            "Confirm Submission",
            `Submit scores for Class ${selectedClass} - Section ${selectedSection}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Submit", onPress: () => {
                        setLoading(true);
                        setTimeout(() => {
                            setLoading(false);
                            Alert.alert("Success", "Scores submitted successfully!");
                            navigation.goBack();
                        }, 1500);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Marks Entry</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Grade Group Toggle */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, gradeGroup === '1-10' && styles.toggleBtnActive]}
                            onPress={() => toggleGradeGroup('1-10')}
                        >
                            <Text style={[styles.toggleText, gradeGroup === '1-10' && styles.toggleTextActive]}>Grades 1-10</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, gradeGroup === '11-12' && styles.toggleBtnActive]}
                            onPress={() => toggleGradeGroup('11-12')}
                        >
                            <Text style={[styles.toggleText, gradeGroup === '11-12' && styles.toggleTextActive]}>Grades 11-12</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Class Selection Card */}
                    <View style={styles.card}>
                        <View style={styles.rowInputs}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.label}>Class</Text>
                                <TouchableOpacity style={styles.dropdown} onPress={() => setShowClassModal(true)}>
                                    <Text style={[styles.dropdownText, !selectedClass && styles.placeholderText]}>
                                        {selectedClass ? `Class ${selectedClass}` : 'Select'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={18} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Section</Text>
                                <TouchableOpacity style={styles.dropdown} onPress={() => setShowSectionModal(true)}>
                                    <Text style={[styles.dropdownText, !selectedSection && styles.placeholderText]}>
                                        {selectedSection ? `Section ${selectedSection}` : 'Select'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={18} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Exam Details Card */}
                    <View style={styles.card}>
                        {gradeGroup === '11-12' ? (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Subject</Text>
                                <TouchableOpacity style={styles.dropdown} onPress={() => setShowSubjectModal(true)}>
                                    <Text style={[styles.dropdownText, !subjectName && styles.placeholderText]}>
                                        {subjectName || 'Select Subject'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Subject Name</Text>
                                <TextInput
                                    style={styles.simpleInput}
                                    placeholder="e.g. Science"
                                    value={subjectName}
                                    onChangeText={setSubjectName}
                                />
                            </View>
                        )}

                        <View style={[styles.formGroup, { marginBottom: 0 }]}>
                            <Text style={styles.label}>Examination Type</Text>
                            <TouchableOpacity style={styles.dropdown} onPress={() => setShowExamModal(true)}>
                                <Text style={[styles.dropdownText, !examType && styles.placeholderText]}>
                                    {examType ?
                                        (gradeGroup === '1-10' ? examTypes1To10 : examTypes11To12).find(e => e.id === examType)?.label
                                        : 'Select Examination'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'manual' && styles.tabActive]}
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setMode('manual');
                            }}
                        >
                            <Ionicons name="create-outline" size={18} color={mode === 'manual' ? '#1e3a8a' : '#94a3b8'} />
                            <Text style={[styles.tabText, mode === 'manual' && styles.tabTextActive]}>Manual Entry</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'excel' && styles.tabActive]}
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setMode('excel');
                            }}
                        >
                            <Ionicons name="document-text-outline" size={18} color={mode === 'excel' ? '#1e3a8a' : '#94a3b8'} />
                            <Text style={[styles.tabText, mode === 'excel' && styles.tabTextActive]}>Excel Upload</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {mode === 'manual' ? (
                        renderManualEntry()
                    ) : (
                        <View style={styles.excelCard}>
                            <LinearGradient
                                colors={['#f0f9ff', '#e0f2fe']}
                                style={styles.excelZone}
                            >
                                <Ionicons name="cloud-upload-outline" size={48} color="#1e3a8a" />
                                <Text style={styles.excelTitle}>Upload Marks Sheet</Text>
                                <Text style={styles.excelDesc}>Supports .xlsx and .xls formats</Text>
                            </LinearGradient>

                            <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
                                <Text style={styles.uploadButtonText}>Choose File</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.templateLink}>
                                <Text style={styles.templateLinkText}>Download Excel Template</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            {mode === 'manual' && (
                <View style={styles.footer}>
                    <TouchableOpacity style={[
                        styles.submitButton,
                        (!selectedClass || !selectedSection) && styles.submitButtonDisabled
                    ]} onPress={handleSubmit} disabled={!selectedClass || !selectedSection}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Scores</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* MODALS */}

            {/* Class Modal */}
            <Modal visible={showClassModal} transparent animationType="fade" onRequestClose={() => setShowClassModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>Select Class</Text>
                        <FlatList
                            data={getAvailableClasses()}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setSelectedClass(item);
                                        setShowClassModal(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>Class {item}</Text>
                                    {selectedClass === item && <Ionicons name="checkmark" size={20} color="#1e3a8a" />}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowClassModal(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Section Modal */}
            <Modal visible={showSectionModal} transparent animationType="fade" onRequestClose={() => setShowSectionModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>Select Section</Text>
                        <FlatList
                            data={sections}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setSelectedSection(item);
                                        setShowSectionModal(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>Section {item}</Text>
                                    {selectedSection === item && <Ionicons name="checkmark" size={20} color="#1e3a8a" />}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSectionModal(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Exam Modal */}
            <Modal visible={showExamModal} transparent animationType="fade" onRequestClose={() => setShowExamModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>Select Examination</Text>
                        <FlatList
                            data={gradeGroup === '1-10' ? examTypes1To10 : examTypes11To12}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setExamType(item.id);
                                        setShowExamModal(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item.label}</Text>
                                    {examType === item.id && <Ionicons name="checkmark" size={20} color="#1e3a8a" />}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowExamModal(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Subject Modal */}
            <Modal visible={showSubjectModal} transparent animationType="fade" onRequestClose={() => setShowSubjectModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>Select Subject</Text>
                        <FlatList
                            data={subjects11To12}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setSubjectName(item);
                                        setShowSubjectModal(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item}</Text>
                                    {subjectName === item && <Ionicons name="checkmark" size={20} color="#1e3a8a" />}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSubjectModal(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    backButton: { padding: 4 },
    content: { padding: 20 },

    // Toggle
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    toggleBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    toggleTextActive: {
        color: '#1e3a8a',
    },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

    simpleInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#0f172a',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
    },
    dropdownText: { fontSize: 16, color: '#0f172a' },
    placeholderText: { color: '#94a3b8' },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#1e3a8a',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#94a3b8',
        marginLeft: 8,
    },
    tabTextActive: {
        color: '#1e3a8a',
    },

    // Empty State
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        opacity: 0.7,
    },
    emptyStateText: {
        marginTop: 12,
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        maxWidth: '80%',
    },

    // Student Card
    studentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e3a8a',
    },
    studentName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    rollNo: {
        fontSize: 13,
        color: '#64748b',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },

    // Inputs
    rowInputs: {
        flexDirection: 'row',
    },
    inputContainer: {
        marginBottom: 0,
    },
    inputLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 6,
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#0f172a',
        textAlign: 'center',
        fontWeight: '600',
    },

    // Excel
    excelCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    excelZone: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 30,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#bfdbfe',
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    excelTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginTop: 16,
        marginBottom: 4,
    },
    excelDesc: {
        fontSize: 14,
        color: '#64748b',
    },
    uploadButton: {
        backgroundColor: '#1e3a8a',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    templateLink: {
        padding: 8,
    },
    templateLinkText: {
        color: '#1e3a8a',
        fontWeight: '600',
        fontSize: 14,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        elevation: 20,
    },
    submitButton: {
        backgroundColor: '#16a34a',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#cbd5e1',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
        textAlign: 'center',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    optionText: {
        fontSize: 16,
        color: '#334155',
        fontWeight: '500',
    },
    cancelButton: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
    },
    cancelButtonText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 15,
    },
});
