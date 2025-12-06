import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../screens/StudentParent/homescreen/studentHomeScreen';
import AttendanceScreen from '../../screens/StudentParent/menuscreen/attendanceScreen';
import AssessmentScreen from '../../screens/StudentParent/menuscreen/assessmentScreen';
import FeesScreen from '../../screens/StudentParent/menuscreen/feesScreen';  
import StudentHeader from '../../components/student/header';

const Stack = createStackNavigator();

export default function StudentHomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        header: (props) => <StudentHeader {...props} />,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} />

      <Stack.Screen
        name="AssessmentScreen"
        component={AssessmentScreen}
        options={({ route }) => ({
          headerShown: route?.params?.fromHome ? true : false,
        })}
      />

      {/* NEW FEES SCREEN */}
      <Stack.Screen name="FeesScreen" component={FeesScreen} />
    </Stack.Navigator>
  );
}