import React, { useState, useRef, useEffect } from 'react';
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
import { nftAgentService } from '../services/nftAgentService';
import { priceAlertService, PriceAlert, PriceNotification } from '../services/priceAlertService';
import { dummyWalletService, DummyWallet } from '../services/dummyWalletService';
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
  onNavigateToPortfolio: () => void;
  onNavigateToNFTs: () => void;
  onNavigateToSettings: () => void;
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
  details?: {
    collectionName?: string;
    triggerPrice?: number;
    purchasePrice?: number;
    currency?: string;
    previousPrice?: number;
    autoBuy?: boolean;
  };
}

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

export function ChatInterface({ isDarkMode, toggleDarkMode, onNavigateBack, onNavigateToPortfolio, onNavigateToNFTs, onNavigateToSettings }: ChatInterfaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedNetwork, setSelectedNetwork] = useState('base');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to your AI Blockchain Assistant! I can help you with wallet balances, NFT floor prices, transfers, swaps, and more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);

  // Price alert state
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<PriceNotification[]>([]);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  
  // Wallet state
  const [wallet, setWallet] = useState<DummyWallet | null>(null);
  
  // Real transactions state (replaces static data)
  const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
  
  // Alert creation form state
  const [alertForm, setAlertForm] = useState({
    collectionName: '',
    thresholdPrice: '',
    thresholdType: 'below' as 'below' | 'above',
    currency: 'ETH' as 'ETH' | 'USD' | 'AVAX'
  });

  // Price monitoring simulation state
  const [priceSimulation, setPriceSimulation] = useState<{
    isActive: boolean;
    collectionName: string;
    currentPrice: number;
    thresholdPrice: number;
    priceHistory: number[];
    isMonitoring: boolean;
  } | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Enhanced scroll to bottom function
  const scrollToBottom = () => {
    // Try multiple methods to ensure scrolling works
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      
      // Fallback: scroll the scroll area container
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 150);
  };

  // Load transactions function
  const loadTransactions = async () => {
    try {
      const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';
      const transactionsResponse = await dummyWalletService.getTransactions(userId);
      
      if (transactionsResponse.success && transactionsResponse.transactions) {
        // Convert wallet transactions to UI transaction format
        const uiTransactions: Transaction[] = transactionsResponse.transactions
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((tx, index) => ({
            id: tx.id.toString(),
            type: tx.type === 'buy_nft' ? 'Auto-Buy NFT' : tx.type === 'deposit' ? 'Deposit' : tx.type === 'withdraw' ? 'Withdraw' : tx.type,
            amount: tx.type === 'buy_nft' 
              ? `${tx.collectionName} NFT` 
              : `${tx.amount} ${tx.currency}`,
            status: tx.status === 'completed' ? 'completed' : tx.status === 'pending' ? 'pending' : 'failed',
            timestamp: new Date(tx.timestamp),
            details: {
              collectionName: tx.collectionName,
              triggerPrice: tx.triggerPrice,
              purchasePrice: tx.purchasePrice,
              currency: tx.currency,
              previousPrice: tx.previousPrice,
              autoBuy: tx.type === 'buy_nft' && tx.triggerPrice !== undefined
            }
          }));
        
        setRealTransactions(uiTransactions);
      } else {
        console.error('Failed to load transactions:', transactionsResponse.error);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  // Price simulation functions
  const startPriceSimulation = (collectionName: string, thresholdPrice: number) => {
    const initialPrice = 0.9; // Start at 0.9 ETH
    const priceSequence = [0.9, 0.65, 0.25, 0.18]; // Price drop sequence
    
    setPriceSimulation({
      isActive: true,
      collectionName,
      currentPrice: initialPrice,
      thresholdPrice,
      priceHistory: [initialPrice],
      isMonitoring: true
    });

    // Simulate price drops
    priceSequence.forEach((price, index) => {
      setTimeout(() => {
        setPriceSimulation(prev => {
          if (!prev) return null;
          
          const newPriceHistory = [...prev.priceHistory, price];
          const shouldTrigger = price <= thresholdPrice;
          
          if (shouldTrigger) {
            // Trigger auto-buy
            setTimeout(() => {
              triggerAutoBuy(collectionName, price, thresholdPrice);
            }, 1000);
          }
          
          return {
            ...prev,
            currentPrice: price,
            priceHistory: newPriceHistory,
            isMonitoring: !shouldTrigger
          };
        });
      }, (index + 1) * 2000); // 2 seconds between each price update
    });
  };

  const triggerAutoBuy = async (collectionName: string, purchasePrice: number, triggerPrice: number) => {
    try {
      const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';
      const result = await dummyWalletService.buyNFT(userId, {
        collectionName,
        price: purchasePrice,
        currency: 'ETH',
        quantity: 1
      });

      if (result.success) {
        // Show success toast
        setToast({
          show: true,
          type: 'success',
          title: '🎉 Auto-Buy Executed!',
          message: `Successfully purchased ${collectionName} NFT for ${purchasePrice} ETH`
        });

        // Add transaction to messages
        const transactionMessage: Message = {
          id: Date.now().toString(),
          type: 'success',
          content: `🎉 **Auto-Buy Executed!**

🛒 **Purchased:** ${collectionName} NFT
💰 **Price:** ${purchasePrice} ETH
🎯 **Trigger:** Below ${triggerPrice} ETH
⏰ **Time:** ${new Date().toLocaleTimeString()}

✅ Your NFT has been automatically purchased and added to your portfolio!`,
          timestamp: new Date(),
          data: result
        };
        
        setMessages(prev => [...prev, transactionMessage]);
        
        // Reload wallet and transactions
        const walletResponse = await dummyWalletService.getWallet(userId);
        if (walletResponse.success && walletResponse.wallet) {
          setWallet(walletResponse.wallet);
        }
        await loadTransactions();
        
        // Scroll to bottom
        setTimeout(() => scrollToBottom(), 200);
        
        // Stop simulation
        setTimeout(() => {
          setPriceSimulation(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Auto-buy failed:', error);
      setToast({
        show: true,
        type: 'error',
        title: 'Auto-Buy Failed',
        message: 'Failed to execute automatic purchase'
      });
    }
  };

  const showToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // NFT Purchase Handler
  const handleNFTPurchase = async (message: string): Promise<{handled: boolean, success: boolean, message: string, data?: any}> => {
    // Auto-buy alert patterns
    const autoBuyPatterns = [
      /buy\s+(\w+)\s+nft\s+when\s+price\s+drops?\s+below\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
      /auto-buy\s+(\w+)\s+nft\s+when\s+price\s+drops?\s+below\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
      /buy\s+(\w+)\s+nft\s+if\s+price\s+drops?\s+below\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
      /purchase\s+(\w+)\s+nft\s+when\s+price\s+drops?\s+below\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
      /(\w+)\s+nft\s+when\s+price\s+drops?\s+below\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
    ];

    // Check for auto-buy alerts first
    for (const pattern of autoBuyPatterns) {
      const match = message.match(pattern);
      if (match) {
        const collectionName = match[1];
        const thresholdPrice = parseFloat(match[2]);
        const currency = match[3] ? match[3].toUpperCase() : 'ETH';

        // Start price simulation
        startPriceSimulation(collectionName, thresholdPrice);

        // Add system message to chat
        const alertMessage: Message = {
          id: Date.now().toString(),
          type: 'system',
          content: `🎬 **Auto-Buy Monitoring Started!**

📊 **Collection:** ${collectionName}
🎯 **Trigger:** Below ${thresholdPrice} ${currency}
📈 **Current:** 0.9 ${currency}

Watch the price drop sequence in the Active Watches section!`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, alertMessage]);

        return {
          handled: true,
          success: true,
          message: `🚨 **Auto-buy alert created!** I'll automatically buy ${collectionName} NFT when price drops below ${thresholdPrice} ${currency}`,
        };
      }
    }

    // Regular purchase patterns
    const purchasePatterns = [
      /buy\s+(\w+)\s+for\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
      /purchase\s+(\w+)\s+at\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
      /get\s+(\w+)\s+nft\s+for\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
      /buy\s+(\w+)\s+nft/i,
      /purchase\s+(\w+)\s+nft/i,
    ];

    for (const pattern of purchasePatterns) {
      const match = message.match(pattern);
      if (match) {
        const collectionName = match[1];
        let price = match[2] ? parseFloat(match[2]) : null;
        let currency = match[3] ? match[3].toUpperCase() : 'ETH';

        // If no price specified, use a default or ask for confirmation
        if (!price) {
          // For now, use a default price - in a real app, you'd ask the user
          price = 0.1;
          currency = 'ETH';
        }

        if (!wallet) {
          return {
            handled: true,
            success: false,
            message: '❌ Wallet not loaded. Please try again in a moment.',
          };
        }

        try {
          const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';
          const result = await dummyWalletService.buyNFT(userId, {
            collectionName,
            price,
            currency: currency as 'ETH' | 'USD' | 'AVAX',
            quantity: 1
          });

          if (result.success) {
            return {
              handled: true,
              success: true,
              message: `🎉 **NFT Purchase Successful!**

🛒 **Purchased:** ${collectionName} NFT
💰 **Price:** ${dummyWalletService.formatCurrency(price, currency)}
🏦 **Wallet Balance:** 
   • ETH: ${wallet.balance.ETH.toFixed(4)} → ${(wallet.balance.ETH - price).toFixed(4)}
   • USD: ${wallet.balance.USD.toFixed(0)}
   • AVAX: ${wallet.balance.AVAX.toFixed(1)}

✅ Your NFT has been added to your portfolio!`,
              data: result
            };
          } else {
            return {
              handled: true,
              success: false,
              message: `❌ **Purchase Failed**

${result.error || 'Unable to complete the purchase. Please check your balance and try again.'}`,
            };
          }
        } catch (error) {
          return {
            handled: true,
            success: false,
            message: `❌ **Purchase Error**

${error instanceof Error ? error.message : 'An unexpected error occurred during purchase.'}`,
          };
        }
      }
    }

    return { handled: false, success: false, message: '' };
  };

  const quickActions: QuickAction[] = [
    { id: 'balance', label: 'Check Balance', icon: Wallet, description: 'What is my wallet balance?' },
    { id: 'address', label: 'Get Address', icon: Network, description: 'What is my wallet address?' },
    { id: 'nfts', label: 'My NFTs', icon: ImageIcon, description: 'Show me my NFTs' },
    { id: 'buy_coolcats', label: 'Buy Cool Cats', icon: ImageIcon, description: 'Buy Cool Cats NFT for 0.25 ETH' },
    { id: 'buy_bayc', label: 'Buy BAYC', icon: ImageIcon, description: 'Buy Bored Ape NFT for 5 ETH' },
    { id: 'floor_price', label: 'NFT Floor Price', icon: TrendingUp, description: 'Get floor price for an NFT collection' },
    { id: 'create_alert', label: 'Create Alert', icon: Zap, description: 'Create a price alert for an NFT collection' },
    { id: 'demo_auto_buy', label: 'Demo Auto-Buy', icon: Zap, description: 'Demo: Monitor Cool Cats price and auto-buy below 0.2 ETH' }
  ];

  // Use real transactions instead of static data
  const displayTransactions = realTransactions.length > 0 ? realTransactions : [
    // Fallback static data if no real transactions
    {
      id: '1',
      type: 'Deposit',
      amount: '5.0 ETH',
      status: 'completed' as const,
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      type: 'Deposit',
      amount: '1000 USD',
      status: 'completed' as const,
      timestamp: new Date(Date.now() - 7200000)
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
    scrollToBottom();
  }, [messages]);

  // Load price alerts and notifications on component mount
  useEffect(() => {
    const loadPriceAlerts = async () => {
      try {
        const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';
        const alertsResponse = await priceAlertService.getUserAlerts(userId);
        const notificationsResponse = await priceAlertService.getUserNotifications(userId);
        
        if (alertsResponse.success) {
          setPriceAlerts(alertsResponse.alerts || []);
        } else {
          console.error('Failed to load alerts:', alertsResponse.error);
        }
        
        if (notificationsResponse.success) {
          setNotifications(notificationsResponse.notifications || []);
        } else {
          console.error('Failed to load notifications:', notificationsResponse.error);
        }
      } catch (error) {
        console.error('Error loading price alerts:', error);
      }
    };

    const loadWallet = async () => {
      try {
        const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';
        const walletResponse = await dummyWalletService.getWallet(userId);
        
        if (walletResponse.success && walletResponse.wallet) {
          setWallet(walletResponse.wallet);
        } else {
          console.error('Failed to load wallet:', walletResponse.error);
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    };


    loadPriceAlerts();
    loadWallet();
    loadTransactions();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      loadPriceAlerts();
      loadTransactions();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

    try {
      // Check if message contains NFT purchase intent
      const purchaseResult = await handleNFTPurchase(message);
      if (purchaseResult.handled) {
        const purchaseMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: purchaseResult.success ? 'success' : 'error',
          content: purchaseResult.message,
          timestamp: new Date(),
          data: purchaseResult.data
        };
        setMessages(prev => [...prev, purchaseMessage]);
        
        // Reload wallet and transactions to show updated data
        if (purchaseResult.success) {
          const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';
          const walletResponse = await dummyWalletService.getWallet(userId);
          if (walletResponse.success && walletResponse.wallet) {
            setWallet(walletResponse.wallet);
          }
          // Reload transactions to show the new purchase
          await loadTransactions();
        }
        
        // Ensure scroll to bottom after message is added
        setTimeout(() => scrollToBottom(), 200);
        setIsTyping(false);
        return;
      }

      // Send message to NFT Agent for other queries
      const response = await nftAgentService.sendMessage(message);
      
      // Format the response for display
      const formattedContent = nftAgentService.formatResponse(response);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: formattedContent,
        timestamp: new Date(),
        data: response.result
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Ensure scroll to bottom after AI response
      setTimeout(() => scrollToBottom(), 200);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
      
      // Ensure scroll to bottom after error response
      setTimeout(() => scrollToBottom(), 200);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (action) {
      if (actionId === 'create_alert') {
        // Show the create alert form
        setShowCreateAlert(true);
        return;
      }

      if (actionId === 'demo_auto_buy') {
        // Start price simulation demo
        startPriceSimulation('Cool Cats', 0.2);
        
        // Show info message
        const demoMessage: Message = {
          id: Date.now().toString(),
          type: 'system',
          content: '🎬 **Demo Started!**\n\nMonitoring Cool Cats NFT price...\n\n**Alert:** Auto-buy when price drops below 0.2 ETH\n**Current:** 0.9 ETH\n\nWatch the price drop sequence in the Active Watches section!',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, demoMessage]);
        setTimeout(() => scrollToBottom(), 200);
        return;
      }

      setMessage(action.description);
      
      // Auto-send the quick action
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: action.description,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsTyping(true);

      try {
        // Send message to NFT Agent
        const response = await nftAgentService.sendMessage(action.description);
        
        // Format the response for display
        const formattedContent = nftAgentService.formatResponse(response);
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: formattedContent,
          timestamp: new Date(),
          data: response.result
        };
        
        setMessages(prev => [...prev, aiResponse]);
        
        // Ensure scroll to bottom after quick action response
        setTimeout(() => scrollToBottom(), 200);
      } catch (error) {
        console.error('Error sending quick action:', error);
        
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'error',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorResponse]);
        
        // Ensure scroll to bottom after error response
        setTimeout(() => scrollToBottom(), 200);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleCreateAlert = async () => {
    if (!alertForm.collectionName.trim() || !alertForm.thresholdPrice.trim()) {
      return;
    }

    try {
        const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';
        const result = await priceAlertService.createAlert({
          userId,
          collectionName: alertForm.collectionName,
          thresholdPrice: parseFloat(alertForm.thresholdPrice),
          thresholdType: alertForm.thresholdType,
          currency: alertForm.currency
        });

      if (result.success) {
        // Reset form
        setAlertForm({
          collectionName: '',
          thresholdPrice: '',
          thresholdType: 'below',
          currency: 'ETH'
        });
        setShowCreateAlert(false);
        
            // Reload alerts
            const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';
            const alertsResponse = await priceAlertService.getUserAlerts(userId);
        if (alertsResponse.success) {
          setPriceAlerts(alertsResponse.alerts || []);
        }
        
        // Show success message
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'success',
          content: `✅ Price alert created: ${alertForm.collectionName} ${alertForm.thresholdType} ${alertForm.thresholdPrice} ${alertForm.currency}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        
        // Ensure scroll to bottom after success message
        setTimeout(() => scrollToBottom(), 200);
      } else {
        throw new Error(result.error || 'Failed to create alert');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'error',
        content: 'Failed to create price alert. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Ensure scroll to bottom after error message
      setTimeout(() => scrollToBottom(), 200);
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

      case 'error':
        return (
          <div className="flex justify-start mb-4">
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-red-500 text-white">
                  <AlertCircle className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl rounded-bl-md px-4 py-2">
                <p className="text-sm text-red-700 dark:text-red-300">{msg.content}</p>
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
      {/* BlockchainAI Branding */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">BlockchainAI</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {[
          { id: 'chat', label: 'Chat', icon: MessageCircle, onClick: null },
          { id: 'portfolio', label: 'Portfolio', icon: BarChart3, onClick: onNavigateToPortfolio },
          { id: 'nfts', label: 'NFTs', icon: ImageIcon, onClick: onNavigateToNFTs },
          { id: 'settings', label: 'Settings', icon: Settings, onClick: onNavigateToSettings }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick || (() => setActiveTab(item.id))}
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
        
        {/* User Profile */}
        <div className="pt-3 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">0x1234...5678</p>
            </div>
          </div>
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
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="h-full p-4">
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
              </div>

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

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    {/* Recent Transactions */}
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Recent Activity</h3>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {displayTransactions.slice(0, 5).map((tx) => (
                          <div key={tx.id} className="p-2 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium">{tx.type}</p>
                                {tx.details?.autoBuy && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                    Auto-Buy
                                  </Badge>
                                )}
                              </div>
                              <Badge 
                                variant={tx.status === 'completed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {tx.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">{tx.amount}</p>
                              
                              {/* Show detailed auto-buy information */}
                              {tx.details?.autoBuy && tx.details.collectionName && (
                                <div className="text-xs space-y-1 bg-green-50 dark:bg-green-900/10 p-2 rounded border border-green-200 dark:border-green-800">
                                  <div className="flex justify-between">
                                    <span className="text-green-700 dark:text-green-400">Collection:</span>
                                    <span className="font-medium">{tx.details.collectionName}</span>
                                  </div>
                                  {tx.details.previousPrice && tx.details.triggerPrice && (
                                    <div className="flex justify-between">
                                      <span className="text-green-700 dark:text-green-400">Price Drop:</span>
                                      <span>{tx.details.previousPrice} → {tx.details.triggerPrice} {tx.details.currency}</span>
                                    </div>
                                  )}
                                  {tx.details.purchasePrice && (
                                    <div className="flex justify-between">
                                      <span className="text-green-700 dark:text-green-400">Bought For:</span>
                                      <span className="font-medium">{tx.details.purchasePrice} {tx.details.currency}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <p className="text-xs text-muted-foreground">
                                {formatTime(tx.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {displayTransactions.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Alerts & Notifications */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Price Alerts</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowCreateAlert(true)}
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Active Notifications */}
                      {notifications.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                            🚨 Active Alerts ({notifications.length})
                          </h4>
                          <div className="space-y-2">
                            {notifications.slice(0, 3).map((notification) => (
                              <div key={notification.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                  {notification.collectionName}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-green-500 mt-1">
                                  {new Date(notification.triggeredAt).toLocaleTimeString()}
                                </p>
                              </div>
                            ))}
                            {notifications.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{notifications.length - 3} more alerts
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Active Price Alerts */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Active Watches ({priceAlerts.length + (priceSimulation ? 1 : 0)})</h4>
                        
                        {/* Price Simulation Card */}
                        {priceSimulation && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                  {priceSimulation.collectionName}
                                </p>
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                  Monitoring
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-blue-600 dark:text-blue-400">Current Price:</span>
                                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                  {priceSimulation.currentPrice} ETH
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-blue-600 dark:text-blue-400">Trigger:</span>
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                  Below {priceSimulation.thresholdPrice} ETH
                                </span>
                              </div>
                              
                              {/* Price History */}
                              <div className="mt-2">
                                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Price History:</p>
                                <div className="flex space-x-1">
                                  {priceSimulation.priceHistory.map((price, index) => (
                                    <div 
                                      key={index}
                                      className={`px-2 py-1 rounded text-xs font-medium transition-all duration-500 ${
                                        price <= priceSimulation.thresholdPrice 
                                          ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300' 
                                          : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                                      }`}
                                    >
                                      {price} ETH
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {!priceSimulation.isMonitoring && (
                                <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                                    ✅ Auto-buy triggered! Purchase in progress...
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {priceAlerts.length > 0 ? (
                          priceAlerts.slice(0, 5).map((alert) => (
                            <div key={alert.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{alert.collectionName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {alert.thresholdType === 'below' ? 'Below' : 'Above'} {alert.thresholdPrice} {alert.currency}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const result = await priceAlertService.deleteAlert(alert.id);
                                    if (result.success) {
            // Reload alerts
            const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';
            const alertsResponse = await priceAlertService.getUserAlerts(userId);
                                      if (alertsResponse.success) {
                                        setPriceAlerts(alertsResponse.alerts || []);
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error deleting alert:', error);
                                  }
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                        ) : !priceSimulation && (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-2">No price alerts set</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowCreateAlert(true)}
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              Create Alert
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Quick Alert Creation */}
                      {showCreateAlert && (
                        <div className="mt-4 p-3 bg-card border rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Create Price Alert</h4>
                          <div className="space-y-2">
                            <Input 
                              placeholder="Collection name (e.g., Bored Ape Yacht Club)"
                              className="text-xs"
                              value={alertForm.collectionName}
                              onChange={(e) => setAlertForm(prev => ({ ...prev, collectionName: e.target.value }))}
                            />
                            <div className="flex space-x-2">
                              <Input 
                                placeholder="Price threshold"
                                className="text-xs flex-1"
                                type="number"
                                value={alertForm.thresholdPrice}
                                onChange={(e) => setAlertForm(prev => ({ ...prev, thresholdPrice: e.target.value }))}
                              />
                              <Select 
                                value={alertForm.thresholdType}
                                onValueChange={(value: 'below' | 'above') => setAlertForm(prev => ({ ...prev, thresholdType: value }))}
                              >
                                <SelectTrigger className="w-20 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="below">Below</SelectItem>
                                  <SelectItem value="above">Above</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select 
                                value={alertForm.currency}
                                onValueChange={(value: 'ETH' | 'USD' | 'AVAX') => setAlertForm(prev => ({ ...prev, currency: value }))}
                              >
                                <SelectTrigger className="w-16 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ETH">ETH</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="AVAX">AVAX</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={handleCreateAlert}
                                disabled={!alertForm.collectionName.trim() || !alertForm.thresholdPrice.trim()}
                              >
                                Create Alert
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowCreateAlert(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
            toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
            'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'error' ? 'bg-red-500' :
                toast.type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}>
                {toast.type === 'success' && <CheckCircle className="w-3 h-3 text-white" />}
                {toast.type === 'error' && <AlertCircle className="w-3 h-3 text-white" />}
                {toast.type === 'warning' && <AlertCircle className="w-3 h-3 text-white" />}
                {toast.type === 'info' && <Bot className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${
                  toast.type === 'success' ? 'text-green-800 dark:text-green-200' :
                  toast.type === 'error' ? 'text-red-800 dark:text-red-200' :
                  toast.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                  'text-blue-800 dark:text-blue-200'
                }`}>
                  {toast.title}
                </h4>
                <p className={`text-xs mt-1 ${
                  toast.type === 'success' ? 'text-green-600 dark:text-green-400' :
                  toast.type === 'error' ? 'text-red-600 dark:text-red-400' :
                  toast.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className={`text-xs ${
                  toast.type === 'success' ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200' :
                  toast.type === 'error' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200' :
                  toast.type === 'warning' ? 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200' :
                  'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
