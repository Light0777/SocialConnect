import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo";

const API_BASE = "https://socialconnect-backend-7hog.onrender.com/api/users";

export const handleUpdateProfile = async (profileData: any, setProfile: any, getToken: any) => {
  try {
    const token = await getToken({ template: "backend" });
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const text = await response.text();
    console.log("Server response:", text);
    const data = JSON.parse(text);

    if (!response.ok) throw new Error(data.error || "Failed to update profile");

    setProfile(data.user);
    await AsyncStorage.setItem("profileCache", JSON.stringify(data.user));
  } catch (err: any) {
    console.error("Update profile error:", err);
    Alert.alert("Error", err.message);
  }
};