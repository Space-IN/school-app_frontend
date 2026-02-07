import { useState, useEffect, useMemo } from "react"
import { ActivityIndicator, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { fetchStudents } from "../../controllers/adminDataController"
import { api } from "../../api/api"




const StudentsMarksEntry = ({ grade, section, board, components, assessmentId, subjectCode, selectedFaculties, onReset, scores, loadingScores, }) => {
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

    const getExistingMarks = (studentId, compName) => {
        const scoreRec = scoresMap[studentId]
        if(!scoreRec || !scoreRec.components) {
            return 0
        } else {
            const component = scoreRec.components.find(comp => comp.name===compName)
            return component?.marks_obtained ?? 0
        }
    }

    const hasChanged = (studentId, componentName, currentVal) => {
        const existingMarks = getExistingMarks(studentId, componentName)
        const currNum = currentVal==='' || currentVal===null || currentVal===undefined ? 0 : Number(currentVal)
        return !isNaN(currNum) && currNum!==existingMarks
    }

    const scoresMap = useMemo(() => {
        if(!scores || !Array.isArray(scores)) {
            return {}
        } else {
            const map = {}
            scores.forEach(scoreRec => {
                if(scoreRec.student && scoreRec.student.userId)
                    map[scoreRec.student.userId] = scoreRec
            })
            return map
        }
    }, [scores])

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
                            let marks_obtained = 0
                            if(rawVal!==undefined && rawVal!==null && rawVal!=="") {
                                const numVal = Number(rawVal)
                                if(!isNaN(numVal)) {
                                    marks_obtained = numVal
                                }
                            }
                            return {
                                name: comp.name, marks_obtained, markedBy: selectedFaculties[comp.name],
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
                        setMarksData({})
                        onReset()
                    }}
                ])
            } else {
                Alert.alert("Submission Failed", res.data?.message || "Unknown error.")
            }
        } catch(err) {
            console.error("submission error: ", err.response?.data || err)
            const resData = err.response?.data
            console.log("resData: ", resData)
            if(resData && resData.message?.toLowerCase().includes('missing references')) {
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


    useEffect(() => {
        loadStudents()
    }, [grade, section, board])

    useEffect(() => {
        setMarksData({})
    }, [assessmentId, subjectCode])

    useEffect(() => {
        if(!loadingScores && scores && Array.isArray(scores)) {
            const initialMarks = {}
            scores.forEach(scoreRec => {
                if(scoreRec.student && scoreRec.components) {
                    const studentId = scoreRec.student.userId
                    initialMarks[studentId] = {}
                    scoreRec.components.forEach(comp => initialMarks[studentId][comp.name] = String(comp.marks_obtained??0))
                }
            })
            setMarksData(initialMarks)
        }
    }, [loadingScores, scores, subjectCode])

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
                {students.map((student) => {
                    const existingScore = scoresMap[student.userId]

                    return (
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
                                {existingScore && (
                                    <View style={styles.totalScoreBadge}>
                                        <Text style={styles.totalScoreText}>
                                            {existingScore.marks_obtained}/{existingScore.max_marks}
                                        </Text>
                                        <Text style={styles.gradeText}>{existingScore.grade_obtained}</Text>
                                    </View>
                                )}
                            </View>
                            
                            <View style={styles.divider} />

                            <View style={styles.componentsContainer}>
                                {components.map((comp, idx) => {
                                    const currVal = marksData[student.userId]?.[comp.name] || ''
                                    const isChanged = hasChanged(student.userId, comp.name, currVal)
                                    const existingMarks = getExistingMarks(student.userId, comp.name)

                                    return (
                                        <View key={idx} style={styles.componentRow}>
                                            <View style={{ flex: 1, }}>
                                                <Text style={styles.componentLabel}>
                                                    {comp.name} (Max: {comp.maxMarks})
                                                </Text>
                                                {existingScore && (
                                                    <Text style={styles.previousScoreText}>
                                                        Previous: {existingMarks}
                                                    </Text>
                                                )}
                                            </View>
                                            <TextInput
                                                style={[styles.marksInput, isChanged&&styles.marksInputChanged]}
                                                placeholder="0"
                                                keyboardType="numeric"
                                                maxLength={3}
                                                placeholderTextColor="#94a3b8"
                                                value={currVal}
                                                onChangeText={(val) => handleMarkChange(student.userId, comp.name, val)}
                                            />
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    )
                })}

                <View style={styles.footer}>
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
                                    UPDATE ASSESSMENT
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
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
        width: "94%",
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
        marginBottom: 10,
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
    totalScoreBadge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
    },
    totalScoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e40af',
    },
    gradeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
        marginTop: 2,
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
    },
    previousScoreText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        marginTop: 2,
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
    marksInputChanged: {
        borderColor: '#eab308',
        borderWidth: 2,
        backgroundColor: '#fefce8',
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
        position: "relative",
        marginTop: 20,
        bottom: 0,
    },
    footerContent: {
        width: "100%",
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
        width: "100%",
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
})

export default StudentsMarksEntry