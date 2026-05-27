import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import {
  getUserProfile,
  createUserProfile,
  UserProfile,
} from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "";
  return email.endsWith("@admin.com") || (adminEmail !== "" && email === adminEmail);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (u: User) => {
    try {
      let p = await getUserProfile(u.uid);
      if (!p) {
        await createUserProfile(u.uid, {
          uid: u.uid,
          displayName: u.displayName || "Суралцагч",
          email: u.email || "",
          photoURL: u.photoURL || undefined,
          role: isAdminEmail(u.email) ? "admin" : "student",
          points: 0,
          participations: 0,
          wins: 0,
          badges: [],
        });
        p = await getUserProfile(u.uid);
      }
      setProfile(p);
    } catch (err) {
      console.warn("Firestore профайл ачааллахад алдаа гарлаа:", err);
      setProfile({
        uid: u.uid,
        displayName: u.displayName || "Суралцагч",
        email: u.email || "",
        photoURL: u.photoURL || undefined,
        role: isAdminEmail(u.email) ? "admin" : "student",
        points: 0,
        participations: 0,
        wins: 0,
        badges: [],
      });
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchProfile(u);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signInWithGoogle, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
