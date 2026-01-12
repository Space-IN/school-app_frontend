import { View, Text, StyleSheet } from "react-native"

const readableDate = (date) => {
    const newDate = new Date(date)
    return newDate.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
}

const DetailRow = ({ label, value }) => (
    <View style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", width: "100%" }}>
        <Text style={styles.detailsText}>{label}</Text>
        <Text style={styles.detailsText}>{value}</Text>
    </View>
)




export default function FeeDetails({ title, dueDate, details, lastPaid, status }) {
    const installmentStatusColor = status==="PAID" ? "#27AE60" : status==="PARTIAL" ? "#F2C94C" : status==="OVERDUE" ? "#D64545" : "#e4e6e9ff"
    return (
      <View style={[styles.installment, { backgroundColor: installmentStatusColor }]}>
        <View style={styles.installmentTitleContainer}>
          <Text style={styles.installmentTitle}>{title}</Text>
          <Text style={{ fontSize: 13, color: "#595959", fontWeight: "800", }}>{readableDate(dueDate)}</Text>
        </View>
        <View style={styles.installmentDetail}>
          {details.map((ele, idx) => (
            <DetailRow key={idx} label={ele.label} value={ele.value} />
          ))}
          {lastPaid && (
            <View style={styles.lastPayment}>
              <Text style={styles.lastPaymentText}>Last Payment</Text>
              <Text style={styles.lastPaymentText}>{readableDate(lastPaid)}</Text>
            </View>
          )}
        </View>
      </View>
    )
}

const styles = StyleSheet.create({
  installment: {
    flexDirection: "col",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderRadius: 15,
    padding: 15,
    width: "100%",
  },
  installmentTitleContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    width: "100%",
  },
  installmentTitle: {
    fontSize: 21,
    fontWeight: "800",
  },
  installmentDetail: {
    display: "flex",
    flexDirection: "column",
    gap:1,
  },
  lastPayment: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    marginTop: 6,
  },
  lastPaymentText: {
    fontSize: 13,
    color: "black",
    fontWeight: "600",
  },
  detailsText: {
    fontSize: 16,
    fontWeight: "600",
  },
})