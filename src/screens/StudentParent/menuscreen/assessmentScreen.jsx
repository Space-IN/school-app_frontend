import { useEffect, useRef, useState } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { View, StyleSheet, Text, TouchableOpacity, Modal, FlatList, Animated, ActivityIndicator, Platform, StatusBar as RNStatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useStudent } from "../../../context/studentContext"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { fetchAssessments, fetchAssessmentScore } from "../../../controllers/studentDataController"





const TableRow = ({ subject, marks, max_marks, grade, status, isHeader, isTotal }) => {
  const bgColor = isTotal ? status==="Fail" ? "#be3b3bff" : "#10b981" : "transparent"
  const textStyle = [styles.tableText, isHeader && { fontWeight: "800" }, isTotal && { color: "#fff", fontWeight: "600" }]

  return (
    <View style={[styles.tableRow, { backgroundColor: bgColor, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }]}>
      <Text style={[textStyle, styles.subjectCol]}>
        {isHeader ? "Subject" : subject || "Total"}
      </Text>
      <Text style={[textStyle, styles.centerCol]}>
        {isHeader ? "Marks" : marks}
      </Text>
      <Text style={[textStyle, styles.centerCol]}>
        {isHeader ? "Max" : max_marks}
      </Text>
      <Text style={[textStyle, styles.centerCol]}>
        {isHeader ? "Grade" : grade}
      </Text>
      <Text style={[textStyle, styles.centerCol]}>
        {isHeader ? "Status" : status}
      </Text>
    </View>
  )
}


export default function AssessmentScreen() {
  const { studentData } = useStudent()

  const navigation = useNavigation()

  const currentYear = new Date().getFullYear()

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [marksData, setMarksData] = useState(null)

  const slideAnim = useRef(new Animated.Value(0)).current

  const handleSelection = async (studentId, grade, section, exam, year) => {
    setLoading(true)
    setSelectedExam(exam)
    setModalVisible(false)
    try {
      const response = await fetchAssessmentScore(studentId, grade, section, exam.test_name, year)
      if(response) setMarksData(response)
    } catch(err) {
      setErr(err.message || "an error occured while fetching assessment score.")
    } finally {
      setLoading(false)
    }
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }

  const slideInStyle = {
    opacity: slideAnim,
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 0],
        }),
      }
    ]
  }


  useEffect(() => {
      const loadAssessments = async () => {
          try {
              const response = await fetchAssessments(studentData?.className, studentData?.section, currentYear)
              if(response) setExams(response.exams)
          } catch(err) {
              setErr(err.message || "an error occured while fetching assessment.")
          }
      }
      loadAssessments()
  }, [])

  return (
    <View style={styles.safeArea}>
      <LinearGradient
        colors={['#d72b2b', '#8b1313']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="caret-back-outline" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Assessments</Text>
            <Text style={styles.headerSubtitle}>
              {studentData?.className} - {studentData?.section}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.dropdownTextContainer}>
            <Text style={styles.dropdownTextPrimary}>
              {selectedExam ? selectedExam.test_name : "Select Assessment"}
            </Text>
            {selectedExam && (
              <Text style={styles.dropdownTextSecondary}>
                {`${selectedExam.test_type} - ${new Date(selectedExam.date).toISOString().split('T')[0]}`}
              </Text>
            )}
          </View>
          <Ionicons name="caret-down" size={22} color="black" />
        </TouchableOpacity>

        {selectedExam && (
          err ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.errText}>
                No marks available for this assessment. Please contact your respective Administrator for more information.
              </Text>
            </View>
          ) : loading ? (
            <View style={styles.noDataContainer}>
              <ActivityIndicator size="small" color="#9c1006ff" />
            </View>
          ) : marksData ? (
            <View>
              <Animated.View style={[styles.marksContainer, slideInStyle]}>
                <TableRow isHeader />
                {marksData.subjects.map((subj, i) => (
                  <TableRow key={i} {...subj} />
                ))}
                <TableRow
                  subject="Total"
                  marks={marksData.total_obtained}
                  max_marks={marksData.total_max}
                  grade={marksData.total_grade}
                  status={marksData.total_status}
                  isTotal
                />
              </Animated.View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                No marks available for this assessment. Please contact your respective Administrator for more information.
              </Text>
            </View>
          )
        )}
      </View>


      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <FlatList
              data={exams}
              keyExtractor={(item) => `${item.test_name}-${item.date}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelection(studentData?.userId, studentData?.className, studentData?.section, item, currentYear)}
                  key={index}
                >
                  <Text style={styles.examDateText}>{new Date(item.date).toISOString().split('T')[0]}</Text>
                  <Text style={styles.examText}>{item.test_name}</Text>
                  <Text style={styles.examTypeText}>{item.test_type}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyExamsContainer}>
                  <Text style={styles.emptyExamsText}>No assessments record yet to be displayed.</Text>
                </View>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight + 24 : 60
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 1,
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#e0e7ff",
    fontWeight: "500",
  },
  dropdownContainer: {
    marginTop: -25,
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 15,
    width: "100%",
  },
  dropdownTextContainer: {
    display: "flex",
    flexDirection: "column",
  },
  dropdownTextPrimary: {
    fontSize: 18,
    color: "#000",
    fontWeight: "800",
  },
  dropdownTextSecondary: {
    fontSize: 14,
    color: "#4e5053ff",
    fontWeight: "600",
  },
  marksContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 15,
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10
  },
  tableText: {
    fontSize: 15,
    color: "#111827",
  },
  subjectCol: {
    flex: 1.4,
  },
  centerCol: {
    flex: 0.8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "80%",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  examText: {
    fontSize: 20,
    color: "#111827",
    textAlign: "center",
  },
  examTypeText: {
    fontSize: 13,
    color: "#111827",
    textAlign: "center",
  },
  examDateText: {
    fontSize: 10,
    color: "#303031ff",
    textAlign: "center",
  },
  emptyExamsContainer: {
    padding: 10,
  },
  emptyExamsText: {
    fontSize: 18,
    color: "#383636ff"
  },
  noDataContainer: {
    borderRadius: 15,
    marginTop: 15,
    padding: 15
  },
  noDataText: {
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "center",
    color: "#383636ff"
  },
  errText: {
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "center",
    color: "#d12828ff"
  }
})
