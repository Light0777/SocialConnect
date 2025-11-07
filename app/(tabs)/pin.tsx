import { useContext, useEffect, useState } from "react";
import { ProfileContext } from "@/contexts/ProfileContext";
import { Post } from "@/contexts/ProfileContext";
import { ScrollView, View, Text, Image, TouchableOpacity, Linking, Modal, Animated, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function PinScreen() {
    const { posts, fetchPosts } = useContext(ProfileContext)!;
    const [shuffledPosts, setShuffledPosts] = useState<Post[]>([]);
    const [hasShuffled, setHasShuffled] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const { width, height } = Dimensions.get('window');

    useEffect(() => {
        fetchPosts();
        const interval = setInterval(fetchPosts, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
    if (!hasShuffled && posts.length > 0) {
        const randomized = [...posts].sort(() => Math.random() - 0.5);
        setShuffledPosts(randomized);
        setHasShuffled(true);
    }
}, [posts]);



    const handlePostPress = (post: Post) => {
        setSelectedPost(post);
        setModalVisible(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
            setSelectedPost(null);
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{
                    padding: 10,
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginTop: 20,
                }}
            >
                <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {posts.length === 0 ? (
                        <View style={{ width: '100%', padding: 50 }}>
                            <Text style={{ color: "#fff", textAlign: "center" }}>No posts yet</Text>
                        </View>
                    ) : (
                        shuffledPosts.map((post, index) => (
                            <TouchableOpacity
                                key={post.id}
                                onPress={() => handlePostPress(post)}
                                style={{
                                    width: '48%',
                                    marginBottom: 20,
                                    borderRadius: 16,
                                    overflow: "hidden",
                                    backgroundColor: "#222",
                                    alignSelf: 'flex-start',
                                }}
                            >
                                {/* Background Image */}
                                {post.bgImage && (
                                    <Image
                                        source={{ uri: post.bgImage }}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        resizeMode="cover"
                                    />
                                )}
                                <View
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: "rgba(0,0,0,0.3)",
                                    }}
                                />

                                <View style={{ padding: 12 }}>
                                    {/* Profile Image */}
                                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                                        {post.image && (
                                            <Image
                                                source={{ uri: post.image }}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: 30,
                                                    borderWidth: 3,
                                                    borderColor: post.bgColor || "#fff",
                                                    marginBottom: 12,
                                                }}
                                            />
                                        )}
                                    </View>

                                    {/* Name and Bio */}
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "800",
                                            color: "#fff",
                                            marginBottom: 6,
                                            textAlign: "center",
                                        }}
                                    >
                                        {post.userName || "name"}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: "rgba(255,255,255,0.9)",
                                            textAlign: "center",
                                            lineHeight: 16,
                                            marginBottom: 8,
                                        }}
                                        numberOfLines={3}
                                    >
                                        {post.bio || "bio"}
                                    </Text>

                                    {/* Links - Limited display */}
                                    {post.links && post.links.length > 0 && (
                                        <View style={{ marginTop: 8 }}>
                                            {post.links.slice(0, 3).map((link, index) => (
                                                <View
                                                    key={index}
                                                    style={{
                                                        backgroundColor: post.bgColor || "#333",
                                                        borderRadius: 100,
                                                        padding: 6,
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: "#fff",
                                                            textAlign: "center",
                                                            fontSize: 12,
                                                            fontWeight: "500",
                                                        }}
                                                        numberOfLines={1}
                                                    >
                                                        {link.title || link.url}
                                                    </Text>
                                                </View>
                                            ))}
                                            {post.links.length > 3 && (
                                                <Text style={{ color: "#fff", textAlign: "center", fontSize: 10 }}>
                                                    +{post.links.length - 3} more
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                    {/* Social Icons - Smaller and limited */}
                                    {post.social && post.social.length > 0 && (
                                        <View style={{ marginTop: 10 }}>
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={{ gap: 8 }}
                                            >
                                                {post.social.slice(0, 4).map((socialItem, index) => (
                                                    <View
                                                        key={index}
                                                        style={{
                                                            alignItems: "center",
                                                            width: 40,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 18,
                                                                overflow: "hidden",
                                                                backgroundColor: "#555",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            {socialItem.icon ? (
                                                                <Image
                                                                    source={{ uri: socialItem.icon }}
                                                                    style={{ width: "100%", height: "100%" }}
                                                                />
                                                            ) : (
                                                                <Text style={{ color: "#fff", fontSize: 18 }}>+</Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Expanded Post Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={closeModal}
            >
                <Animated.View
                    style={{
                        flex: 1,
                        borderTopEndRadius: 30,
                        borderTopLeftRadius: 30,
                        backgroundColor: 'black',
                        opacity: fadeAnim,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        {/* Close Button - Fixed at top */}
                        <TouchableOpacity
                            onPress={closeModal}
                            style={{
                                position: 'absolute',
                                top: 23,
                                right: 20,
                                zIndex: 10,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>×</Text>
                        </TouchableOpacity>

                        <ScrollView
                            contentContainerStyle={{
                                flexGrow: 1,
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                paddingVertical: 20,
                            }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Card Content - Takes full width and adjusts to content */}
                            <View
                                style={{
                                    width: width * 0.9,
                                    backgroundColor: "#222",
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    marginBottom: 30,
                                }}
                            >
                                {selectedPost && (
                                    <>
                                        {/* Background Image */}
                                        {selectedPost.bgImage && (
                                            <Image
                                                source={{ uri: selectedPost.bgImage }}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                }}
                                                resizeMode="cover"
                                            />
                                        )}
                                        <View
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: "rgba(0,0,0,0.5)",
                                            }}
                                        />

                                        <View style={{ padding: 20 }}>
                                            {/* Profile Image */}
                                            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 10 }}>
                                                {selectedPost.image && (
                                                    <Image
                                                        source={{ uri: selectedPost.image }}
                                                        style={{
                                                            width: 140,
                                                            height: 140,
                                                            borderRadius: 100,
                                                            borderWidth: 4,
                                                            borderColor: selectedPost.bgColor || "#fff",
                                                            marginBottom: 20,
                                                        }}
                                                    />
                                                )}
                                            </View>

                                            <Text
                                                style={{
                                                    fontSize: 28,
                                                    fontWeight: "800",
                                                    color: "#fff",
                                                    marginBottom: 8,
                                                    textAlign: "center",
                                                }}
                                            >{selectedPost.userName || "name"}</Text>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    color: "rgba(255,255,255,0.9)",
                                                    textAlign: "center",
                                                    lineHeight: 22,
                                                    marginBottom: 20,
                                                }}
                                            >{selectedPost.bio || "bio"}</Text>

                                            {/* Links - Show All */}
                                            {selectedPost.links && selectedPost.links.length > 0 && (
                                                <View style={{ marginTop: 14 }}>
                                                    {selectedPost.links.map((link, index) => (
                                                        <TouchableOpacity
                                                            key={index}
                                                            onPress={() => link.url && Linking.openURL(link.url)}
                                                            style={{
                                                                backgroundColor: selectedPost.bgColor || "#333",
                                                                borderRadius: 100,
                                                                padding: 12,
                                                                marginBottom: 10,
                                                            }}
                                                        >
                                                            <Text style={{ color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "500", }}>
                                                                {link.title || link.url}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}

                                            {/* Social Icons - Show All */}
                                            {selectedPost.social && selectedPost.social.length > 0 && (
                                                <View style={{ marginTop: 20, marginBottom: 20 }}>
                                                    <ScrollView
                                                        horizontal
                                                        showsHorizontalScrollIndicator={false}
                                                        contentContainerStyle={{ gap: 16, justifyContent: 'center', flexGrow: 1 }}
                                                    >
                                                        {selectedPost.social.map((socialItem, index) => (
                                                            <TouchableOpacity
                                                                key={index}
                                                                onPress={() => socialItem.url && Linking.openURL(socialItem.url)}
                                                                style={{
                                                                    alignItems: "center",
                                                                    width: 80,
                                                                }}
                                                            >
                                                                <View
                                                                    style={{
                                                                        width: 60,
                                                                        height: 60,
                                                                        borderRadius: 100,
                                                                        overflow: "hidden",
                                                                        backgroundColor: "#555",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
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
                                                                    <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>
                                                                        {socialItem.customName}
                                                                    </Text>
                                                                )}
                                                            </TouchableOpacity>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            )}
                                        </View>
                                    </>
                                )}
                            </View>
                            {/* Title and Description - Below the Card */}
                            {selectedPost && (
                                <View style={{ width: width * 0.9, paddingHorizontal: 10 }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 15,
                                    }}>
                                        <Text style={{
                                            color: "#fff",
                                            fontSize: 28,
                                            fontWeight: "bold",
                                            textAlign: "left",
                                            lineHeight: 32,
                                            flex: 1,
                                            marginRight: 15,
                                        }}>
                                            {selectedPost.title}
                                        </Text>
                                    </View>

                                    {selectedPost.description && (
                                        <Text style={{
                                            color: "#ccc",
                                            fontSize: 18,
                                            textAlign: "left",
                                            marginBottom: 30,
                                            lineHeight: 26
                                        }}>
                                            {selectedPost.description}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </Animated.View>
            </Modal>
        </View>
    );
}

