// src/features/feedings/store.tsx
import { useAuth } from "@/src/shared/auth-context";
import { auth, db } from "@/src/shared/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Feeding {
  id: string;
  catId: string;
  timestamp: Date;
  slotLabel?: string;
  userId?: string | null;
}

type Ctx = {
  feedings: Feeding[];
  logFeeding: (catId: string, slotLabel?: string) => Promise<void>;
  getForCatToday: (catId: string) => Feeding[];
};

const FeedCtx = createContext<Ctx | null>(null);

export const FeedProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    let unsub: Unsubscribe | undefined;

    if (!loading && user) {
      const q = query(collection(db, "feedings"), orderBy("timestamp", "desc"));
      unsub = onSnapshot(q, (snap) => {
        setFeedings(
          snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              catId: data.catId,
              slotLabel: data.slotLabel ?? undefined,
              timestamp:
                (data.timestamp as Timestamp)?.toDate?.() ?? new Date(),
              userId: data.userId ?? null,
            } as Feeding;
          })
        );
      });
    } else {
      setFeedings([]);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [user, loading]);

  const logFeeding: Ctx["logFeeding"] = async (catId, slotLabel) => {
    await addDoc(collection(db, "feedings"), {
      catId,
      slotLabel: slotLabel ?? null,
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid ?? null,
    });
  };

  const getForCatToday: Ctx["getForCatToday"] = (catId) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return feedings.filter(
      (f) => f.catId === catId && f.timestamp >= start && f.timestamp <= end
    );
  };

  return (
    <FeedCtx.Provider value={{ feedings, logFeeding, getForCatToday }}>
      {children}
    </FeedCtx.Provider>
  );
};

export const useFeedings = () => {
  const ctx = useContext(FeedCtx);
  if (!ctx) throw new Error("useFeedings must be used inside FeedProvider");
  return ctx;
};
