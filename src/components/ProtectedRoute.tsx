import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, requireSignIn } = useAuth();
  const requested = useRef(false);

  useEffect(() => {
    if (!loading && !user && !requested.current) {
      requested.current = true;
      requireSignIn(() => window.location.reload());
    }
  }, [loading, user, requireSignIn]);

  if (loading) return null; // optionally a spinner
  if (!user) return null; // block render until signed in
  return <>{children}</>;
};

export default ProtectedRoute;
