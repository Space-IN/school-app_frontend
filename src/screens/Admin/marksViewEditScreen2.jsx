import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import { LinearGradient } from "expo-linear-gradient"
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { fetchAssessments } from "../../controllers/adminDataController"




export default function MarksViewEditScreen({ navigation, route, }) {
    const { board, } = route.params

    const classess = Array.from({ length: 12, }, (_, i) => (i+1).toString())
    const sections = ['A', 'B', 'C', 'D']
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSection, setSelectedSection] = useState('')

    const currYear = new Date().getFullYear()
    const [loadingAssessments, setLoadingAssessments] = useState(false)
    const [assessments, setAssessments] = useState([])
    const [selectedAssessment, setSelectedAssessment] = useState({})
    const loadAssessment = async () => {
        setLoadingAssessments(true)
        setAssessments([])
        try {
            const resAssessments = await fetchAssessments(currYear, board, selectedClass, selectedSection)
            if(resAssessments) setAssessments(resAssessments)
        } catch(err) {
            console.error("couldn't fetch assessments: ", err)
        } finally {
            setLoadingAssessments(false)
        }
    }


    useEffect(() => {
        loadAssessment()
    }, [selectedClass, selectedSection])

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#d72b2b', '#8b1313']} start={{ x: 0, y: 0, }} end={{ x: 1, y: 1, }} style={styles.mainHeader}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="caret-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.pageTitle}>Assessment Records</Text>
                        <View style={{ width: 40, }} />
                    </View>
                    <Text style={styles.pageSubtitle}>{board}</Text>
                </SafeAreaView>
            </LinearGradient>


            <View style={styles.filterContainer}>
                <View style={[styles.filterRow, { zIndex: 10, }]}>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Class</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedClass}
                                onValueChange={setSelectedClass}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select" value={null} color="#94a3b8" />
                                {classess.map(c => <Picker.Item key={c} label={c} value={c} />)}
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


            {selectedClass && selectedSection && (
                <View style={styles.card}>
                    <View style={styles.optionsPickerContainer}>
                        <Text style={styles.filterLabel}>Assessments</Text>
                        <View style={styles.optionsPickerWrapper}>
                            <Picker
                                selectedValue={selectedAssessment}
                                onValueChange={setSelectedAssessment}
                                enabled={!loadingAssessments}
                                style={styles.optionsPicker}
                            >
                                <Picker.Item label="Select Assessment" value={null} color="#94a3b8" />
                                {assessments.map(a => <Picker.Item key={a._id} label={a.assessment_name} value={a._id} />)}
                            </Picker>

                            {loadingAssessments && (
                                <View style={styles.pickerLoadingOverlay}>
                                    <ActivityIndicator size="small" color="#9c1006ff" />
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', },
    mainHeader: {
        paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    },
    headerTopRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5,
    },
    pageTitle: {
        fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.5,
    },
    pageSubtitle: {
        color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', marginBottom: 15, fontWeight: "900",
    },
    card: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        marginBottom: 24, marginTop: 20,
        shadowColor: '#64748b', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 4,
        borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 24,
        width: "95%",
        alignSelf: "center",
    },
    optionsPickerContainer: {
        backgroundColor: '#fff',
        padding: 20, marginHorizontal: 20,
        shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
        borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9',
    },
    assessmentLabel: {
        fontSize: 13, fontWeight: '700',
        color: '#334155', marginBottom: 12, letterSpacing: 0.3,
    },
    optionsPickerWrapper: {
        borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        position: 'relative',
    },
    optionsPicker: { height: 56, color: '#1e293b', },
    pickerLoadingOverlay: {
        position: 'absolute',
        right: 16, top: 0, bottom: 0,
        justifyContent: 'center',
        backgroundColor: 'rgba(248, 250, 252, 0.9)',
        paddingLeft: 12,
    },
    toggleRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 16 },
    toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    toggleBtnText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 13 },
    toggleBtnTextActive: { color: '#4f46e5', fontWeight: '800', fontSize: 13 },

    filterContainer: { paddingHorizontal: 20, marginTop: -30 },
    filterRow: { flexDirection: 'row', gap: 12 },
    filterItem: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        elevation: 4, shadowColor: '#6366f1', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    filterLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: '900', letterSpacing: 0.5, },
    pickerWrapper: {
        marginHorizontal: -8, marginTop: -8, overflow: "hidden"
    },
    picker: { height: 50, },

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
    readOnlyText: { fontSize: 16, fontWeight: '600', color: '#334155' },
})