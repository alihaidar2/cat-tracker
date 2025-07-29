// src/features/cats/store.tsx
import { useAuth } from "@/src/shared/auth-context";
import { db, storage } from "@/src/shared/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Cat {
  id: string;
  name: string;
  birthday?: string;
  weightKg?: number;
  notes?: string;
  photoUrl?: string;
  breed?: string;
  gender?: "male" | "female" | "unknown";
  schedule?: {
    times: string[];
    tz: string;
  };
}

type Ctx = {
  cats: Cat[];
  addCat: (
    cat: Omit<Cat, "id" | "photoUrl">,
    localUri?: string
  ) => Promise<string>;
  getCat: (id: string) => Cat | undefined;
  deleteCat: (id: string) => Promise<void>;
};

const CatsCtx = createContext<Ctx | null>(null);

export const CatsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [cats, setCats] = useState<Cat[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    let unsub: Unsubscribe | undefined;

    if (!loading && user) {
      unsub = onSnapshot(collection(db, "cats"), (snap) => {
        setCats(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      });
    } else {
      // signed out or still loading → clear local state
      setCats([]);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [user, loading]);

  async function uploadPhoto(localUri: string, catId: string) {
    const blob = await (await fetch(localUri)).blob();
    const fileRef = ref(storage, `cats/${catId}.jpg`);
    await uploadBytes(fileRef, blob);
    return getDownloadURL(fileRef);
  }

  const addCat: Ctx["addCat"] = async (cat, localUri) => {
    const docRef = await addDoc(collection(db, "cats"), cat);
    if (localUri) {
      const url = await uploadPhoto(localUri, docRef.id);
      await updateDoc(doc(db, "cats", docRef.id), { photoUrl: url });
    }
    return docRef.id;
  };

  const getCat = (id: string) => cats.find((c) => c.id === id);

  const deleteCat: Ctx["deleteCat"] = async (id) => {
    try {
      const fileRef = ref(storage, `cats/${id}.jpg`);
      await deleteObject(fileRef);
    } catch {
      /* ignore */
    }
    await deleteDoc(doc(db, "cats", id));
  };

  return (
    <CatsCtx.Provider value={{ cats, addCat, getCat, deleteCat }}>
      {children}
    </CatsCtx.Provider>
  );
};

export const useCats = () => {
  const ctx = useContext(CatsCtx);
  if (!ctx) throw new Error("useCats must be used inside CatsProvider");
  return ctx;
};
