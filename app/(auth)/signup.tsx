// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { useContext } from "react";
// import { ProfileContext } from "@/contexts/ProfileContext";
// import validator from "validator";


// const API_BASE = "http://10.134.54.91:3000/api/users";

// export default function SignupScreen() {
//   const { setProfile } = useContext(ProfileContext)!;
//   const navigation = useNavigation<any>();
//   const [username, setusername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const DEFAULT_TENANT = "tenant_1";

//   // const handleSignup = async () => {
//   //   if (!username || !email || !password) {
//   //     Alert.alert("Error", "Please fill all fields");
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   try {
//   //     const response = await fetch(`${API_BASE}/register`, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ username, email, password, tenantId: DEFAULT_TENANT })
//   //     });

//   //     const data = await response.json();

//   //     if (!response.ok) throw new Error(data.error || "Something went wrong");

//   //     Alert.alert("Success", data.message || "Registered successfully!");
//   //     navigation.replace("(auth)/login");
//   //     setProfile({
//   //       id: data.user.id,
//   //       name: data.user.username,
//   //       bio: "",
//   //       profileImg: "https://via.placeholder.com/120",
//   //       bgColor: "#989a9c",
//   //       bgImage: null,
//   //       links: [],
//   //       social: [],
//   //     });
//   //   }
//   //   catch (err: any) {
//   //     Alert.alert("Signup Failed", err.message || "Unknown error occurred");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleSignup = async () => {
//     if (!username || !email || !password) {
//       Alert.alert("Error", "Please fill all fields");
//       return;
//     }

//     // ✅ Email validation
//     if (!validator.isEmail(email)) {
//       Alert.alert("Error", "Invalid email address");
//       return;
//     }

//     // ✅ Password strength check (optional)
//     if (password.length < 6) {
//       Alert.alert("Error", "Password must be at least 6 characters");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE}/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, email, password, tenantId: DEFAULT_TENANT }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Something went wrong");

//       Alert.alert("Success", data.message || "Registered successfully!");
//       navigation.replace("(auth)/login");
//       setProfile({
//         id: data.user.id,
//         name: data.user.username,
//         bio: "",
//         profileImg: "https://via.placeholder.com/120",
//         bgColor: "#989a9c",
//         bgImage: null,
//         links: [],
//         social: [],
//       });
//     } catch (err: any) {
//       Alert.alert("Signup Failed", err.message || "Unknown error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Sign Up</Text>

//       <TextInput
//         placeholder="Name"
//         placeholderTextColor="#aaa"
//         value={username}
//         onChangeText={setusername}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Email"
//         placeholderTextColor="#aaa"
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//         keyboardType="email-address"
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Password"
//         placeholderTextColor="#aaa"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         style={styles.input}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
//         <Text style={styles.buttonText}>{loading ? "Signing up..." : "Sign Up"}</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate("Login")}>
//         <Text style={styles.link}>Already have an account? Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#1a1a1a" },
//   title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#fff" },
//   input: { width: "100%", padding: 12, borderRadius: 8, backgroundColor: "#333", color: "#fff", marginBottom: 12 },
//   button: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 8, width: "100%", alignItems: "center", marginBottom: 10 },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   link: { color: "#4CAF50", marginTop: 10 },
// });


import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";

export default function Signup() {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignup = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
      }
    } catch (err) {
      console.error("Google Signup Error:", err);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          width: "90%",
          backgroundColor: "#222",
          padding: 25,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#fff",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={handleGoogleSignup}
          style={{
            width: "100%",
            backgroundColor: "#4285F4",
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Sign up with Google
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#fff" }}>
            Already have an account?{" "}
            <Link href="/(auth)/login" style={{ fontWeight: "bold", color: "#4DA6FF" }}>
              Login
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
