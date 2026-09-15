"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone_number: string;
  approval_status: string;
  source: string;
  is_blocked: boolean;
};

type AuthContextType = {
  user: User | null;
  userData: UserData | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone_number: string,
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; redirectTo?: string }>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<UserData | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (userId: string): Promise<UserData | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, name, email, role, phone_number, approval_status, source, is_blocked",
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user data:", error);
        return null;
      }

      return (data as UserData | null) ?? null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }, [supabase]);

  const getCurrentUser = async (): Promise<UserData | null> => {
    if (userData) return userData;
    if (!session?.user.id) return null;
    return fetchProfile(session.user.id);
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let isCurrent = true;

    void fetchProfile(userId).then((profile) => {
      if (isCurrent) {
        setUserData(profile);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [fetchProfile, userId]);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone_number: string,
  ) => {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone_number } },
      });

      if (authError) return { error: authError.message };
      if (!authData.user) return { error: "Failed to create user" };

      // Use window.location for hard navigation
      window.location.href = "/login";
      return { error: null };
    } catch (error) {
      console.error("Signup error:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };
      if (!authData.user) return { error: "Unable to load your account." };

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role, is_blocked")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        return { error: "Unable to load your user profile." };
      }

      if (profile.is_blocked) {
        await supabase.auth.signOut();
        return { error: "Your account has been blocked. Please contact support." };
      }

      const role = profile.role?.toLowerCase();
      return {
        error: null,
        redirectTo:
          role === "admin"
            ? "/admin-dashboard"
            : ["data_entry", "cleaner"].includes(role || "")
              ? "/admin-dashboard/booking-records"
              : "/customer-dashboard",
      };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    setLoading(true);
    setSession(null);
    setUser(null);
    setUserData(null);

    try {
      await Promise.race([
        supabase.auth.signOut({ scope: "global" }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      try {
        Object.keys(window.localStorage)
          .filter((key) => key.startsWith("sb-") || key.includes("supabase"))
          .forEach((key) => window.localStorage.removeItem(key));
      } catch (error) {
        console.error("Unable to clear local auth storage:", error);
      }
      try {
        const hostname = window.location.hostname;
        const domains = [
          undefined,                       // no domain attribute
          hostname,                        // camzcleaning.com
          `.${hostname}`,                  // .camzcleaning.com
          hostname.replace(/^www\./, ""),  // strip www if present
          `.${hostname.replace(/^www\./, "")}`,
        ];
        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          if (name.startsWith("sb-")) {
            domains.forEach((d) => {
              document.cookie =
                `${name}=; Max-Age=0; path=/` + (d ? `; domain=${d}` : "");
            });
          }
        });
      } catch (e) {
        console.error("Unable to clear auth cookies:", e);
      }
      window.location.assign("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
