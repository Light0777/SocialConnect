import React from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useClerk } from "@clerk/clerk-expo";

const SettingsScreen: React.FC = () => {
  const { signOut } = useClerk();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              // ✅ No routing needed — SignedOut in layout handles it
            } catch (err) {
              console.error("Logout error:", err);
              Alert.alert("Error", "Failed to logout. Try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: "#141414" }}>
      <View style={{ marginTop: 40, alignItems: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 40 }}>
          Settings
        </Text>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ef4444",
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 14,
            gap: 10,
            width: "80%",
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;


// import { useClerk } from '@clerk/clerk-expo'
// import * as Linking from 'expo-linking'
// import { Text, TouchableOpacity } from 'react-native'

// export const SignOutButton = () => {
//   // Use `useClerk()` to access the `signOut()` function
//   const { signOut } = useClerk()
//   const handleSignOut = async () => {
//     try {
//       await signOut()
//       // Redirect to your desired page
//       Linking.openURL(Linking.createURL('/'))
//     } catch (err) {
//       // See https://clerk.com/docs/custom-flows/error-handling
//       // for more info on error handling
//       console.error(JSON.stringify(err, null, 2))
//     }
//   }
//   return (
//     <TouchableOpacity onPress={handleSignOut}>
//       <Text>Sign out</Text>
//     </TouchableOpacity>
//   )
// }