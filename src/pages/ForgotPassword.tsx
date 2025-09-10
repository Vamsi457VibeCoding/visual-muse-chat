import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Brain, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import httpService from '@/services/httpService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    try {
      setIsSubmitting(true);
      await httpService.requestPasswordReset(email);
      setIsEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-canvas flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-node mb-4">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Visual Mind</h1>
            <p className="text-muted-foreground">AI-Powered Mind Mapping Platform</p>
          </div>

          {/* Success message */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-chat">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/20 rounded-full mx-auto mb-4">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-2xl text-foreground">Check Your Email</CardTitle>
              <CardDescription className="text-muted-foreground">
                We've sent password reset instructions to <br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Didn't receive the email? Check your spam folder or</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-accent"
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                >
                  try a different email address
                </Button>
              </div>

              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-node mb-4">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Visual Mind</h1>
          <p className="text-muted-foreground">AI-Powered Mind Mapping Platform</p>
        </div>

        {/* Forgot password form */}
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-chat">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Forgot Password?</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-node transition-smooth"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login">
                <Button variant="link" className="text-accent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Reset link will be valid for 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;