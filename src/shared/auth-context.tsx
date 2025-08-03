// src/shared/auth-context.tsx
import { auth } from "@/src/shared/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  authed: boolean;
  /** clears Firebase session and AsyncStorage (if enabled) */
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  authed: false,
  logout: async () => {},
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u?.isAnonymous) {
        await signOut(auth);
        setUser(null);
      } else {
        setUser(u ?? null);
      }
      setLoad(false);
    });
    return unsub;
  }, []);

  /** wrapper so screens don’t import firebase/auth directly */
  const logout = () => signOut(auth);

  const authed = !!user && !user.isAnonymous;

  return (
    <AuthContext.Provider value={{ user, loading: loading, authed, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
