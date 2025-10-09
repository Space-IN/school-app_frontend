// src/navigation/faculty/facultyHomeNavigator.jsx

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import FacultyDashboard from "../../screens/Faculty/homescreen/FacultyDashboard"
import FacultyHeader from "../../components/faculty/FacultyHeader" // You'll need to create this

const Stack = createNativeStackNavigator()

export default function FacultyHomeNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="FacultyHome"
            screenOptions={{
                header: (props) => <FacultyHeader {...props} />,
            }}
        >
            <Stack.Screen name="FacultyHome" component={FacultyDashboard} />
        </Stack.Navigator>
    )
}