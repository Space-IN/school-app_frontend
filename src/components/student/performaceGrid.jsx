import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'



export default function PerformanceGrid({ studentLoading, attendancePercentage, grade, feeStatus }) {
  const remarks = "-"

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: !attendancePercentage ? "#909691" : attendancePercentage>75 ? "#10b981" : attendancePercentage>45 ? "#f59e0b" : "#e23333ff" }]}>
          <Text style={styles.cardTitle}>ATTENDANCE</Text>
          <View style={styles.divider} />
          <View style={styles.metricContainer}>
            <FontAwesome name="calendar-o" size={22} color="white" />
            {studentLoading ? (
              <ActivityIndicator size="small" color="#9c1006" />
            ) : (
              <Text style={[styles.metricText, { marginLeft: 5 }]}>{!attendancePercentage ? "-" : `${attendancePercentage}%`}</Text>
            )}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: !grade?.cgpa ? "#909691" : grade>8 ? "#10b981" : grade>5 ? "#f59e0b"  : "#DC2626" }]}>
          <Text style={styles.cardTitle}>CGPA</Text>
          <View style={styles.divider} />
          <View style={styles.metricContainer}>
            <FontAwesome name="graduation-cap" size={22} color="white" />
            {studentLoading ? (
              <ActivityIndicator size="small" color="#9c1006" />
            ) : (
              <Text style={[styles.metricText, { marginLeft: 5 }]}>{!grade?.cgpa ? "-" : `${(grade?.cgpa).toFixed(2)}`}</Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.row2}>
        <View style={[styles.card, { backgroundColor: feeStatus==="PENDING" ? "#f59e0b" : feeStatus==="OVERDUE" ? "#DC2626" : feeStatus==="PAID" ? "#10b981" : "#909691" }]}>
          <Text style={styles.cardTitle}>FEES</Text>
          <View style={styles.divider} />
          <View style={styles.metricContainer}>
            <FontAwesome name="rupee" size={24} color="white" />
            <Text style={styles.metricText}>{!feeStatus ? "-" : feeStatus}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: remarks==="-" ? "#909691" : "#f59e0b" }]}>
          <Text style={styles.cardTitle}>REMARKS</Text>
          <View style={styles.divider} />
          <View style={styles.metricContainer}>
            <FontAwesome6 name="chalkboard-user" size={22} color="white" />
            <Text style={styles.metricText}>{remarks==="-" ? "NO REMARKS" : `${remarks} REMARKS`}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        width: "100%",
        marginTop: 0,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 2,
        flexWrap: "wrap",
    },
    row2: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginTop: -6,
    },
    card: {
        flex: 1,
        backgroundColor: "#909691",
        borderRadius: 12,
        marginHorizontal: 6,
        height: 110,
        alignItems: "center",
        width: "48%",
        marginBottom: 12,
    },
    cardTitle: {
        color: "#f5f5f5",
        fontSize: 12,
        fontWeight: "900",
        marginBottom: 2,
        padding: 3,
    },
    metricText: {
        color: "#f5f5f5",
        fontSize: 15,
        marginTop: 10,
        fontWeight: "700",
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        marginBottom: 15,
    },
    metricContainer: {
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
    },
});