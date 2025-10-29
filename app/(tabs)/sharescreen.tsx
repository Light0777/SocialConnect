import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from 'expo-media-library';
import { useContext } from "react";
import { ProfileContext } from "@/contexts/ProfileContext";

const ShareScreen: React.FC = () => {
    const { profile } = useContext(ProfileContext); // ✅ Get profile from context
    const viewShotRef = useRef<ViewShot>(null);

    const captureImage = async (): Promise<string | null> => {
        try {
            const uri = await viewShotRef.current?.capture?.();
            if (!uri) {
                Alert.alert("Error", "Could not capture the profile.");
                return null;
            }
            return uri; // no need for cacheDirectory, expo-sharing works directly with the captured uri
        } catch (err) {
            console.log("Capture error:", err);
            Alert.alert("Error", "Failed to capture the profile.");
            return null;
        }
    };

    const handleShare = async () => {
        const fileUri = await captureImage();
        if (!fileUri) return;

        try {
            await Sharing.shareAsync(fileUri);
        } catch (err) {
            console.log("Share error:", err);
            Alert.alert("Error", "Failed to share the profile.");
        }
    };

    const handleExportPNG = async () => {
        const fileUri = await captureImage();
        if (!fileUri) return;

        try {
            // Ask for permissions if needed
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Cannot save image without permission');
                return;
            }

            // Save to gallery
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            await MediaLibrary.createAlbumAsync('ProfileCards', asset, false); // false = don’t duplicate if album exists
            Alert.alert('Success', 'Profile card saved to gallery!');
        } catch (err) {
            console.log('Export error:', err);
            Alert.alert('Error', 'Failed to save profile to gallery.');
        }
    };

    return (
        <ScrollView contentContainerStyle={{ paddingTop: 40, alignItems: "center" }}>
            <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
                <View
                    style={{
                        width: "90%",
                        borderRadius: 24,
                        overflow: "hidden",
                        alignItems: "center",
                        paddingVertical: 20,
                        paddingHorizontal: 24,
                        marginBottom: 20,
                        position: "relative",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                        elevation: 10,
                    }}
                >
                    {/* Background */}
                    {profile.bgImage ? (
                        <Image
                            source={{ uri: profile.bgImage }}
                            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "#141414" }} />
                    )}

                    {/* Overlay */}
                    <View
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "rgba(0,0,0,0.3)",
                        }}
                    />

                    {/* Content */}
                    <View style={{ alignItems: "center", zIndex: 2 }}>
                        <Image
                            source={{ uri: profile.profileImg }}
                            style={{
                                width: 130,
                                height: 130,
                                borderRadius: 65,
                                borderWidth: 4,
                                borderColor: profile.bgColor || "#fff",
                                marginBottom: 24,
                            }}
                        />
                        <Text
                            style={{
                                fontSize: 28,
                                fontWeight: "800",
                                color: "#fff",
                                marginBottom: 8,
                                textAlign: "center",
                            }}
                        >
                            {profile.name}
                        </Text>
                        <Text
                            style={{
                                fontSize: 15,
                                color: "rgba(255,255,255,0.9)",
                                textAlign: "center",
                                lineHeight: 22,
                                maxWidth: "85%",
                            }}
                        >
                            {profile.bio}
                        </Text>

                        {/* QR Code */}
                        <View
                            style={{
                                marginTop: 40,
                                alignItems: "center",
                                backgroundColor: "rgba(255,255,255,0.15)",
                                borderRadius: 20,
                                padding: 24,
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: "#fff",
                                    padding: 16,
                                    borderRadius: 16,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 5,
                                }}
                            >
                                <QRCode value={JSON.stringify(profile)} size={180} />
                            </View>
                            <Text
                                style={{
                                    marginTop: 16,
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: "600",
                                }}
                            >
                                Scan to view profile
                            </Text>
                        </View>
                    </View>
                </View>
            </ViewShot>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", marginTop: 10, gap: 12, width: "90%" }}>
                <TouchableOpacity
                    onPress={handleShare}
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#000",
                        paddingVertical: 14,
                        borderRadius: 14,
                        gap: 8,
                        borderWidth: 1,
                        borderColor: "#fff",
                    }}
                >
                    <Ionicons name="share-social" size={20} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleExportPNG}
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#000",
                        paddingVertical: 14,
                        borderRadius: 14,
                        gap: 8,
                         borderWidth: 1,
                        borderColor: "#fff",
                    }}
                >
                    <Ionicons name="download" size={20} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>Export PNG</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default ShareScreen;
