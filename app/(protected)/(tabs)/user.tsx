import { useAuth } from "@/src/shared/auth-context";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function UserScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        {user?.email ?? "Anonymous"}
      </Text>

      <Button
        title="Sign Out"
        onPress={async () => {
          await logout();
          router.replace("/(auth)/sign-in");
        }}
      />
    </View>
  );
}
