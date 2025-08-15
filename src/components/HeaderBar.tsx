import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, User, LogOut } from "lucide-react";

const HeaderBar: React.FC = () => {
  const { user, openAuth, signOut } = useAuth();

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary" />
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="font-heading font-bold text-xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            BizTechMap
          </span>
        </motion.div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium truncate max-w-[200px]">{user.email}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={signOut} 
                className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                size="sm" 
                variant="premium" 
                onClick={() => openAuth()} 
                className="gap-2"
                aria-label="Sign in"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default HeaderBar;
