// this is my homepage

import { Image, TouchableOpacity, View, Text, TextInput, ScrollView, StatusBar, Animated, Platform, Alert, } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ThemedView } from "@/components/themed-view";
import React, { useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import { AntDesign } from "@expo/vector-icons";
import ColorPicker from 'react-native-wheel-color-picker';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { Linking } from "react-native";
import { ProfileContext } from '@/contexts/ProfileContext';
import { useContext } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleUpdateProfile } from "@/utils/profile";
import { useRouter } from "expo-router";
import { useUser } from '@clerk/clerk-expo';
import { useAuth } from "@clerk/clerk-expo";


export default function HomeScreen() {
  const { getToken } = useAuth();

  const { user } = useUser(); // this gives you the logged-in user
  const userId = user?.id;    // Clerk’s user ID

  const { profile, setProfile } = useContext(ProfileContext);

  // Use defaults if profile is not yet loaded
  const [imageLoadError, setImageLoadError] = React.useState(false);
  const [name, setName] = React.useState(profile?.name || '');
  const [bio, setBio] = React.useState(profile?.bio || '');
  const [profileImg, setProfileImg] = React.useState(profile?.profileImg || '');
  const [links, setLinks] = React.useState(profile?.links || []);
  const [social, setSocial] = React.useState(profile?.social || []);
  const [bgImage, setBgImage] = React.useState(profile?.bgImage || null);
  const [themeColor, setThemeColor] = React.useState(profile?.bgColor || '#ffffff');
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [isPublishPressed, setIsPublishPressed] = React.useState(false);

  const [isPublishOpen, setIsPublishOpen] = React.useState(false);
  const togglePublish = () => {
    setIsPublishOpen(prev => !prev);
  };

  const getProfileImageSource = () => {
    // if previous load failed, force placeholder
    if (imageLoadError) {
      return { uri: "https://via.placeholder.com/150.png" };
    }

    // priority: local profileImg state > local bgImage state > context profile > placeholder
    if (profileImg && profileImg.trim().length > 0) {
      return { uri: profileImg };
    }

    if (bgImage && bgImage.trim().length > 0) {
      return { uri: bgImage };
    }

    // fall back to context ONLY if local states are empty
    if (profile?.profileImg && profile.profileImg.trim().length > 0) {
      return { uri: profile.profileImg };
    }

    if (profile?.bgImage && profile.bgImage.trim().length > 0) {
      return { uri: profile.bgImage };
    }

    // final fallback
    return { uri: "https://via.placeholder.com/150.png" };
  };


  const router = useRouter(); // if you use routing

  // -------------------- Add this useEffect --------------------
  // ✅ FIXED: Only run when user.id is available to prevent double requests
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        // 1️⃣ Load from AsyncStorage
        const savedUser = await AsyncStorage.getItem("profileCache");
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;

        if (parsedUser) {
          setProfile(parsedUser);
          setName(parsedUser.name);
          setBio(parsedUser.bio);
          setProfileImg(parsedUser.profileImg);
          setLinks(parsedUser.links);
          setSocial(parsedUser.social);
          setBgImage(parsedUser.bgImage);
          setThemeColor(parsedUser.bgColor);
        }

        // 2️⃣ Fetch from server to get latest, merge with local
        if (!user?.id) return; // Clerk still loading user
        // const res = await fetch(`https://hithermost-hobert-shyly.ngrok-free.dev/api/users/${user.id}`);
        const res = await fetch(`https://socialconnect-backend-7hog.onrender.com/api/users/${user.id}`);

        const data = await res.json();

        if (data.user) {
          const latestProfile = {
            ...data.user,
            name: parsedUser?.name || data.user.username,
            bio: parsedUser?.bio ?? data.user.bio ?? "",
            profileImg: parsedUser?.profileImg ?? data.user.profileImg ?? "",
            bgColor: parsedUser?.bgColor ?? data.user.bgColor ?? "#ffffff",
            bgImage: parsedUser?.bgImage ?? data.user.bgImage ?? null,
            links: parsedUser?.links ?? data.user.links ?? [],
            social: parsedUser?.social ?? data.user.social ?? [],
          };
          setProfile(latestProfile);

          setName(latestProfile.name);
          setBio(latestProfile.bio);
          setProfileImg(latestProfile.profileImg);
          setLinks(latestProfile.links);
          setSocial(latestProfile.social);
          setBgImage(latestProfile.bgImage);
          setThemeColor(latestProfile.bgColor);

          await AsyncStorage.setItem("profileCache", JSON.stringify(latestProfile));
        }
      } catch (err) {
        console.warn("Failed to load profile", err);
        console.log("User ID:", user?.id);
      }
    };

    // ✅ Only load profile when user ID is available
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]); // ✅ Now depends only on user.id, not the entire user object



  const toggleEditMode = async () => {
    if (editMode) {
      // update context immediately so UI shows latest name/bio
      setProfile(prev => {
        if (!prev) return prev; // no update when profile is missing
        return {
          ...prev,
          name,
          bio,
          profileImg,
          links,
          social,
          bgColor: themeColor,
          bgImage,
        };
      });
      // save to backend
      await saveProfile();
    }

    // toggle edit mode
    setEditMode(!editMode);
  };

  React.useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio);
      setProfileImg(profile.profileImg);
      setLinks(profile.links);
      setSocial(profile.social);
      setBgImage(profile.bgImage);
      setThemeColor(profile.bgColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once on mount



  const canvasAnim = React.useRef(new Animated.Value(0)).current; // 0 = normal, 1 = shrunk & up

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const scaleAnim = useRef(new Animated.Value(1)).current; // start at normal size

  const openColorPicker = () => {
    setShowColorPicker(true);
    scaleAnim.setValue(1); // ensure it starts at normal size
    Animated.timing(scaleAnim, {
      toValue: 0.8,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeColorPicker = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowColorPicker(false));
  };


  React.useEffect(() => {
    if (showColorPicker) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(canvasAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(canvasAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showColorPicker]);


  React.useEffect(() => {
    if (editMode) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [editMode]);

  const uploadImage = async (uri: string) => {
    const formData = new FormData();

    // Cast the object to 'any' to bypass TS type error
    formData.append('image', {
      uri,
      name: 'image.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await fetch('http://10.134.54.91:3000/api/users/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    return data.url; // permanent URL from backend
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission denied');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const uploadedUrl = await uploadImage(uri);
      setProfileImg(uploadedUrl);
      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, profileImg: uploadedUrl }; // ✅ FIXED: was bgImage, now profileImg
      });
    }
  };

  const pickBackgroundImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission denied');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const uploadedUrl = await uploadImage(uri);
      setBgImage(uploadedUrl);
      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, bgImage: uploadedUrl };
      });

    }
  };


  const pickSocialIcon = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Please allow access to photo library");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newSocial = [...social];
      newSocial[index].icon = result.assets[0].uri;
      setSocial(newSocial);
    }
  };

  const addLink = () => setLinks([...links, { title: "", url: "", isNew: true }]);

  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;

    // If user starts typing, mark it not new anymore
    if (newLinks[index].isNew && value.trim() !== "") {
      newLinks[index].isNew = false;
    }

    setLinks(newLinks);
  };

  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  const addSocial = () => setSocial([...social, { type: "link", url: "", icon: null, customName: "New Link" }]);
  const updateSocial = (index: number, field: 'url' | 'customName', value: string) => {
    const newSocial = [...social];
    newSocial[index][field] = value;
    setSocial(newSocial);
  };
  const removeSocial = (index: number) => setSocial(social.filter((_, i) => i !== index));

  const getContrastColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const getDarkerColor = (hexColor: string, amount: number = 30) => {
    const hex = hexColor.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const getSocialIconColor = (type: string) => {
    switch (type) {
      case "youtube": return "#FF0000";
      case "instagram": return "#E4405F";
      case "twitter": return "#1DA1F2";
      case "facebook": return "#3b5998";
      case "linkedin": return "#0077b5";
      case "tiktok": return "#000000";
      default: return "#fff";
    }
  };

  // link error handler notification

  const handleLinkPress = (url: string | undefined) => {
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      Alert.alert(
        "Invalid URL",
        "Please enter the full URL starting with https:// or http://",
        [{ text: "OK" }]
      );
      return;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            "Cannot open link",
            "This link cannot be opened on your device.",
            [{ text: "OK" }]
          );
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  // save profile
  // const API_BASE = "https://hithermost-hobert-shyly.ngrok-free.dev/api/users";
  const API_BASE = "https://socialconnect-backend-7hog.onrender.com/api/users";

  const saveProfile = async () => {
    const userId = user?.id;
    if (!userId) {
      return Alert.alert("Error", "User ID not found. Please log in again.");
    }

    const profileData = {
      id: userId,
      username: name, // Add username field, using name as the value
      name,
      bio,
      profileImg,
      links,
      social,
      bgColor: themeColor,
      bgImage,
    };


    try {
      await handleUpdateProfile(profileData, setProfile, getToken);

      // Save clean profile locally
      await AsyncStorage.setItem("profileCache", JSON.stringify(profileData));

      setProfile((prev) => prev ? { ...prev, ...profileData } : profileData);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar barStyle={bgImage ? "light-content" : "dark-content"} />

      {/* Background */}
      {bgImage ? (
        <Image
          source={{
            uri:
              bgImage && bgImage.trim().length > 0
                ? bgImage
                : "https://via.placeholder.com/800x600.png"
          }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
          resizeMode="cover"
        />

      ) : (
        <View style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          backgroundColor: themeColor,
        }} />
      )}

      {/* Overlay for better readability */}
      {(bgImage || themeColor) && (
        <View style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: 'rgba(0,0,0,0.3)',
          top: 0,
          left: 0,
        }} />
      )}

      {/* Header Controls */}
      <View style={{
        position: "absolute",
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 1000,
      }}>
        {/* Edit Toggle */}
        <LiquidGlassView
          style={[
            {
              padding: 15,
              borderRadius: 50,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                },
                android: {
                  elevation: 5,
                },
              }),
            },
            !isLiquidGlassSupported && {
              backgroundColor: editMode ? themeColor : 'rgba(255,255,255,0.2)',
            }
          ]}
          effect="clear"
          interactive >
          <TouchableOpacity
            onPress={async () => {
              if (editMode) await saveProfile();
              setEditMode(!editMode);
            }}
          >
            <Feather name={editMode ? "check" : "edit"} size={24} color="#fff" />
          </TouchableOpacity>


        </LiquidGlassView>

        {/* Publish Button - only show when editMode is false */}
        {!editMode && (
          <Animated.View
            style={{
              position: "absolute",
              right: 20,
              zIndex: 2000,
              transform: [{ scale: isPublishPressed ? 0.9 : 1 }],
            }}
          >
            <LiquidGlassView
              style={[
                {
                  padding: 15,
                  borderRadius: 50,
                  ...Platform.select({
                    ios: {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.35,
                      shadowRadius: 5,
                    },
                    android: { elevation: 6 },
                  }),
                },
                !isLiquidGlassSupported && { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
              effect="clear"
              interactive
            >
              <TouchableOpacity
                onPress={() => router.push("/components/createPost")}
                onPressIn={() => setIsPublishPressed(true)}
                onPressOut={() => setIsPublishPressed(false)}
                activeOpacity={0.8}
              >
                <Feather name="upload" size={24} color="#fff" />
              </TouchableOpacity>
            </LiquidGlassView>
          </Animated.View>
        )}

        {/* Edit Mode Controls */}
        <Animated.View style={{
          flexDirection: 'row',
          gap: 10,
          transform: [{ translateX: slideAnim }],
          opacity: editMode ? 1 : 0,
        }}>
          <LiquidGlassView
            style={[
              {
                padding: 15,
                borderRadius: 50,
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  },
                  android: {
                    elevation: 5,
                  },
                }),
              },
              !isLiquidGlassSupported && {
                backgroundColor: 'rgba(255,255,255,0.2)',
              }
            ]}
            effect="clear"
            interactive
          >
            <TouchableOpacity onPress={pickBackgroundImage}>
              <MaterialIcons name="photo-library" size={24} color="#fff" />
            </TouchableOpacity>
          </LiquidGlassView>

          <LiquidGlassView
            style={[
              {
                padding: 13,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.3)',
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  },
                  android: {
                    elevation: 5,
                  },
                }),
              },
              !isLiquidGlassSupported && {
                backgroundColor: themeColor,
              }
            ]}
            effect="clear"
            interactive
          >
            <TouchableOpacity onPress={() => setShowColorPicker(!showColorPicker)}>
              <MaterialIcons name="palette" size={24} color="#fff" />
            </TouchableOpacity>
          </LiquidGlassView>
        </Animated.View>
      </View>


      <Animated.View
        style={{
          flex: 1,
          transform: [
            {
              scale: canvasAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.95], // shrink slightly
              }),
            },
            {
              translateY: canvasAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -50], // move up when picker opens
              }),
            },
          ],
        }}
      >
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingTop: Platform.OS === 'ios' ? 120 : 100,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >

          {/* Profile Section */}
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <View style={{ position: 'relative' }}>
              <Image
                source={getProfileImageSource()}
                onError={() => setImageLoadError(true)}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 4,
                  borderColor: themeColor,
                }}
              />

              {editMode && (
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    backgroundColor: themeColor,
                    borderRadius: 25,
                    width: 50,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 3,
                    borderColor: 'white',
                    ...Platform.select({
                      ios: {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                      },
                      android: {
                        elevation: 5,
                      },
                    }),
                  }}
                >
                  <Feather name="camera" size={22} color={getContrastColor(themeColor)} />
                </TouchableOpacity>
              )}
            </View>

            {/* Name & Bio */}
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              {editMode ? (
                <>
                  <LiquidGlassView
                    style={[
                      {
                        borderRadius: 25,
                        marginBottom: 10,
                        minWidth: 200,
                      },
                      !isLiquidGlassSupported && {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }
                    ]}
                    effect="clear"
                    interactive
                  >
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      style={{
                        fontSize: 28,
                        fontWeight: "bold",
                        color: "#fff",
                        textAlign: "center",
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                      }}
                      placeholder="Your Name"
                      placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                  </LiquidGlassView>
                  <LiquidGlassView
                    style={[
                      {
                        borderRadius: 25,
                        minWidth: 250,
                      },
                      !isLiquidGlassSupported && {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }
                    ]}
                    effect="clear"
                    interactive
                  >
                    <TextInput
                      value={bio}
                      onChangeText={setBio}
                      style={{
                        fontSize: 16,
                        color: "rgba(255,255,255,0.9)",
                        textAlign: "center",
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                      }}
                      placeholder="Your bio"
                      placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                  </LiquidGlassView>
                </>
              ) : (
                <>
                  <Text style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#fff",
                    textAlign: 'center',
                    marginBottom: 8,
                    ...Platform.select({
                      ios: {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                      },
                    }),
                  }}>{name}</Text>
                  <Text style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.9)",
                    textAlign: 'center',
                    ...Platform.select({
                      ios: {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                      },
                    }),
                  }}>{bio}</Text>
                </>
              )}
            </View>
          </View>

          {/* Links Section - Theme Colored Liquid Glass */}
          <View style={{ width: "100%", maxWidth: 400, alignSelf: "center", marginTop: 20 }}>
            {links.map((link, index) => (
              <View
                key={index}
                style={{
                  marginVertical: 8,
                  borderRadius: 30,
                  backgroundColor: editMode ? `${themeColor}50` : `${themeColor}`,
                }}
              >
                {editMode ? (
                  <View style={{ padding: 12 }}>
                    {/* Title Input */}
                    <TextInput
                      value={link.title}
                      onChangeText={(text) => updateLink(index, "title", text)}
                      placeholder="Title"
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 8,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        backgroundColor: `${themeColor}`,
                      }}
                    />

                    {/* URL Input */}
                    <TextInput
                      value={link.url || ""}
                      onChangeText={(text) => updateLink(index, "url", text)}
                      placeholder="https://..."
                      style={{
                        color: "white",
                        fontSize: 14,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        backgroundColor: `${themeColor}`,
                      }}
                    />

                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={() => removeLink(index)}
                      style={{
                        marginTop: 10,
                        alignSelf: "flex-end",
                        padding: 6,
                        borderRadius: 8,
                        backgroundColor: "red",
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(link.url)}
                    style={{
                      paddingVertical: 16,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {link.title}
                    </Text>
                  </TouchableOpacity>

                )}
              </View>
            ))}

            {/* Add Link */}
            {editMode && (
              <TouchableOpacity
                onPress={addLink}
                style={{
                  marginTop: 12,
                  paddingVertical: 14,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 16 }}>+ Add Link</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Social Media Section */}
          <KeyboardAwareScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              alignItems: "center",
            }}
            enableOnAndroid={true}
            extraScrollHeight={100}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: "center",
              }}
              style={{ marginTop: 40, marginBottom: 90 }}
            >
              {social.map((socialItem, index) => (
                <View
                  key={index}
                  style={{ alignItems: "center", width: 100 }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (editMode) {
                        pickSocialIcon(index);
                      } else if (socialItem.url) {
                        Linking.openURL(socialItem.url);
                      }
                    }}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 100,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    {socialItem.icon ? (
                      <Image
                        source={{
                          uri:
                            socialItem.icon && socialItem.icon.trim().length > 0
                              ? socialItem.icon
                              : "https://via.placeholder.com/50.png"
                        }}
                        style={{ width: "100%", height: "100%" }}
                      />

                    ) : (
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#ccc",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Feather name="plus" size={28} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {editMode ? (
                    <>
                      {/* 🔹 Title field */}
                      <TextInput
                        value={socialItem.customName}
                        onChangeText={(text) => updateSocial(index, "customName", text)}
                        placeholder="Title (e.g. YouTube)"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          textAlign: "center",
                          marginBottom: 4,
                          width: "100%",
                        }}
                      />
                      {/* 🔹 Link field */}
                      <TextInput
                        value={socialItem.url}
                        onChangeText={(text) => updateSocial(index, "url", text)}
                        placeholder="Link"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        style={{
                          color: "#fff",
                          fontSize: 10,
                          textAlign: "center",
                          width: "100%",
                        }}
                      />
                      {/* 🔹 Remove button */}
                      <TouchableOpacity
                        onPress={() => removeSocial(index)}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: -5,
                          backgroundColor: "#ff4757",
                          borderRadius: 12,
                          width: 24,
                          height: 24,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <AntDesign name="close" size={12} color="#fff" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    socialItem.customName && (
                      <Text
                        style={{ color: "#fff", fontSize: 12, textAlign: "center" }}
                        onPress={() => socialItem.url && Linking.openURL(socialItem.url)}
                      >
                        {socialItem.customName}
                      </Text>
                    )
                  )}
                </View>
              ))}

              {editMode && (
                <TouchableOpacity
                  onPress={addSocial}
                  style={{ alignItems: "center", width: 100, }}
                >
                  <View
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 100,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Feather name="plus" size={28} color="#fff" />
                  </View>
                  <Text style={{ color: "#fff", fontSize: 12 }}>Add</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </KeyboardAwareScrollView>

        </ScrollView>
      </Animated.View>

      {
        showColorPicker && (
          <Animated.View
            style={{
              backgroundColor: "rgba(255,255,255,0.1)", // semi-transparent
              borderTopEndRadius: 30,
              borderTopLeftRadius: 30,
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 30,
              zIndex: 2000,
              padding: 20,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <View
              style={{
                padding: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}></Text>

                <TouchableOpacity
                  onPress={closeColorPicker}
                  style={{
                    backgroundColor: "#f2f2f2",
                    paddingVertical: 6,
                    paddingHorizontal: 15,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#333", fontWeight: "600" }}>Apply</Text>
                </TouchableOpacity>
              </View>

              <ColorPicker
                color={themeColor}
                onColorChange={setThemeColor}
                thumbSize={28}
                sliderSize={28}
                noSnap={true}
                row={false}
                swatches={true}
              />
            </View>
          </Animated.View>
        )
      }


    </ThemedView >
  );
}