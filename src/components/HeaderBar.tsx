import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const HeaderBar: React.FC = () => {
  const { user, openAuth, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-12 flex items-center justify-end text-sm">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden sm:inline">Signed in as</span>
            <span className="font-medium truncate max-w-[200px]">{user.email}</span>
            <Button size="sm" variant="outline" onClick={signOut} aria-label="Sign out">Sign Out</Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => openAuth()} aria-label="Sign in">Sign In</Button>
        )}
      </div>
    </header>
  );
};

export default HeaderBar;
