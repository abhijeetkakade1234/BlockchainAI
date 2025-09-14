import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  MessageCircle, 
  Shield, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Loader2,
  ArrowLeft,
  Github
} from 'lucide-react';

interface LoginPageProps {
  onNavigateBack: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function LoginPage({ onNavigateBack, isDarkMode, toggleDarkMode }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isSignUp) {
        setSuccess('Account created successfully! Please check your email to verify your account.');
      } else {
        setSuccess('Welcome back! Redirecting to your dashboard...');
        // Here you would typically redirect to the main app
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError('');
    
    // Simulate social login
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(`Signed in with ${provider} successfully!`);
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button onClick={onNavigateBack} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5" />
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">BlockchainAI</span>
              </button>

              {/* Dark mode toggle */}
              <Button variant="ghost" onClick={toggleDarkMode}>
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-16 min-h-screen grid lg:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col justify-center px-12 bg-muted/30 relative overflow-hidden">
            <div className="relative z-10 max-w-md mx-auto space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold text-xl">BlockchainAI</span>
                </div>
                <h1 className="text-3xl font-bold leading-tight">
                  Secure Access to Your{' '}
                  <span className="text-blue-500">AI-Powered</span>{' '}
                  Blockchain Assistant
                </h1>
                <p className="text-muted-foreground text-lg">
                  Join thousands of users who trust us with their crypto operations. 
                  Experience the future of blockchain interaction.
                </p>
              </div>

              <div className="relative">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1582693692339-3f6556e86f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMGJsb2NrY2hhaW4lMjBhYnN0cmFjdHxlbnwxfHx8fDE3NTczNjE5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Security and Blockchain"
                  className="w-full h-64 object-cover rounded-2xl shadow-lg"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Why users trust us:</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-sm">Bank-level security with end-to-end encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm">SOC 2 Type II compliant infrastructure</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-sm">Never store your private keys or seed phrases</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background decorations */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 bg-green-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* Right Side - Form */}
          <div className="flex flex-col justify-center px-6 lg:px-12 py-12">
            <div className="max-w-md mx-auto w-full space-y-8">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-lg">BlockchainAI</span>
                </div>
              </div>

              <Card>
                <CardHeader className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex bg-muted rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          setError('');
                          setSuccess('');
                          setFormData({ email: '', password: '', confirmPassword: '' });
                        }}
                        className={`px-6 py-2 rounded-md transition-all ${
                          !isSignUp 
                            ? 'bg-background text-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          setError('');
                          setSuccess('');
                          setFormData({ email: '', password: '', confirmPassword: '' });
                        }}
                        className={`px-6 py-2 rounded-md transition-all ${
                          isSignUp 
                            ? 'bg-background text-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl">
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    {isSignUp 
                      ? 'Start your journey with AI-powered blockchain operations' 
                      : 'Sign in to access your AI blockchain assistant'
                    }
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Success Message */}
                  {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isLoading}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          disabled={isLoading}
                          className="h-11 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {isSignUp && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          disabled={isLoading}
                          className="h-11"
                          required
                        />
                      </div>
                    )}

                    {!isSignUp && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            disabled={isLoading}
                          />
                          <Label htmlFor="remember" className="text-sm">Remember me</Label>
                        </div>
                        <button
                          type="button"
                          className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                          disabled={isLoading}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isSignUp ? 'Creating account...' : 'Signing in...'}
                        </>
                      ) : (
                        isSignUp ? 'Create Account' : 'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin('Google')}
                      disabled={isLoading}
                      className="h-11"
                    >
                      <span className="mr-2">🇬</span>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin('GitHub')}
                      disabled={isLoading}
                      className="h-11"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </div>

                  {/* Toggle Sign In/Up */}
                  <div className="text-center text-sm text-muted-foreground">
                    {isSignUp ? (
                      <>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignUp(false);
                            setError('');
                            setSuccess('');
                            setFormData({ email: '', password: '', confirmPassword: '' });
                          }}
                          className="text-blue-500 hover:text-blue-600 hover:underline font-medium"
                          disabled={isLoading}
                        >
                          Sign in
                        </button>
                      </>
                    ) : (
                      <>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignUp(true);
                            setError('');
                            setSuccess('');
                            setFormData({ email: '', password: '', confirmPassword: '' });
                          }}
                          className="text-blue-500 hover:text-blue-600 hover:underline font-medium"
                          disabled={isLoading}
                        >
                          Sign up
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Privacy */}
              {isSignUp && (
                <p className="text-xs text-center text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}