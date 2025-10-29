import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ProfileProvider } from "@/contexts/ProfileContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ProfileProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          {/* Show auth screens ONLY when logged out */}
          <SignedOut>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(auth)/signup" />
            </Stack>
          </SignedOut>

          {/* App tabs accessible only when logged in */}
          <SignedIn>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </SignedIn>

          <StatusBar style="auto" />
        </ThemeProvider>
      </ProfileProvider>
    </ClerkProvider>
  );
}

