import { useCats } from "@/src/features/cats/store";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { SafeAreaView } from "react-native-safe-area-context";

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString() : "—";

export default function CatsScreen() {
  const { cats, deleteCat } = useCats();

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete cat",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCat(id),
        },
      ],
      { cancelable: true }
    );
  };

  const renderRightActions = (item: any) => (
    <View style={styles.deleteWrap}>
      <Pressable
        style={styles.deleteBtn}
        onPress={() => confirmDelete(item.id, item.name)}
      >
        <Text style={styles.deleteTxt}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={cats}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Cats</Text>
            <Pressable
              style={styles.addBtn}
              onPress={() => router.push("/cat/new")}
            >
              <Text style={styles.addTxt}>+ Add Cat</Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          cats.length === 0 && { flex: 1, justifyContent: "center" },
        ]}
        renderItem={({ item }) => (
          <Swipeable
            overshootRight={false}
            renderRightActions={() => renderRightActions(item)}
          >
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({ pathname: "/cat/[id]", params: { id: item.id } })
              }
            >
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.img} />
              ) : (
                <View style={[styles.img, styles.placeholder]} />
              )}
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.breed || "Unknown breed"} • {item.gender || "—"}
                </Text>
                <Text style={styles.meta}>
                  Birthday: {formatDate(item.birthday)}
                </Text>
              </View>
            </Pressable>
          </Swipeable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No cats yet. Add one!</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 26, fontWeight: "600" },
  addBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addTxt: { color: "#fff", fontWeight: "600" },

  card: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  img: { width: 84, height: 84, borderRadius: 12, marginRight: 14 },
  placeholder: { backgroundColor: "#e5e7eb" },
  info: { flex: 1, justifyContent: "center" },
  name: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  meta: { fontSize: 14, color: "#555" },
  empty: { textAlign: "center", color: "#777" },

  // swipe delete
  deleteWrap: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  deleteBtn: {
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderRadius: 14,
    height: "100%",
  },
  deleteTxt: { color: "#fff", fontWeight: "600" },
});
