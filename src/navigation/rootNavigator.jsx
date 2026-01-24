import { createStackNavigator } from "@react-navigation/stack"
import { useAuth } from "../context/authContext"
import AuthNavigator from "./authNavigator"
import AppNavigator from "./appNavigator"
import { View, ActivityIndicator } from "react-native"

const RootStack = createStackNavigator()



export default function RootNavigator() {
    const { isAuthenticated, loading } = useAuth()

    if(loading) {
        return (
        <View style={{ flex: 1, justifyContent: 'center',alignItems: 'center' }}>
            <ActivityIndicator size='large' color="#9c1006ff" />
        </View>
        )
    } else {
        return (
            <RootStack.Navigator screenOptions={{ headerShown: false, }}>
                {isAuthenticated ? (
                    <RootStack.Screen name="App" component={AppNavigator} />
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        )
    }
}