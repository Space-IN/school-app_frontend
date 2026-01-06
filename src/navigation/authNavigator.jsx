import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/auth/loginScreen"
import OtpScreen from "../screens/auth/otpScreen"
import SetPasswordScreen from "../screens/auth/setPasswordScreen"

const Stack = createNativeStackNavigator()

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" component={LoginScreen} />
            <Stack.Screen name="otp" component={OtpScreen} />
            <Stack.Screen name="setPassword" component={SetPasswordScreen} />
        </Stack.Navigator>
    )
}