import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser, useAuth } from "@clerk/clerk-expo";

export type Link = {
  title: string;
  url: string;
  isNew?: boolean;
};

export type Social = {
  type: string;
  url: string;
  icon: string | null;
  customName: string;
};

export type UserProfile = {
  id: string;
  name: string;
  bio: string;
  profileImg: string;
  bgColor: string;
  bgImage: string | null;
  links: Link[];
  social: Social[];
};

export type Post = {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  bgImage?: string | null;
  links?: { title?: string; url: string }[];
  social?: { icon?: string | null; url?: string; customName?: string }[];
  userId: string;
  userName?: string;
  bio?: string;
  bgColor?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProfileContextType = {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (post: Post) => void;
  saveProfileToBackend: () => Promise<void>;
  fetchProfileFromBackend: (userId?: string) => Promise<void>;
  fetchPosts: () => Promise<void>;
};


export const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  setProfile: () => { },
  posts: [],
  setPosts: () => { },
  addPost: () => { },
  saveProfileToBackend: async () => { },
  fetchProfileFromBackend: async () => { },
  fetchPosts: async () => { },
});

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  // const BASE_URL = "https://hithermost-hobert-shyly.ngrok-free.dev";
  const BASE_URL = "https://socialconnect-backend-7hog.onrender.com";


  const addPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
  };

  const saveProfileToBackend = async () => {
    if (!user?.id || !profile) return;

    try {
      const token = await getToken({ template: "mobile" });
      const updatedProfile = { ...profile, clerkId: user.id };

      await axios.put(
        `${BASE_URL}/api/users/profile`,
        updatedProfile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile(prev => ({ ...prev, ...updatedProfile }));
      await AsyncStorage.setItem("profileCache", JSON.stringify(updatedProfile));
      console.log("Profile saved to backend");
    } catch (err) {
      console.error("Save profile error:", err);
    }
  };

  const fetchProfileFromBackend = async (id?: string) => {
  const targetId = id ?? user?.id;
  if (!targetId) return;

  try {
    const token = await getToken({ template: "backend" });
    const response = await fetch(`${BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("📩 Raw backend response:", text); // 👈 keep this line for debugging

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("❌ JSON parse failed:", parseErr, "Response text was:", text);
      return; // stop if it’s not valid JSON
    }

    // safety check if backend.user exists
    if (!data?.user) {
      console.error("⚠️ Backend returned unexpected structure:", data);
      return;
    }

    const backend = data.user;

    const latestProfile: UserProfile = {
      id: backend.id?.toString() || targetId,
      name: backend.name || backend.username || user?.fullName || "Unnamed User",
      bio: backend.bio || "",
      profileImg: backend.profileImg || user?.imageUrl || "",
      bgColor: backend.bgColor || "#ffffff",
      bgImage: backend.bgImage || null,
      links: backend.links || [],
      social: backend.social || [],
    };

    setProfile(latestProfile);
    await AsyncStorage.setItem("profileCache", JSON.stringify(latestProfile));
  } catch (err: any) {
    console.error("Profile fetch error:", err);
  }
};


  const fetchPosts = async () => {
    try {
      const token = await getToken({ template: "backend" });
      const response = await axios.get<Post[]>(`${BASE_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedPosts = response.data.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image || profile?.profileImg || "",
        bgImage: p.bgImage || profile?.bgImage || null,
        links: p.links || profile?.links || [],
        social: p.social || profile?.social || [],
        userId: p.userId,
        userName: p.userName || profile?.name || "Unnamed User",
        bio: p.bio || profile?.bio || "",
        bgColor: p.bgColor || profile?.bgColor || "#222",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));


      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
  };


  useEffect(() => {
    if (user?.id) {
      fetchProfileFromBackend();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isSignedIn) {
      AsyncStorage.removeItem("profileCache");
      setProfile(null);
      setPosts([]);
    }
  }, [isSignedIn]);

  // 👇 Add this just above the "return (...)" line
useEffect(() => {
  fetch("https://socialconnect-backend-7hog.onrender.com")
    .then((res) => res.text())
    .then((text) => {
      console.log("✅ Backend connected successfully:", text);
    })
    .catch((err) => {
      console.error("❌ Backend connection failed:", err);
    });
}, []);


  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        posts,
        setPosts,
        addPost,
        saveProfileToBackend,
        fetchProfileFromBackend,
        fetchPosts,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
