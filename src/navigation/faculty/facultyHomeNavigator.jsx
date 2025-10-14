// src/navigation/faculty/facultyHomeNavigator.jsx

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import FacultyDashboard from "../../screens/Faculty/homescreen/FacultyDashboard"
import FacultyHeader from "../../components/faculty/FacultyHeader" // You'll need to create this
import { SafeAreaProvider } from "react-native-safe-area-context"


const Stack = createNativeStackNavigator()

export default function FacultyHomeNavigator() {
    return (
        <SafeAreaProvider>
        <Stack.Navigator
            initialRouteName="FacultyHome"
            screenOptions={{
                header: (props) => <FacultyHeader {...props} />,
            }}
        >
            <Stack.Screen name="FacultyHome" component={FacultyDashboard} />
        </Stack.Navigator>
        </SafeAreaProvider>
    )
}