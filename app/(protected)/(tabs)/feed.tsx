import { useCats } from "@/src/features/cats/store";
import { useFeedings } from "@/src/features/feedings/store";
import {
  buildSlotsForToday,
  markFed,
  type Slot,
} from "@/src/features/feedings/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(relativeTime);

export default function FeedScreen() {
  const { cats } = useCats();
  const { feedings, logFeeding, getForCatToday } = useFeedings();

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selectedCat = cats.find((c) => c.id === selectedCatId) ?? null;

  const todaysFeedingsForCat = useMemo(() => {
    return selectedCat ? getForCatToday(selectedCat.id) : [];
  }, [selectedCat, getForCatToday, feedings]);

  const slots: Slot[] = useMemo(() => {
    if (!selectedCat?.schedule?.times) return [];
    const base = buildSlotsForToday(selectedCat.schedule.times);
    return markFed(base, todaysFeedingsForCat);
  }, [selectedCat, todaysFeedingsForCat]);

  const lastFedLabel = useMemo(() => {
    if (!todaysFeedingsForCat.length) return "Never";
    const last = todaysFeedingsForCat[0]; // feedings store is sorted desc
    return dayjs(last.timestamp).fromNow();
  }, [todaysFeedingsForCat]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cat picker modal */}
      <Modal visible={pickerOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose a cat</Text>
            {cats.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.modalRow}
                onPress={() => {
                  setSelectedCatId(c.id);
                  setPickerOpen(false);
                }}
              >
                <Text style={styles.modalRowText}>{c.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalRow, { borderTopWidth: 0.5, marginTop: 12 }]}
              onPress={() => setPickerOpen(false)}
            >
              <Text style={[styles.modalRowText, { color: "#2563eb" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>🐾 Cat Tracker</Text>

            {/* Cat card */}
            {!selectedCat ? (
              <Pressable
                style={styles.card}
                onPress={() => setPickerOpen(true)}
              >
                <Text style={styles.catName}>Select a cat</Text>
                <Text style={styles.lastFed}>Tap to choose</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.card}
                onPress={() => setPickerOpen(true)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>{selectedCat.name}</Text>
                  <Text style={styles.lastFed}>Last fed: {lastFedLabel}</Text>
                </View>
                <Text style={styles.chooseTxtInline}>Change</Text>
              </Pressable>
            )}

            {/* Slots checklist */}
            {selectedCat && (
              <>
                <Text style={styles.sectionTitle}>Today’s schedule</Text>
                {slots.length === 0 && (
                  <Text style={styles.empty}>No schedule set</Text>
                )}
                {slots.map((s) => (
                  <SlotRow
                    key={s.label}
                    slot={s}
                    onCheck={() => logFeeding(selectedCat.id, s.label)}
                  />
                ))}

                <Text style={styles.sectionTitle}>Recent feedings</Text>
              </>
            )}
          </View>
        }
        data={todaysFeedingsForCat}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedingRow
            timestamp={item.timestamp}
            user={item.userId ?? undefined}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No feedings yet</Text>}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

/* --------- Slot Row --------- */
const SlotRow: React.FC<{ slot: Slot; onCheck: () => void }> = ({
  slot,
  onCheck,
}) => {
  const disabled = slot.future || slot.fed;
  return (
    <Pressable
      style={[
        slotStyles.row,
        disabled && { opacity: 0.5 },
        slot.fed && slotStyles.rowFed,
      ]}
      onPress={!disabled ? onCheck : undefined}
    >
      <Text style={slotStyles.time}>{slot.label}</Text>
      <View style={[slotStyles.checkbox, slot.fed && slotStyles.checkboxOn]} />
    </Pressable>
  );
};

/* --------- Feeding row (history list) --------- */
const FeedingRow: React.FC<{ timestamp: Date; user?: string }> = ({
  timestamp,
  user,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowText}>
      {dayjs(timestamp).format("MMM D, HH:mm")} — {user ?? "Unknown"}
    </Text>
  </View>
);

/* --------------- Styles --------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  header: { paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: "600", marginBottom: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  empty: { textAlign: "center", marginTop: 12, color: "#777" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  catName: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  lastFed: { fontSize: 14, color: "#555" },
  chooseTxtInline: { color: "#2563eb", fontWeight: "500", marginLeft: 12 },

  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  rowText: { fontSize: 15, color: "#333" },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  modalRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  modalRowText: { fontSize: 16, color: "#111" },
});

const slotStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rowFed: {
    backgroundColor: "#e0f2fe",
    borderColor: "#bae6fd",
  },
  time: { flex: 1, fontSize: 16, fontWeight: "500", color: "#111827" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#9ca3af",
  },
  checkboxOn: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
});
