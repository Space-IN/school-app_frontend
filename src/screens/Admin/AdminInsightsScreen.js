import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Dimensions,
    Platform,
    TextInput,
    Alert,
    TouchableOpacity,
    Modal,
    FlatList,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { BASE_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');



export default function AdminInsightsScreen() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        upcomingEvents: [],
        recentActivities: [],
        overallAttendance: null,
    });

    // Attendance Checker State
    const [attendanceGrade, setAttendanceGrade] = useState('');
    const [attendanceSection, setAttendanceSection] = useState('');
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [checkingAttendance, setCheckingAttendance] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);

    const grades = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const sections = ['A', 'B', 'C', 'D'];

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        try {
            const results = await Promise.allSettled([
                axios.get(`${BASE_URL}/api/admin/students/count`),
                axios.get(`${BASE_URL}/api/faculty/all`),
                axios.get(`${BASE_URL}/api/events`),
                axios.get(`${BASE_URL}/api/announcement/active`),
                axios.get(`${BASE_URL}/api/admin/attendance/overall`)
            ]);

            // 1. Total Students
            let totalStudents = 0;
            if (results[0].status === 'fulfilled') {
                totalStudents = results[0].value.data.count || 0;
            }

            // 2. Total Faculty
            let totalFaculty = 0;
            if (results[1].status === 'fulfilled' && results[1].value.data) {
                totalFaculty = results[1].value.data.length || 0;
            }

            // 3. Upcoming Events
            let upcomingEvents = [];
            if (results[2].status === 'fulfilled') {
                const allEvents = results[2].value.data || [];
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset to start of day
                upcomingEvents = allEvents
                    .filter(event => new Date(event.date) >= today)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3);
            }

            // 4. Recent Announcements
            let recentActivities = [];
            if (results[3].status === 'fulfilled') {
                recentActivities = (results[3].value.data || []).slice(0, 5).map(announcement => ({
                    id: announcement._id,
                    text: announcement.title,
                    time: new Date(announcement.date).toLocaleDateString(),
                }));
            }

            // 5. Overall Attendance
            let overallAttendance = null;
            if (results[4].status === 'fulfilled') {
                overallAttendance = results[4].value.data.percentage || null;
            }

            setStats({
                totalStudents,
                totalFaculty,
                upcomingEvents,
                recentActivities,
                overallAttendance,
            });

        } catch (error) {
            console.error("Dashboard data fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkAttendanceStatus = async () => {
        if (!attendanceGrade || !attendanceSection) {
            Alert.alert('Error', 'Please enter both Grade and Section');
            return;
        }

        setCheckingAttendance(true);
        setAttendanceStatus(null);
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await axios.get(`${BASE_URL}/api/attendance/check`, {
                params: {
                    grade: attendanceGrade,
                    section: attendanceSection,
                    date: today,
                    sessionNumber: 1
                }
            });

            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            if (res.data && res.data.isMarked) {
                setAttendanceStatus('✅ Attendance Marked');
            } else {
                setAttendanceStatus('❌ Not Marked Yet');
            }
        } catch (err) {
            setAttendanceStatus('❌ Not Marked Yet (or Error)');
        } finally {
            setCheckingAttendance(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text style={styles.dateText}>{currentDate}</Text>
                    <Text style={styles.welcomeText}>Dashboard Overview</Text>
                </View>

                {/* Metrics Row */}
                <View style={styles.metricsRow}>
                    <LinearGradient
                        colors={['#3b82f6', '#1e3a8a']}
                        style={styles.metricCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="school" size={20} color="#1e3a8a" />
                        </View>
                        <Text style={styles.metricValue}>{stats.totalStudents}</Text>
                        <Text style={styles.metricLabel}>Students</Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={['#ec4899', '#be185d']}
                        style={styles.metricCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="people" size={20} color="#be185d" />
                        </View>
                        <Text style={styles.metricValue}>{stats.totalFaculty}</Text>
                        <Text style={styles.metricLabel}>Faculty</Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={['#10b981', '#047857']}
                        style={styles.metricCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="stats-chart" size={20} color="#047857" />
                        </View>
                        <Text style={styles.metricValue}>
                            {stats.overallAttendance ? `${stats.overallAttendance}%` : 'N/A'}
                        </Text>
                        <Text style={styles.metricLabel}>Attendance</Text>
                    </LinearGradient>
                </View>

                {/* Attendance Checker */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Quick Attendance Check</Text>
                    <View style={styles.card}>
                        <View style={styles.inputRow}>
                            <TouchableOpacity
                                style={styles.dropdownInput}
                                onPress={() => setShowGradeModal(true)}
                            >
                                <Text style={attendanceGrade ? styles.inputText : styles.placeholderText}>
                                    {attendanceGrade ? `Grade ${attendanceGrade}` : 'Select Grade'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color="#64748b" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dropdownInput}
                                onPress={() => setShowSectionModal(true)}
                            >
                                <Text style={attendanceSection ? styles.inputText : styles.placeholderText}>
                                    {attendanceSection ? `Section ${attendanceSection}` : 'Select Section'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.checkButton}
                            onPress={checkAttendanceStatus}
                            disabled={checkingAttendance}
                        >
                            {checkingAttendance ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.checkButtonText}>Verify Status</Text>
                            )}
                        </TouchableOpacity>

                        {attendanceStatus && (
                            <View style={[
                                styles.statusResult,
                                { backgroundColor: attendanceStatus.includes('Marked') ? '#f0fdf4' : '#fef2f2' }
                            ]}>
                                <Ionicons
                                    name={attendanceStatus.includes('Marked') ? "checkmark-circle" : "alert-circle"}
                                    size={20}
                                    color={attendanceStatus.includes('Marked') ? "#166534" : "#991b1b"}
                                />
                                <Text style={[
                                    styles.statusText,
                                    { color: attendanceStatus.includes('Marked') ? "#166534" : "#991b1b" }
                                ]}>
                                    {attendanceStatus}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Upcoming Events */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    {stats.upcomingEvents.length > 0 ? (
                        stats.upcomingEvents.map((event, index) => (
                            <View key={event._id || event.id || index} style={styles.eventCard}>
                                <View style={styles.eventDateBox}>
                                    <Text style={styles.eventDay}>{new Date(event.date).getDate()}</Text>
                                    <Text style={styles.eventMonth}>
                                        {new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.eventInfo}>
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    <Text style={styles.eventSubtext}>
                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No upcoming events</Text>
                    )}
                </View>

                {/* Recent Activities */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Recent Activities</Text>
                    <View style={styles.card}>
                        {stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity, index) => (
                                <View key={activity.id || index} style={[
                                    styles.activityItem,
                                    index === stats.recentActivities.length - 1 && { borderBottomWidth: 0 }
                                ]}>
                                    <View style={styles.timelineDot} />
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityText}>{activity.text}</Text>
                                        <Text style={styles.activityTime}>{activity.time}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No recent activities</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Modals */}
            <Modal
                visible={showGradeModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowGradeModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGradeModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Grade</Text>
                        <FlatList
                            data={grades}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setAttendanceGrade(item);
                                        setShowGradeModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>Grade {item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={showSectionModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSectionModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSectionModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Section</Text>
                        <FlatList
                            data={sections}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setAttendanceSection(item);
                                        setShowSectionModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>Section {item}</Text>
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
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    headerSection: {
        marginBottom: 24,
    },
    dateText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
        marginTop: 4,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    metricCard: {
        width: (width - 40 - 24) / 3,
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 2,
    },
    metricLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dropdownInput: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginRight: 10,
    },
    inputText: {
        color: '#334155',
        fontSize: 14,
        fontWeight: '500',
    },
    placeholderText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    checkButton: {
        backgroundColor: '#1e3a8a',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    checkButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
    statusResult: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
    },
    statusText: {
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 15,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    eventDateBox: {
        backgroundColor: '#eff6ff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 16,
    },
    eventDay: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e3a8a',
    },
    eventMonth: {
        fontSize: 10,
        fontWeight: '700',
        color: '#3b82f6',
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    eventSubtext: {
        fontSize: 13,
        color: '#64748b',
    },
    activityItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3b82f6',
        marginTop: 6,
        marginRight: 16,
        borderWidth: 2,
        borderColor: '#dbeafe',
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
        lineHeight: 20,
    },
    activityTime: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        fontStyle: 'italic',
        marginTop: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '80%',
        borderRadius: 20,
        padding: 24,
        maxHeight: '60%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        color: '#0f172a',
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalItemText: {
        fontSize: 16,
        color: '#334155',
        textAlign: 'center',
        fontWeight: '500',
    },
});
