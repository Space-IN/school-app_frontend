import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import StudentHomeNavigator from "./studentHomeNavigator"
import StudentProfileScreen from "../../screens/StudentParent/profilescreen/studentProfileScreen"
import MenuScreen from "./StudentParentTabs"
import { Ionicons } from "@expo/vector-icons"
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome from '@expo/vector-icons/FontAwesome'

const Tab = createBottomTabNavigator()


export default function StudentTab() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
                tabBarStyle: { height: 80, paddingTop: 5, backgroundColor: "#c01e12ff" },
                headerShown: false,
                headerBackTitleVisible: false,
                
            }}
        >
            <Tab.Screen
                name="Home"
                component={StudentHomeNavigator}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Entypo name="home" size={size} color={color} />
                    )
                }}
            />

            <Tab.Screen
                name="Menu"
                component={MenuScreen}
                options={{
                    tabBarLabel: "Menu",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="menu-sharp" size={size} color={color} />
                    )
                }}
            />

            <Tab.Screen
                name="Profile"
                component={StudentProfileScreen}
                options={{
                    tabBarLabel: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="user" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    )
}