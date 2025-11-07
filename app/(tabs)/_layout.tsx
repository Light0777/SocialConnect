import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { View } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // ✅ Prevent rendering until auth state is known
  if (!isLoaded) return null;

  // ✅ If user NOT logged in → redirect to login
  if (!isSignedIn) return <Redirect href="/(auth)/login" />;

  const tabNames = ['SettingsScreen', 'sharescreen', 'index', 'pin'];
  const icons: Record<string, any> = { 
    SettingsScreen: 'person', 
    sharescreen: 'share', 
    index: 'home', 
    pin: 'compass' 
  };

  return (
    <ProfileProvider>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { 
            position: 'absolute',
            backgroundColor: '#141414',
            borderTopWidth: 0,
            paddingHorizontal: 5,
            marginHorizontal: 30,
            borderRadius: 40,
            bottom: 15,
            left: 20,
            right: 20,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            height: 65,
          },
        }}
      >
        {tabNames.map((name, index) => (
          <Tabs.Screen
            key={index}
            name={name}
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    width: 50,
                    height: 50,
                    marginTop: 25,
                    borderRadius: 25,
                    backgroundColor: focused ? '#ffffff' : 'transparent',
                    borderWidth: 1,
                    borderColor: focused ? '#ffffff' : 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ scale: focused ? 1.1 : 1 }],
                  }}
                >
                  <Ionicons 
                    name={icons[name]} 
                    size={focused ? 26 : 24} 
                    color={focused ? '#000000' : '#ffffff'} 
                  />
                </View>
              ),
            }}
          />
        ))}
      </Tabs>
    </ProfileProvider>
  );
}
