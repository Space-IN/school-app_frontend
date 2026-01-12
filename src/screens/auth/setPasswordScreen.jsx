import { useEffect } from "react"
import { View, ImageBackground, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import SetPasswordContainer from "../../components/auth/setPassword"



export default function SetPasswordScreen({ route, navigation }) {
    const { resetToken, uiFlow } = route.params || {}

    useEffect(() => {
        if(!resetToken) {
            if(uiFlow==="auth") navigation.replace("login")
            else navigation.pop(2)
        }
    }, [resetToken])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB", }}>
            {uiFlow==="auth" ? (
                <ImageBackground
                    source={require('../../../assets/school.webp')}
                    style={styles.background}
                    resizeMode="cover"
                >
                    <SetPasswordContainer navigation={navigation} resetToken={resetToken} uiFlow={uiFlow} />
                </ImageBackground>
            ) : (
                <View style={styles.background}>
                    <SetPasswordContainer navigation={navigation} resetToken={resetToken} uiFlow={uiFlow} />
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