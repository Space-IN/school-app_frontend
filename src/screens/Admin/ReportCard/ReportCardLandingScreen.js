import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReportCardLandingScreen({ navigation, route }) {
    const { board } = route.params || { board: 'General' };

    // Selection State
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [showClassModal, setShowClassModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);

    // Data State
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const grades1To10 = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
    const grades11To12 = ['11', '12'];
    const sections = ['A', 'B', 'C', 'D'];

    // Mock Fetch Students
    useEffect(() => {
        if (selectedClass && selectedSection) {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                setStudents([
                    { id: '1', name: 'Aarav Kumar', rollNo: '101', father: 'Ramesh Kumar', mother: 'Sunita Devi', dob: '2010-05-15' },
                    { id: '2', name: 'Vivaan Singh', rollNo: '102', father: 'Vikram Singh', mother: 'Anjali Singh', dob: '2010-08-20' },
                    { id: '3', name: 'Aditya Sharma', rollNo: '103', father: 'Sanjay Sharma', mother: 'Priya Sharma', dob: '2010-12-10' },
                    { id: '4', name: 'Vihaan Gupta', rollNo: '104', father: 'Amit Gupta', mother: 'Neha Gupta', dob: '2011-01-05' },
                    { id: '5', name: 'Arjun Reddy', rollNo: '105', father: 'Karan Reddy', mother: 'Sneha Reddy', dob: '2010-11-25' },
                ]);
                setLoading(false);
            }, 800);
        } else {
            setStudents([]);
        }
    }, [selectedClass, selectedSection]);

    const getGradeGroup = (cls) => {
        const num = parseInt(cls);
        return num >= 11 ? '11-12' : '1-10';
    };

    const handleStudentPress = (student) => {
        navigation.navigate('ReportCardEditorScreen', {
            student,
            board,
            className: selectedClass,
            section: selectedSection,
            gradeGroup: getGradeGroup(selectedClass)
        });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Report Cards</Text>
                <Text style={styles.headerSubtitle}>{board} Board</Text>
            </View>
            <View style={{ width: 24 }} />
        </View>
    );

    const renderFilters = () => (
        <View style={styles.filterContainer}>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowClassModal(true)}
            >
                <Text style={[styles.dropdownText, !selectedClass && styles.placeholder]}>
                    {selectedClass ? `Class ${selectedClass}` : 'Select Class'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>

            <View style={{ width: 12 }} />

            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowSectionModal(true)}
            >
                <Text style={[styles.dropdownText, !selectedSection && styles.placeholder]}>
                    {selectedSection ? `Section ${selectedSection}` : 'Select Section'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {renderHeader()}

            <View style={styles.content}>
                {renderFilters()}

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#4f46e5" />
                    </View>
                ) : (
                    <FlatList
                        data={students}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={48} color="#cbd5e1" />
                                <Text style={styles.emptyText}>
                                    {selectedClass && selectedSection
                                        ? "No students found."
                                        : "Select Class and Section to view students."}
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.studentCard}
                                onPress={() => handleStudentPress(item)}
                            >
                                <LinearGradient
                                    colors={['#eff6ff', '#fff']}
                                    style={styles.cardGradient}
                                >
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{item.name[0]}</Text>
                                    </View>
                                    <View style={styles.info}>
                                        <Text style={styles.name}>{item.name}</Text>
                                        <Text style={styles.roll}>Roll No: {item.rollNo}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>

            {/* CLASS MODAL */}
            <Modal visible={showClassModal} transparent animationType="fade" onRequestClose={() => setShowClassModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowClassModal(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Class</Text>
                        <FlatList
                            data={[...grades1To10, ...grades11To12]}
                            keyExtractor={i => i}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => { setSelectedClass(item); setShowClassModal(false); }}
                                >
                                    <Text style={styles.modalItemText}>Class {item}</Text>
                                    {selectedClass === item && <Ionicons name="checkmark" size={20} color="#4f46e5" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* SECTION MODAL */}
            <Modal visible={showSectionModal} transparent animationType="fade" onRequestClose={() => setShowSectionModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSectionModal(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Section</Text>
                        <FlatList
                            data={sections}
                            keyExtractor={i => i}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => { setSelectedSection(item); setShowSectionModal(false); }}
                                >
                                    <Text style={styles.modalItemText}>Section {item}</Text>
                                    {selectedSection === item && <Ionicons name="checkmark" size={20} color="#4f46e5" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
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
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { fontSize: 13, color: '#64748b' },
    content: { flex: 1, padding: 20 },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    dropdown: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    dropdownText: { fontSize: 15, color: '#334155', fontWeight: '500' },
    placeholder: { color: '#94a3b8' },

    studentCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: { fontSize: 18, color: '#fff', fontWeight: '700' },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    roll: { fontSize: 13, color: '#64748b', marginTop: 2 },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 60, opacity: 0.7 },
    emptyText: { marginTop: 10, color: '#64748b', fontSize: 15 },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        maxHeight: '60%'
    },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#1e293b', textAlign: 'center' },
    modalItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    modalItemText: { fontSize: 16, color: '#334155' }
});
