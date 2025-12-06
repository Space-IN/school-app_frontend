import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import AntDesign from '@expo/vector-icons/AntDesign'
import { useStudent } from "../../../context/student/studentContext"
import { useAuth } from "../../../context/authContext"
import { LinearGradient } from "expo-linear-gradient"



const StudentProfileScreen = () => {
  const { studentData, studentLoading, studentErr } = useStudent()
  const { logout } = useAuth()

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => logout() },
      ],
      { cancelable: true }
    )
  }


  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {studentLoading ? (
          <View style={styles.idCard}>
            <ActivityIndicator size="large" color="#9c1006" />
          </View>
        ) : studentErr ? (
          <View style={styles.idCard}>
            <Text style={styles.errData}>
              Something went wrong while fetching your profile data. Please try again later.
            </Text>
          </View>
        ) : !studentData ? (
          <View style={styles.idCard}>
            <Text style={styles.noData}>
              User data couldn't be fetched. Please check your internet connection and try again later...
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={['#ce312cff', '#9c2f2bff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.idCard}
          >
            {/* student's profile section */}
            <View style={styles.topRow}>
              <Ionicons name="person-circle-outline" size={80} color="#fff" />
              <View style={{ marginLeft: 10, width: "70%" }}>
                <Text style={{ fontSize: 24, fontWeight: "900", color: "white" }}>{(studentData.name)?.toUpperCase() || "N/A"}</Text>
                <Text style={{ fontSize: 17, color: "white" }}>
                  {studentData.className || "N/A"} - {studentData.section || "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.detailRow}>
                <View style={{ width: "100%", display: "flex", flexDirection: "row",  }}>
                  <Text style={styles.label}>Gender: </Text>
                  <Text style={styles.value}>{studentData.gender || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={{ width: "100%", display: "flex", flexDirection: "row",  }}>
                  <Text style={styles.label}>DOB: </Text>
                  <Text style={styles.value}>{studentData.dob?.split("T")[0] || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={{ width: "100%", display: "flex", flexDirection: "row", }}>
                  <Text style={styles.label}>Roll Number: </Text>
                  <Text style={styles.value}>{studentData.rollNo || "N/A"}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={{ width: "100%", display: "flex", flexDirection: "row",  }}>
                  <Text style={styles.label}>Admission Number: </Text>
                  <Text style={styles.value}>{studentData.admissionNumber || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={{ width: "100%", display: "flex", flexDirection: "row", }}>
                  <View style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "45%" }}>
                    <MaterialIcons name="phone" size={20} color="#fff" style={{ marginRight: 5 }} />
                    <Text style={{ fontWeight: "500", color: "#fff", fontSize: 16, }}>Phone No:</Text>
                  </View>
                  <Text style={styles.value}>{studentData.fatherContact || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={{ width: "100%", display: "flex", flexDirection: "row", }}>
                  <View style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "45%" }}>
                    <MaterialIcons name="email" size={20} color="#fff" style={{ marginRight: 5, }} />
                    <Text style={{ fontWeight: "500", color: "#fff", fontSize: 16, }}>E-Mail:</Text>
                  </View>
                  <Text style={styles.value}>{studentData.studentEmail || "N/A"}</Text>
                </View>
              </View>

              <View style={[styles.detailRow, { alignItems: "flex-start" }]}>
                <Text style={styles.label}>Address:</Text>
                <Text style={[styles.value, { flex: 1 }]}>{studentData.address || "N/A"}</Text>
              </View>
            </View>

            {/* parent's profile cards */}
            <View style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 25, gap: 10 ,flexWrap:"wrap"}}>
              <View style={styles.parentCard}>
                <Text style={styles.parentRole}>FATHER'S PROFILE</Text>

                <Text style={styles.parentName}>{(studentData.fatherName).toUpperCase() || "N/A"}</Text>

                <View style={styles.infoSection}>
                  <View style={[styles.detailRow, { marginBottom: 4, }]}>
                    <View style={{ width: "100%", display: "flex", flexDirection: "row",  }}>
                      <Text style={{ fontWeight: "500", color: "black", fontSize: 16, marginRight: 5, width: "45%"}}>Occupation: </Text>
                      <Text style={{ color: "black", fontWeight: "400", fontSize: 16, }}>{studentData.fatherOccupation || "N/A"}</Text>
                    </View>
                  </View>

                  <View style={[styles.detailRow, { marginBottom: 4, }]}>
                    <View style={{ width: "100%", display: "flex", flexDirection: "row",  }}>
                      <Text style={{ fontWeight: "500", color: "black", fontSize: 16, marginRight: 5, width: "45%"}}>Contact: </Text>
                      <Text style={{ color: "black", fontWeight: "400", fontSize: 16, }}>{studentData.fatherContact || "N/A"}</Text>
                    </View>
                  </View>

                  <View style={[styles.detailRow, { marginBottom: 4, }]}>
                    <View style={{ width: "100%", display: "flex", flexDirection: "row",  }}>
                      <Text style={{ fontWeight: "500", color: "black", fontSize: 16, marginRight: 5, width: "45%"}}>EMail: </Text>
                      <Text style={{ color: "black", fontWeight: "400", fontSize: 16,flexShrink:1,flexWrap:"wrap" }}>{studentData.parentEmail || "N/A"}</Text>
                    </View>
                  </View>

                  
                </View>
              </View>

              <View style={styles.parentCard}>
                <Text style={styles.parentRole}>MOTHER'S PROFILE</Text>

                <Text style={styles.parentName}>{(studentData.motherName).toUpperCase() || "N/A"}</Text>

                <View style={styles.infoSection}>
                  <View style={[styles.detailRow, { marginBottom: 4, }]}>
                    <View style={{ width: "100%", display: "flex", flexDirection: "row",  }}>
                      <Text style={{ fontWeight: "500", color: "black", fontSize: 16, marginRight: 5, width: "45%"}}>Occupation: </Text>
                      <Text style={{ color: "black", fontWeight: "400", fontSize: 16, }}>{studentData.motherOccupation || "N/A"}</Text>
                    </View>
                  </View>

                  <View style={[styles.detailRow, { marginBottom: 4, }]}>
                    <View style={{ width: "100%", display: "flex", flexDirection: "row",  }}>
                      <Text style={{ fontWeight: "500", color: "black", fontSize: 16, marginRight: 5, width: "45%"}}>Contact: </Text>
                      <Text style={{ color: "black", fontWeight: "400", fontSize: 16, }}>{studentData.motherContact || "N/A"}</Text>
                    </View>
                  </View>

                  <View style={[styles.detailRow, { marginBottom: 4, }]}>
                    <View style={{ width: "100%", display: "flex", flexDirection: "row",  }}>
                      <Text style={{ fontWeight: "500", color: "black", fontSize: 16, marginRight: 5, width: "45%"}}>EMail: </Text>
                      <Text style={{ color: "black", fontWeight: "400", fontSize: 16,flexShrink:1,flexWrap:"wrap" }}>{studentData.parentEmail || "N/A"}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <AntDesign name="logout" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default StudentProfileScreen

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: { padding: 20, paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  idCard: {
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: "#ce312cff"
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginVertical: 5,
  },
  infoSection: {
    marginTop: 5,
    width: "100%",
    padding: 5
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  label: {
    fontWeight: "500",
    color: "#fff",
    fontSize: 16,
    marginRight: 5,
    width: "45%",
  },
  value: {
    color: "#fff",
    fontWeight: "400",
    fontSize: 16,
    maxWidth: 210
  },
  parentSection: {
    marginTop: 5,
    backgroundColor: "black",
    width: "100%",
    borderRadius: 20,
    height: "auto",
  },
  parentHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a8a",
    marginTop: 5
  },
  parentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
    alignSelf: "center",
  },
  parentName: { fontSize: 20, fontWeight: "900", color: "#101c2eff", marginBottom: 3, marginLeft: 3 },
  parentRole: { fontSize: 13, fontWeight: "900", color: "#4b4b4bff", marginLeft: 3 },
  parentDetail: { fontSize: 16, color: "#111827", marginBottom: 3 },
  logoutButton: {
    backgroundColor: "#f12a2aff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 7
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  errData: {
    fontSize: 20,
    fontWeight: "500",
    color: "red",
  },
  noData: {
    fontSize: 20,
    fontWeight: "500",
    color: "gray",
  },
})
