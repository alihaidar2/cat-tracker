// app/(protected)/_layout.tsx
import { CatsProvider } from "@/src/features/cats/store";
import { FeedProvider } from "@/src/features/feedings/store";
import { useAuth } from "@/src/shared/auth-context";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

function Loader() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function ProtectedLayout() {
  const { authed, loading } = useAuth();
  if (loading) return <Loader />;
  if (!authed) return <Redirect href="/(auth)/sign-in" />;

  return (
    <FeedProvider>
      <CatsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="cat" /> {/* folder with [id].tsx, new.tsx */}
        </Stack>
      </CatsProvider>
    </FeedProvider>
  );
}
