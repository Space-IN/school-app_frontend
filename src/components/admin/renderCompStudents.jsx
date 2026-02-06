import { useState, useEffect } from "react"
import { ActivityIndicator, View, Text, TextInput, StyleSheet, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { fetchStudents } from "../../controllers/adminDataController"
import { api } from "../../api/api"




const StudentsMarksEntry = ({ grade, section, board, components, assessmentId, subjectCode, selectedFaculties }) => {
    const [loadingStudents, setLoadingStudents] = useState(false)
    const [students, setStudents] = useState([])
    const loadStudents = async () => {
        setLoadingStudents(true)
        try {
            const fetchedStudents = await fetchStudents(grade, section, board)
            setStudents(fetchedStudents.filter(s => s.board===board))
        } catch(err) {
            console.error("error fetching students: ", err)
            Alert.alert("Error", "Failed to fetch students.")
            setStudents([])
        } finally {
            setLoadingStudents(false)
        }
    }
    
    const [marksData, setMarksData] = useState({})
    const handleMarkChange = (studentId, componentName, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: { ...(prev[studentId] || {}), [componentName]: value, }
        }))
    }

    const validateMarks = () => {
        const errors = []

        students.forEach(student => {
            const studentMarks = marksData[student.userId] || {}
            components.forEach(comp => {
                const value = studentMarks[comp.name]
                if(value!==undefined && value!==null && value!=="") {
                    const numValue = Number(value)
                    if(isNaN(numValue)) {
                        errors.push(`${student.name}: '${value}' in ${comp.name} is not a valid number.`)
                    } else if(numValue>comp.maxMarks) {
                        errors.push(`${student.name}: ${comp.name} exceeds max marks (${comp.maxMarks}).`)
                    } else if(numValue<0) {
                        errors.push(`${student.name}: ${comp.name} cannot be negative.`)
                    }
                }
            })
        })
        return errors
    }

    const handleSubmit = async () => {
        if(!grade || !section || !board) {
            Alert.alert("Missing Details", "Class and Section is missing.")
            return
        } else if(!assessmentId) {
            Alert.alert("Missing Details", "Exam is missing.")
            return
        } else if(!subjectCode) {
            Alert.alert("Missing Details", "Please select Subject.")
            return
        } else if(!components) {
            Alert.alert("Missing Details", "Exam Structure unavailable.")
            return
        } else {
            const missingFaculty = components.filter(comp => !selectedFaculties[comp.name])
            if (missingFaculty.length > 0) {
                Alert.alert(
                    "Missing Faculty",
                    `Please select faculty for: ${missingFaculty.map(c => c.name).join(', ')}`
                )
                return
            } else {
                const validationErrors = validateMarks()
                if(validationErrors.length>0) {
                    Alert.alert(
                        "Validation Error",
                        validationErrors.slice(0, 5).join('\n') + 
                        (validationErrors.length > 5 ? '\n...and more' : '')
                    )
                    return
                } else {
                    const message = `Update marks for:\nClass: ${grade} ${section}\nSubject: ${subjectCode}.`
                    Alert.alert("Confirm Submission", message, [
                        { text: "Cancel", style: "cancel", },
                        { text: "Submit", onPress: updateAssessment, },
                    ])
                }
            }
        }
    }

    const [submitting, setSubmitting] = useState(false)
    const updateAssessment = async () => {
        setSubmitting(true)
        try {
            const records = []
            if(subjectCode) {
                students.forEach((student) => {
                    const studentMarks = marksData[student.userId] || {}
                    const hasMarks = components.some((comp) => {
                        const val = studentMarks[comp.name]
                        return val!==undefined && val!==null && val!==''
                    })
                    if(hasMarks) {
                        const updatedMarks = components.map((comp) => {
                            const rawVal = studentMarks[comp.name]
                            let marksObtained = null
                            if(rawVal!==undefined && rawVal!==null && rawVal!=="") {
                                const numVal = Number(rawVal)
                                if(!isNaN(numVal)) {
                                    marksObtained = numVal
                                }
                            }
                            return {
                                name: comp.name, marksObtained, markedBy: selectedFaculties[comp.name],
                            }
                        })
                        records.push({ studentId: student.userId, components: updatedMarks, })
                    }
                })
            }
            const payload = {
                assessmentId, subjectCode, records: records,
            }
            const res = await api.put("/api/admin/assessment", payload)
            if(res.data?.success) {
                Alert.alert("Success", "Assessment updated successfully!", [
                    { text: "Done", onPress: () => {
                        
                    }}
                ])
            }
        } catch(err) {

        } finally {
            setSubmitting(false)
        }
    }


    useEffect(() => {
        loadStudents()
    }, [grade, section, board])

    if(loadingStudents) {
        return <ActivityIndicator size="large" color="#ac1d1dff" style={{ marginTop: 40, }} />
    } else if(students.length===0) {
        return (
            <View style={[styles.emptyStateContainer, { marginTop: 20 }]}>
                <Ionicons name="people-outline" size={40} color="#64748b" />
                <Text style={{ marginTop: 10, color: '#64748b' }}>No students found for this class.</Text>
            </View>
        )
    } else {
        return (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>STUDENT MARKS</Text>
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
                                <Text style={styles.rollNo}>User ID: {student.userId}</Text>
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
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        paddingVertical: 20, paddingHorizontal: 25,
        marginBottom: 24, marginTop: 20,
        shadowColor: '#64748b', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 4,
        borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 24,
        width: "95%",
        alignSelf: "center",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#2c2d2e',
        marginBottom: 16,
    },
    studentCard: {
        backgroundColor: '#f3f3f3',
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
})

export default StudentsMarksEntry