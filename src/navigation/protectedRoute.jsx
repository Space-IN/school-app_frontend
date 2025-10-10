import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/authContext";
import AuthNavigator from "./authNavigator";
import AppNavigator from "./appNavigator";


const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth()

    if(loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center',alignItems: 'center' }}>
                <ActivityIndicator size='large' color="#9c1006ff" />
            </View>
        )
    }

    return isAuthenticated ? <AppNavigator /> : <AuthNavigator />
}

export default ProtectedRoute