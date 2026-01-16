import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import StudentProfileNavigator from "./studentProfileNavigator"
import StudentMenuNavigator from "./studentMenuNavigator"
import StudentHomeNavigator from "./studentHomeNavigator"

const Tab = createBottomTabNavigator()


export default function StudentTab() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
                tabBarStyle: { height: 80, paddingTop: 5, backgroundColor: "#ac1d1dff" },
                headerShown: false,
                headerBackTitleVisible: false,
                
            })}
        >
            <Tab.Screen
                name="Home"
                component={StudentHomeNavigator}
                options={{
                    tabBarLabel: "HOME",
                    tabBarIcon: ({ color, size }) => (
                        <Entypo name="home" size={size} color={color} />
                    )
                }}
            />

            <Tab.Screen
                name="Menu"
                component={StudentMenuNavigator}
                options={{
                    tabBarLabel: "MENU",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="menu-sharp" size={size} color={color} />
                    )
                }}
            />

            <Tab.Screen
                name="Profile"
                component={StudentProfileNavigator}
                options={{
                    tabBarLabel: "PROFILE",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="user" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    )
}