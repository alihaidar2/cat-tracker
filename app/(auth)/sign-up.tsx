// app/sign-up.tsx
import { emailSignUp } from "@/src/shared/lib/auth";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function SignUp() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    Keyboard.dismiss();
    if (!email.trim() || !pw) {
      return Alert.alert("Missing info", "Email and password are required.");
    }
    if (pw.length < 6) {
      return Alert.alert("Weak password", "Use at least 6 characters.");
    }
    if (pw !== pw2) {
      return Alert.alert("Password mismatch", "Passwords do not match.");
    }

    setLoading(true);
    try {
      await emailSignUp(email.trim(), pw, displayName.trim() || undefined);
      router.replace("/(protected)/(tabs)/feed");
    } catch (e: any) {
      console.error("Sign up error:", e);
      Alert.alert("Sign up failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        <View style={styles.container}>
          <Text style={styles.h1}>Create account</Text>

          <TextInput
            style={styles.input}
            placeholder="Display name (optional)"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            placeholderTextColor="#9ca3af"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9ca3af"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={pw}
            onChangeText={setPw}
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            value={pw2}
            onChangeText={setPw2}
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />

          <Pressable
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnTxt}>Sign up</Text>
            )}
          </Pressable>

          <Link href="/sign-in" style={styles.link}>
            Already have an account? Sign in
          </Link>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  h1: { fontSize: 28, fontWeight: "600", marginBottom: 24, color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnTxt: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#2563eb", marginTop: 20, textAlign: "center", fontSize: 15 },
});
