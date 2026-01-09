import { StyleSheet, ImageBackground, } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import OtpTab from "../../components/student/otp"




export default function OptScreen({ route, navigation }) {
    const { phone, userId, uiFlow } = route.params
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ac1d1dff", }}>
            {uiFlow==="auth" ? (
                <ImageBackground
                    source={require('../../../assets/school.webp')}
                    style={styles.background}
                    resizeMode="cover"
                >
                    <OtpTab phoneNumber={phone} userId={userId} navigation={navigation} />
                </ImageBackground>
            ) : (
                <View style={styles.background}>
                    <OtpTab phoneNumber={phone} userId={userId} navigation={navigation} />
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: "#F9FAFB",
        justifyContent: "center",
        alignItems: "center",
    },
})