import { useAuth } from "@/src/shared/auth-context";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { authed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return authed ? (
    <Redirect href="/(protected)/(tabs)/feed" />
  ) : (
    <Redirect href="/sign-in" />
  );
}
