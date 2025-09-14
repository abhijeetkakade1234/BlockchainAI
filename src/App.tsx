import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { LoginPage } from './components/LoginPage';
import { ChatInterface } from './components/ChatInterface';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { NFTGallery } from './components/NFTGallery';
import { SettingsPage } from './components/SettingsPage';
import { 
  MessageCircle, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  Image as ImageIcon,
  BarChart3,
  Menu,
  X,
  Star,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'chat' | 'portfolio' | 'nfts' | 'settings'>('landing');

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const features = [
    {
      icon: MessageCircle,
      title: "Natural Language Trading",
      description: "Trade crypto by simply chatting with our AI assistant"
    },
    {
      icon: BarChart3,
      title: "Portfolio Management", 
      description: "Track and optimize your investments with intelligent insights"
    },
    {
      icon: TrendingUp,
      title: "DeFi Operations",
      description: "Stake, lend, and farm yields automatically through conversation"
    },
    {
      icon: ImageIcon,
      title: "NFT Management",
      description: "Buy, sell, and track your NFT collection effortlessly"
    },
    {
      icon: Globe,
      title: "Cross-Chain Support",
      description: "Operate across multiple blockchain networks seamlessly"
    },
    {
      icon: Zap,
      title: "Real-time Insights",
      description: "Get market data and AI-powered recommendations instantly"
    }
  ];

  const steps = [
    {
      icon: Wallet,
      title: "Connect Your Wallet",
      description: "Securely link your crypto wallet to get started"
    },
    {
      icon: MessageCircle,
      title: "Start Chatting",
      description: "Ask questions or give commands in natural language"
    },
    {
      icon: Zap,
      title: "Execute Actions", 
      description: "AI handles transactions and operations automatically"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Users" },
    { value: "$50M+", label: "Transactions Processed" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "AI Support" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "DeFi Trader",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612a96a?w=64&h=64&fit=crop&crop=face",
      quote: "This AI assistant completely transformed how I manage my crypto portfolio. What used to take hours now takes minutes."
    },
    {
      name: "Michael Rodriguez", 
      role: "NFT Collector",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      quote: "The natural language interface makes complex DeFi operations feel simple. It's like having a crypto expert on call 24/7."
    },
    {
      name: "Emma Thompson",
      role: "Crypto Investor", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      quote: "Finally, a blockchain tool that doesn't require a computer science degree. The AI understands exactly what I want to do."
    }
  ];

  // Handle page navigation
  if (currentPage === 'login') {
    return (
      <LoginPage 
        onNavigateBack={() => setCurrentPage('landing')}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLoginSuccess={() => setCurrentPage('chat')}
      />
    );
  }

  if (currentPage === 'chat') {
    return (
      <ChatInterface
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onNavigateBack={() => setCurrentPage('landing')}
        onNavigateToPortfolio={() => setCurrentPage('portfolio')}
        onNavigateToNFTs={() => setCurrentPage('nfts')}
        onNavigateToSettings={() => setCurrentPage('settings')}
      />
    );
  }

  if (currentPage === 'portfolio') {
    return (
      <PortfolioDashboard
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onNavigateBack={() => setCurrentPage('landing')}
        onNavigateToChat={() => setCurrentPage('chat')}
        onNavigateToNFTs={() => setCurrentPage('nfts')}
        onNavigateToSettings={() => setCurrentPage('settings')}
      />
    );
  }

  if (currentPage === 'nfts') {
    return (
      <NFTGallery
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onNavigateBack={() => setCurrentPage('landing')}
        onNavigateToChat={() => setCurrentPage('chat')}
        onNavigateToSettings={() => setCurrentPage('settings')}
      />
    );
  }

  if (currentPage === 'settings') {
    return (
      <SettingsPage
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onNavigateBack={() => setCurrentPage('landing')}
        onNavigateToChat={() => setCurrentPage('chat')}
        onNavigateToNFTs={() => setCurrentPage('nfts')}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">BlockchainAI</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              </nav>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" onClick={toggleDarkMode}>
                  {isDarkMode ? '☀️' : '🌙'}
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('login')}>Sign In</Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setCurrentPage('login')}>Get Started</Button>
              </div>

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-border">
                <nav className="flex flex-col space-y-4">
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
                  <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                  <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                  <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
                  <div className="flex items-center space-x-4 pt-4 border-t border-border">
                    <Button variant="ghost" onClick={toggleDarkMode}>
                      {isDarkMode ? '☀️' : '🌙'}
                    </Button>
                    <Button variant="ghost" onClick={() => setCurrentPage('login')}>Sign In</Button>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setCurrentPage('login')}>Get Started</Button>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="w-fit">
                    🚀 AI-Powered Blockchain Assistant
                  </Badge>
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                    Your AI-Powered{' '}
                    <span className="text-blue-500">Blockchain</span>{' '}
                    Assistant
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Chat with AI to manage your crypto portfolio, execute trades, and explore DeFi - all through natural conversation
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setCurrentPage('login')}>
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    <Play className="mr-2 w-4 h-4" />
                    Watch Demo
                  </Button>
                </div>

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No setup required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Bank-level security</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1642432556591-72cbc671b707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMEFJJTIwYmxvY2tjaGFpbiUyMHRlY2hub2xvZ3klMjBpbGx1c3RyYXRpb258ZW58MXx8fHwxNzU3MzYxOTUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="AI and Blockchain Technology"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Powerful Features for Modern Crypto Trading
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our AI assistant brings together the best of blockchain technology and natural language processing
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-blue-200 dark:hover:border-blue-800">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                          <Icon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold">{feature.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get started with blockchain operations in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">{index + 1}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="text-3xl lg:text-4xl font-bold text-blue-500">
                        {stat.value}
                      </div>
                      <div className="text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold">
                What Our Users Say
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of satisfied users who've transformed their crypto experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center space-x-3">
                        <ImageWithFallback 
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 bg-muted/50 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Logo and tagline */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-lg">BlockchainAI</span>
                </div>
                <p className="text-muted-foreground">
                  Making blockchain accessible through AI-powered conversations
                </p>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h4 className="font-semibold">Product</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">API</a>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Support</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Help Center</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Community</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Contact</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Status</a>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Legal</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Security</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Compliance</a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-muted-foreground">
                © 2024 BlockchainAI. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">Twitter</span>
                  <Users className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">GitHub</span>
                  <Shield className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <BarChart3 className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}