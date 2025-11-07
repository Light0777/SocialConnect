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
