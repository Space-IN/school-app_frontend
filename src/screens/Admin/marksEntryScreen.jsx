import { useEffect, useState } from "react"
import { Alert, KeyboardAvoidingView, LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, FlatList, TextInput, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Picker } from "@react-native-picker/picker"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from 'expo-linear-gradient'
import { api } from "../../api/api"

export default function MarksEntryScreen({ route, navigation }) {
    const { board } = route.params || { board: '' }
    
    // Step 1: Grade Group
    const [gradeGroup, setGradeGroup] = useState('school')
    
    // Step 2: Class & Section
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSection, setSelectedSection] = useState('')
    const [showClassModal, setShowClassModal] = useState(false)
    const [showSectionModal, setShowSectionModal] = useState(false)
    
    // Step 3: Examination Type (Template)
    const [examTemplates, setExamTemplates] = useState([])
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [showExamModal, setShowExamModal] = useState(false)
    const [loadingTemplates, setLoadingTemplates] = useState(false)
    
    // Step 4: Examination Name
    const [examName, setExamName] = useState('')
    
    // Step 5: Subject
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [showSubjectModal, setShowSubjectModal] = useState(false)
    
    // Step 6: Faculty (per component)
    const [facultyList, setFacultyList] = useState([])
    const [loadingFaculty, setLoadingFaculty] = useState(false)
    const [selectedFaculties, setSelectedFaculties] = useState({}) // { componentName: facultyId }
    
    // Step 7: Students & Marks
    const [students, setStudents] = useState([])
    const [loadingStudents, setLoadingStudents] = useState(false)
    const [marksData, setMarksData] = useState({}) // { studentId: { componentName: marks } }
    
    // Submission
    const [submitting, setSubmitting] = useState(false)
    
    const grades1To10 = Array.from({ length: 10 }, (_, i) => (i + 1).toString())
    const grades11To12 = ['11', '12']
    const sections = ['A', 'B', 'C', 'D']
    
    const getAvailableClasses = () => gradeGroup === 'school' ? grades1To10 : grades11To12

    // Reset dependent fields when selections change
    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    }, [gradeGroup])

    useEffect(() => {
        setSelectedTemplate(null)
        setExamName('')
        setSelectedSubject(null)
        setExamTemplates([])
    }, [selectedClass, selectedSection])

    useEffect(() => {
        setExamName(selectedTemplate?.assessmentName || '')
        setSelectedSubject(null)
    }, [selectedTemplate])

    useEffect(() => {
        setFacultyList([])
        setSelectedFaculties({})
        setStudents([])
        setMarksData({})
    }, [selectedSubject])

    // Fetch Exam Templates when Class & Section are selected
    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchExamTemplates()
        }
    }, [selectedClass, selectedSection])

    // Fetch Faculty when Subject is selected
    useEffect(() => {
        if (selectedSubject && selectedClass && selectedSection) {
            fetchFaculties()
            fetchStudents()
        }
    }, [selectedSubject])

    const fetchExamTemplates = async () => {
        setLoadingTemplates(true)
        try {
            const yearRange = "2026-2027"
            const res = await api.get('/api/admin/assessment/assessment-template', {
                params: { academicYear: yearRange, grade: selectedClass, board }
            })
            
            if (res.data?.success) {
                setExamTemplates(res.data.data || [])
            } else {
                setExamTemplates([])
            }
        } catch (err) {
            console.error("Error fetching exam templates:", err)
            Alert.alert("Error", `Could not fetch exam templates. ${err.response?.data?.error || err.message}`)
            setExamTemplates([])
        } finally {
            setLoadingTemplates(false)
        }
    }

    const fetchFaculties = async () => {
        setLoadingFaculty(true)
        try {
            const res = await api.get('/api/admin/subject/faculty/', {
                params: {
                    grade: selectedClass,
                    section: selectedSection,
                    subjectMasterId: selectedSubject._id,
                    board
                }
            })
            
            if (res.data?.success && res.data.faculties) {
                setFacultyList(res.data.faculties)
            } else {
                setFacultyList([])
            }
        } catch (err) {
            console.error("Error fetching faculties:", err)
            setFacultyList([])
        } finally {
            setLoadingFaculty(false)
        }
    }

    const fetchStudents = async () => {
        setLoadingStudents(true)
        try {
            const res = await api.get(`/api/admin/students/grade/${selectedClass}/section/${selectedSection}?board=${board}`)
            
            const fetchedStudents = Array.isArray(res.data) ? res.data : []
            setStudents(fetchedStudents.filter(s => s.board === board))
        } catch (err) {
            console.error("Error fetching students:", err)
            Alert.alert("Error", "Failed to fetch students.")
            setStudents([])
        } finally {
            setLoadingStudents(false)
        }
    }

    const toggleGradeGroup = (group) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
        setGradeGroup(group)
        setSelectedClass('')
        setSelectedSection('')
        setSelectedTemplate(null)
        setExamName('')
        setSelectedSubject(null)
    }

    const getSubjectsFromTemplate = () => {
        if (!selectedTemplate || !selectedTemplate.subjects) return []
        return selectedTemplate.subjects.map(s => s.subject)
    }

    const getComponentsForSelectedSubject = () => {
        if (!selectedTemplate || !selectedSubject) return []
        
        const subjectEntry = selectedTemplate.subjects.find(s => s.subject._id === selectedSubject._id)
        return subjectEntry ? subjectEntry.components : []
    }

    const handleFacultyChange = (componentName, facultyId) => {
        setSelectedFaculties(prev => ({
            ...prev,
            [componentName]: facultyId
        }))
    }

    const handleMarkChange = (studentId, componentName, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [componentName]: value
            }
        }))
    }

    const validateMarks = () => {
        const components = getComponentsForSelectedSubject()
        const errors = []

        students.forEach(student => {
            const studentMarks = marksData[student.userId] || {}
            
            components.forEach(comp => {
                const value = studentMarks[comp.name]
                if (value !== undefined && value !== null && value !== '') {
                    const numValue = Number(value)
                    if (isNaN(numValue)) {
                        errors.push(`${student.name}: '${value}' in ${comp.name} is not a valid number`)
                    } else if (numValue > comp.maxMarks) {
                        errors.push(`${student.name}: ${comp.name} exceeds max marks (${comp.maxMarks})`)
                    } else if (numValue < 0) {
                        errors.push(`${student.name}: ${comp.name} cannot be negative`)
                    }
                }
            })
        })

        return errors
    }

    const handleSubmit = async () => {
        // Validation
        if (!selectedClass || !selectedSection) {
            Alert.alert("Missing Details", "Please select Class and Section.")
            return
        }

        if (!selectedTemplate) {
            Alert.alert("Missing Details", "Please select an Examination Type.")
            return
        }

        if (!examName || examName.trim() === '') {
            Alert.alert("Missing Details", "Please enter an Examination Name.")
            return
        }

        // If subject is selected, validate marks AND faculty
        if (selectedSubject) {
            const components = getComponentsForSelectedSubject()
            
            // Check if all components have faculty selected
            const missingFaculty = components.filter(comp => !selectedFaculties[comp.name])
            if (missingFaculty.length > 0) {
                Alert.alert(
                    "Missing Faculty",
                    `Please select faculty for: ${missingFaculty.map(c => c.name).join(', ')}`
                )
                return
            }

            const validationErrors = validateMarks()
            if (validationErrors.length > 0) {
                Alert.alert(
                    "Validation Error",
                    validationErrors.slice(0, 5).join('\n') + 
                    (validationErrors.length > 5 ? '\n...and more' : '')
                )
                return
            }
        }

        // Confirmation
        const message = selectedSubject 
            ? `Submit marks for:\nClass: ${selectedClass}-${selectedSection}\nExam: ${examName}\nSubject: ${selectedSubject.name}?`
            : `Create assessment without marks?\nClass: ${selectedClass}-${selectedSection}\nExam: ${examName}`

        Alert.alert("Confirm Submission", message, [
            { text: "Cancel", style: "cancel" },
            { text: "Submit", onPress: submitAssessment }
        ])
    }

    const submitAssessment = async () => {
        setSubmitting(true)
        try {
            const records = []

            // Only build records if subject is selected
            if (selectedSubject) {
                const components = getComponentsForSelectedSubject()
                
                students.forEach(student => {
                    const studentMarks = marksData[student.userId] || {}
                    
                    // Check if student has any marks entered
                    const hasMarks = components.some(comp => {
                        const val = studentMarks[comp.name]
                        return val !== undefined && val !== null && val !== ''
                    })

                    if (hasMarks) {
                        const subjectRecord = {
                            subjectCode: selectedSubject.code,
                            components: components.map(comp => {
                                const rawValue = studentMarks[comp.name]
                                let marksObtained = null
                                
                                if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
                                    const numValue = Number(rawValue)
                                    if (!isNaN(numValue)) {
                                        marksObtained = numValue
                                    }
                                }

                                return {
                                    name: comp.name,
                                    marksObtained,
                                    markedBy: selectedFaculties[comp.name] || null
                                }
                            })
                        }

                        records.push({
                            studentId: student.userId,
                            subjects: [subjectRecord]
                        })
                    }
                })
            }

            const payload = {
                grade: Number(selectedClass),
                section: selectedSection,
                board: board,
                date: new Date().toISOString().split('T')[0], // Format: "2026-12-01"
                assessment_name: examName,
                assessment_template: selectedTemplate._id,
                records
            }

            console.log('Submitting payload:', JSON.stringify(payload, null, 2))

            const res = await api.post('/api/admin/assessment', payload)

            if (res.data?.success) {
                Alert.alert("Success", "Assessment submitted successfully!", [
                    { text: "OK", onPress: () => {
                        // Reset form
                        setSelectedTemplate(null)
                        setExamName('')
                        setSelectedSubject(null)
                        setMarksData({})
                        setSelectedFaculties({})
                    }}
                ])
            } else {
                Alert.alert("Submission Failed", res.data?.message || "Unknown error")
            }
        } catch (err) {
            console.error("Submission error:", err.response?.data || err)
            const resData = err.response?.data
            if (resData && resData.message?.includes('missing references')) {
                const details = [
                    resData.missingStudents?.length ? `Students: ${resData.missingStudents.join(', ')}` : '',
                    resData.missingFaculties?.length ? `Faculty: ${resData.missingFaculties.join(', ')}` : '',
                    resData.missingSubjects?.length ? `Subjects: ${resData.missingSubjects.join(', ')}` : ''
                ].filter(Boolean).join('\n')
                
                Alert.alert("Submission Failed", `Missing References:\n${details}`)
            } else {
                Alert.alert("Submission Error", resData?.message || err.message)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const renderDropdown = (label, value, placeholder, onPress, disabled = false) => (
        <View style={{ flex: 1, marginBottom: 15 }}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity 
                style={[styles.dropdown, disabled && styles.disabledDropdown]} 
                onPress={disabled ? null : onPress} 
                activeOpacity={0.7}
                disabled={disabled}
            >
                <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={18} color={disabled ? "#94a3b8" : "#6366f1"} />
            </TouchableOpacity>
        </View>
    )

    const renderStudentMarksEntry = () => {
        if (!selectedSubject) return null

        if (loadingStudents) {
            return <ActivityIndicator size="large" color="#ac1d1dff" style={{ marginTop: 40 }} />
        }

        if (students.length === 0) {
            return (
                <View style={[styles.emptyStateContainer, { marginTop: 20 }]}>
                    <Ionicons name="people-outline" size={40} color="#64748b" />
                    <Text style={{ marginTop: 10, color: '#64748b' }}>No students found for this class.</Text>
                </View>
            )
        }

        const components = getComponentsForSelectedSubject()

        return (
            <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>Student Marks Entry</Text>
                
                {students.map((student) => (
                    <View key={student.userId} style={styles.studentCard}>
                        <View style={styles.studentHeader}>
                            <LinearGradient
                                colors={['#bd2828', '#ac1d1dff']}
                                style={styles.avatarCircle}
                            >
                                <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                            </LinearGradient>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.rollNo}>Admission: {student.admissionNumber}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.componentsContainer}>
                            {components.map((comp, idx) => (
                                <View key={idx} style={styles.componentRow}>
                                    <Text style={styles.componentLabel}>
                                        {comp.name} (Max: {comp.maxMarks})
                                    </Text>
                                    <TextInput
                                        style={styles.marksInput}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        maxLength={3}
                                        placeholderTextColor="#94a3b8"
                                        value={marksData[student.userId]?.[comp.name] || ''}
                                        onChangeText={(val) => handleMarkChange(student.userId, comp.name, val)}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.pageTitle}>Marks Entry</Text>
                        <Text style={styles.pageSubtitle}>
                            Manage, record and create student's assessment performance{board ? ` for ${board}` : ''}
                        </Text>
                    </View>

                    {/* Grade Group Toggle */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, gradeGroup === "school" && styles.toggleBtnActive]}
                            onPress={() => toggleGradeGroup('school')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.toggleText, gradeGroup === 'school' && styles.toggleTextActive]}>
                                SCHOOL
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, gradeGroup === "puc" && styles.toggleBtnActive]}
                            onPress={() => toggleGradeGroup('puc')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.toggleText, gradeGroup === 'puc' && styles.toggleTextActive]}>
                                PUC
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Configuration Card */}
                    <View style={styles.card}>
                        
                        {/* Class & Section */}
                        <View style={styles.rowInputs}>
                            {renderDropdown(
                                "Class", 
                                selectedClass ? `Class ${selectedClass}` : null, 
                                'Select Class', 
                                () => setShowClassModal(true)
                            )}
                            <View style={{ width: 16 }} />
                            {renderDropdown(
                                "Section", 
                                selectedSection ? `Section ${selectedSection}` : null, 
                                'Select Section', 
                                () => setShowSectionModal(true)
                            )}
                        </View>

                        {/* Examination Type - Only show if Class & Section selected */}
                        {selectedClass && selectedSection && (
                            <>
                                <View style={{ marginBottom: 15 }}>
                                    <Text style={styles.label}>Examination Type (Template)</Text>
                                    <TouchableOpacity
                                        style={styles.dropdown}
                                        onPress={() => setShowExamModal(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.dropdownText, !selectedTemplate && styles.placeholderText]}>
                                            {selectedTemplate 
                                                ? `${selectedTemplate.assessmentName} (${selectedTemplate.assessmentType})` 
                                                : loadingTemplates ? 'Loading templates...' : 'Select Examination Type'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#6366f1" />
                                    </TouchableOpacity>
                                </View>

                                {/* Examination Name - Only show if Template selected */}
                                {selectedTemplate && (
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
                                )}

                                {/* Subject - Only show if Template selected */}
                                {selectedTemplate && (
                                    <View style={{ marginBottom: 15 }}>
                                        {renderDropdown(
                                            "Subject",
                                            selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : null,
                                            'Select Subject',
                                            () => setShowSubjectModal(true)
                                        )}
                                    </View>
                                )}

                                {/* Faculty Selection - Only show if Subject selected */}
                                {selectedSubject && (
                                    <View style={{ marginBottom: 15 }}>
                                        <Text style={styles.label}>Marked By (Faculty) <Text style={{ color: 'red' }}>*</Text></Text>
                                        {loadingFaculty ? (
                                            <ActivityIndicator size="small" color="#ac1d1dff" />
                                        ) : (
                                            getComponentsForSelectedSubject().map((comp, idx) => (
                                                <View key={idx} style={{ marginBottom: 10 }}>
                                                    <Text style={styles.componentFacultyLabel}>{comp.name}</Text>
                                                    <View style={styles.pickerContainer}>
                                                        <Picker
                                                            selectedValue={selectedFaculties[comp.name] || ''}
                                                            onValueChange={(val) => handleFacultyChange(comp.name, val)}
                                                            style={{ height: 50, width: '100%' }}
                                                        >
                                                            <Picker.Item label="Select Faculty" value="" color="#9ca3af" />
                                                            {facultyList.map((fac, i) => (
                                                                <Picker.Item
                                                                    key={i}
                                                                    label={fac.facultyId}
                                                                    value={fac.facultyId}
                                                                    color="#000"
                                                                />
                                                            ))}
                                                        </Picker>
                                                    </View>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                )}
                            </>
                        )}
                    </View>

                    {/* View/Edit Button */}
                    <TouchableOpacity
                        style={[styles.viewEditButton, { marginBottom: 20 }]}
                        onPress={() => navigation.navigate('MarksViewEditScreen', { board })}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.viewEditText}>VIEW / EDIT MARKS</Text>
                    </TouchableOpacity>

                    {/* Student Marks Entry */}
                    {renderStudentMarksEntry()}

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Submit Button Footer */}
            {selectedTemplate && (
                <View style={styles.footer}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0)', '#fff']}
                        style={styles.footerGradient}
                        pointerEvents="none"
                    />
                    <View style={styles.footerContent}>
                        <TouchableOpacity 
                            style={styles.submitButton} 
                            onPress={handleSubmit} 
                            activeOpacity={0.8}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {selectedSubject ? 'Submit Marks' : 'Create Assessment'}
                                </Text>
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
                                        setSelectedClass(item)
                                        setShowClassModal(false)
                                    }}
                                >
                                    <Text style={[styles.optionText, selectedClass === item && styles.optionTextSelected]}>
                                        Class {item}
                                    </Text>
                                    {selectedClass === item && <Ionicons name="checkmark-circle" size={24} color="#ac1d1dff" />}
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
                        <FlatList
                            data={sections}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setSelectedSection(item)
                                        setShowSectionModal(false)
                                    }}
                                >
                                    <Text style={[styles.optionText, selectedSection === item && styles.optionTextSelected]}>
                                        Section {item}
                                    </Text>
                                    {selectedSection === item && <Ionicons name="checkmark-circle" size={24} color="#ac1d1dff" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Examination Type Modal */}
            <Modal visible={showExamModal} transparent animationType="fade" onRequestClose={() => setShowExamModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowExamModal(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeaderContainer}>
                            <Text style={styles.modalHeader}>Select Examination Type</Text>
                            <TouchableOpacity onPress={() => setShowExamModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={examTemplates}
                            keyExtractor={item => item._id}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                                    No exam templates found for this Class and Board. Create an Exam template before creating the Exam.
                                </Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setSelectedTemplate(item)
                                        setShowExamModal(false)
                                    }}
                                >
                                    <View>
                                        <Text style={[styles.optionText, selectedTemplate?._id === item._id && styles.optionTextSelected]}>
                                            {item.assessmentName}
                                        </Text>
                                        <Text style={styles.optionSubtext}>{item.assessmentType}</Text>
                                    </View>
                                    {selectedTemplate?._id === item._id && <Ionicons name="checkmark-circle" size={24} color="#ac1d1dff" />}
                                </TouchableOpacity>
                            )}
                        />
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
                        <FlatList
                            data={getSubjectsFromTemplate()}
                            keyExtractor={(item) => item._id}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', padding: 20, color: 'red' }}>
                                    No subjects found in this template.
                                </Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setSelectedSubject(item)
                                        setShowSubjectModal(false)
                                    }}
                                >
                                    <View>
                                        <Text style={[styles.optionText, selectedSubject?._id === item._id && styles.optionTextSelected]}>
                                            {item.name}
                                        </Text>
                                        <Text style={styles.optionSubtext}>Code: {item.code}</Text>
                                    </View>
                                    {selectedSubject?._id === item._id && <Ionicons name="checkmark-circle" size={24} color="#ac1d1dff" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20, paddingBottom: 100 },
    headerContainer: { marginBottom: 24 },
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
        shadowColor: '#ac1d1dff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#ac1d1dff',
    },
    toggleTextActive: {
        color: '#ac1d1dff',
        fontWeight: '700',
    },
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
    rowInputs: { flexDirection: 'row' },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
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
        opacity: 0.6
    },
    dropdownText: { fontSize: 16, color: '#0f172a', fontWeight: '500' },
    placeholderText: { color: '#94a3b8' },
    simpleInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#0f172a',
    },
    componentFacultyLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    viewEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ac1d1dff',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#c7d2fe'
    },
    viewEditText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#ffffff'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
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
        marginBottom: 16,
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
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },
    componentsContainer: {
        gap: 12,
    },
    componentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    componentLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        flex: 1,
    },
    marksInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: '#0f172a',
        textAlign: 'center',
        fontWeight: '600',
        width: 80,
    },
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
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
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
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
    },
    modalHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
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
        color: '#ac1d1dff',
        fontWeight: '700',
    },
    optionSubtext: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
})