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
};

export const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  setProfile: () => {},
  posts: [],
  setPosts: () => {},
  addPost: () => {},
  saveProfileToBackend: async () => {},
  fetchProfileFromBackend: async () => {},
});

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const BASE_URL = "https://hithermost-hobert-shyly.ngrok-free.dev";

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

      setProfile(updatedProfile);
      await AsyncStorage.setItem("profileCache", JSON.stringify(updatedProfile));
      console.log("Profile saved to backend");
    } catch (err) {
      console.error("Save profile error:", err);
    }
  };

  const fetchProfileFromBackend = async (userId?: string) => {
    if (!user?.id) return;

    try {
      const token = await getToken({ template: "mobile" });
      const res = await axios.get<{ user: UserProfile }>(
        `${BASE_URL}/api/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(res.data.user);
      await AsyncStorage.setItem("profileCache", JSON.stringify(res.data.user));

    } catch (err: any) {
      console.warn("Profile fetch error:", err.response?.status);

      if (err.response?.status === 404) {
        const newProfile: UserProfile = {
          id: user.id,
          name: user.fullName || "New User",
          bio: "",
          profileImg: user.imageUrl || "",
          bgColor: "#ffffff",
          bgImage: null,
          links: [],
          social: [],
        };

        setProfile(newProfile);
        await saveProfileToBackend();
      }
    }
  };

  useEffect(() => {
    if (!user?.id || profile) return;
    fetchProfileFromBackend(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (!isSignedIn) {
      AsyncStorage.removeItem("profileCache");
      setProfile(null);
      setPosts([]);
    }
  }, [isSignedIn]);

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
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
