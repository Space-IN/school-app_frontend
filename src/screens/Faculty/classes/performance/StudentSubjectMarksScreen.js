import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { useAuth } from "../../../../context/authContext";
import { api } from '../../../../api/api';

const year = new Date().getFullYear();

const StudentSubjectMarksScreen = ({ route }) => {
  const { students, grade, section, board, subjectName } = route.params;
  const { decodedToken } = useAuth();

  const facultyId = decodedToken?.preferred_username || null;

  const [facultySubjects, setFacultySubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  const [assessmentTemplate, setAssessmentTemplate] = useState(null);
  const [subjectComponents, setSubjectComponents] = useState([]);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const [marks, setMarks] = useState({});
  const [markedByInfo, setMarkedByInfo] = useState({}); // Track who marked each component
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("selected subject: ", selectedSubject)
  })
  /* ======================= FETCH SUBJECTS ======================= */

  useEffect(() => {
    if (facultyId) fetchSubjects();
  }, [facultyId]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await api.get(`/api/faculty/subject/subjects/faculty/${facultyId}`);
      console.log("subject response: ", res.data[0])
      const filtered = res.data
        .filter(subj =>
          subj.classSectionAssignments?.some(cs =>
            String(cs.classAssigned) === String(grade) &&
            cs.section.toUpperCase() === section.toUpperCase()
          )
        )
        .map(subj => ({
          name: subj.subjectName,
          code: subj.subjectMasterId.code,
        }));

      setFacultySubjects(filtered);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error fetching subjects' });
    } finally {
      setLoadingSubjects(false);
    }
  };

  /* ======================= FETCH EXAMS ======================= */

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      console.log("yearjsfdklj: ", year, board, grade, section)
      const res = await api.get(`/api/faculty/assessment/assessmentName`, {
        params: { year, board, grade, section },
      });

      setExams(res.data.exams || []);
    } catch (err) {
      console.error("error fetching exams: ", err)
      Toast.show({ type: 'error', text1: 'Error fetching exams' });
    } finally {
      setLoadingExams(false);
    }
  };

  /* ======================= FETCH ASSESSMENT TEMPLATE ======================= */

  const fetchAssessmentTemplate = async (templateId) => {
    setLoadingTemplate(true);
    try {
      const res = await api.get(`/api/faculty/assessment/assessmentTemplate/${templateId}`);
      
      if (res.data.success) {
        setAssessmentTemplate(res.data.data);
        
        // Find the selected subject's components in the template
        if (selectedSubject) {
          const subjectTemplate = res.data.data.subjects?.find(
            subj => subj.subject?.code === selectedSubject.code
          );
          
          if (subjectTemplate) {
            setSubjectComponents(subjectTemplate.components || []);
          } else {
            setSubjectComponents([]);
            Toast.show({ 
              type: 'warning', 
              text1: 'Subject not found in template' 
            });
          }
        }
      }
    } catch (err) {
      console.error("error fetching assessment template: ", err);
      Toast.show({ type: 'error', text1: 'Error fetching template' });
      setSubjectComponents([]);
    } finally {
      setLoadingTemplate(false);
    }
  };

  /* ======================= FETCH SUBJECT SCORES ======================= */

  const fetchSubjectScores = async (assessmentId, subjectCode) => {
    if (!assessmentId || !subjectCode) return;
    
    setLoadingScores(true);
    try {
      const res = await api.get(
        `/api/faculty/assessment/${assessmentId}/subject/${subjectCode}`
      );

      if (!res.data.success) {
        // No existing marks, keep marks state empty
        setMarks({});
        setMarkedByInfo({});
        return;
      }

      const scores = res.data.data.scores || [];
      const prefilled = {};
      const markedBy = {};

      scores.forEach(score => {
        const studentId = score.student?.userId;

        if (studentId) {
          // Initialize student's marks object
          prefilled[studentId] = {};
          markedBy[studentId] = {};
          
          // Fill in component-wise marks and who marked them
          score.components?.forEach(comp => {
            prefilled[studentId][comp.name] = String(comp.marks_obtained ?? '');
            markedBy[studentId][comp.name] = {
              name: comp.marked_by?.name || 'Unknown',
              userId: comp.marked_by?.userId || '',
            };
          });
        }
      });

      setMarks(prefilled);
      setMarkedByInfo(markedBy);
    } catch (err) {
      console.log("❌ Error fetching subject scores:", err?.response?.data || err);
      // If 404 or no records, just clear the marks
      if (err?.response?.status === 404) {
        setMarks({});
        setMarkedByInfo({});
      }
    } finally {
      setLoadingScores(false);
    }
  };

  /* ======================= HANDLERS ======================= */

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setMarks({});
    setMarkedByInfo({});
    setSubjectComponents([]);
    setAssessmentTemplate(null);
    
    // If exam is already selected, fetch template and scores with new subject
    if (selectedExam?._id && selectedExam?.assessment_template?._id) {
      fetchAssessmentTemplate(selectedExam.assessment_template._id);
      if (subject?.code) {
        fetchSubjectScores(selectedExam._id, subject.code);
      }
    }
  };

  const handleExamChange = (exam) => {
    setSelectedExam(exam);
    setMarks({});
    setMarkedByInfo({});
    setSubjectComponents([]);
    
    if (exam?.assessment_template?._id) {
      fetchAssessmentTemplate(exam.assessment_template._id);
      
      // Fetch subject scores if subject is already selected
      if (selectedSubject?.code && exam._id) {
        fetchSubjectScores(exam._id, selectedSubject.code);
      }
    }
  };

  const handleMarkChange = (studentId, componentName, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [componentName]: value
      }
    }));
  };

  const canSubmit =
    selectedSubject &&
    selectedExam &&
    subjectComponents.length > 0 &&
    Object.values(marks).some(studentMarks => 
      Object.values(studentMarks).some(m => m !== '' && !isNaN(m))
    );

  /* ======================= SUBMIT ======================= */

  const handleSubmit = async () => {
    if (!canSubmit) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Submission',
        text2: 'Select subject, exam and enter marks.',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        assessmentId: selectedExam._id,
        subjectCode: selectedSubject.code,
        records: students
          .filter(student => {
            const studentMarks = marks[student.userId];
            // Exclude student if no marks entered at all
            return studentMarks && Object.values(studentMarks).some(m => m !== '');
          })
          .map(student => {
            const studentMarks = marks[student.userId] || {};
            
            // Build components array - include if value exists (even if 0)
            const components = subjectComponents
              .filter(comp => {
                const markValue = studentMarks[comp.name];
                // Include if not empty string (allows 0)
                return markValue !== undefined && markValue !== '';
              })
              .map(comp => ({
                name: comp.name,
                marks_obtained: Number(studentMarks[comp.name]),
                markedBy: facultyId,
              }));

            return {
              studentId: student.userId,
              components: components,
            };
          }),
      };

      console.log("📤 SUBMIT PAYLOAD:", JSON.stringify(payload, null, 2));

      const res = await api.put(`/api/faculty/assessment/faculty/submit`, payload);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: res.data?.message || 'Marks submitted successfully',
      });

      setMarks({});
      setMarkedByInfo({});
    } catch (err) {
      console.log("error submitting the marks: ", err)
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: err.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ======================= RENDER ======================= */

  const renderStudent = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentAvatar}>
          <Text style={styles.studentAvatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentId}>{item.userId}</Text>
        </View>
      </View>
      
      <View style={styles.componentsGrid}>
        {subjectComponents.map((component, index) => {
          const markedBy = markedByInfo[item.userId]?.[component.name];
          const isMarkedByOther = markedBy && markedBy.userId !== facultyId;
          const hasExistingMarks = marks[item.userId]?.[component.name] !== undefined && 
                                   marks[item.userId]?.[component.name] !== '';
          
          return (
            <View key={index} style={styles.componentCard}>
              <View style={styles.componentHeader}>
                <Text style={styles.componentName}>{component.name}</Text>
                <Text style={styles.componentMaxMarks}>/ {component.maxMarks}</Text>
              </View>
              
              <TextInput
                style={[
                  styles.markInput,
                  hasExistingMarks && styles.markInputExisting,
                  isMarkedByOther && styles.markInputEdited
                ]}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor="#999"
                value={marks[item.userId]?.[component.name] || ''}
                onChangeText={(value) => handleMarkChange(item.userId, component.name, value)}
              />
              
              {markedBy && (
                <View style={styles.markedByContainer}>
                  <View style={[
                    styles.markedByBadge,
                    isMarkedByOther && styles.markedByBadgeWarning
                  ]}>
                    <Text style={[
                      styles.markedByText,
                      isMarkedByOther && styles.markedByTextWarning
                    ]}>
                      {isMarkedByOther ? '⚠️ ' : '✓ '}
                      {markedBy.name}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mark Student Assessments</Text>
        <Text style={styles.headerSubtitle}>
          Grade {grade} • Section {section} • {board}
        </Text>
      </View>

      {/* SUBJECT */}
      <View style={styles.pickerSection}>
        <Text style={styles.label}>📘 Subject</Text>
        {loadingSubjects ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <View style={styles.pickerWrapper}>
            <Picker 
              selectedValue={selectedSubject} 
              onValueChange={handleSubjectChange}
              style={styles.picker}
            >
              <Picker.Item label="Select Subject" value={null} />
              {facultySubjects.map(subj => (
                <Picker.Item key={subj.code} label={subj.name} value={subj} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* EXAMS */}
      <View style={styles.pickerSection}>
        <Text style={styles.label}>📝 Exam</Text>
        {loadingExams ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <View style={styles.pickerWrapper}>
            <Picker 
              selectedValue={selectedExam} 
              onValueChange={handleExamChange}
              style={styles.picker}
            >
              <Picker.Item label="Select Exam" value={null} />
              {exams.map(exam => (
                <Picker.Item
                  key={exam._id}
                  label={exam.assessment_name}
                  value={exam}
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Loading Template Indicator */}
      {loadingTemplate && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={styles.loadingText}>Loading template...</Text>
        </View>
      )}

      {/* Loading Scores Indicator */}
      {loadingScores && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={styles.loadingText}>Loading existing marks...</Text>
        </View>
      )}

      {/* Components Info */}
      {subjectComponents.length > 0 && (
        <View style={styles.componentsInfoCard}>
          <View style={styles.componentsInfoHeader}>
            <Text style={styles.componentsInfoTitle}>Exam Structure</Text>
          </View>
          <View style={styles.componentsList}>
            {subjectComponents.map((comp, idx) => (
              <View key={idx} style={styles.componentInfoRow}>
                <View style={styles.componentBadge}>
                  <Text style={styles.componentBadgeText}>{idx + 1}</Text>
                </View>
                <View style={styles.componentInfoContent}>
                  <Text style={styles.componentName}>{comp.name}</Text>
                  <Text style={styles.componentDetails}>
                    Max: {comp.maxMarks} marks
                    {comp.passMarks ? ` • Pass: ${comp.passMarks}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Show students only when both subject and exam are selected */}
      {selectedSubject && selectedExam && subjectComponents.length > 0 ? (
        <>
          <FlatList
            data={students}
            keyExtractor={item => item._id}
            renderItem={renderStudent}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No students available</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          />

          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitText}>Submit Marks</Text>
                  <Text style={styles.submitIcon}>✓</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={styles.placeholderIcon}>
            <Text style={styles.placeholderIconText}>📋</Text>
          </View>
          <Text style={styles.placeholderTitle}>Ready to Mark Assessments</Text>
          <Text style={styles.placeholderSubtitle}>
            {!selectedSubject && !selectedExam 
              ? 'Select a subject and exam to begin marking'
              : !selectedSubject
              ? 'Please select a subject'
              : 'Please select an exam'}
          </Text>
          
          {/* Show step indicators */}
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, selectedSubject && styles.stepCircleComplete]}>
                <Text style={[styles.stepNumber, selectedSubject && styles.stepNumberComplete]}>
                  {selectedSubject ? '✓' : '1'}
                </Text>
              </View>
              <Text style={styles.stepLabel}>Select Subject</Text>
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, selectedExam && styles.stepCircleComplete]}>
                <Text style={[styles.stepNumber, selectedExam && styles.stepNumberComplete]}>
                  {selectedExam ? '✓' : '2'}
                </Text>
              </View>
              <Text style={styles.stepLabel}>Select Exam</Text>
            </View>
          </View>
        </View>
      )}

      <Toast />
    </View>
  );
};

export default StudentSubjectMarksScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    fontWeight: '500',
  },
  pickerSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  label: { 
    fontSize: 15, 
    fontWeight: '600', 
    marginBottom: 8,
    color: '#2c3e50',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 50,
  },
  loader: {
    marginVertical: 12,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  loadingText: {
    marginLeft: 12,
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  componentsInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  componentsInfoHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  componentsInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  componentsList: {
    gap: 12,
  },
  componentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  componentBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  componentBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  componentInfoContent: {
    flex: 1,
  },
  componentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  componentDetails: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#2c3e50',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  componentsGrid: {
    gap: 12,
  },
  componentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  componentMaxMarks: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  markInput: {
    height: 56,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  markInputExisting: {
    backgroundColor: '#fff9c4',
    borderColor: '#fbc02d',
  },
  markInputEdited: {
    backgroundColor: '#ffe0b2',
    borderColor: '#ff9800',
    borderWidth: 2,
  },
  markedByContainer: {
    marginTop: 8,
  },
  markedByBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  markedByBadgeWarning: {
    backgroundColor: '#fff3e0',
  },
  markedByText: {
    fontSize: 10,
    color: '#2e7d32',
    fontWeight: '600',
  },
  markedByTextWarning: {
    color: '#e65100',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#95a5a6',
    fontWeight: '500',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#adb5bd',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700',
    marginRight: 8,
  },
  submitIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderIconText: {
    fontSize: 48,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    borderWidth: 2,
    borderColor: '#dee2e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleComplete: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6c757d',
  },
  stepNumberComplete: {
    color: '#fff',
    fontSize: 20,
  },
  stepLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  stepDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#dee2e6',
    marginHorizontal: 12,
    marginBottom: 30,
  },
});