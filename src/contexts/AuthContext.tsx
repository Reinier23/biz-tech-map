import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  modalOpen: boolean;
  openAuth: (onSignedIn?: () => void) => void;
  closeAuth: () => void;
  requireSignIn: (cb: () => void) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const pendingCallbacks = useRef<(() => void)[]>([]);
  const openedByGuard = useRef(false);

  useEffect(() => {
    // 1) Subscribe to auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Execute any queued actions after successful sign-in
        const queue = [...pendingCallbacks.current];
        pendingCallbacks.current = [];
        queue.forEach((fn) => {
          try { fn(); } catch {}
        });
        setModalOpen(false);
        openedByGuard.current = false;
      }
    });

    // 2) Then get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    }).finally(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  const openAuth = useCallback((onSignedIn?: () => void) => {
    if (onSignedIn) pendingCallbacks.current.push(onSignedIn);
    setModalOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setModalOpen(false);
    // Do not clear pending callbacks; user may reopen and complete
  }, []);

  const requireSignIn = useCallback((cb: () => void) => {
    if (user) {
      cb();
      return;
    }
    pendingCallbacks.current.push(cb);
    setModalOpen(true);
    openedByGuard.current = true;
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    modalOpen,
    openAuth,
    closeAuth,
    requireSignIn,
    signOut,
  }), [user, session, loading, modalOpen, openAuth, closeAuth, requireSignIn, signOut]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
