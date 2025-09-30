import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/login";


const Stack = createNativeStackNavigator()

const AuthNavigator = () => {

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" component={LoginScreen} />
        </Stack.Navigator>
    )
}

export default AuthNavigator