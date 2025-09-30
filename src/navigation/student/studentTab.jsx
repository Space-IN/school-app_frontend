import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import StudentHomeNavigator from "./studentHomeNavigator"
import StudentProfileScreen from "../../screens/StudentParent/homescreen/StudentProfileScreen"
import MenuScreen from "./StudentParentTabs"
import { Ionicons } from "@expo/vector-icons"
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome from '@expo/vector-icons/FontAwesome'

const Tab = createBottomTabNavigator()


export default function StudentTab() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "#9c1006ff",
                tabBarInactiveTintColor: "gray",
                tabBarStyle: { height: 65, paddingTop: 5, },
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