import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, FileText, Shield, CheckCircle } from 'lucide-react';

interface EmailCaptureSectionProps {
  isVisible: boolean;
  onEmailCaptured: (email: string) => void;
}

export const EmailCaptureSection: React.FC<EmailCaptureSectionProps> = ({ 
  isVisible, 
  onEmailCaptured 
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setIsValidEmail(validateEmail(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidEmail) {
      localStorage.setItem('user_email', email);
      onEmailCaptured(email);
      setIsSubmitted(true);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="animate-fade-in">
      <Card className="shadow-lg border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Get Your Full Stack Report
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Receive a comprehensive analysis with detailed recommendations and cost savings potential
          </p>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="text-base"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={!isValidEmail}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Mail className="h-4 w-4" />
                Get My Report
              </Button>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Shield className="h-3 w-3" />
                <span>We respect your privacy. No spam, unsubscribe anytime.</span>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Report Requested!</h3>
                <p className="text-sm text-muted-foreground">
                  We'll send your comprehensive tech stack analysis to <strong>{email}</strong>
                </p>
              </div>
              <div className="bg-muted/30 p-3 rounded text-xs text-muted-foreground">
                <p>Your report will include:</p>
                <ul className="mt-2 space-y-1 text-left">
                  <li>• Detailed consolidation opportunities</li>
                  <li>• Potential cost savings breakdown</li>
                  <li>• Implementation timeline recommendations</li>
                  <li>• Tool-specific migration guides</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};