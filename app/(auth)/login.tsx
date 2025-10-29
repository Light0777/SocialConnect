// import React, { useState, useContext, useEffect } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import { ProfileContext } from "@/contexts/ProfileContext";

// const API_BASE = "http://10.134.54.91:3000/api/users";

// export default function LoginScreen() {
//   const { setProfile } = useContext(ProfileContext)!;
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const DEFAULT_TENANT = "tenant_1";

//   useEffect(() => {
//     const checkSavedUser = async () => {
//       try {
//         const savedUser = await AsyncStorage.getItem("user");
//         const authToken = await AsyncStorage.getItem("authToken");

//         if (!savedUser || !authToken) return; // Not logged in

//         // ⛔️ If the backend only gives dummy tokens, skip verification for now
//         if (authToken === "dummy-token") {
//           console.log("Dummy token detected — skipping verification for now.");
//           const parsedUser = JSON.parse(savedUser);
//           setProfile(parsedUser);
//           router.replace("/(tabs)");
//           return;
//         }

//         // ✅ Example of how you’d verify real tokens (if backend supports it)
//         const verifyRes = await fetch(`${API_BASE}/verify`, {
//           method: "GET",
//           headers: { Authorization: `Bearer ${authToken}` },
//         });

//         if (!verifyRes.ok) {
//           console.log("Invalid or expired token. Logging out.");
//           await AsyncStorage.removeItem("user");
//           await AsyncStorage.removeItem("authToken");
//           return;
//         }

//         // Load user profile
//         const parsedUser = JSON.parse(savedUser);
//         setProfile(parsedUser);

//         // Fetch latest profile data
//         const res = await fetch(`${API_BASE}/${parsedUser.id}`);
//         const text = await res.text();
//         console.log("Raw response:", text);

//         let data: any;
//         try {
//           data = JSON.parse(text);
//         } catch {
//           console.warn("Response is not valid JSON:", text);
//           return;
//         }

//         if (res.ok && data.user) {
//           const latestProfile = {
//             id: data.user.id,
//             name: data.user.username,
//             bio: data.user.bio ?? "",
//             profileImg: data.user.profileImg ?? "",
//             bgColor: data.user.bgColor ?? "#ffffff",
//             bgImage: data.user.bgImage ?? null,
//             links: data.user.links ?? [],
//             social: data.user.social ?? [],
//           };

//           setProfile(latestProfile);
//           await AsyncStorage.setItem("user", JSON.stringify(latestProfile));
//         }

//         router.replace("/(tabs)");
//       } catch (err) {
//         console.warn("Failed to fetch latest profile:", err);
//       }
//     };

//     checkSavedUser();
//   }, []);




//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert("Error", "All fields are required");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE}/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password: password.trim(), tenantId: DEFAULT_TENANT }),
//       });

//       // 🔹 Debug raw server response
//       const text = await response.text();
//       console.log("Server response:", text);

//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch {
//         throw new Error("Server did not return valid JSON. Check console for response.");
//       }

//       if (!response.ok) {
//         throw new Error(data.error || `Server returned status ${response.status}`);
//       }

//       const { user, token } = data;

//       // ✅ Save auth token
//       if (token) await AsyncStorage.setItem("authToken", token);

//       // ✅ Save user ID for future update requests
//       await AsyncStorage.setItem("userId", user.id.toString());

//       // ✅ Save user profile in context and AsyncStorage
//       const existing = JSON.parse(await AsyncStorage.getItem("user") || "{}");
//       const userProfile = {
//         id: user.id,
//         name: user.username,
//         bio: user.bio ?? existing.bio ?? "",
//         profileImg: user.profileImg?.trim() || existing.profileImg || "https://via.placeholder.com/120",
//         bgColor: user.bgColor || existing.bgColor || "#989a9c",
//         bgImage: user.bgImage?.trim() || existing.bgImage || null,
//         links: user.links?.length ? user.links : existing.links || [],
//         social: user.social?.length ? user.social : existing.social || [],
//       };

//       setProfile(userProfile);
//       await AsyncStorage.setItem("user", JSON.stringify(userProfile));

//       Alert.alert("Success", `Welcome back, ${user.username}`);
//       router.replace("/(tabs)");
//     } catch (err: any) {
//       console.error("Login error:", err);
//       Alert.alert("Error", err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>

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

//       <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
//         <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
//         <Text style={styles.link}>Don't have an account? Sign up</Text>
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
import { Link, useRouter } from "expo-router";

export default function Login() {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace("/(tabs)"); // ✅ Redirect correctly
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
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
          onPress={handleGoogleLogin}
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
            Login with Google
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
