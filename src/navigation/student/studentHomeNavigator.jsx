import { createNativeStackNavigator } from "@react-navigation/native-stack"
import StudentHome from "../../screens/StudentParent/homescreen/studentHomeScreen"
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
            <Stack.Screen name="StudentHome" component={StudentHome} />
        </Stack.Navigator>
    )
}