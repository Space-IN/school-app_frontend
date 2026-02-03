import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Picker } from '@react-native-picker/picker'; // Correct Import
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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
    const [examName, setExamName] = useState('');
    const [subjectName, setSubjectName] = useState('');

    // DB Templates
    const [examTemplates, setExamTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // UI State for Modals
    const [mode, setMode] = useState('manual');
    const [showClassModal, setShowClassModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showExamModal, setShowExamModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allSubjectsMap, setAllSubjectsMap] = useState({}); // Mapping ID -> Name

    // Valid Fallback Faculty ID (fetched from DB)
    const [defaultFacultyId, setDefaultFacultyId] = useState(null);

    // Animation Effect
    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [gradeGroup]);

    // Fetch a valid Faculty ID for fallback purposes
    useEffect(() => {
        const fetchDefaultFaculty = async () => {
            try {
                const res = await api.get('/api/admin/faculty/all');
                if (res.data?.success && res.data.data?.length > 0) {
                    setDefaultFacultyId(res.data.data[0].userId);
                    console.log("Fallback Faculty ID set:", res.data.data[0].userId);
                }
            } catch (e) {
                console.log("Failed to fetch fallback faculty:", e.message);
            }
        };
        fetchDefaultFaculty();
    }, []);

    // Dependent Fields Reset
    // Dependent Fields Reset
    useEffect(() => {
        // When Template changes, reset Subject
        setSubjectName('');
    }, [selectedTemplate]);

    // When Class/Section changes, reset Template and Students (optional but cleaner)
    useEffect(() => {
        setSelectedTemplate(null);
        setSubjectName('');
        setExamType('');
    }, [selectedClass, selectedSection]);

    // Fetch all subjects to build a map (Fix for backend populate issue)
    useEffect(() => {
        const fetchAllSubjects = async () => {
            try {
                const res = await api.get('/api/admin/subject');
                if (res.data?.success) {
                    const map = {};
                    res.data.data.forEach(sub => {
                        map[sub._id] = sub; // Store full object or just name
                    });
                    console.log(`Loaded ${Object.keys(map).length} subjects for mapping.`);
                    setAllSubjectsMap(map);
                }
            } catch (e) {
                console.error("Failed to load subject map:", e);
            }
        };
        fetchAllSubjects();
    }, []);

    // Fetch Exam Templates when Class/Board changes
    useEffect(() => {
        if (selectedClass) {
            fetchExamTemplates();
        }
    }, [selectedClass, board]);

    // Auto-select Faculty when Subject changes
    useEffect(() => {
        if (!subjectName || !subjectAssignments.length) {
            if (!subjectName) setSelectedFaculty("");
            return;
        }

        // Find assignment by Name
        const assignment = subjectAssignments.find(a => {
            if (typeof a.subject === 'object' && a.subjectName) return a.subjectName === subjectName;
            if (a.subjectName === subjectName) return true;
            return false;
        });

        if (assignment) {
            const assignFacId = assignment.facultyId || ((typeof assignment.faculty === 'object') ? assignment.faculty.userId : assignment.faculty);
            const resolved = facultyIdMap[assignFacId] || assignFacId;
            if (resolved) {
                setSelectedFaculty(resolved);
            } else if (defaultFacultyId) {
                setSelectedFaculty(defaultFacultyId);
            }
        } else if (defaultFacultyId) {
            setSelectedFaculty(defaultFacultyId);
        }
    }, [subjectName, subjectAssignments, facultyIdMap, defaultFacultyId]); // Re-run if map loads later

    const fetchExamTemplates = async () => {
        try {
            // Calculate Academic Year "2025-26" format
            const date = new Date();
            const month = date.getMonth(); // 0 = Jan
            const currentYear = date.getFullYear(); // 2026
            let startYear, endYear;

            if (month < 3) {
                startYear = currentYear - 1;
                endYear = currentYear;
            } else {
                startYear = currentYear;
                endYear = currentYear + 1;
            }
            const academicYear = `${startYear}-${endYear.toString().slice(-2)}`;

            console.log("Fetching ALL Templates for Year/Board to filter locally:", { academicYear, board });

            // Fetch broad list (Grade + Board) - Removing academicYear restriction to fix mismatches
            const params = {};
            if (board) params.board = board;
            if (selectedClass) params.grade = selectedClass;

            console.log("Fetching templates with params:", params);

            // Note: even with backend cache cleared, we might get empty results if board mismatch exists.
            const res = await api.get('/api/admin/assessment/assessment-template', { params });

            console.log("Exam Template API Response:", res.data);

            if (res.data?.success) {
                const all = res.data.data || [];
                console.log(`Fetched ${all.length} templates. showing all.`);
                setExamTemplates(all);
            } else {
                setExamTemplates([]);
            }
        } catch (err) {
            console.error("Failed to fetch templates:", err.response?.data || err.message);
            Alert.alert("Error", `Could not fetch exam templates. ${err.response?.data?.error || err.message}`);
        }
    };

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

    // Helper to get subjects specifically available in the SELECTED TEMPLATE
    // Note: If backend population is disabled, s.subject might be just an ID string.
    const getTemplateSubjects = () => {
        if (!selectedTemplate || !selectedTemplate.subjects) return [];
        return selectedTemplate.subjects.map(s => {
            if (typeof s.subject === 'string') {
                // Resolve ID using our client-side map
                const mapped = allSubjectsMap[s.subject];
                if (mapped) return mapped;

                // Fallback if not found in map
                return { name: 'Subject ' + s.subject.substr(-4), _id: s.subject };
            }
            return s.subject; // Returns array of Subject objects { name, code, _id }
        });
    };

    // Helper to find template components for current subject
    const getTemplateComponents = () => {
        if (!selectedTemplate || !subjectName) return [];

        // Robust match: Handle populated object OR raw ID (using map)
        const sub = selectedTemplate.subjects.find(s => {
            let sName;
            if (typeof s.subject === 'object' && s.subject.name) {
                sName = s.subject.name;
            } else if (typeof s.subject === 'string') {
                sName = allSubjectsMap[s.subject]?.name || ('Subject ' + s.subject.substr(-4));
            }
            return sName === subjectName;
        });

        return sub ? sub.components : [];
    };




    const handleDownloadTemplate = async () => {
        if (!selectedClass || !selectedSection || !examType) {
            Alert.alert('Missing Info', 'Please select Class, Section and Exam Type/Subject first.');
            return;
        }

        try {
            // define columns based on exam type
            let columns = ['Student ID', 'Name', 'Roll No'];

            // Logic: If using Assessment Template, columns depend on the SELECTED SUBJECT components
            if (selectedTemplate) {
                if (!subjectName) {
                    Alert.alert('Select Subject', 'Please select a subject to generate the correct template.');
                    return;
                }
                const comps = getTemplateComponents(); // [{name: 'Theory', maxMarks: 80}, ...]

                if (comps.length > 0) {
                    comps.forEach(c => {
                        columns.push(`${c.name} (${c.maxMarks})`);
                    });
                } else {
                    columns.push('Marks'); // Fallback
                }
            } else {
                // FALLBACK for old hardcoded types (if any)
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

            const templateComponents = getTemplateComponents();

            data.forEach(row => {
                const studentId = row['Student ID'] || row['student_id'];
                if (!studentId) return;

                const entry = {};

                // New Dynamic Logic
                if (selectedTemplate && templateComponents.length > 0) {
                    templateComponents.forEach(comp => {
                        // Look for "Name (Max)" or just "Name"
                        const colNameWithMax = `${comp.name} (${comp.maxMarks})`;
                        let val = row[colNameWithMax];
                        if (val === undefined) val = row[comp.name];

                        if (val !== undefined) {
                            entry[comp.name] = val; // Store by component name
                        }
                    });

                    // Merge carefully to avoid overwriting existing data for other subjects if running multiple times?
                    // For now, we replace for this student.
                    if (newMarksData[studentId]) {
                        newMarksData[studentId] = { ...newMarksData[studentId], ...entry };
                    } else {
                        newMarksData[studentId] = entry;
                    }
                }
                // Fallback Logic
                else {
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
                }
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

    // State
    const [facultyMap, setFacultyMap] = useState({}); // userId -> _id
    const [reverseFacultyMap, setReverseFacultyMap] = useState({}); // _id -> userId
    const [facultyIdMap, setFacultyIdMap] = useState({}); // facultyId -> userId
    const [facultyList, setFacultyList] = useState([]); // List of { userId, name } for Dropdown
    const [selectedFaculty, setSelectedFaculty] = useState(""); // Currently selected marker

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        console.log("Fetching Faculty List...");
        let allFaculty = [];

        // Helper to safely fetch and parse
        const fetchAndParse = async (url, label) => {
            try {
                console.log(`Fetching ${label}...`);
                const res = await api.get(url);
                if (Array.isArray(res.data)) return res.data;
                if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
                if (res.data?.faculty && Array.isArray(res.data.faculty)) return res.data.faculty;
                return [];
            } catch (err) {
                console.warn(`Failed to fetch ${label}:`, err.message);
                return [];
            }
        };

        const [activeList, deletedList] = await Promise.all([
            fetchAndParse(`${BASE_URL}/api/admin/faculty/all`, "Active Faculty"),
            fetchAndParse(`${BASE_URL}/api/admin/faculty/deleted`, "Deleted Faculty")
        ]);

        allFaculty = [...activeList, ...deletedList];

        console.log(`Parsed ${allFaculty.length} total faculty items.`);

        if (allFaculty.length === 0) {
            Alert.alert("Warning", "Could not load any faculty data. Submissions may fail.");
        }

        if (allFaculty.length > 0) {
            console.log("Sample Faculty Keys:", Object.keys(allFaculty[0]));
        }

        const fMap = {};
        const rMap = {};
        const idMap = {}; // facultyId -> userId

        allFaculty.forEach(f => {
            const uId = f.userId; // e.g. "shanker"
            const mId = f._id;    // e.g. "6938..."
            const fId = f.facultyId; // e.g. "fshanker869"

            if (uId && mId) {
                fMap[uId] = mId;
                rMap[mId] = uId;
            }

            // Map facultyId to userId
            if (fId && uId) {
                idMap[fId] = uId;
            }
            // Also map userId to itself, just in case
            if (uId) {
                idMap[uId] = uId;
            }
        });

        console.log(`Faculty Maps Populated: ${Object.keys(fMap).length} entries.`);
        setFacultyMap(fMap);
        setReverseFacultyMap(rMap);
        setFacultyIdMap(idMap);
        // Clean list for dropdown
        setFacultyList(allFaculty.map(f => ({ userId: f.userId, name: f.name })));
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
            // endpoint: /api/admin/subject/class/:classAssigned/section/:section/board/:board
            // Fixed URL structure to match backend route
            const res = await api.get(`${BASE_URL}/api/admin/subject/class/${encodeURIComponent(className)}/section/${encodeURIComponent(sectionName)}/board/${encodeURIComponent(board || 'CBSE')}`);

            console.log('Subject Assignments API Response:', JSON.stringify(res.data, null, 2)); // Debug log

            // Handle { subjects: [...] } or { data: [...] } or direct array
            let data = [];
            if (res.data?.subjects) data = res.data.subjects;
            else if (res.data?.data) data = res.data.data;
            else if (Array.isArray(res.data)) data = res.data;

            console.log(`Assignments Parsed: ${data.length} items found.`);
            data.forEach(d => {
                const sId = d.subjectMasterId ? ((typeof d.subjectMasterId === 'object') ? d.subjectMasterId._id : d.subjectMasterId) : d.subject;
                const fId = d.facultyId || ((typeof d.faculty === 'object') ? d.faculty._id : d.faculty);
                console.log(`Assignment: Subject [${sId}] -> Faculty [${fId}]`);
            });

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
    // Helper to find faculty ID for a subject ID
    // Returns: String UserID (e.g. "faculty0010")
    // If subjectId provided is a string name (legacy calls), we return null or handle gracefully? 
    // The calling function MUST pass the subject ID now.
    const getFacultyForSubject = (subjectId) => {
        if (!subjectId || !subjectAssignments.length) return null;

        // Find assignment by Subject ID (Robust)
        const assignment = subjectAssignments.find(a => {
            // Handle if 'a.subject' or 'a.subjectMasterId' is populated Object or simple ID string
            const aSubId = a.subjectMasterId
                ? ((typeof a.subjectMasterId === 'object') ? a.subjectMasterId._id : a.subjectMasterId)
                : ((typeof a.subject === 'object') ? a.subject._id : a.subject);
            return aSubId === subjectId;
        });

        if (!assignment) {
            // Fallback: This might happen if 'subjectAssignments' state not fully loaded 
            // or if we passed a Name instead of ID.
            // console.log(`Debug: No assignment found for subject ID ${subjectId}`);
            return null;
        }

        // Return the string Faculty ID (userId)
        // Case 1: Directly available (if API returns it at top level)
        if (assignment.facultyId) return assignment.facultyId;

        // Case 2: We have Faculty Object (if populated)
        if (assignment.faculty && assignment.faculty.userId) return assignment.faculty.userId;

        // Case 3: We have Faculty ObjectId -> Use Reverse Map
        const fObjectId = (typeof assignment.faculty === 'object') ? assignment.faculty._id : assignment.faculty;
        if (fObjectId && reverseFacultyMap[fObjectId]) {
            return reverseFacultyMap[fObjectId];
        }

        console.warn("Found assignment but could not resolve Faculty UserID");
        return null;
    };

    // Helper to update marks state - Nested by Subject
    const updateMark = useCallback((studentId, subjectNm, component, value) => {
        setMarksData(prev => {
            const studentMarks = prev[studentId] || {};
            const subjectMarks = studentMarks[subjectNm] || {};

            return {
                ...prev,
                [studentId]: {
                    ...studentMarks,
                    [subjectNm]: {
                        ...subjectMarks,
                        [component]: value
                    }
                }
            };
        });
    }, []);

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

        const templateComponents = selectedTemplate ? getTemplateComponents() : [];

        return (
            <View style={{ marginTop: 10 }}>
                {students.map((student) => (
                    <StudentRow
                        key={student.id}
                        student={student}
                        subjectName={subjectName}
                        components={templateComponents}
                        currentMarks={marksData[student.id]?.[subjectName] || {}}
                        onMarkChange={updateMark}
                    />
                ))}

                <View style={{ height: 120 }} />
            </View>
        );
    };

    const handleSubmit = () => {
        if (!selectedClass || !selectedSection) {
            Alert.alert("Missing Details", "Please select a Class and Section first.");
            return;
        }
        if (!selectedTemplate) {
            Alert.alert("Missing Details", "Please select an Examination Type (Template).");
            return;
        }

        if (!examName || examName.trim() === '') {
            Alert.alert("Missing Details", "Examination Name is required.");
            return;
        }

        // Pre-validate Teachers - Check if we have assignments for required subjects
        // We only need teacher for the CURRENT subject being graded

        // Resolve Subject ID from Template
        const templateSub = selectedTemplate?.subjects?.find(s => {
            const sId = (typeof s.subject === 'object') ? s.subject._id : s.subject;
            const sName = allSubjectsMap[sId]?.name || (typeof s.subject === 'object' ? s.subject.name : '');
            return sName === subjectName;
        });

        const currentSubjectId = (templateSub && templateSub.subject && typeof templateSub.subject === 'object')
            ? templateSub.subject._id
            : templateSub?.subject;

        if (!currentSubjectId) {
            if (!subjectName) {
                // Allow creation of Empty Assessment (Schematic only)
                Alert.alert(
                    "Create Empty Assessment?",
                    "You have not selected a subject. This will create the Assessment details but NO teacher/student marks will be saved.\n\nProceed?",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Create Empty", onPress: () => submitFinalPayload(null, null) }
                    ]
                );
                return;
            } else {
                Alert.alert("Error", "Could not resolve Subject ID. Please try again.");
                return;
            }
        }

        // Priority 1: User Manually Selected Faculty in Dropdown
        if (selectedFaculty) {
            Alert.alert(
                "Confirm Submission",
                `Submit scores for:\nClass: ${selectedClass}-${selectedSection}\nExam: ${examName}\nSubject: ${subjectName}\nMarked By: ${selectedFaculty}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Submit", onPress: () => submitFinalPayload(currentSubjectId, selectedFaculty) }
                ]
            );
            return;
        }

        const assignedFaculty = getFacultyForSubject(currentSubjectId);

        if (!assignedFaculty) {
            Alert.alert(
                "Teacher Assignment Warning",
                `The subject '${subjectName}' (ID: ${currentSubjectId}) has no assigned teacher detected in the loaded list.\n\nThis might be due to a missing assignment record or API filter mismatch.\n\nDo you want to proceed effectively using 'admin' as the marker?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Proceed Anyway",
                        onPress: () => submitFinalPayload(currentSubjectId, defaultFacultyId || "admin") // Robust Fallback
                    }
                ]
            );
            return;
        }

        // If no issues, proceed directly to confirmation
        Alert.alert(
            "Confirm Submission",
            `Submit scores for:\nClass: ${selectedClass}-${selectedSection}\nExam: ${examName}\nSubject: ${subjectName}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Submit", onPress: () => submitFinalPayload(currentSubjectId, assignedFaculty) } // Pass resolved IDs
            ]
        );
    };

    // Helper to find faculty ObjectId for a subject ID
    const getFacultyObjectIdForSubject = (subjectId) => {
        if (!subjectId || !subjectAssignments.length) return null;

        // Find assignment by Subject ID
        const assignment = subjectAssignments.find(a => {
            // Check subjectMasterId if populated or ID string
            const aSubId = a.subjectMasterId
                ? ((typeof a.subjectMasterId === 'object') ? a.subjectMasterId._id : a.subjectMasterId)
                : (typeof a.subject === 'object') ? a.subject._id : a.subject;

            return aSubId === subjectId;
        });

        if (!assignment) return null;

        // Resolve Faculty ObjectId
        // Priority 1: Direct ObjectId if populated (assignment.faculty._id)
        if (assignment.faculty && assignment.faculty._id) return assignment.faculty._id;

        // Priority 2: Use Reverse Map if we have a string ID (facultyId="faculty0010")
        // Note: Field name might be 'facultyId' or 'faculty' based on schema
        const fIdString = assignment.facultyId || assignment.faculty;

        if (fIdString && typeof fIdString === 'string') {
            // Look for ObjectId in the map
            const resolved = reverseFacultyMap[fIdString];
            if (resolved) return resolved;

            // If not in map, maybe it IS an ObjectId? Return it to try.
            return fIdString;
        }

        return null;
    };

    const submitFinalPayload = async (resolvedSubjectId, resolvedFacultyId) => {
        setLoading(true);
        try {
            console.log("Constructing Controller-Spec Payload...");

            const records = [];

            // 1. Processing Records (If Subject Selected)
            if (resolvedSubjectId) {
                // Get Template Details for Subject (Need Code)
                const templateSub = selectedTemplate.subjects.find(s => {
                    const sId = (typeof s.subject === 'object') ? s.subject._id : s.subject;
                    return sId === resolvedSubjectId;
                });

                if (!templateSub) throw new Error("Template mismatch for subject.");

                // Subject Code is crucial for Backend Mapping
                let subjectCode;
                if (templateSub.subject && templateSub.subject.code) {
                    subjectCode = templateSub.subject.code;
                } else {
                    // Fallback: Use Map
                    subjectCode = allSubjectsMap[resolvedSubjectId]?.code;
                }

                if (!subjectCode) {
                    Alert.alert("Error", "Subject Code missing in template and map. Cannot submit.");
                    setLoading(false);
                    return;
                }

                // 2. Data Validation Loop (Check for non-numeric input)
                const validationErrors = [];
                students.forEach(st => {
                    const studentMarks = marksData[st.id]?.[subjectName] || {};
                    templateSub.components.forEach(comp => {
                        const rawVal = studentMarks[comp.name];
                        if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
                            const strVal = String(rawVal).trim();
                            if (isNaN(Number(strVal))) {
                                validationErrors.push(`${st.name}: '${rawVal}' in ${comp.name}`);
                            }
                        }
                    });
                });

                if (validationErrors.length > 0) {
                    Alert.alert(
                        "Data Validation Error",
                        "The following entries are not valid numbers:\n" +
                        validationErrors.slice(0, 5).join('\n') +
                        (validationErrors.length > 5 ? "\n...and more" : "") +
                        "\n\nPlease correct them before submitting."
                    );
                    setLoading(false);
                    return;
                }

                // 3. Iterate Students & Construct Payload
                students.forEach(st => {
                    // Determine Marks
                    const studentMarks = marksData[st.id]?.[subjectName] || {};

                    // Map Components
                    const components = [];
                    // Resolve the correct user ID for submission (Handle facultyId vs userId mismatch)
                    const finalMarkedBy = facultyIdMap[resolvedFacultyId] || resolvedFacultyId;

                    templateSub.components.forEach(comp => {
                        const compName = comp.name;
                        // Logic to allow NULL marks (Empty box = null)
                        const rawVal = studentMarks[compName];
                        let val = null;
                        if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                            val = Number(rawVal);
                            if (isNaN(val)) val = null;
                        }

                        components.push({
                            name: compName,
                            marksObtained: val, // Controller expects camelCase
                            markedBy: finalMarkedBy // Controller expects UserID string
                        });
                    });

                    // Filter: If student has NO VALID MARKS (all are null), skip submission.
                    // Prevents creating empty/fail records for absent/unmarked students.
                    const hasValidMarks = components.some(c => c.marksObtained !== null);

                    if (!hasValidMarks) {
                        // console.log(`Skipping student ${st.name} (No marks entered)`);
                        return;
                    }

                    // Add Record
                    records.push({
                        studentId: st.id, // Controller expects UserID string (st.id is mapped userId)
                        subjects: [{
                            subjectCode: subjectCode, // Controller expects Code string
                            components: components
                        }]
                    });
                });
            }

            const payload = {
                grade: Number(selectedClass),
                section: selectedSection,
                board: board,
                date: new Date().toISOString(),
                year: new Date().getFullYear(),
                assessment_name: examName,
                assessment_template: selectedTemplate._id,
                records: records
            };

            console.log('FINAL CONTROLLER PAYLOAD:', JSON.stringify(payload, null, 2));

            const res = await api.post('/api/admin/assessment', payload);

            if (res.data?.success) {
                Alert.alert("Success", "Marks submitted successfully!");
                // Clear inputs?
            } else {
                // Check for specific backend messages
                if (res.data?.message?.includes('missing references')) {
                    const details = [
                        res.data.missingStudents?.length ? `Students: ${res.data.missingStudents.join(', ')}` : '',
                        res.data.missingFaculties?.length ? `Faculty: ${res.data.missingFaculties.join(', ')}` : '',
                        res.data.missingSubjects?.length ? `Subjects: ${res.data.missingSubjects.join(', ')}` : ''
                    ].filter(Boolean).join('\n');

                    Alert.alert("Submission Failed", `Missing References:\n${details}`);
                } else {
                    Alert.alert("Submission Failed", res.data?.message || "Unknown error");
                }
            }
        } catch (err) {
            console.error("Submission Error Details:", err.response?.data);

            const resData = err.response?.data;
            if (resData && resData.message?.includes('missing references')) {
                const details = [
                    resData.missingStudents?.length ? `Students: ${resData.missingStudents.join(', ')}` : '',
                    resData.missingFaculties?.length ? `Faculty: ${resData.missingFaculties.join(', ')}` : '',
                    resData.missingSubjects?.length ? `Subjects: ${resData.missingSubjects.join(', ')}` : ''
                ].filter(Boolean).join('\n');

                Alert.alert("Submission Failed", `Missing References:\n${details}`);
            } else {
                Alert.alert("Submission Error", resData?.message || err.message);
            }
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
                    subject: subjectName, // "Subject Name" from database
                    assessment_template: selectedTemplate?._id, // Filter by template ID
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

    const renderDropdown = (label, value, placeholder, onPress, onClear) => (
        <View style={{ flex: 1, marginBottom: 15 }}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.dropdown} onPress={onPress} activeOpacity={0.7}>
                <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                {value && onClear ? (
                    <TouchableOpacity onPress={(e) => {
                        // e.stopPropagation() doesn't work well on Touchables on Android sometimes, 
                        // but here nested touchable usually works.
                        // But we might need to handle the parent onPress carefully.
                        // React Native Event Bubbling: Child onPress fires first. 
                        // If we don't manage it, Parent might fire too?
                        // Actually RN handles disjoint touchables well if layout allows.
                        if (onClear) onClear();
                    }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                ) : (
                    <Ionicons name="chevron-down" size={18} color="#6366f1" />
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
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
                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.label}>Examination Type (Template)</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowExamModal(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.dropdownText, !selectedTemplate && styles.placeholderText]}>
                                    {selectedTemplate ? selectedTemplate.assessmentName : 'Select Examination Type'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6366f1" />
                            </TouchableOpacity>
                        </View>

                        {/* Examination Name (Mandatory) */}
                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.label}>Examination Name <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={styles.simpleInput}
                                placeholder="e.g. Unit Test 1"
                                value={examName}
                                onChangeText={setExamName}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        {/* 2. Subject - Dependent on Template (DROPDOWN) */}
                        <View style={{ marginBottom: 15 }}>
                            {renderDropdown(
                                "Subject",
                                subjectName || null,
                                selectedTemplate ? 'Select Subject' : 'Select Exam Type first',
                                () => {
                                    if (!selectedTemplate) {
                                        Alert.alert("Steps Order", "Please select an Examination Type first.");
                                        return;
                                    }
                                    setShowSubjectModal(true);
                                },
                                // Clear Handler
                                () => setSubjectName(null)
                            )}
                        </View>


                        {/* Marked By Faculty Dropdown */}
                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.label}>Marked By (Faculty)</Text>
                            <View style={{
                                borderWidth: 1,
                                borderColor: '#e2e8f0',
                                borderRadius: 12,
                                backgroundColor: '#fff',
                                overflow: 'hidden' // Ensure picker stays inside border
                            }}>
                                <Picker
                                    selectedValue={selectedFaculty}
                                    onValueChange={(itemValue) => setSelectedFaculty(itemValue)}
                                    style={{ height: 50, width: '100%' }}
                                >
                                    <Picker.Item label="Select Faculty" value="" color="#9ca3af" />
                                    {facultyList.map((fac, idx) => (
                                        <Picker.Item
                                            key={idx.toString()}
                                            label={`${fac.name} (${fac.userId})`}
                                            value={fac.userId}
                                            color="#000"
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>


                    </View>

                    {/* View / Edit Button */}
                    <TouchableOpacity
                        style={[styles.viewEditButton, { marginBottom: 20 }]}
                        onPress={() => navigation.navigate('MarksViewEditScreen', { board: board })}
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
                        <View style={styles.modalHeaderContainer}>
                            <Text style={styles.modalHeader}>Select Examination Type</Text>
                            <TouchableOpacity onPress={() => setShowExamModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ maxHeight: 400 }}>
                            <FlatList
                                data={examTemplates}
                                keyExtractor={item => item._id}
                                ListEmptyComponent={
                                    <Text style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>No exam templates found for this Class/Board.</Text>
                                }
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.optionItem}
                                        onPress={() => {
                                            setExamType(item._id); // Keep for compatibility if needed
                                            setSelectedTemplate(item);
                                            setExamName(item.assessmentName); // Default the name
                                            setSubjectName(''); // Reset subject
                                            setShowExamModal(false);
                                        }}
                                    >
                                        <Text style={[styles.optionText, selectedTemplate?._id === item._id && styles.optionTextSelected]}>{item.assessmentName}</Text>
                                        {selectedTemplate?._id === item._id && <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />}
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
                        <View style={styles.modalHeaderContainer}>
                            <Text style={styles.modalHeader}>Select Subject</Text>
                            <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ maxHeight: 400 }}>
                            <FlatList
                                data={getTemplateSubjects()}
                                keyExtractor={(item, index) => item._id || index.toString()}
                                ListEmptyComponent={
                                    <Text style={{ textAlign: 'center', padding: 20, color: 'red' }}>
                                        No subjects found in this template.
                                        {selectedTemplate?.subjects?.length > 0 ? " (Mapping Error)" : " (Empty Template)"}
                                    </Text>
                                }
                                renderItem={({ item }) => {
                                    const displayName = item.name || "Unknown Subject";
                                    return (
                                        <TouchableOpacity
                                            style={styles.optionItem}
                                            onPress={() => {
                                                setSubjectName(displayName);
                                                setShowSubjectModal(false);
                                            }}
                                        >
                                            <Text style={[styles.optionText, subjectName === displayName && styles.optionTextSelected]}>
                                                {displayName}
                                            </Text>
                                            {subjectName === displayName && <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

        </SafeAreaView>
    );
}

// Memoized Row Component to prevent re-rendering ALL rows when ONE input changes
const StudentRow = React.memo(({ student, components, currentMarks, onMarkChange, subjectName }) => {
    return (
        <View style={styles.studentCard}>
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
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Pending</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {components.length === 0 ? (
                <Text style={styles.helperText}>Subject not found in this Exam Template.</Text>
            ) : (
                <View style={styles.rowInputs}>
                    {components.map((comp, index) => (
                        <View key={index} style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>{comp.name} ({comp.maxMarks})</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="0"
                                keyboardType="numeric"
                                maxLength={3}
                                placeholderTextColor="#94a3b8"
                                value={currentMarks[comp.name] || ''}
                                onChangeText={v => onMarkChange(student.id, subjectName, comp.name, v)}
                            />
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}, (prev, next) => {
    // Custom Comparison for Performance
    // Only re-render if marks for this SPECIFIC student have changed (reference check ok if immutable update)
    // Or if components structure changed
    return (
        prev.currentMarks === next.currentMarks &&
        prev.components === next.components &&
        prev.student.id === next.student.id &&
        prev.subjectName === next.subjectName
    );
});


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
