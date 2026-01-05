import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/auth/login"
import OtpScreen from "../screens/auth/otpScreen"

const Stack = createNativeStackNavigator()

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" component={LoginScreen} />
            <Stack.Screen name="otp" component={OtpScreen} />
        </Stack.Navigator>
    )
}