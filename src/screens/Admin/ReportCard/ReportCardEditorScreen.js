import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    Switch,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function ReportCardEditorScreen({ navigation, route }) {
    const { student, board, className, section, gradeGroup } = route.params;

    // UI State
    const [previewMode, setPreviewMode] = useState(false);

    // Data State (Mocked Initial Data)
    const [scholasticMarks, setScholasticMarks] = useState(
        gradeGroup === '1-10'
            ? [
                { subject: 'English', pt: '18', nb: '5', se: '5', yearly: '70', grade: 'A1' },
                { subject: 'Hindi', pt: '17', nb: '5', se: '4', yearly: '68', grade: 'B1' },
                { subject: 'Mathematics', pt: '19', nb: '5', se: '5', yearly: '75', grade: 'A1' },
                { subject: 'Science', pt: '16', nb: '4', se: '5', yearly: '65', grade: 'B2' },
                { subject: 'Social Science', pt: '18', nb: '5', se: '5', yearly: '72', grade: 'A2' },
            ]
            : [
                { subject: 'English Core', theory: '70', practical: '20', total: '90', grade: 'A1' },
                { subject: 'Physics', theory: '60', practical: '28', total: '88', grade: 'A2' },
                { subject: 'Chemistry', theory: '65', practical: '29', total: '94', grade: 'A1' },
                { subject: 'Biology', theory: '55', practical: '25', total: '80', grade: 'B1' },
                { subject: 'Physical Education', theory: '68', practical: '28', total: '96', grade: 'A1' },
            ]
    );

    const [coScholastic, setCoScholastic] = useState([
        { area: 'Work Education', grade: 'A' },
        { area: 'Art Education', grade: 'A' },
        { area: 'Health & Physical Ed.', grade: 'B' },
        { area: 'Discipline', grade: 'A' },
    ]);

    const [remarks, setRemarks] = useState('An excellent student with a keen interest in Mathematics.');
    const [attendance, setAttendance] = useState('180/200');

    // PDF Generation
    const generatePDF = async () => {
        try {
            const scholasticRows = scholasticMarks.map(item => {
                if (gradeGroup === '1-10') {
                    return `
                    <tr>
                        <td style="text-align: left; padding-left: 10px;">${item.subject}</td>
                        <td>${item.pt}</td>
                        <td>${item.nb}</td>
                        <td>${item.se}</td>
                        <td>${item.yearly}</td>
                        <td><b>${item.grade}</b></td>
                    </tr>`;
                } else {
                    return `
                    <tr>
                        <td style="text-align: left; padding-left: 10px;">${item.subject}</td>
                        <td>${item.theory}</td>
                        <td>${item.practical}</td>
                        <td>${item.total}</td>
                        <td><b>${item.grade}</b></td>
                    </tr>`;
                }
            }).join('');

            const coScholasticRows = coScholastic.map(item => `
                <tr>
                    <td style="text-align: left; padding-left: 10px;">${item.area}</td>
                    <td>${item.grade}</td>
                </tr>
            `).join('');

            const headerHTML = gradeGroup === '1-10'
                ? `<th>Subject</th><th>PT (20)</th><th>NB (5)</th><th>SE (5)</th><th>Yearly</th><th>Grade</th>`
                : `<th>Subject</th><th>Theory</th><th>Practical</th><th>Total</th><th>Grade</th>`;

            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .school-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                    .board-info { font-size: 14px; color: #666; margin-bottom: 20px; }
                    .report-title { font-size: 18px; font-weight: bold; text-decoration: underline; color: #4f46e5; }
                    
                    .student-info { margin-bottom: 30px; width: 100%; border-collapse: collapse; }
                    .student-info td { padding: 8px; font-size: 14px; }
                    .label { font-weight: bold; width: 120px; color: #555; }
                    
                    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: center; font-size: 14px; }
                    th { background-color: #f3f4f6; color: #333; }
                    
                    .section-header { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #444; border-bottom: 2px solid #eee; padding-bottom: 5px; }
                    
                    .remarks-box { border: 1px solid #ccc; padding: 15px; border-radius: 8px; margin-bottom: 40px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 20px; }
                    .sign-line { border-top: 1px solid #333; width: 25%; text-align: center; padding-top: 10px; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="school-name">vishwachetana vidyaniketana</div>
                    <div class="board-info">Affiliated to ${board}</div>
                    <div class="report-title">REPORT CARD (SESSION 2024-25)</div>
                </div>

                <table class="student-info">
                    <tr>
                        <td class="label">Name:</td><td>${student.name}</td>
                        <td class="label">Roll No:</td><td>${student.rollNo}</td>
                    </tr>
                    <tr>
                        <td class="label">Class:</td><td>${className} - ${section}</td>
                        <td class="label">D.O.B:</td><td>${student.dob}</td>
                    </tr>
                    <tr>
                        <td class="label">Attendance:</td><td>${attendance}</td>
                        <td></td><td></td>
                    </tr>
                </table>

                <div class="section-header">Scholastic Areas</div>
                <table>
                    <thead>
                        <tr>${headerHTML}</tr>
                    </thead>
                    <tbody>
                        ${scholasticRows}
                    </tbody>
                </table>

                <div class="section-header">Co-Scholastic & Discipline</div>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: left; padding-left: 10px;">Area</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${coScholasticRows}
                    </tbody>
                </table>

                <div class="section-header">Class Teacher's Remarks</div>
                <div class="remarks-box">
                    ${remarks}
                </div>

                <div class="signatures">
                    <div class="sign-line">Class Teacher</div>
                    <div class="sign-line">Principal</div>
                    <div class="sign-line">Parent</div>
                </div>
            </body>
            </html>
            `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate PDF');
        }
    };

    // handlers
    const handleSave = () => {
        Alert.alert('Success', 'Report Card Saved Successfully!');
        // In real app, send data to backend here
    };

    const handlePrint = () => {
        generatePDF();
    };

    const togglePreview = () => setPreviewMode(!previewMode);

    // Render Components
    const renderHeader = () => (
        <View style={previewMode ? styles.previewHeader : styles.editHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {!previewMode && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>{previewMode ? 'Report Card Preview' : 'Edit Report Card'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 8, fontSize: 13, color: '#64748b' }}>Preview</Text>
                <Switch value={previewMode} onValueChange={togglePreview} trackColor={{ true: '#4f46e5' }} />
            </View>
        </View>
    );

    const renderStudentInfo = () => (
        <View style={styles.sectionCard}>
            <Text style={styles.schoolName}>VISHWACHETANA VIDYANIKETANA</Text>
            <Text style={styles.boardName}>Affiliated to {board}</Text>
            <Text style={styles.reportTitle}>REPORT CARD (SESSION 2024-25)</Text>

            <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>{student.name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Roll No:</Text>
                    <Text style={styles.infoValue}>{student.rollNo}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Class:</Text>
                    <Text style={styles.infoValue}>{className} - {section}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>D.O.B:</Text>
                    <Text style={styles.infoValue}>{student.dob}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Attendance:</Text>
                    {previewMode ? (
                        <Text style={styles.infoValue}>{attendance}</Text>
                    ) : (
                        <TextInput
                            value={attendance}
                            onChangeText={setAttendance}
                            style={styles.smallInput}
                        />
                    )}
                </View>
            </View>
        </View>
    );

    const renderScholasticTable = () => {
        if (gradeGroup === '1-10') {
            return (
                <View style={styles.tableCard}>
                    <Text style={styles.sectionTitle}>Scholastic Areas</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.col, { flex: 2 }]}>Subject</Text>
                        <Text style={styles.col}>PT (20)</Text>
                        <Text style={styles.col}>NB (5)</Text>
                        <Text style={styles.col}>SE (5)</Text>
                        <Text style={styles.col}>Yearly</Text>
                        <Text style={styles.col}>Grade</Text>
                    </View>
                    {scholasticMarks.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.cell, { flex: 2, textAlign: 'left' }]}>{item.subject}</Text>
                            {previewMode ? (
                                <>
                                    <Text style={styles.cell}>{item.pt}</Text>
                                    <Text style={styles.cell}>{item.nb}</Text>
                                    <Text style={styles.cell}>{item.se}</Text>
                                    <Text style={styles.cell}>{item.yearly}</Text>
                                    <Text style={[styles.cell, { fontWeight: 'bold' }]}>{item.grade}</Text>
                                </>
                            ) : (
                                <>
                                    <TextInput style={styles.cellInput} value={item.pt} onChangeText={t => {
                                        const n = [...scholasticMarks]; n[index].pt = t; setScholasticMarks(n);
                                    }} />
                                    <TextInput style={styles.cellInput} value={item.nb} onChangeText={t => {
                                        const n = [...scholasticMarks]; n[index].nb = t; setScholasticMarks(n);
                                    }} />
                                    <TextInput style={styles.cellInput} value={item.se} onChangeText={t => {
                                        const n = [...scholasticMarks]; n[index].se = t; setScholasticMarks(n);
                                    }} />
                                    <TextInput style={styles.cellInput} value={item.yearly} onChangeText={t => {
                                        const n = [...scholasticMarks]; n[index].yearly = t; setScholasticMarks(n);
                                    }} />
                                    <TextInput style={styles.cellInput} value={item.grade} onChangeText={t => {
                                        const n = [...scholasticMarks]; n[index].grade = t; setScholasticMarks(n);
                                    }} />
                                </>
                            )}
                        </View>
                    ))}
                </View>
            );
        } else {
            // 11-12
            return (
                <View style={styles.tableCard}>
                    <Text style={styles.sectionTitle}>Scholastic Areas</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.col, { flex: 2 }]}>Subject</Text>
                        <Text style={styles.col}>Theory</Text>
                        <Text style={styles.col}>Practical</Text>
                        <Text style={styles.col}>Total</Text>
                        <Text style={styles.col}>Grade</Text>
                    </View>
                    {scholasticMarks.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.cell, { flex: 2, textAlign: 'left' }]}>{item.subject}</Text>
                            {previewMode ? (
                                <>
                                    <Text style={styles.cell}>{item.theory}</Text>
                                    <Text style={styles.cell}>{item.practical}</Text>
                                    <Text style={styles.cell}>{item.total}</Text>
                                    <Text style={[styles.cell, { fontWeight: 'bold' }]}>{item.grade}</Text>
                                </>
                            ) : (
                                <>
                                    <TextInput style={styles.cellInput} value={item.theory} onChangeText={t => {
                                        const n = [...scholasticMarks]; n[index].theory = t; setScholasticMarks(n);
                                    }} />
                                    <TextInput style={styles.cellInput} value={item.practical} onChangeText={t => {
                                        const n = [...scholasticMarks]; n[index].practical = t; setScholasticMarks(n);
                                    }} />
                                    <TextInput style={styles.cellInput} value={item.total} onChangeText={t => {
                                        const n = [...scholasticMarks]; n[index].total = t; setScholasticMarks(n);
                                    }} />
                                    <TextInput style={styles.cellInput} value={item.grade} onChangeText={t => {
                                        const n = [...scholasticMarks]; n[index].grade = t; setScholasticMarks(n);
                                    }} />
                                </>
                            )}
                        </View>
                    ))}
                </View>
            );
        }
    };

    const renderCoScholastic = () => (
        <View style={styles.tableCard}>
            <Text style={styles.sectionTitle}>Co-Scholastic & Discipline</Text>
            <View style={styles.tableHeader}>
                <Text style={[styles.col, { flex: 3, textAlign: 'left', paddingLeft: 10 }]}>Area</Text>
                <Text style={styles.col}>Grade</Text>
            </View>
            {coScholastic.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                    <Text style={[styles.cell, { flex: 3, textAlign: 'left', paddingLeft: 10 }]}>{item.area}</Text>
                    {previewMode ? (
                        <Text style={styles.cell}>{item.grade}</Text>
                    ) : (
                        <TextInput
                            style={styles.cellInput}
                            value={item.grade}
                            onChangeText={t => {
                                const n = [...coScholastic]; n[index].grade = t; setCoScholastic(n);
                            }}
                        />
                    )}
                </View>
            ))}
        </View>
    );

    const renderRemarks = () => (
        <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Class Teacher's Remarks</Text>
            {previewMode ? (
                <Text style={styles.remarksText}>{remarks}</Text>
            ) : (
                <TextInput
                    style={styles.remarksInput}
                    multiline
                    value={remarks}
                    onChangeText={setRemarks}
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {renderHeader()}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderStudentInfo()}
                {renderScholasticTable()}
                {renderCoScholastic()}
                {renderRemarks()}

                {previewMode && (
                    <View style={styles.signatures}>
                        <View style={styles.signBox}>
                            <Text style={styles.signLabel}>Class Teacher</Text>
                        </View>
                        <View style={styles.signBox}>
                            <Text style={styles.signLabel}>Principal</Text>
                        </View>
                        <View style={styles.signBox}>
                            <Text style={styles.signLabel}>Parent</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                {previewMode ? (
                    <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
                        <Ionicons name="print-outline" size={20} color="#fff" />
                        <Text style={styles.footerBtnText}>Print / Download PDF</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Ionicons name="save-outline" size={20} color="#fff" />
                        <Text style={styles.footerBtnText}>Save Report Card</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    scrollContent: { padding: 16, paddingBottom: 100 },

    // Headers
    editHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1e293b',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },

    // Sections
    sectionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    tableCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },

    // School Info
    schoolName: { textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#1e293b' },
    boardName: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 5 },
    reportTitle: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#4f46e5', marginBottom: 15, textTransform: 'uppercase' },

    infoGrid: { marginTop: 10 },
    infoRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
    infoLabel: { width: 100, fontSize: 14, fontWeight: '600', color: '#64748b' },
    infoValue: { fontSize: 14, fontWeight: '700', color: '#1e293b', flex: 1 },
    smallInput: {
        backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 4, flex: 1, height: 32
    },

    // Tables
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 12, paddingHorizontal: 16, paddingTop: 16 },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        padding: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: 10,
        alignItems: 'center'
    },
    col: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#64748b' },
    cell: { flex: 1, textAlign: 'center', fontSize: 13, color: '#334155' },
    cellInput: {
        flex: 1, textAlign: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 4, marginHorizontal: 2
    },

    // Remarks
    remarksInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 12,
        minHeight: 80,
        textAlignVertical: 'top'
    },
    remarksText: { fontSize: 14, fontStyle: 'italic', color: '#334155', padding: 8 },

    // Signatures
    signatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        paddingHorizontal: 10,
    },
    signBox: {
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#94a3b8',
        paddingTop: 5,
        width: '30%',
    },
    signLabel: { fontSize: 12, color: '#64748b' },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0'
    },
    saveButton: {
        backgroundColor: '#16a34a',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    printButton: {
        backgroundColor: '#4f46e5',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 16 },
});
