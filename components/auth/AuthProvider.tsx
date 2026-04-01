"use client";

import { createContext, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Profile = {
  prenom: string | null;
  email: string;
  entreprise: string | null;
  metier: string | null;
};

type AuthContextType = {
  user: User;
  profile: Profile | null;
  supabase: ReturnType<typeof createClient>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  user,
  profile,
  children,
}: {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const supabase = createClient();

  return (
    <AuthContext.Provider value={{ user, profile, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
