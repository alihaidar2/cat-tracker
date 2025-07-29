import { useCats } from "@/src/features/cats/store";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString() : "—";

export default function CatProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCat } = useCats();
  const cat = getCat(id!);

  if (!cat) {
    return (
      <View style={styles.center}>
        <Text>Cat not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        {cat.photoUrl ? (
          <Image source={{ uri: cat.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]} />
        )}
        <Text style={styles.name}>{cat.name}</Text>
        {/* <Pressable
          style={styles.editBtn}
          onPress={() => router.push({ pathname: "/cat/new" })} // swap to edit screen later
        >
          <Text style={styles.editTxt}>Edit</Text>
        </Pressable> */}
      </View>

      {/* Metadata card fills the rest */}
      <View style={styles.card}>
        <MetaRow label="Breed" value={cat.breed || "—"} />
        <MetaRow label="Gender" value={cat.gender || "—"} />
        <MetaRow label="Birthday" value={formatDate(cat.birthday)} />
        <MetaRow
          label="Weight"
          value={cat.weightKg != null ? `${cat.weightKg} kg` : "—"}
        />
        <MetaRow label="Notes" value={cat.notes || "—"} last />
      </View>
    </SafeAreaView>
  );
}

const MetaRow = ({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => (
  <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  avatar: { width: 140, height: 140, borderRadius: 70, marginBottom: 12 },
  placeholder: { backgroundColor: "#eee" },
  name: { fontSize: 24, fontWeight: "600", marginBottom: 12 },
  editBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editTxt: { color: "#fff", fontWeight: "600" },

  card: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // shadow / elevation
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#d1d5db",
  },
  rowLabel: { fontSize: 14, color: "#6b7280", marginBottom: 2 },
  rowValue: { fontSize: 16, color: "#111827" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
