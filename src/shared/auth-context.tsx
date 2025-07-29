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
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  authed: false,
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u?.isAnonymous) {
        await signOut(auth);
        setUser(null);
      } else {
        setUser(u);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const authed = !!user && !user.isAnonymous;

  return (
    <AuthContext.Provider value={{ user, loading, authed }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
