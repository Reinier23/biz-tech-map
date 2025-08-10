import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useAuth } from "@/contexts/AuthContext";

const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;

const AuthModal: React.FC = () => {
  const { modalOpen, closeAuth } = useAuth();

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => !open && closeAuth()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          <Auth
            supabaseClient={supabase}
            providers={["google"]}
            redirectTo={redirectTo}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    messageText: 'hsl(var(--foreground))',
                    inputBackground: 'hsl(var(--card))',
                    inputText: 'hsl(var(--foreground))',
                  },
                },
              },
              className: {
                container: "text-foreground",
                button: "bg-primary text-primary-foreground hover:bg-primary/90",
                input: "bg-card border border-border text-foreground",
                label: "text-muted-foreground",
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  social_provider_text: 'Continue with',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Create account',
                },
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
