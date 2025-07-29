// app/sign-in.tsx
import { useAuth } from "@/src/shared/auth-context";
import { emailSignIn } from "@/src/shared/lib/auth";
import { Link, Redirect } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignIn() {
  const { authed, loading: authLoading } = useAuth(); // 👈 use auth context
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    try {
      await emailSignIn(email.trim(), pw);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;
  if (authed) return <Redirect href="/(protected)/(tabs)/feed" />;

  return (
    <View style={styles.c}>
      <Text style={styles.h1}>Sign in</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPw}
        value={pw}
      />
      <Pressable style={styles.btn} onPress={onSubmit} disabled={loading}>
        <Text style={styles.btnTxt}>{loading ? "..." : "Sign in"}</Text>
      </Pressable>
      <Link href="/sign-up" style={styles.link}>
        Create account
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, padding: 24, justifyContent: "center" },
  h1: { fontSize: 28, fontWeight: "600", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "600" },
  link: { color: "#2563eb", marginTop: 16, textAlign: "center" },
});
