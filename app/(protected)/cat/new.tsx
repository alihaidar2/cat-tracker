// app/cat/new.tsx
// npm i @react-native-community/datetimepicker dayjs
import { useCats } from "@/src/features/cats/store";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const GENDERS: ("male" | "female" | "unknown")[] = [
  "male",
  "female",
  "unknown",
];
const BREEDS = [
  "Domestic Shorthair",
  "Domestic Longhair",
  "Siamese",
  "Persian",
  "Maine Coon",
  "Ragdoll",
  "Bengal",
  "Sphynx",
  "Other",
];

export default function NewCat() {
  const { addCat } = useCats();
  const insets = useSafeAreaInsets();

  // base fields
  const [name, setName] = useState("");
  const [breed, setBreed] = useState<string>("");
  const [gender, setGender] = useState<"male" | "female" | "unknown">(
    "unknown"
  );
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const [photoUri, setPhotoUri] = useState<string>();
  const [saving, setSaving] = useState(false);

  // pickers
  const [breedPickerOpen, setBreedPickerOpen] = useState(false);
  const [genderPickerOpen, setGenderPickerOpen] = useState(false);
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

  // schedule modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [timesPerDay, setTimesPerDay] = useState<string>(""); // numeric string
  const [scheduleTimes, setScheduleTimes] = useState<string[]>([]);
  const [timePickerIndex, setTimePickerIndex] = useState<number | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed to pick photo");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
    });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  };

  const handleOpenSchedule = () => {
    if (!timesPerDay) setTimesPerDay("2");
    if (scheduleTimes.length === 0) setScheduleTimes(defaultTimes(2));
    setScheduleModalOpen(true);
  };

  const onChangeSlotTime = (index: number, date: Date) => {
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    const next = [...scheduleTimes];
    next[index] = `${hh}:${mm}`;
    setScheduleTimes(next);
  };

  const saveScheduleModal = () => {
    const n = Math.max(0, parseInt(timesPerDay || "0", 10));
    if (n === 0) {
      setScheduleTimes([]);
      setScheduleModalOpen(false);
      return;
    }
    if (scheduleTimes.length !== n) {
      Alert.alert("Incomplete", "Please set all times.");
      return;
    }
    setScheduleModalOpen(false);
  };

  const cancelScheduleModal = () => setScheduleModalOpen(false);

  const save = async () => {
    if (!name.trim()) return Alert.alert("Name is required");
    setSaving(true);
    try {
      const schedule =
        scheduleTimes.length > 0
          ? {
              times: scheduleTimes,
              tz: "America/Toronto",
            }
          : undefined;

      const id = await addCat(
        {
          name: name.trim(),
          breed: breed || undefined,
          gender,
          birthday: birthday ? dayjs(birthday).format("YYYY-MM-DD") : undefined,
          weightKg: weight ? parseFloat(weight) : undefined,
          notes: notes || undefined,
          schedule,
        },
        photoUri
      );
      router.replace({ pathname: "/cat/[id]", params: { id } });
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={insets.top} // adjusts lift on iOS
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Pressable style={styles.avatarBox} onPress={pickImage}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatar} />
            ) : (
              <Text>Tap to add photo</Text>
            )}
          </Pressable>

          <LabeledInput
            label="Name *"
            value={name}
            onChangeText={setName}
            placeholder="Milo"
          />

          <LabeledButton
            label="Breed"
            value={breed || "Select breed"}
            onPress={() => setBreedPickerOpen(true)}
          />

          <LabeledButton
            label="Gender"
            value={gender}
            onPress={() => setGenderPickerOpen(true)}
          />

          <LabeledButton
            label="Birthday"
            value={
              birthday ? dayjs(birthday).format("YYYY-MM-DD") : "Select date"
            }
            onPress={() => setShowBirthdayPicker(true)}
          />

          <LabeledInput
            label="Weight (kg)"
            value={weight}
            onChangeText={setWeight}
            placeholder="4.2"
            keyboardType="decimal-pad"
          />

          <LabeledInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Loves tuna..."
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: "top" }}
          />

          <LabeledButton
            label="Feeding schedule"
            value={
              scheduleTimes.length
                ? `${scheduleTimes.length} times: ${scheduleTimes.join(", ")}`
                : "Set schedule"
            }
            onPress={handleOpenSchedule}
          />
        </ScrollView>

        {/* Sticky footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={save}
            disabled={saving}
          >
            <Text style={styles.saveTxt}>{saving ? "Saving…" : "Save"}</Text>
          </Pressable>
        </View>

        {/* Breed modal */}
        <SimplePicker
          visible={breedPickerOpen}
          title="Select breed"
          options={BREEDS}
          onSelect={(v) => {
            setBreed(v);
            setBreedPickerOpen(false);
          }}
          onClose={() => setBreedPickerOpen(false)}
        />

        {/* Gender modal */}
        <SimplePicker
          visible={genderPickerOpen}
          title="Select gender"
          options={GENDERS}
          onSelect={(v) => {
            setGender(v);
            setGenderPickerOpen(false);
          }}
          onClose={() => setGenderPickerOpen(false)}
        />

        {/* Birthday picker */}
        {showBirthdayPicker && (
          <DateTimePicker
            value={birthday ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            maximumDate={new Date()}
            onChange={(event, date) => {
              setShowBirthdayPicker(false);
              if (date) setBirthday(date);
            }}
          />
        )}

        {/* Schedule modal */}
        <Modal visible={scheduleModalOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { maxHeight: "85%" }]}>
              <Text style={styles.modalTitle}>Feeding schedule</Text>

              <LabeledInput
                label="Times per day"
                value={timesPerDay}
                onChangeText={(txt) => {
                  const nStr = txt.replace(/[^0-9]/g, "");
                  setTimesPerDay(nStr);
                  const count = parseInt(nStr || "0", 10);
                  setScheduleTimes((prev) => {
                    if (count <= 0) return [];
                    if (count > prev.length) {
                      return [
                        ...prev,
                        ...defaultTimes(count).slice(prev.length),
                      ];
                    }
                    return prev.slice(0, count);
                  });
                }}
                placeholder="2"
                keyboardType="number-pad"
              />

              {scheduleTimes.map((t, i) => (
                <LabeledButton
                  key={i}
                  label={`Time #${i + 1}`}
                  value={t}
                  onPress={() => setTimePickerIndex(i)}
                />
              ))}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <Pressable
                  onPress={cancelScheduleModal}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelTxt}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={saveScheduleModal}
                  style={styles.modalSaveBtn}
                >
                  <Text style={styles.modalSaveTxt}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Time picker for individual slots */}
        {timePickerIndex !== null && (
          <DateTimePicker
            value={stringToDate(scheduleTimes[timePickerIndex])}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              if (event.type === "dismissed") {
                setTimePickerIndex(null);
                return;
              }
              if (date) onChangeSlotTime(timePickerIndex, date);
              setTimePickerIndex(null);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- helpers ---------- */

function defaultTimes(n: number): string[] {
  // Spread between 8:00 and 20:00 by default
  const start = 8 * 60;
  const end = 20 * 60;
  if (n <= 1) return ["08:00"];
  const step = (end - start) / (n - 1);
  return Array.from({ length: n }).map((_, i) => {
    const mins = Math.round(start + step * i);
    const h = Math.floor(mins / 60)
      .toString()
      .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  });
}

function stringToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h);
  d.setMinutes(m);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

/* ---------- Reusable components ---------- */

type LabeledInputProps = React.ComponentProps<typeof TextInput> & {
  label: string;
};
const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  style,
  ...rest
}) => (
  <View style={{ width: "100%", marginBottom: 16 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor="#9ca3af"
      {...rest}
    />
  </View>
);

type LabeledButtonProps = { label: string; value: string; onPress: () => void };
const LabeledButton: React.FC<LabeledButtonProps> = ({
  label,
  value,
  onPress,
}) => (
  <View style={{ width: "100%", marginBottom: 16 }}>
    <Text style={styles.label}>{label}</Text>
    <Pressable style={styles.selector} onPress={onPress}>
      <Text
        style={[
          styles.selectorText,
          value === "Set schedule" || value.includes("Select")
            ? { color: "#9ca3af" }
            : null,
        ]}
      >
        {value}
      </Text>
    </Pressable>
  </View>
);

type SimplePickerProps = {
  visible: boolean;
  title: string;
  options: string[] | readonly string[];
  onSelect: (val: any) => void;
  onClose: () => void;
};
const SimplePicker: React.FC<SimplePickerProps> = ({
  visible,
  title,
  options,
  onSelect,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalBackdrop}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>{title}</Text>
        {options.map((o) => (
          <TouchableOpacity
            key={o}
            style={styles.modalRow}
            onPress={() => onSelect(o)}
          >
            <Text style={styles.modalRowText}>{o}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.modalRow, { borderTopWidth: 0.5, marginTop: 12 }]}
          onPress={onClose}
        >
          <Text style={[styles.modalRowText, { color: "#2563eb" }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 16 },
  avatarBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e5e7eb",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 24,
  },
  avatar: { width: "100%", height: "100%" },
  label: { fontSize: 14, color: "#374151", marginBottom: 4, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#fff",
  },
  selector: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  selectorText: { fontSize: 16, color: "#111827" },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveTxt: { color: "#fff", fontWeight: "600", fontSize: 16 },

  // Modal shared
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
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

  cancelBtn: { paddingHorizontal: 16, paddingVertical: 12, marginRight: 12 },
  cancelTxt: { color: "#6b7280", fontSize: 16 },
  modalSaveBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalSaveTxt: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
