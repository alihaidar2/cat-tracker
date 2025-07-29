import dayjs from "dayjs";

export type Slot = {
  label: string; // "08:00"
  date: Date; // today @ 08:00
  future: boolean;
  fed: boolean;
};

export function buildSlotsForToday(times: string[] = []): Slot[] {
  const now = dayjs();
  return times.map((t) => {
    const [H, M] = t.split(":").map(Number);
    const d = dayjs().hour(H).minute(M).second(0).millisecond(0);
    return { label: t, date: d.toDate(), future: d.isAfter(now), fed: false };
  });
}

export function markFed(
  slots: Slot[],
  feedings: { slotLabel?: string; timestamp: Date }[]
): Slot[] {
  return slots.map((s) => {
    const hit = feedings.some((f) => f.slotLabel === s.label);
    return { ...s, fed: hit };
  });
}
