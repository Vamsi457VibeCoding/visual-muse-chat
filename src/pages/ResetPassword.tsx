import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Brain, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import httpService from '@/services/httpService';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }

    // Verify token on component mount
    const verifyToken = async () => {
      try {
        await httpService.verifyResetToken(token);
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
        toast({
          title: "Invalid or expired token",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive",
        });
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword || !token) {
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await httpService.resetPassword(token, password);
      setIsSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been successfully reset.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-canvas flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-canvas flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-chat">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-destructive">Invalid Reset Link</CardTitle>
              <CardDescription className="text-muted-foreground">
                This password reset link is invalid or has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Link to="/forgot-password">
                <Button className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground">
                  Request New Reset Link
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
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
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-2xl text-foreground">Password Reset Complete</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your password has been successfully reset. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-node transition-smooth"
              >
                Continue to Login
              </Button>
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

        {/* Reset password form */}
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-chat">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Reset Your Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                    required
                    disabled={isSubmitting}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                    required
                    disabled={isSubmitting}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords don't match</p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-node transition-smooth"
                disabled={isSubmitting || !password || !confirmPassword || password !== confirmPassword}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login">
                <Button variant="link" className="text-accent">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Password must be at least 6 characters long
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;