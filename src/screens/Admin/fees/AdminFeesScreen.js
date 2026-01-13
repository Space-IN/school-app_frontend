//src\screens\Admin\fees\AdminFeesScreen.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ManageFeesTab from "./ManageFeesTab";
import ViewFeesTab from "./ViewFeesTab";

const Tab = createMaterialTopTabNavigator();

export default function AdminFeesScreen() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarIndicatorStyle: { backgroundColor: "#ac1d1d" },
          tabBarLabelStyle: { fontWeight: "700" },
          tabBarStyle: { backgroundColor: "#fff" },
        }}
      >
        <Tab.Screen
          name="ManageFees"
          component={ManageFeesTab}
          options={{ title: "Manage Fees" }}
        />
        <Tab.Screen
          name="ViewFees"
          component={ViewFeesTab}
          options={{ title: "View Fees" }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
