import React, { useState, useEffect, useMemo } from 'react';
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
    KeyboardAvoidingView,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync, writeAsStringAsync, cacheDirectory } from 'expo-file-system/legacy';
const FileSystem = { readAsStringAsync, writeAsStringAsync, cacheDirectory };
import * as Sharing from 'expo-sharing';
import { read, utils, write } from 'xlsx';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../api/api';
import { BASE_URL } from '@env';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MarksEntryScreen({ navigation, route }) {
    const { board } = route.params || { board: '' };

    // Top Level State
    const [gradeGroup, setGradeGroup] = useState('1-10'); // '1-10' or '11-12'

    // Selection State
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // Exam & Subject State
    const [examType, setExamType] = useState('');
    const [examName, setExamName] = useState(''); // Custom name for the exam
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
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [gradeGroup]);

    useEffect(() => {
        // Reset exam type when subject changes to avoid invalid combinations
        setExamType('');
    }, [subjectName]);

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

    const subjects1To10 = [
        'Kannada',
        'English',
        'Hindi',
        'Mathematics',
        'Science',
        'Social Science'
    ];

    const subjects11To12 = [
        'Physics',
        'Chemistry',
        'Mathematics',
        'Biology',
        'Computer Science',
        'English',
        'Kannada',
        'Hindi'
    ];

    const getFilteredExamTypes = useMemo(() => {
        if (gradeGroup === '1-10') return examTypes1To10;

        if (!subjectName) return [];

        const sub = subjectName.toLowerCase();

        // Language subjects and Computer Science: Show only Mid-term and Preparatory
        if (['english', 'kannada', 'hindi', 'computer science'].includes(sub)) {
            return examTypes11To12.filter(e => e.id === 'midterm_prep');
        }

        // Mathematics: Show Mid-term, Preparatory, JEE, and KCET. Hide NEET.
        if (sub === 'mathematics') {
            return examTypes11To12.filter(e => e.id !== 'neet');
        }

        // Physics and Chemistry: Show All
        if (['physics', 'chemistry'].includes(sub)) {
            return examTypes11To12;
        }

        // Biology: Show Mid-term, Preparatory, NEET, and KCET. Hide JEE.
        if (sub === 'biology') {
            return examTypes11To12.filter(e => e.id !== 'jee');
        }

        return examTypes11To12;
    }, [gradeGroup, subjectName]);




    const handleDownloadTemplate = async () => {
        if (!selectedClass || !selectedSection || !examType) {
            Alert.alert('Missing Info', 'Please select Class, Section and Exam Type/Subject first.');
            return;
        }

        try {
            // define columns based on exam type
            let columns = ['Student ID', 'Name', 'Roll No'];

            if (gradeGroup === '1-10') {
                if (examType === 'formative') {
                    columns.push('Marks (20)');
                } else {
                    columns.push('Written (80)', 'Internal (20)');
                }
            } else {
                if (examType === 'midterm_prep') {
                    columns.push('Theory', 'Practical');
                } else if (examType === 'neet') {
                    columns.push('Biology (360)', 'Chemistry (180)', 'Physics (180)');
                } else if (['jee', 'kcet'].includes(examType)) {
                    columns.push('Physics', 'Chemistry', 'Mathematics');
                }
            }

            // Create data rows
            const data = students.length > 0
                ? students.map(s => {
                    const row = {
                        'Student ID': s.id,
                        'Name': s.name,
                        'Roll No': s.rollNo
                    };
                    // Init empty columns
                    columns.slice(3).forEach(c => row[c] = '');
                    return row;
                })
                : [
                    // Empty template if no students
                    columns.reduce((acc, curr) => ({ ...acc, [curr]: '' }), {})
                ];

            const ws = utils.json_to_sheet(data, { header: columns });
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Marks");

            const wbout = write(wb, { type: 'base64', bookType: 'xlsx' });
            const uri = FileSystem.cacheDirectory + `marks_template_${selectedClass}_${selectedSection}.xlsx`;

            await FileSystem.writeAsStringAsync(uri, wbout, {
                encoding: 'base64'
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Download Marks Template',
                UTI: 'com.microsoft.excel.xlsx'
            });

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate template');
        }
    };

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
                encoding: 'base64'
            });

            const workbook = read(fileContent, { type: 'base64' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = utils.sheet_to_json(sheet);

            if (!data || data.length === 0) {
                setLoading(false);
                Alert.alert('Error', 'Excel file is empty or invalid.');
                return;
            }

            // Parse Data into marksData state
            const newMarksData = { ...marksData };

            data.forEach(row => {
                const studentId = row['Student ID'] || row['student_id']; // Handle dynamic keys if needed
                if (!studentId) return;

                const entry = {};

                if (gradeGroup === '1-10') {
                    if (examType === 'formative') {
                        entry.marks = row['Marks (20)'];
                    } else {
                        entry.written = row['Written (80)'];
                        entry.internal = row['Internal (20)'];
                    }
                } else {
                    if (examType === 'midterm_prep') {
                        entry.theory = row['Theory'];
                        entry.practical = row['Practical'];
                    } else if (examType === 'neet') {
                        entry.bio = row['Biology (360)'];
                        entry.chem = row['Chemistry (180)'];
                        entry.phy = row['Physics (180)'];
                    } else if (['jee', 'kcet'].includes(examType)) {
                        entry.phy = row['Physics'];
                        entry.chem = row['Chemistry'];
                        entry.math = row['Mathematics'];
                    }
                }

                newMarksData[studentId] = entry;
            });

            setMarksData(newMarksData);

            setLoading(false);
            Alert.alert(
                'Success',
                `Parsed marks for ${data.length} students. switching to review...`,
                [
                    { text: 'OK', onPress: () => setMode('manual') }
                ]
            );

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

    // API Integration State
    const [marksData, setMarksData] = useState({}); // { studentId: { subject: { theory: val, practical: val } } } or similar
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [subjectAssignments, setSubjectAssignments] = useState([]); // Array of { subject: { name }, faculty: { _id } }
    const [facultyMap, setFacultyMap] = useState({}); // Map: userId (e.g. 'faculty0016') -> Mongo _id (e.g. '6878902b...')

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            console.log("Fetching Faculty List (All + Deleted)...");
            // Fetch both active and deleted faculty to ensure we can map old assignments
            const [resAll, resDeleted] = await Promise.all([
                api.get(`${BASE_URL}/api/admin/faculty/all`),
                api.get(`${BASE_URL}/api/admin/faculty/deleted`)
            ]);

            const parseList = (res) => {
                if (Array.isArray(res.data)) return res.data;
                if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
                if (res.data?.faculty && Array.isArray(res.data.faculty)) return res.data.faculty;
                return [];
            };

            const allFaculty = [...parseList(resAll), ...parseList(resDeleted)];
            console.log(`Parsed ${allFaculty.length} total faculty items.`);

            const map = {};
            allFaculty.forEach(f => {
                const uId = f.userId;
                const mId = f._id;
                if (uId && mId) {
                    map[uId] = mId;
                }
            });

            console.log(`Faculty Map Populated: ${Object.keys(map).length} mapping entries.`);
            setFacultyMap(map);
        } catch (err) {
            console.error('Failed to fetch faculty list:', err);
            Alert.alert("Network Error", "Failed to load faculty data.");
        }
    };

    // Fetch Students & Subjects when Class/Section changes
    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchStudents();
            fetchSubjectAssignments();
        } else {
            setStudents([]);
            setSubjectAssignments([]);
        }
    }, [selectedClass, selectedSection]);

    const fetchSubjectAssignments = async () => {
        try {
            const className = selectedClass.trim();
            const sectionName = selectedSection.trim();
            // endpoint: /api/admin/subject/subjects/class/:classAssigned/section/:section
            const res = await api.get(`${BASE_URL}/api/admin/subject/subjects/class/${encodeURIComponent(className)}/section/${encodeURIComponent(sectionName)}`);

            console.log('Subject Assignments API Response:', JSON.stringify(res.data, null, 2)); // Debug log

            // Handle { subjects: [...] } or { data: [...] } or direct array
            let data = [];
            if (res.data?.subjects) data = res.data.subjects;
            else if (res.data?.data) data = res.data.data;
            else if (Array.isArray(res.data)) data = res.data;

            setSubjectAssignments(data);
        } catch (err) {
            console.error('Failed to fetch subject assignments:', err);
        }
    };

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const className = selectedClass.trim();
            const sectionName = selectedSection.trim();
            const boardQuery = board ? `?board=${encodeURIComponent(board)}` : '';

            const res = await api.get(
                `${BASE_URL}/api/admin/students/grade/${encodeURIComponent(className)}/section/${encodeURIComponent(sectionName)}${boardQuery}`
            );

            let fetched = res.data || [];
            if (board) {
                // Strict filtering based on schema separation (STATE vs CBSE)
                fetched = fetched.filter(s => s.board === board);
            }
            // Map to unified structure if needed
            const mapped = fetched.map(s => ({
                id: s.userId, // using userId as it seems to be the main ID used in other screens
                _id: s._id, // mongo ID needed for backend reference
                name: s.name,
                rollNo: s.rollNo || s.admissionNumber || 'N/A'
            }));

            setStudents(mapped);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to fetch students.');
        } finally {
            setLoadingStudents(false);
        }
    };

    // Helper to find faculty ID for a subject name
    const getFacultyForSubject = (subjName) => {
        if (!subjName || !subjectAssignments.length) return null;
        const lowerName = subjName.toLowerCase();

        const assignment = subjectAssignments.find(a =>
            a.subjectName && a.subjectName.toLowerCase() === lowerName
        );

        if (!assignment) {
            console.log(`DEBUG: No assignment found for subject '${subjName}' in loaded assignments.`);
            return null;
        }

        // 1. Try direct ObjectId from backend (if populated)
        if (assignment.facultyObjectId) return assignment.facultyObjectId;

        // 2. Try mapping string ID (facultyId) to ObjectId
        if (assignment.facultyId) {
            const mappedId = facultyMap[assignment.facultyId];
            if (mappedId) return mappedId;

            console.log(`DEBUG: Found assignment for '${subjName}' with facultyId '${assignment.facultyId}', but not found in Faculty Map.`);
            console.log('Available keys in Map:', Object.keys(facultyMap).slice(0, 5), '...');
        }

        return null; // Return null if logic fails - caller filters this out
    };

    // Helper to update marks state
    const updateMark = (studentId, field, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const renderManualEntry = () => {
        if (!selectedClass || !selectedSection) {
            return (
                <View style={[styles.emptyStateContainer, { marginTop: 40 }]}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="school-outline" size={40} color="#6366f1" />
                    </View>
                    <Text style={styles.emptyStateTitle}>Ready to Grade?</Text>
                    <Text style={styles.emptyStateText}>
                        Select a Class and Section above to start entering marks for your students.
                    </Text>
                </View>
            );
        }

        if (loadingStudents) {
            return <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />;
        }

        if (students.length === 0) {
            return (
                <View style={[styles.emptyStateContainer, { marginTop: 40 }]}>
                    <Ionicons name="people-outline" size={40} color="#64748b" />
                    <Text style={{ marginTop: 10, color: '#64748b' }}>No students found for this class.</Text>
                </View>
            );
        }

        return (
            <View style={{ marginTop: 10 }}>
                {students.map((student, index) => (
                    <View key={student.id} style={styles.studentCard}>
                        <View style={styles.studentHeader}>
                            <LinearGradient
                                colors={['#6366f1', '#4f46e5']}
                                style={styles.avatarCircle}
                            >
                                <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                            </LinearGradient>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.rollNo}>Roll No: {student.rollNo}</Text>
                            </View>
                            {/* Status Badge Placeholder - Could be 'Pending' or 'Done' */}
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Pending</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />
                        {renderExamInputs(student.id)}
                    </View>
                ))}

                <View style={{ height: 120 }} />
            </View>
        );
    };

    const renderExamInputs = (studentId) => {
        const currentMarks = marksData[studentId] || {};

        if (gradeGroup === '1-10') {
            if (examType === 'formative') {
                return (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Marks (Max 20)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="0"
                            keyboardType="numeric"
                            maxLength={2}
                            placeholderTextColor="#94a3b8"
                            value={currentMarks.marks}
                            onChangeText={v => updateMark(studentId, 'marks', v)}
                        />
                    </View>
                );
            }
            return (
                <View style={styles.rowInputs}>
                    <View style={{ flex: 1, marginRight: 15 }}>
                        <Text style={styles.inputLabel}>Written (80)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="0"
                            keyboardType="numeric"
                            maxLength={2}
                            placeholderTextColor="#94a3b8"
                            value={currentMarks.written}
                            onChangeText={v => updateMark(studentId, 'written', v)}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Internal (20)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="0"
                            keyboardType="numeric"
                            maxLength={2}
                            placeholderTextColor="#94a3b8"
                            value={currentMarks.internal}
                            onChangeText={v => updateMark(studentId, 'internal', v)}
                        />
                    </View>
                </View>
            );
        } else {
            // 11-12
            if (examType === 'midterm_prep') {
                return (
                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1, marginRight: 15 }}>
                            <Text style={styles.inputLabel}>Theory (70/100)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Marks"
                                keyboardType="numeric"
                                maxLength={3}
                                placeholderTextColor="#94a3b8"
                                value={currentMarks.theory}
                                onChangeText={v => updateMark(studentId, 'theory', v)}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Practical (30)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Marks"
                                keyboardType="numeric"
                                maxLength={2}
                                placeholderTextColor="#94a3b8"
                                value={currentMarks.practical}
                                onChangeText={v => updateMark(studentId, 'practical', v)}
                            />
                        </View>
                    </View>
                );
            }
            if (examType === 'neet') {
                return (
                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>Bio (360)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                                value={currentMarks.bio}
                                onChangeText={v => updateMark(studentId, 'bio', v)}
                            />
                        </View>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>Chem (180)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                                value={currentMarks.chem}
                                onChangeText={v => updateMark(studentId, 'chem', v)}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Phy (180)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                                value={currentMarks.phy}
                                onChangeText={v => updateMark(studentId, 'phy', v)}
                            />
                        </View>
                    </View>
                );
            }
            if (examType === 'jee' || examType === 'kcet') {
                const max = examType === 'jee' ? 100 : 60;
                return (
                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>Phy ({max})</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                                value={currentMarks.phy}
                                onChangeText={v => updateMark(studentId, 'phy', v)}
                            />
                        </View>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>Chem ({max})</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                                value={currentMarks.chem}
                                onChangeText={v => updateMark(studentId, 'chem', v)}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Math ({max})</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                                value={currentMarks.math}
                                onChangeText={v => updateMark(studentId, 'math', v)}
                            />
                        </View>
                    </View>
                );
            }
            return <Text style={styles.helperText}>Please select an exam type above to enable mark entry.</Text>;
        }
    };

    const handleSubmit = () => {
        if (!selectedClass || !selectedSection) {
            Alert.alert("Missing Details", "Please select a Class and Section first.");
            return;
        }
        if (!examType) {
            Alert.alert("Missing Details", "Please select an Examination Type.");
            return;
        }

        // Pre-validate Teachers - Check if we have assignments for required subjects
        let requiredSubjects = [];
        if (gradeGroup === '1-10') {
            requiredSubjects.push(subjectName);
        } else {
            if (examType === 'midterm_prep') requiredSubjects.push(subjectName);
            else if (examType === 'neet') requiredSubjects.push('Biology', 'Chemistry', 'Physics');
            else if (['jee', 'kcet'].includes(examType)) requiredSubjects.push('Physics', 'Chemistry', 'Mathematics');
        }

        // Clean up
        requiredSubjects = [...new Set(requiredSubjects)].filter(s => s && s.trim());

        const missingTeachers = requiredSubjects.filter(sub => !getFacultyForSubject(sub));

        if (missingTeachers.length > 0) {
            Alert.alert(
                "Submission Blocked",
                `The following subjects have no assigned teacher:\n${missingTeachers.join(', ')}\n\nYou MUST assign a teacher to these subjects in 'Subject Management' before you can submit marks. The system requires a valid teacher reference.`,
                [
                    { text: "OK", style: "cancel" }
                ]
            );
            return;
        }

        // If no issues, proceed directly to confirmation
        Alert.alert(
            "Confirm Submission",
            `Submit scores for Class ${selectedClass} - Section ${selectedSection}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Submit", onPress: submitFinalPayload }
            ]
        );
    };

    const submitFinalPayload = async () => {
        setLoading(true);
        try {
            const date = new Date().toISOString();
            console.log("Submitting Payload... (Step 1: Init)");

            // Transform marksData into records
            const records = students.map(st => {
                if (!st._id) {
                    console.warn("Found student with missing _id:", JSON.stringify(st));
                    return null;
                }
                const m = marksData[st.id] || {};
                const subjectsList = [];

                const addSub = (name, ob, max) => {
                    const teacherId = getFacultyForSubject(name);

                    // CRITICAL FIX: Do NOT add subject if teacherId is null.
                    if (!teacherId) {
                        console.warn(`Skipping subject ${name} due to missing teacher identity.`);
                        return;
                    }

                    subjectsList.push({
                        subject: name,
                        marked_by: teacherId, // For Mongoose Schema (snake_case)
                        markedBy: teacherId,  // For Controller Validation (camelCase)
                        max_marks: max,
                        marks_obtained: Number(ob) || 0
                    });
                };

                if (gradeGroup === '1-10') {
                    if (examType === 'formative') {
                        if (subjectName) addSub(subjectName, m.marks, 20);
                    } else {
                        if (subjectName) {
                            const total = (Number(m.written) || 0) + (Number(m.internal) || 0);
                            addSub(subjectName, total, 100);
                        }
                    }
                } else {
                    // 11-12 logic
                    if (examType === 'midterm_prep') {
                        if (subjectName) {
                            const total = (Number(m.theory) || 0) + (Number(m.practical) || 0);
                            addSub(subjectName, total, 100);
                        }
                    } else if (examType === 'neet') {
                        addSub('Biology', m.bio, 360);
                        addSub('Chemistry', m.chem, 180);
                        addSub('Physics', m.phy, 180);
                    } else if (['jee', 'kcet'].includes(examType)) {
                        const max = examType === 'jee' ? 100 : 60;
                        addSub('Physics', m.phy, max);
                        addSub('Chemistry', m.chem, max);
                        addSub('Mathematics', m.math, max);
                    } else {
                        // Standard subjects
                        if (subjectName) addSub(subjectName, m.theory, 100);
                    }
                }

                // Filter out subjects with NO valid teacher. 
                // The frontend blocked submission if ALL were missing, but if one student has a glitch, we must exclude it to save the rest.
                const validSubjects = subjectsList.filter(s => s.marked_by);

                if (validSubjects.length === 0) return null; // Skip student if no valid subjects

                // Calculate total assessment marks for this student
                const totalObtained = validSubjects.reduce((acc, sub) => acc + (Number(sub.marks_obtained) || 0), 0);
                const totalMax = validSubjects.reduce((acc, sub) => acc + (Number(sub.max_marks) || 0), 0);

                return {
                    student: st._id, // For Schema storage (ObjectId)
                    studentId: st.id, // For Controller validation (String 'userId')
                    subjects: validSubjects,
                    assessment_max_marks: totalMax,
                    assessment_marks_obtained: totalObtained
                };
            }).filter(r => r !== null && r.student); // Remove null records

            const payload = {
                grade: selectedClass,
                section: selectedSection,
                test_name: examName || examType, // Use custom name if provided, else ID
                test_type: "Exam",
                date: date,
                year: new Date().getFullYear(), // Send integer year
                board: board || 'CBSE', // Add board parameter, default to 'CBSE' if undefined
                records: records
            };

            console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

            const res = await api.post(`${BASE_URL}/api/admin/students/submit`, payload);

            if (res.data.success) {
                Alert.alert("Success", "Marks submitted successfully!");
                setMarksData({}); // Clear form
                setExamName('');
            } else {
                Alert.alert("Error", res.data.message || "Failed to submit marks.");
            }
        } catch (err) {
            console.error("Submission Error Details:", JSON.stringify(err.response?.data || err.message, null, 2));
            const msg = err.response?.data?.message || err.message;
            Alert.alert("Submission Failed", `${msg}`);
        } finally {
            setLoading(false);
        }
    };



    const handleViewEditMarks = async () => {
        if (!selectedClass || !selectedSection || !subjectName || !examType) {
            Alert.alert("Missing Details", "Please select Class, Section, Subject, and Exam Type first.");
            return;
        }

        setLoading(true);
        try {
            const className = selectedClass.trim();
            const sectionName = selectedSection.trim();
            const year = new Date().getFullYear();

            // Correct Endpoint: GET /api/admin/students/assessmentScore
            console.log('Fetching marks from:', `${BASE_URL}/api/admin/students/assessmentScore`);
            const res = await api.get(`${BASE_URL}/api/admin/students/assessmentScore`, {
                params: {
                    grade: className,
                    section: sectionName,
                    subject: subjectName,
                    test_name: examType,
                    year: year
                }
            });

            if (res.data && res.data.success && res.data.data && res.data.data.scores) {
                const fetchedScores = res.data.data.scores; // Array of score objects

                if (fetchedScores.length === 0) {
                    Alert.alert("No Data", "No existing marks found for this selection.");
                    setLoading(false);
                    return;
                }

                // Map scores to marksData state
                const newMarksData = { ...marksData };

                fetchedScores.forEach(score => {
                    // score structure based on ViewPerformanceTab: 
                    // { student: { _id, userId }, marks_obtained, max_marks, ... }
                    // Note: We need to match studentId used in 'students' state (userId)
                    const sId = score.student?.userId;
                    if (sId) {
                        // We need to figure out how to map 'marks_obtained' back to 
                        // written/internal or theory/practical etc.
                        // Since the GET returns a total 'marks_obtained', checking specific breakdown 
                        // might not be supported unless we modify the backend to return breakdown.
                        // For now, if we are in 'Edit' mode, and if the exam has parts, 
                        // we might only be able to populate the total or 'marks' field 
                        // if the backend hasn't stored the breakdown.

                        // Wait, if the user wants to EDIT, they need the split.
                        // If backend only stores total, we can't perfectly restore split.
                        // Assumption: For now, populate the primary field or total.
                        // Or if the backend returns detailed record.

                        // Best Effort: Populate 'marks' (formative) or 'written' (summative) with total.
                        // Or 'theory' (11-12).

                        // Actually, if we look at `StudentSubjectMarksScreen`, it suggests mapping total to input.
                        console.log("Processing Score:", score);

                        // Determine which field to populate based on gradeGroup/examType
                        const val = String(score.marks_obtained || '');

                        if (!newMarksData[sId]) newMarksData[sId] = {};

                        if (gradeGroup === '1-10') {
                            if (examType === 'formative') {
                                newMarksData[sId].marks = val;
                            } else {
                                // Summative: written + internal
                                // If we only have total, put it in written? Or split?
                                // Putting in written for now to allow edit.
                                newMarksData[sId].written = val;
                                newMarksData[sId].internal = '0'; // Defaulting
                            }
                        } else {
                            if (examType === 'midterm_prep') {
                                newMarksData[sId].theory = val;
                                newMarksData[sId].practical = '0';
                            } else if (examType === 'neet') {
                                // NEET has Bio/Chem/Phy.
                                // Problem: The 'score' object represents ONE subject (e.g. Biology).
                                // So we filter by subject Name.
                                // Wait, `fetchScores` was for a specific `subject`.
                                // Our fetch query includes `subject: subjectName`.
                                // This filters response to ONE subject.

                                // If we want to populate the full row for NEET, we need to call API 3 times 
                                // or call without subject filter?
                                // Checking `api / admin / students / assessmentScore`... if subject is omitted?
                                // "getAssessmentScore" usually filters by whatever is passed.
                                // Let's try omitting subject if examType is NEET/JEE.

                                // For now, let's map the 'subjectName' from response to the field.
                                const subLower = (score.subjectName || score.subject || '').toLowerCase();
                                if (subLower.includes('bio')) newMarksData[sId].bio = val;
                                else if (subLower.includes('chem')) newMarksData[sId].chem = val;
                                else if (subLower.includes('phy')) newMarksData[sId].phy = val;
                                else if (subLower.includes('math')) newMarksData[sId].math = val;
                            } else {
                                // Standard 11-12 subject
                                newMarksData[sId].theory = val;
                            }
                        }
                    }
                });

                setMarksData(newMarksData);
                Alert.alert("Success", "Marks loaded successfully.");
            } else {
                Alert.alert("Info", "No marks found or invalid response.");
            }

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to fetch existing marks.");
        } finally {
            setLoading(false);
        }
    };

    const renderDropdown = (label, value, placeholder, onPress) => (
        <View style={{ flex: 1, marginBottom: 15 }}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.dropdown} onPress={onPress} activeOpacity={0.7}>
                <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#6366f1" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            {/* No custom header, relying on navigation stack or system bar. Padding top for status bar */}
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.headerContainer}>
                        <Text style={styles.pageTitle}>Marks Entry</Text>
                        <Text style={styles.pageSubtitle}>Manage and record student performance{board ? ` for ${board}` : ''}</Text>
                    </View>

                    {/* Grade Group Toggle */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, gradeGroup === '1-10' && styles.toggleBtnActive]}
                            onPress={() => toggleGradeGroup('1-10')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.toggleText, gradeGroup === '1-10' && styles.toggleTextActive]}>Grades 1-10</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, gradeGroup === '11-12' && styles.toggleBtnActive]}
                            onPress={() => toggleGradeGroup('11-12')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.toggleText, gradeGroup === '11-12' && styles.toggleTextActive]}>Grades 11-12</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Configuration Card */}
                    <View style={styles.card}>
                        <View style={styles.rowInputs}>
                            {renderDropdown("Class", selectedClass ? `Class ${selectedClass} ` : null, 'Select Class', () => setShowClassModal(true))}
                            <View style={{ width: 16 }} />
                            {renderDropdown("Section", selectedSection ? `Section ${selectedSection} ` : null, 'Select Section', () => setShowSectionModal(true))}
                        </View>

                        {/* Unified Subject Dropdown for All Grades */}
                        {/* We use the fetched subjectAssignments to populate this. If empty, we show empty or allow manual if needed (but manual risks mismatch) */}
                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.label}>Subject Name</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowSubjectModal(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.dropdownText, !subjectName && styles.placeholderText]}>
                                    {subjectName || 'Select Subject'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color="#6366f1" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.label}>Examination Type</Text>
                            <TouchableOpacity
                                style={[styles.dropdown, (gradeGroup === '11-12' && !subjectName) && styles.disabledDropdown]}
                                onPress={() => {
                                    if (gradeGroup === '11-12' && !subjectName) {
                                        Alert.alert('Select Subject', 'Please select a subject first to see applicable exams.');
                                        return;
                                    }
                                    setShowExamModal(true);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.dropdownText, !examType && styles.placeholderText]}>
                                    {examType ?
                                        (gradeGroup === '1-10' ? examTypes1To10 : examTypes11To12).find(e => e.id === examType)?.label
                                        : 'Select Examination'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6366f1" />
                            </TouchableOpacity>
                        </View>

                        {/* Custom Examination Name */}
                        <View style={{ marginBottom: 0 }}>
                            <Text style={styles.label}>Examination Name (Optional)</Text>
                            <TextInput
                                style={styles.simpleInput}
                                placeholder="e.g. Unit Test 1"
                                value={examName}
                                onChangeText={setExamName}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    {/* View / Edit Button */}
                    <TouchableOpacity
                        style={[styles.viewEditButton, { marginBottom: 20 }]}
                        onPress={handleViewEditMarks}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="eye-outline" size={20} color="#4f46e5" style={{ marginRight: 8 }} />
                        <Text style={styles.viewEditText}>View / Edit Existing Marks</Text>
                    </TouchableOpacity>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'manual' && styles.tabActive]}
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setMode('manual');
                            }}
                        >
                            <Ionicons name="create" size={20} color={mode === 'manual' ? '#4f46e5' : '#94a3b8'} />
                            <Text style={[styles.tabText, mode === 'manual' && styles.tabTextActive]}>Manual Entry</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'excel' && styles.tabActive]}
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setMode('excel');
                            }}
                        >
                            <Ionicons name="document-text" size={20} color={mode === 'excel' ? '#4f46e5' : '#94a3b8'} />
                            <Text style={[styles.tabText, mode === 'excel' && styles.tabTextActive]}>Excel Upload</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {mode === 'manual' ? (
                        renderManualEntry()
                    ) : (
                        <View style={styles.excelCard}>
                            <View style={styles.excelIconContainer}>
                                <Ionicons name="cloud-upload" size={48} color="#4f46e5" />
                            </View>
                            <Text style={styles.excelTitle}>Upload Marks Sheet</Text>
                            <Text style={styles.excelDesc}>Supported formats: .xlsx, .xls</Text>

                            <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload} activeOpacity={0.8}>
                                <Text style={styles.uploadButtonText}>Select File to Upload</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.templateLink} onPress={handleDownloadTemplate}>
                                <Ionicons name="download-outline" size={16} color="#6366f1" />
                                <Text style={styles.templateLinkText}>Download Excel Template</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            {mode === 'manual' && selectedClass && selectedSection && (
                <View style={styles.footer}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0)', '#fff']}
                        style={styles.footerGradient}
                        pointerEvents="none"
                    />
                    <View style={styles.footerContent}>
                        <TouchableOpacity style={[
                            styles.submitButton,
                            (!examType) && styles.submitButtonDisabled
                        ]} onPress={handleSubmit} disabled={!examType} activeOpacity={0.8}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Scores</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* MODALS */}

            {/* Class Modal */}
            <Modal visible={showClassModal} transparent animationType="fade" onRequestClose={() => setShowClassModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowClassModal(false)}>
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
                                    <Text style={[styles.optionText, selectedClass === item && styles.optionTextSelected]}>Class {item}</Text>
                                    {selectedClass === item && <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Section Modal */}
            <Modal visible={showSectionModal} transparent animationType="fade" onRequestClose={() => setShowSectionModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSectionModal(false)}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>Select Section</Text>
                        <View style={{ maxHeight: 300 }}>
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
                                        <Text style={[styles.optionText, selectedSection === item && styles.optionTextSelected]}>Section {item}</Text>
                                        {selectedSection === item && <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Exam Modal */}
            <Modal visible={showExamModal} transparent animationType="fade" onRequestClose={() => setShowExamModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowExamModal(false)}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>Select Examination</Text>
                        <View style={{ maxHeight: 400 }}>
                            <FlatList
                                data={getFilteredExamTypes}
                                keyExtractor={item => item.id}
                                ListEmptyComponent={
                                    <Text style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>No exams available for this selection.</Text>
                                }
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.optionItem}
                                        onPress={() => {
                                            setExamType(item.id);
                                            setShowExamModal(false);
                                        }}
                                    >
                                        <Text style={[styles.optionText, examType === item.id && styles.optionTextSelected]}>{item.label}</Text>
                                        {examType === item.id && <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Subject Modal */}
            <Modal visible={showSubjectModal} transparent animationType="fade" onRequestClose={() => setShowSubjectModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSubjectModal(false)}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>Select Subject</Text>
                        <View style={{ maxHeight: 400 }}>
                            <FlatList
                                data={subjectAssignments.length > 0
                                    ? subjectAssignments.map(a => a.subjectName)
                                    : (gradeGroup === '1-10' ? subjects1To10 : subjects11To12)}
                                keyExtractor={(item, index) => `${item}-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.optionItem}
                                        onPress={() => {
                                            setSubjectName(item);
                                            setShowSubjectModal(false);
                                        }}
                                    >
                                        <Text style={[styles.optionText, subjectName === item && styles.optionTextSelected]}>{item}</Text>
                                        {subjectName === item && <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20, paddingBottom: 100 },

    headerContainer: {
        marginBottom: 24,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    pageSubtitle: {
        fontSize: 15,
        color: '#64748b',
        marginTop: 4,
    },

    // Toggle
    viewEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e0e7ff',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#c7d2fe'
    },
    viewEditText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4f46e5'
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#e0e7ff',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    toggleBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366f1',
    },
    toggleTextActive: {
        color: '#4f46e5',
        fontWeight: '700',
    },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },

    simpleInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
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
        borderRadius: 16,
        padding: 16,
    },
    disabledDropdown: {
        backgroundColor: '#f1f5f9',
        borderColor: '#e2e8f0',
        opacity: 0.7
    },
    dropdownText: { fontSize: 16, color: '#0f172a', fontWeight: '500' },
    placeholderText: { color: '#94a3b8' },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginRight: 20,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f1f5f9',
    },
    tabActive: {
        backgroundColor: '#e0e7ff',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
        marginLeft: 8,
    },
    tabTextActive: {
        color: '#4f46e5',
    },

    // Empty State
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderStyle: 'dashed',
        paddingHorizontal: 30,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
    },
    helperText: {
        fontSize: 14,
        color: '#6366f1',
        fontStyle: 'italic',
        marginTop: 5,
    },

    // Student Card
    studentCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    studentName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    rollNo: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    statusBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#d97706',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 20,
    },

    // Inputs
    rowInputs: {
        flexDirection: 'row',
    },
    inputContainer: {
        marginBottom: 0,
    },
    inputLabel: {
        fontSize: 11,
        color: '#64748b',
        marginBottom: 8,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    textInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#0f172a',
        textAlign: 'center',
        fontWeight: '600',
    },

    // Excel
    excelCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 2,
    },
    excelIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    excelTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 6,
    },
    excelDesc: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 30,
    },
    uploadButton: {
        backgroundColor: '#4f46e5',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    },
    templateLink: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    templateLinkText: {
        color: '#6366f1',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 6,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerGradient: {
        height: 30,
    },
    footerContent: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    submitButton: {
        backgroundColor: '#16a34a',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 340,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 20,
        textAlign: 'center',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    optionText: {
        fontSize: 16,
        color: '#334155',
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#4f46e5',
        fontWeight: '700',
    },
    cancelButton: {
        marginTop: 20,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
    },
});
