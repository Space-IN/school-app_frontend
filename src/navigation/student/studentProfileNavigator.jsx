import { createNativeStackNavigator } from "@react-navigation/native-stack"
import StudentProfileScreen from "../../screens/StudentParent/profilescreen/studentProfileScreen"
import StudentHeader from "../../components/student/header"

const Stack = createNativeStackNavigator()


export default function StudentProfileNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="studentProfile"
            screenOptions={{
                header: (props) => <StudentHeader {...props} />,
            }}
        >
            <Stack.Screen name="studentProfile" component={StudentProfileScreen} />
        </Stack.Navigator>
    )
}