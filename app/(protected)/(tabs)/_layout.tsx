// app/(protected)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="feed" options={{ title: "Feed" }} />
      <Tabs.Screen name="cats" options={{ title: "Cats" }} />
    </Tabs>
  );
}
