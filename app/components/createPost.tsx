import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Animated,
  PanResponder
} from "react-native";
import { ProfileContext } from "@/contexts/ProfileContext";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function CreatePostScreen() {
  const { profile, addPost } = useContext(ProfileContext)!;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Use refs to track current state values (avoid stale closures)
  const titleRef = useRef(title);
  const descriptionRef = useRef(description);

  // Update refs when state changes
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    descriptionRef.current = description;
  }, [description]);

  // Animation values for slide to publish
  const slideAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  // Animated arrows animation
  useEffect(() => {
    const animateArrows = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animateArrows();
  }, []);

  const handlePublish = async () => {
    // Use refs to get current values (not stale closures)
    const currentTitle = titleRef.current;
    const currentDescription = descriptionRef.current;

    console.log("=== PUBLISH STARTED ===");
    console.log("Title:", `"${currentTitle}"`, "Length:", currentTitle.length);
    console.log("Description:", `"${currentDescription}"`, "Length:", currentDescription.length);
    console.log("Profile ID:", profile.id);

    // SIMPLE VALIDATION
    if (currentTitle.length === 0 || currentDescription.length === 0) {
      Alert.alert("Error", "Please fill in both title and description");
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
      }).start();
      return;
    }

    if (!profile.id) {
      Alert.alert("Error", "User profile not loaded. Please try again.");
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
      }).start();
      return;
    }

    try {
      setLoading(true);

      const postContent = {
        title: currentTitle,
        description: currentDescription,
        userId: profile.id,
        profileImg: profile.profileImg || null,
        bgImage: profile.bgImage || null,
        links: profile.links || [],
        social: profile.social || [],
        userName: profile.name || "Anonymous",
        bio: profile.bio || "",
        bgColor: profile.bgColor || "#ffffff",
      };

      console.log("Sending to backend:", postContent);

      const response = await fetch("http://10.134.54.91:3000/posts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postContent),
      });

      const text = await response.text();
      console.log("Raw response:", text);

      const data = JSON.parse(text);
      console.log("Post created:", data);

      addPost(data.post);
      setTitle("");
      setDescription("");

      Alert.alert("Success", "Post published successfully!", [
        { text: "OK", onPress: () => router.push("/(tabs)/pin") }
      ]);

    } catch (err) {
      console.error("Error uploading post:", err);
      Alert.alert("Error", "Failed to publish post");
    } finally {
      setLoading(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
      }).start();
    }
  };

  // Recreate panResponder when handlePublish changes
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !loading,
      onMoveShouldSetPanResponder: () => !loading,
      onPanResponderMove: (_, gestureState) => {
        if (loading) return;

        // Limit slide to maximum of track width - thumb width
        const maxSlide = 250 - 60;
        const newValue = Math.min(Math.max(0, gestureState.dx), maxSlide);
        slideAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (loading) return;

        const triggerThreshold = 150;
        if (gestureState.dx >= triggerThreshold) {
          handlePublish();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const animatedArrowsStyle = {
    opacity: arrowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        translateX: arrowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 5],
        }),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Small Rectangle Card */}
      <View style={{
        width: "90%",
        borderRadius: 24,
        overflow: "hidden",
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 24,
        marginTop: 20,
        position: "relative",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      }}>
        {/* Profile */}
        {profile.bgImage ? (
          <Image
            source={{ uri: profile.bgImage }}
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "#141414" }} />
        )}
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
        <Image
          source={{ uri: profile.profileImg }}
          style={{
            width: 110,
            height: 110,
            borderRadius: 65,
            borderWidth: 4,
            borderColor: profile.bgColor || "#fff",
            marginBottom: 24,
          }}
        />
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileBio}>{profile.bio}</Text>

        {/* Links */}
        {profile.links?.map((link: any, index: number) => (
          <TouchableOpacity
            key={index}
            onPress={() => Linking.openURL(link.url)}
            style={{ width: "90%", maxWidth: 400, alignSelf: "center", marginTop: 20 }}
          >
            <View
              key={index}
              style={{
                marginVertical: -10,
                borderRadius: 20,
              }}
            >
              <Text style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 8,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 100,
                height: 40,
                backgroundColor: profile.bgColor,
                textAlign: "center"
              }}>{link.title || link.url}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {/* Social Icons */}
        {profile.social && profile.social.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              alignItems: "center",
              paddingVertical: 20,
              gap: 16,
            }}
          >
            {profile.social.map((socialItem: any, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => socialItem.url && Linking.openURL(socialItem.url)}
                style={{
                  alignItems: "center",
                  width: 60,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 30,
                    overflow: "hidden",
                    backgroundColor: "#555",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  {socialItem.icon ? (
                    <Image
                      source={{ uri: socialItem.icon }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 24 }}>+</Text>
                  )}
                </View>
                {socialItem.customName && (
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    {socialItem.customName}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={{
        width: "90%",
        marginTop: "5%"
      }}>
        {/* Inputs */}
        <TextInput
          placeholder="Title *"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Description *"
          placeholderTextColor="#aaa"
          style={[styles.input, { height: 80, textAlign: "left", textAlignVertical: "top" }]}
          value={description}
          onChangeText={setDescription}
          multiline
        />


        {/* Bottom Action Bar */}
        <View style={styles.actionBar}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <View style={[styles.circleButton, loading && { opacity: 0.5 }]}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Slide to Publish */}
          <View style={[styles.sliderContainer, loading && { opacity: 0.7 }]}>
            <View style={styles.sliderTrack}>
              <Text style={styles.sliderText}>
                {loading ? "Publishing..." : "Slide to Post"}
              </Text>
              {!loading && (
                <Animated.View style={[styles.animatedArrows, animatedArrowsStyle]}>
                  <Text style={styles.arrowsText}>› › ›</Text>
                </Animated.View>
              )}
            </View>
            <Animated.View
              style={[
                styles.sliderThumb,
                { transform: [{ translateX: slideAnim }] },
                loading && { opacity: 0.5 }
              ]}
              {...panResponder.panHandlers}
            >
              <View style={styles.thumbCircle}>
                <Ionicons
                  name={loading ? "time" : "arrow-forward"}
                  size={24}
                  color="#000"
                />
              </View>
            </Animated.View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    flexGrow: 1,
  },
  card: {
    width: "90%",
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4
  },
  profileBio: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 12
  },
  linkButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    width: "100%",
  },
  linkText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600"
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#333",
    color: "#fff",
    marginBottom: 12,
  },
  requiredHint: {
    color: "#888",
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  // New styles for slide to publish
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  sliderTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingLeft: 60,
  },
  sliderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  animatedArrows: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderThumb: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
  thumbCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});