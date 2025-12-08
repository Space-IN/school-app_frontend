// ✅ AdminWorkbenchScreen.js
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    SafeAreaView,
    LayoutAnimation,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/authContext';

export default function AdminWorkbenchScreen({ navigation }) {
    const [userId, setUserId] = useState(null);
    const { logout } = useAuth();

    // State for expanded sections
    const [expandedSection, setExpandedSection] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const stored = await AsyncStorage.getItem('userData');
                const parsed = stored ? JSON.parse(stored) : null;
                if (parsed?.userId) {
                    setUserId(parsed.userId);
                }
            } catch (err) {
                console.error('❌ Error loading userData:', err);
            }
        };
        loadUserData();
    }, []);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => logout(),
            },
        ]);
    };

    const toggleSection = (section) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSection(expandedSection === section ? null : section);
    };

    // ✅ Navigation handlers
    const handleAddStudent = () => {
        navigation.navigate('BoardSelectionScreen', {
            nextScreen: 'AddStudentScreen',
            title: 'Add Student - Select Board',
        });
    };

    const handleAddFaculty = () => navigation.navigate('AddFacultyScreen');
    const handleViewStudents = () => {
        navigation.navigate('BoardSelectionScreen', {
            nextScreen: 'AllStudentsScreen',
            title: 'View Students - Select Board',
        });
    };
    const handleViewFaculty = () => navigation.navigate('AllFacultyScreen');
    const handleClassSchedule = () => navigation.navigate('ClassScheduleScreen');
    const handleAddSubjectMaster = () => navigation.navigate('AddSubjectMasterScreen');
    const handleAssignSubject = () => navigation.navigate('AssignSubjectScreen');
    const handleAddEvent = () => navigation.navigate('AddEventScreen');
    const handleViewClassSchedule = () => navigation.navigate('ClassScheduleViewScreen');
    const handleAddNotice = () => navigation.navigate('AddNoticeScreen');
    const handleFacultyPerformance = () => navigation.navigate('FacultyPerformance');
    const handleManageFees = () => navigation.navigate('AdminFeesScreen');

    const renderSectionHeader = (title, icon, sectionKey) => (
        <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(sectionKey)}
        >
            <View style={styles.sectionHeaderLeft}>
                <Ionicons name={icon} size={24} color="#1e3a8a" />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Ionicons
                name={expandedSection === sectionKey ? "chevron-up" : "chevron-down"}
                size={24}
                color="#1e3a8a"
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View>
                            <Text style={styles.greeting}>Hello, {userId} 👋</Text>
                            <Text style={styles.subtitle}>Manage your school operations</Text>
                        </View>
                        <TouchableOpacity style={styles.logoutButtonCompact} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ---------------- Sections ---------------- */}

                {/* Add Users Section */}
                {renderSectionHeader("Add Users", "person-add", "addUsers")}
                {expandedSection === "addUsers" && (
                    <View style={styles.dropdownContent}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleAddStudent}>
                            <Ionicons name="person-add-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>Add Student</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleAddFaculty}>
                            <Ionicons name="person-add-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>Add Faculty</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* View Users Section */}
                {renderSectionHeader("View Users", "people", "viewUsers")}
                {expandedSection === "viewUsers" && (
                    <View style={styles.dropdownContent}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleViewStudents}>
                            <Ionicons name="school-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>View Students</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleViewFaculty}>
                            <Ionicons name="people-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>View Faculty</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Event Management Section */}
                {renderSectionHeader("Event Management", "calendar", "eventManagement")}
                {expandedSection === "eventManagement" && (
                    <View style={styles.dropdownContent}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleAddEvent}>
                            <Ionicons name="calendar-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>Add Event</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Subject Management Section */}
                {renderSectionHeader("Subject Management", "book", "subjectManagement")}
                {expandedSection === "subjectManagement" && (
                    <View style={styles.dropdownContent}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleAddSubjectMaster}>
                            <Ionicons name="book-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>Add Subject Master</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleAssignSubject}>
                            <Ionicons name="create-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>Assign Subject</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Class Schedule Section */}
                {renderSectionHeader("Class Schedule", "time", "classSchedule")}
                {expandedSection === "classSchedule" && (
                    <View style={styles.dropdownContent}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleClassSchedule}>
                            <Ionicons name="calendar-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>Manage Schedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleViewClassSchedule}>
                            <Ionicons name="eye-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>View Schedule</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Faculty Performance Section */}
                {renderSectionHeader("Faculty Performance", "analytics", "facultyPerformance")}
                {expandedSection === "facultyPerformance" && (
                    <View style={styles.dropdownContent}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleFacultyPerformance}>
                            <Ionicons name="analytics-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>View Performance</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Notices Section */}
                {renderSectionHeader("Notices", "megaphone", "notices")}
                {expandedSection === "notices" && (
                    <View style={styles.dropdownContent}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleAddNotice}>
                            <Ionicons name="megaphone-outline" size={20} color="#333" />
                            <Text style={styles.dropdownText}>Add Notice</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* Fees Section */}
                {renderSectionHeader("Fees Management", "cash", "feesManagement")}
{expandedSection === "feesManagement" && (
    <View style={styles.dropdownContent}>
        <TouchableOpacity style={styles.dropdownItem} onPress={handleManageFees}>
            <Ionicons name="cash-outline" size={20} color="#333" />
            <Text style={styles.dropdownText}>Manage Fees</Text>
        </TouchableOpacity>
    </View>
)}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContent: {
        paddingBottom: 30,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff'
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoutButtonCompact: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    profileCard: {
        backgroundColor: '#9c1006',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
    },
    subtitle: {
        fontSize: 14,
        color: '#ffffff',
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginTop: 10,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e3a8a',
        marginLeft: 10,
    },
    dropdownContent: {
        backgroundColor: '#f9f9f9',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 5,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
});
