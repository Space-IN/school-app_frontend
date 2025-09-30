import { createNativeStackNavigator } from "@react-navigation/native-stack"
import StudentParentHome from "../../screens/StudentParent/homescreen/StudentParentHome"
import StudentHeader from "../../components/student/header"

const Stack = createNativeStackNavigator()


export default function StudentHomeNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="StudentHome"
            screenOptions={{
                header: (props) => <StudentHeader {...props} />,
            }}
        >
            <Stack.Screen name="StudentHome" component={StudentParentHome} />
        </Stack.Navigator>
    )
}