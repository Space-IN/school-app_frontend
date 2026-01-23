import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { api } from '../../api/api';
import { BASE_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {api} from '../../api/api'


const { width } = Dimensions.get('window');

// --- Corporate Brand Palette ---
const PRO_COLORS = {
    background: '#F8FAFC', // Slate-50/100
    textPrimary: '#0F172A', // Slate-900
    textSecondary: '#64748B', // Slate-500
    cardBg: '#FFFFFF',

    // Brand Colors
    corporateBlue: ['#1e3a8a', '#2563eb'], // Navy to Royal Blue
    corporateTeal: ['#0f766e', '#14b8a6'], // Deep Teal to Teal-500
    corporateRed: ['#991b1b', '#ef4444'],  // Deep Red for alerts/critical
};

export default function AdminInsightsScreen({ navigation }) {
    // Enable Header for Dashboard Tab (Insights) whenever it's focused
    // AND disable it when we leave (bluring this screen)
    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({ headerShown: true, title: 'Admin Dashboard' });

            return () => {
                navigation.getParent()?.setOptions({ headerShown: false });
            };
        }, [navigation])
    );

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
    const [attendanceBoard, setAttendanceBoard] = useState(''); // New Board State
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [checkingAttendance, setCheckingAttendance] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showBoardModal, setShowBoardModal] = useState(false); // New Board Modal State

    const grades = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const sections = ['A', 'B', 'C', 'D'];
    const boards = ['All / None', 'CBSE', 'STATE']; // Added 'All / None' option

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        try {
            const results = await Promise.allSettled([
                api.get(`${BASE_URL}/api/admin/students/count`),
                api.get(`${BASE_URL}/api/admin/faculty/all`),
                api.get(`${BASE_URL}/api/admin/events`),
                api.get(`${BASE_URL}/api/admin/announcement/active`),
                api.get(`${BASE_URL}/api/admin/attendance/overall`),
                api.get(`/api/admin/students/count`),
                api.get(`/api/faculty/all`),
                api.get(`/api/events`),
                api.get(`/api/announcement/active`),
                api.get(`/api/admin/attendance/overall`)
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
        if (!attendanceGrade || !attendanceSection || !attendanceBoard) {
            Alert.alert('Error', 'Please select Board, Grade, and Section');
            return;
        }

        setCheckingAttendance(true);
        setAttendanceStatus(null);
        try {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const res = await api.get(`${BASE_URL}/api/admin/attendance`, {
                params: {
                    grade: attendanceGrade,
                    section: attendanceSection,
                    board: attendanceBoard === 'All / None' ? '' : attendanceBoard, // Send empty if All is selected
                    date: today,
                }
            });

            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

            // 14-01-2026 Fix because backend returns nested { success: true, count: 1, data: [...] }
            const attendanceList = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);



            // Filter to find the EXACT match for grade and section
            const matchingDoc = attendanceList.find(doc => {
                const docGrade = String(doc.grade || doc.classAssigned || '').replace(/Grade\s?/i, '').trim();
                const docSection = String(doc.section || '').trim();

                const reqGrade = String(attendanceGrade).trim();
                const reqSection = String(attendanceSection).trim();

                return docGrade === reqGrade && docSection === reqSection;
            });

            const records = matchingDoc?.records || [];
            const markedBy = matchingDoc?.markedBy || [];
            const stats = matchingDoc?.stats || null;



            // detailed check if stats actually has data inside
            const hasStats = stats && Object.keys(stats).length > 0;



            if (hasStats) {
                // Use backend provided stats
                const details = [];
                if (stats['1']) {
                    details.push(`Session 1: Present: ${stats['1'].present}, Absent: ${stats['1'].absent}`);
                }
                if (stats['2']) {
                    details.push(`Session 2: Present: ${stats['2'].present}, Absent: ${stats['2'].absent}`);
                }

                // If markedBy info is available, append it to the details for richer context
                if (markedBy.length > 0) {
                    markedBy.forEach(m => {
                        // Find the existing line for this session and append name
                        const idx = details.findIndex(d => d.startsWith(`Session ${m.session}:`));
                        if (idx !== -1) {
                            details[idx] += ` (by ${m.facultyName})`;
                        }
                    });
                }

                setAttendanceStatus({
                    status: 'marked',
                    message: '✅ Attendance Marked',
                    details: details
                });

            } else if (markedBy.length > 0) {
                // Fallback: Stats empty, but MarkedBy exists (Old record or backend issue)
                const details = markedBy.map(m => `Session ${m.session}: Marked by ${m.facultyName}`);

                setAttendanceStatus({
                    status: 'marked',
                    message: '✅ Attendance Marked',
                    details: details
                });

            } else if (records.length > 0) {
                // Calculation Fallback (if stats missing but records exist)
                let s1Present = 0, s1Absent = 0;
                let s2Present = 0, s2Absent = 0;

                records.forEach(student => {
                    student.sessions.forEach(session => {
                        if (session.session_number === 1) {
                            if (session.status.toLowerCase() === 'present') s1Present++;
                            else s1Absent++;
                        } else if (session.session_number === 2) {
                            if (session.status.toLowerCase() === 'present') s2Present++;
                            else s2Absent++;
                        }
                    });
                });

                setAttendanceStatus({
                    status: 'marked',
                    message: '✅ Attendance Marked',
                    details: [
                        `Session 1: Present: ${s1Present}, Absent: ${s1Absent}`,
                        `Session 2: Present: ${s2Present}, Absent: ${s2Absent}`
                    ]
                });
            } else {
                setAttendanceStatus({
                    status: 'not_marked',
                    message: '❌ Not Marked Yet',
                    details: []
                });
            }
        } catch (err) {
            console.error("Attendance check error:", err);
            setAttendanceStatus({
                status: 'error',
                message: '❌ Not Marked Yet (or Error)',
                details: []
            });
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
                    <Text style={styles.welcomeText}>Overview</Text>
                </View>

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                    {/* Students - Blue Theme */}
                    <LinearGradient
                        colors={PRO_COLORS.corporateBlue}
                        style={styles.metricCardBig}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.metricHeader}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="school" size={18} color={PRO_COLORS.corporateBlue[0]} />
                            </View>
                            <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
                        </View>
                        <View>
                            <Text style={styles.metricValue}>{stats.totalStudents || '0'}</Text>
                            <Text style={styles.metricLabel}>Total Students</Text>
                        </View>
                    </LinearGradient>

                    {/* Faculty - Teal Theme */}
                    <LinearGradient
                        colors={PRO_COLORS.corporateTeal}
                        style={styles.metricCardBig}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.metricHeader}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="people" size={18} color={PRO_COLORS.corporateTeal[0]} />
                            </View>
                            <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
                        </View>
                        <View>
                            <Text style={styles.metricValue}>{stats.totalFaculty || '0'}</Text>
                            <Text style={styles.metricLabel}>Total Faculty</Text>
                        </View>
                    </LinearGradient>

                    {/* Attendance - Red/Warning Theme if low, else Blue */}
                    <LinearGradient
                        colors={stats.overallAttendance && stats.overallAttendance < 75 ? PRO_COLORS.corporateRed : ['#3b82f6', '#1d4ed8']}
                        style={[styles.metricCardWide, { marginTop: 12 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.metricFlex}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="stats-chart" size={20} color="#fff" />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.metricLabelWide}>Overall Attendance</Text>
                                <Text style={styles.metricValueWide}>
                                    {stats.overallAttendance ? `${stats.overallAttendance}%` : 'N/A'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.trendBadge}>
                            <Ionicons name="trending-up" size={16} color="#fff" />
                            <Text style={styles.trendText}>Today</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Quick Attendance Check - Tool Style */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Attendance Verification Tool</Text>
                    <View style={styles.toolCard}>

                        <View style={styles.toolHeader}>
                            <Ionicons name="qr-code-outline" size={22} color={PRO_COLORS.corporateBlue[0]} />
                            <Text style={styles.toolHeaderText}>Instant Check</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.dropdownInput, { marginBottom: 12 }]}
                            onPress={() => setShowBoardModal(true)}
                        >
                            <Text style={attendanceBoard ? styles.inputText : styles.placeholderText}>
                                {attendanceBoard ? `Board: ${attendanceBoard}` : 'Select Board (CBSE/STATE)'}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                        </TouchableOpacity>

                        <View style={styles.inputRow}>
                            <TouchableOpacity
                                style={styles.dropdownInput}
                                onPress={() => setShowGradeModal(true)}
                            >
                                <Text style={attendanceGrade ? styles.inputText : styles.placeholderText}>
                                    {attendanceGrade ? `Grade ${attendanceGrade}` : 'Select Grade'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dropdownInput}
                                onPress={() => setShowSectionModal(true)}
                            >
                                <Text style={attendanceSection ? styles.inputText : styles.placeholderText}>
                                    {attendanceSection ? `Section ${attendanceSection}` : 'Select Section'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
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
                                <>
                                    <Ionicons name="search" size={18} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.checkButtonText}>Verify Now</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {attendanceStatus && (
                            <View style={[
                                styles.statusResult,
                                {
                                    backgroundColor: attendanceStatus.status === 'marked' ? '#F0FDF4' : '#FEF2F2',
                                    borderColor: attendanceStatus.status === 'marked' ? '#BBF7D0' : '#FECACA',
                                    borderWidth: 1
                                }
                            ]}>
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <Ionicons
                                            name={attendanceStatus.status === 'marked' ? "checkmark-circle" : "warning"}
                                            size={22}
                                            color={attendanceStatus.status === 'marked' ? "#166534" : "#991b1b"}
                                        />
                                        <Text style={[
                                            styles.statusText,
                                            { color: attendanceStatus.status === 'marked' ? "#15803d" : "#b91c1c" }
                                        ]}>
                                            {attendanceStatus.message}
                                        </Text>
                                    </View>

                                    {attendanceStatus.details && attendanceStatus.details.length > 0 && (
                                        <View style={styles.statusDetailsContainer}>
                                            {attendanceStatus.details.map((line, idx) => (
                                                <Text key={idx} style={styles.statusDetailText}>
                                                    {line}
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Upcoming Events */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    {stats.upcomingEvents.length > 0 ? (
                        stats.upcomingEvents.map((event, index) => (
                            <View key={event._id || event.id || index} style={styles.eventRow}>
                                <View style={styles.eventDateBadge}>
                                    <Text style={styles.eventDay}>{new Date(event.date).getDate()}</Text>
                                    <Text style={styles.eventMonth}>
                                        {new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.eventInfo}>
                                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                                    <Text style={styles.eventSubtext}>
                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={40} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No upcoming events</Text>
                        </View>
                    )}
                </View>

                {/* Recent Activities */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Activity Feed</Text>
                    <View style={styles.feedCard}>
                        {stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity, index) => (
                                <View key={activity.id || index} style={styles.feedItem}>
                                    <View style={styles.feedTimeBox}>
                                        <Text style={styles.feedTimeText}>{activity.time}</Text>
                                    </View>
                                    <View style={[
                                        styles.feedContent,
                                        index === stats.recentActivities.length - 1 && { borderLeftWidth: 0 } // Remove line for last item if desired, but here we keep left border usually
                                    ]}>
                                        <Text style={styles.feedText}>{activity.text}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="notifications-off-outline" size={40} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No recent activity</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
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

            <Modal
                visible={showBoardModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowBoardModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowBoardModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Board</Text>
                        <FlatList
                            data={boards}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setAttendanceBoard(item);
                                        setShowBoardModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
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
        backgroundColor: PRO_COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: PRO_COLORS.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    headerSection: {
        marginTop: 10,
        marginBottom: 24,
    },
    dateText: {
        fontSize: 13,
        color: PRO_COLORS.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '800',
        color: PRO_COLORS.textPrimary,
        letterSpacing: -1,
    },

    /* Metrics Grid */
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    metricCardBig: {
        width: (width - 40 - 15) / 2, // 2 columns with 15px gap
        padding: 16,
        borderRadius: 20,
        height: 140,
        justifyContent: 'space-between',
        // Shadows
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    metricCardWide: {
        width: '100%',
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Shadows
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    metricLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
        marginTop: 2,
    },
    metricFlex: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricValueWide: {
        fontSize: 24,
        fontWeight: '800',
        color: '#ffffff',
    },
    metricLabelWide: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    trendBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
    },


    /* Section Titles */
    sectionContainer: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 16, // Smaller, more refined title
        fontWeight: '700',
        color: PRO_COLORS.textSecondary,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    /* Tool Card (Attendance) */
    toolCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    toolHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    toolHeaderText: {
        fontSize: 16,
        fontWeight: '700',
        color: PRO_COLORS.textPrimary,
        marginLeft: 10,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dropdownInput: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputText: {
        color: PRO_COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    placeholderText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    checkButton: {
        backgroundColor: PRO_COLORS.corporateBlue[0],
        paddingVertical: 16,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: PRO_COLORS.corporateBlue[0],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    checkButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
    statusResult: {
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
    },
    statusText: {
        marginLeft: 8,
        fontWeight: '700',
        fontSize: 16,
    },
    statusDetailsContainer: {
        marginTop: 8,
        width: '100%',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statusDetailText: {
        color: '#334155',
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 4
    },

    /* Event List */
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    eventDateBadge: {
        backgroundColor: '#F1F5F9', // Light Slate
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    eventDay: {
        fontSize: 18,
        fontWeight: '800',
        color: PRO_COLORS.textPrimary,
    },
    eventMonth: {
        fontSize: 10,
        fontWeight: '700',
        color: PRO_COLORS.textSecondary,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: PRO_COLORS.textPrimary,
        marginBottom: 2,
    },
    eventSubtext: {
        fontSize: 13,
        color: PRO_COLORS.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        marginTop: 8,
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '500',
    },

    /* Feed Items */
    feedCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    feedItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    feedTimeBox: {
        width: 60,
        alignItems: 'flex-start',
        paddingRight: 10,
        borderRightWidth: 2,
        borderRightColor: '#E2E8F0',
    },
    feedTimeText: {
        fontSize: 12,
        fontWeight: '700',
        color: PRO_COLORS.textSecondary,
        textAlign: 'right',
    },
    feedContent: {
        flex: 1,
        paddingLeft: 16,
        justifyContent: 'center',
    },
    feedText: {
        fontSize: 14,
        color: PRO_COLORS.textPrimary,
        lineHeight: 20,
    },

    /* Modals (No major visual changes needed, just matching colors) */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)', // Slate-900 with opacity
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '80%',
        maxHeight: '60%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: PRO_COLORS.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalItemText: {
        fontSize: 16,
        color: PRO_COLORS.textSecondary,
        textAlign: 'center',
    },
});
