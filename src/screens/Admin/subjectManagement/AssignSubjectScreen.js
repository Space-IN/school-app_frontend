import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../../api/api';

const PRO_COLORS = {
    background: '#F5F7FA',
    backgroundLight: '#FFFFFF',
    textPrimary: '#1A202C',
    textSecondary: '#718096',
    border: '#E2E8F0',
    primaryGradient: ['#ac1d1d', '#8b1515'],
    accent: '#ac1d1d',
    accentLight: '#fecaca',
};

const CustomPickerModal = ({ visible, options, onSelect, onClose, title }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={24} color={PRO_COLORS.textSecondary} /></TouchableOpacity>
                </View>
                <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item.value); onClose(); }}>
                            <Text style={styles.modalItemText}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </TouchableOpacity>
    </Modal>
);

const AssignSubjectScreen = () => {
    const [subjectList, setSubjectList] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [subjectId, setSubjectId] = useState(null);
    const [facultyId, setFacultyId] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [classSectionAssignments, setClassSectionAssignments] = useState([]);

    const [modalVisible, setModalVisible] = useState(null); // 'subject', 'faculty', 'class', 'section'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, facultyRes] = await Promise.all([
                    api.get('/api/admin/subject'),
                    api.get('/api/admin/faculty'),
                ]);
                setSubjectList(subjectsRes.data?.data || []);
                setFacultyList(facultyRes.data?.data || []);
            } catch (err) {
                Alert.alert('Error', 'Failed to load initial data');
            }
        };
        fetchData();
    }, []);

    const handleAddClassSection = () => {
        if (!selectedClass || !selectedSection) {
            Alert.alert('Validation Error', 'Please select both class and section');
            return;
        }
        const duplicate = classSectionAssignments.find(item => item.classAssigned === selectedClass && item.section === selectedSection);
        if (duplicate) {
            Alert.alert('Duplicate', 'This class-section is already added.');
            return;
        }
        setClassSectionAssignments(prev => [...prev, { classAssigned: selectedClass, section: selectedSection.toUpperCase() }]);
        setSelectedClass(null);
        setSelectedSection(null);
    };

    const handleRemoveClassSection = (index) => {
        setClassSectionAssignments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!subjectId || !facultyId || classSectionAssignments.length === 0) {
            Alert.alert('Validation Error', 'All fields are required including at least one class-section');
            return;
        }
        try {
            await api.post('/api/admin/subject/assign-subject', {
                subjectMasterId: subjectId,
                facultyId,
                classSectionAssignments,
            });
            Alert.alert('✅ Success', 'Subject assigned successfully!');
            setSubjectId(null);
            setFacultyId(null);
            setClassSectionAssignments([]);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
        }
    };

    const subjectOptions = subjectList.map(s => ({ label: `${s.name} (${s.code})`, value: s._id }));
    const facultyOptions = facultyList.map(f => ({ label: `${f.name} (${f.userId})`, value: f.userId }));
    const classOptions = Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: String(i + 1) }));
    const sectionOptions = ['A', 'B', 'C', 'D'].map(s => ({ label: `Section ${s}`, value: s }));

    const getLabel = (options, value) => options.find(opt => opt.value === value)?.label;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.heading}>Assign Subject to Faculty</Text>
                    
                    <Text style={styles.label}>Subject</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible('subject')}>
                        <Text style={styles.pickerButtonText}>{getLabel(subjectOptions, subjectId) || 'Select Subject'}</Text>
                        <Ionicons name="chevron-down" size={20} color={PRO_COLORS.textSecondary} />
                    </TouchableOpacity>

                    <Text style={styles.label}>Faculty</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible('faculty')}>
                        <Text style={styles.pickerButtonText}>{getLabel(facultyOptions, facultyId) || 'Select Faculty'}</Text>
                        <Ionicons name="chevron-down" size={20} color={PRO_COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.heading}>Assign to Classes</Text>
                    <View style={styles.classSectionRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Class</Text>
                            <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible('class')}>
                                <Text style={styles.pickerButtonText}>{getLabel(classOptions, selectedClass) || 'Select Class'}</Text>
                                <Ionicons name="chevron-down" size={20} color={PRO_COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>Section</Text>
                            <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible('section')}>
                                <Text style={styles.pickerButtonText}>{getLabel(sectionOptions, selectedSection) || 'Select Section'}</Text>
                                <Ionicons name="chevron-down" size={20} color={PRO_COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleAddClassSection}>
                        <LinearGradient colors={['#3b82f6', '#1e3a8a']} style={styles.button}>
                            <Ionicons name="add-circle-outline" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Add Class-Section</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {classSectionAssignments.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.heading}>Assigned Classes</Text>
                        {classSectionAssignments.map((item, index) => (
                            <View key={index} style={styles.pair}>
                                <Text style={styles.pairText}>{`${item.classAssigned} - Section ${item.section}`}</Text>
                                <TouchableOpacity onPress={() => handleRemoveClassSection(index)}>
                                    <Ionicons name="close-circle" size={22} color={PRO_COLORS.accent} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={handleSubmit}>
                    <LinearGradient colors={PRO_COLORS.primaryGradient} style={[styles.button, styles.submitButton]}>
                        <Ionicons name="checkmark-done-circle-outline" size={22} color="#fff" />
                        <Text style={styles.buttonText}>Assign Subject</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <CustomPickerModal visible={modalVisible === 'subject'} options={subjectOptions} onClose={() => setModalVisible(null)} onSelect={setSubjectId} title="Select Subject" />
                <CustomPickerModal visible={modalVisible === 'faculty'} options={facultyOptions} onClose={() => setModalVisible(null)} onSelect={setFacultyId} title="Select Faculty" />
                <CustomPickerModal visible={modalVisible === 'class'} options={classOptions} onClose={() => setModalVisible(null)} onSelect={setSelectedClass} title="Select Class" />
                <CustomPickerModal visible={modalVisible === 'section'} options={sectionOptions} onClose={() => setModalVisible(null)} onSelect={setSelectedSection} title="Select Section" />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: PRO_COLORS.background },
    container: { padding: 16, paddingBottom: 60 },
    card: {
        backgroundColor: PRO_COLORS.backgroundLight,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: PRO_COLORS.border,
    },
    heading: {
        fontSize: 18,
        fontWeight: '700',
        color: PRO_COLORS.accent,
        marginBottom: 16,
    },
    label: {
        fontWeight: '600',
        marginBottom: 8,
        color: PRO_COLORS.textSecondary,
        fontSize: 14,
    },
    classSectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: PRO_COLORS.background,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: PRO_COLORS.border,
        marginBottom: 16,
    },
    pickerButtonText: { color: PRO_COLORS.textPrimary, fontSize: 16 },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
    submitButton: { marginTop: 16 },
    pair: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: PRO_COLORS.accentLight,
        padding: 12,
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: PRO_COLORS.accent,
    },
    pairText: { fontSize: 16, fontWeight: '600', color: PRO_COLORS.accent },
    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: PRO_COLORS.backgroundLight, borderRadius: 16, maxHeight: '80%', padding: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: PRO_COLORS.border },
    modalTitle: { fontSize: 18, fontWeight: '700', color: PRO_COLORS.textPrimary },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: PRO_COLORS.border },
    modalItemText: { fontSize: 16, color: PRO_COLORS.textPrimary },
});

export default AssignSubjectScreen;