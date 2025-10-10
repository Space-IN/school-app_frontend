import { View, Text, StyleSheet, ScrollView } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'



export default function PerformanceGrid() {
    const attendance = 12
    const cgpa = 2.5

    const getColor = (value, min, max) => {
        const clamped = Math.max(min, Math.min(value, max))

        const norm = (clamped-min) / (max-min)
        if(norm<=0.35) return "#be3b3bff"
        if(norm<=0.65) return "#f59e0b"
        return "#10b981"
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.row}>
                <View style={[styles.card, { backgroundColor: getColor(attendance, 0, 10) }]}>
                    <Text style={styles.cardTitle}>ATTENDANCE</Text>
                    <View style={styles.divider} />
                    <View style={styles.metricContainer}>
                      <FontAwesome name="calendar-o" size={22} color="white" />
                      <Text style={[styles.metricText, { marginLeft: 5 }]}>{attendance}%</Text>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: getColor(cgpa, 0, 10) }]}>
                    <Text style={styles.cardTitle}>CGPA</Text>
                    <View style={styles.divider} />
                    <View style={styles.metricContainer}>
                      <FontAwesome name="graduation-cap" size={22} color="white" />
                      <Text style={styles.metricText}>{cgpa}</Text>
                    </View>
                </View>
            </View>
            {/* <View style={styles.row}>
              <View style={[styles.card, { backgroundColor: getColor(cgpa, 0, 10) }]}>
                  <Text style={styles.cardTitle}>Assignments</Text>
                  <View style={styles.divider} />
                  <View style={styles.metricContainer}>
                    <MaterialIcons name="assignment" size={26} color="white" />
                    <Text style={styles.metricText}>{cgpa}</Text>
                  </View>
              </View>

              <View style={[styles.card, { backgroundColor: getColor(cgpa, 0, 10) }]}>
                  <Text style={styles.cardTitle}>Assignments</Text>
                  <View style={styles.divider} />
                  <View style={styles.metricContainer}>
                    <MaterialIcons name="assignment" size={26} color="white" />
                    <Text style={styles.metricText}>{cgpa}</Text>
                  </View>
              </View>
            </View> */}
        </ScrollView>
    )
}


const styles = StyleSheet.create({
  container: {
    padding: 12,
    width: "100%"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    backgroundColor: "#2C2C2C",
    borderRadius: 12,
    marginHorizontal: 6,
    height: 110,
    alignItems: "center",
    width: "48%",
    marginBottom: 12
  },
  cardTitle: {
    color: "#f5f5f5",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 2,
    padding: 3
  },
  metricText: {
    color: "#f5f5f5",
    fontSize: 15,
    marginTop: 10,
    fontWeight: "700"
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 15,
  },
  metricContainer: {
    padding: 3,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  }
})