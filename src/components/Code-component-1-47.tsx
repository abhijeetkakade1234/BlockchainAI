import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  MessageCircle, 
  Send,
  Mic,
  Paperclip,
  Smile,
  Menu,
  X,
  Wallet,
  ArrowUpDown,
  BarChart3,
  Image as ImageIcon,
  Settings,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Bot,
  User,
  Loader2,
  Network,
  Globe
} from 'lucide-react';

interface ChatInterfaceProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onNavigateBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'transaction' | 'balance' | 'error' | 'success';
  content: string;
  timestamp: Date;
  data?: any;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  description: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  hash?: string;
}

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

export function ChatInterface({ isDarkMode, toggleDarkMode, onNavigateBack }: ChatInterfaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedNetwork, setSelectedNetwork] = useState('base');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to your AI Blockchain Assistant! How can I help you today?',
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: '2',
      type: 'user',
      content: 'What\'s my current portfolio balance?',
      timestamp: new Date(Date.now() - 45000)
    },
    {
      id: '3',
      type: 'balance',
      content: 'Your current portfolio balance',
      timestamp: new Date(Date.now() - 30000),
      data: {
        totalValue: '$12,847.32',
        change: '+$234.12',
        changePercent: '+1.86%',
        assets: [
          { symbol: 'ETH', balance: '3.2', value: '$8,240.00' },
          { symbol: 'BTC', balance: '0.15', value: '$4,200.00' },
          { symbol: 'USDC', balance: '407.32', value: '$407.32' }
        ]
      }
    },
    {
      id: '4',
      type: 'user',
      content: 'Can you swap 1 ETH for USDC?',
      timestamp: new Date(Date.now() - 15000)
    },
    {
      id: '5',
      type: 'ai',
      content: 'I can help you swap 1 ETH for USDC. Based on current rates, you would receive approximately 2,575 USDC. Would you like me to proceed with this transaction?',
      timestamp: new Date(Date.now() - 10000)
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { id: 'balance', label: 'Check Balance', icon: Wallet, description: 'View your wallet balances' },
    { id: 'send', label: 'Send Tokens', icon: Send, description: 'Send crypto to another wallet' },
    { id: 'swap', label: 'Swap Tokens', icon: ArrowUpDown, description: 'Exchange one token for another' },
    { id: 'portfolio', label: 'View Portfolio', icon: BarChart3, description: 'See your complete portfolio' }
  ];

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      type: 'Swap',
      amount: '0.5 ETH → 1,287 USDC',
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000),
      hash: '0x1234...5678'
    },
    {
      id: '2',
      type: 'Send',
      amount: '100 USDC',
      status: 'pending',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      type: 'Receive',
      amount: '0.1 BTC',
      status: 'completed',
      timestamp: new Date(Date.now() - 86400000),
      hash: '0xabcd...efgh'
    }
  ];

  const marketData: MarketData[] = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$28,000', change: '+$340', changePercent: '+1.23%', isPositive: true },
    { symbol: 'ETH', name: 'Ethereum', price: '$2,575', change: '-$25', changePercent: '-0.96%', isPositive: false },
    { symbol: 'SOL', name: 'Solana', price: '$19.85', change: '+$0.45', changePercent: '+2.32%', isPositive: true }
  ];

  const networks = [
    { id: 'base', name: 'Base', icon: '🔵' },
    { id: 'avalanche', name: 'Avalanche', icon: '🔺' },
    { id: 'bsc', name: 'BSC', icon: '🟡' },
    { id: 'polygon', name: 'Polygon', icon: '🟣' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I understand you want to perform that action. Let me help you with that right away.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (action) {
      setMessage(action.description);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = (msg: Message) => {
    switch (msg.type) {
      case 'user':
        return (
          <div className="flex justify-end mb-4">
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
              <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2">
                <p className="text-sm">{msg.content}</p>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
              </Avatar>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="flex justify-start mb-4">
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-500 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="flex justify-center mb-4">
            <div className="bg-card border rounded-lg px-4 py-2 max-w-md">
              <p className="text-xs text-muted-foreground text-center">{msg.content}</p>
            </div>
          </div>
        );

      case 'balance':
        return (
          <div className="flex justify-start mb-4">
            <div className="flex items-end space-x-2 max-w-sm">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-500 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Portfolio Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-semibold">{msg.data.totalValue}</span>
                    <span className="text-sm text-green-500">{msg.data.change} ({msg.data.changePercent})</span>
                  </div>
                  <div className="space-y-2">
                    {msg.data.assets.map((asset: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{asset.balance} {asset.symbol}</span>
                        <span className="text-muted-foreground">{asset.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex justify-center mb-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 max-w-md">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-400">{msg.content}</p>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex justify-center mb-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 max-w-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">{msg.content}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* User Profile */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">0x1234...5678</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {[
          { id: 'chat', label: 'Chat', icon: MessageCircle },
          { id: 'portfolio', label: 'Portfolio', icon: BarChart3 },
          { id: 'transactions', label: 'Transactions', icon: ArrowUpDown },
          { id: 'nfts', label: 'NFTs', icon: ImageIcon },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'help', label: 'Help', icon: HelpCircle }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Wallet Connection & Network */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-sidebar-foreground/60">Network</span>
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger className="w-24 h-7 text-xs bg-sidebar-accent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network) => (
                <SelectItem key={network.id} value={network.id}>
                  <div className="flex items-center space-x-2">
                    <span>{network.icon}</span>
                    <span>{network.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-sidebar-foreground/60">Wallet Connected</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="h-full bg-background text-foreground flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 h-full">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 lg:px-6 h-14">
              <div className="flex items-center space-x-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="lg:hidden"
                      onClick={() => setIsSidebarOpen(true)}
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>

                <button onClick={onNavigateBack} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold hidden sm:block">BlockchainAI</span>
                </button>

                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-green-500 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">AI Assistant</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                  {isDarkMode ? '☀️' : '🌙'}
                </Button>
              </div>
            </div>
          </header>

          {/* Chat Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Messages */}
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-4xl mx-auto">
                  {messages.map((msg) => (
                    <div key={msg.id}>
                      {renderMessage(msg)}
                      <div className="text-xs text-muted-foreground text-center mb-2">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-end space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-500 text-white">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask me anything about your crypto portfolio..."
                        className="pr-32 min-h-[44px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mic className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Smile className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!message.trim()} className="h-11">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="hidden xl:block w-80 border-l border-border bg-card/30">
              <div className="h-full flex flex-col">
                {/* Quick Actions */}
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="h-auto p-3 flex flex-col items-center space-y-2"
                          onClick={() => handleQuickAction(action.id)}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Recent Activity</h3>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">{tx.amount}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={tx.status === 'completed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {tx.status}
                          </Badge>
                          {tx.hash && (
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Overview */}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Market Overview</h3>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {marketData.map((asset) => (
                      <div key={asset.symbol} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{asset.symbol}</p>
                          <p className="text-xs text-muted-foreground">{asset.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{asset.price}</p>
                          <div className="flex items-center space-x-1">
                            {asset.isPositive ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={`text-xs ${asset.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                              {asset.changePercent}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}