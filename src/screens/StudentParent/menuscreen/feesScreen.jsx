import { useEffect, useRef, useState } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { ScrollView, View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform, StatusBar as RNStatusBar } from "react-native"
import { useStudent } from "../../../context/studentContext"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { fetchFeeDetails } from "../../../controllers/studentDataController"
import FeeDetails from "../../../components/student/feeDetails"




export default function FeesScreen() {
  const navigation = useNavigation()
  const { studentData } = useStudent()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [feeDetails, setFeeDetails] = useState(null)


  useEffect(() => {
      const loadFeeDetails = async () => {
        setLoading(true)
        try {
          const response = await fetchFeeDetails(studentData?.userId)
          if(response) setFeeDetails(response.data)
        } catch(err) {
          setErr(err.message || "an error occured while fetching assessment.")
        } finally {
          setLoading(false)
        }
      }
      loadFeeDetails()
  }, [])

  return (
    <ScrollView style={styles.safeArea}>
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
            <Text style={styles.headerTitle}>Fees</Text>
            <Text style={styles.headerSubtitle}>
              {studentData?.name} - {studentData?.userId}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.installmentsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#9c1006ff" />
        ) : err ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.errText}>{err}</Text>
          </View>
        ) : !feeDetails ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Fee Data is not available.</Text>
          </View>
        ) : (
          feeDetails.installments.map((ele, idx) => {
            const amountDetails = [
              {label: "Amount to be Paid", value: ele.amount}, {label: "Amount Paid", value: ele.paid},
            ]
            return (
              <FeeDetails
                key={idx}
                title={ele.title}
                dueDate={ele.dueDate} lastPaid={ele.lastPaidOn}
                details={amountDetails} status={ele.status}
              />
            )
          })
        )}
      </View>

      {feeDetails && (
        <View style={styles.feeSummaryContainer}>
          <View style={styles.feeCurrentStateContainer}>
            <View style={[styles.feeValueContainer, { width: "48%", backgroundColor: "#e4e6e9ff" }]}>
              <Text style={{ fontSize: 12, fontWeight: "600", }}>PAID</Text>
              <Text style={{ fontSize: 20, fontWeight: "900" }}>{feeDetails.totalPaid}</Text>
            </View>
            <View style={[styles.feeValueContainer, { width: "48%", backgroundColor: "#e4e6e9ff" }]}>
              <Text style={{ fontSize: 12, fontWeight: "600", }}>PENDING</Text>
              <Text style={{ fontSize: 20, fontWeight: "900" }}>{feeDetails.totalPending}</Text>
            </View>
          </View>
          <View style={[styles.feeValueContainer, { width: "100%", backgroundColor: "#9c1006ff" }]}>
            <Text style={{ fontSize: 12, fontWeight: "600", alignSelf: "center", color: "white" }}>TOTAL</Text>
            <Text style={{ fontSize: 20, fontWeight: "900", alignSelf: "center", color: "white" }}>{feeDetails.totalFee}</Text>
          </View>
        </View>
      )}
    </ScrollView>
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
  installmentsContainer: {
    marginTop: -25,
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    gap: 6,
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
  },
  feeSummaryContainer: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    width: "90%",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    marginTop: 30,
    gap: 20,
    marginBottom: 10,
  },
  feeCurrentStateContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    height: "auto",
  },
  feeValueContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 5,
    justifyContent: "flex-start",
    borderRadius: 10,
    height: "fit-content",
    paddingVertical: 8
  }
})
