import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../context/authContext";

export default function FacultyHeader({ navigation, back }) {
   const { decodedToken } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.elementContainer}>
        {back ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="caret-back-outline" size={24} color="black" />
          </TouchableOpacity>
        ) : (
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
        )}

        <TouchableOpacity onPress={() => alert("Calendar icon clicked!")}>
          <Ionicons name="calendar" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 90,
    paddingTop: "6%",
    paddingHorizontal: "5%",
    backgroundColor: "#c01e12ff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  elementContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 10,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: "contain",
  },
});
