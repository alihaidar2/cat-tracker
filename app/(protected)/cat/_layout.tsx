// app/cat/_layout.tsx
import { useAuth } from "@/src/shared/auth-context";
import { Redirect, Stack } from "expo-router";

export default function CatLayout() {
  const { authed, loading } = useAuth();
  if (loading) return null;
  if (!authed) return <Redirect href="/sign-in" />;

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="[id]" options={{ title: "Cat Profile" }} />
      <Stack.Screen name="new" options={{ title: "New Cat" }} />
    </Stack>
  );
}
