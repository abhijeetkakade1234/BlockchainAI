import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MessageCircle, 
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Menu,
  MoreHorizontal,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Settings,
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Bell,
  BellOff,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Target,
  DollarSign as DollarIcon,
  Calendar,
  Hash,
  Percent
} from 'lucide-react';
import { priceAlertService, PriceAlert, PriceNotification } from '../services/priceAlertService';
import { dummyWalletService, DummyWallet, NFT, Transaction } from '../services/dummyWalletService';

interface NFTActiveWatchesManagerProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onNavigateBack: () => void;
  onNavigateToChat: () => void;
  onNavigateToNFTs: () => void;
  onNavigateToSettings: () => void;
}

interface AlertFormData {
  collectionName: string;
  thresholdPrice: string;
  thresholdType: 'below' | 'above';
  currency: 'ETH' | 'USD' | 'AVAX';
}

interface MonitoringStatus {
  isMonitoring: boolean;
  lastCheck?: string;
  nextCheck?: string;
  totalAlerts: number;
  activeAlerts: number;
}

export function PortfolioDashboard({ isDarkMode, toggleDarkMode, onNavigateBack, onNavigateToChat, onNavigateToNFTs, onNavigateToSettings }: NFTActiveWatchesManagerProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<PriceNotification[]>([]);
  const [wallet, setWallet] = useState<DummyWallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus>({
    isMonitoring: true,
    totalAlerts: 0,
    activeAlerts: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [showValues, setShowValues] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  const [alertForm, setAlertForm] = useState<AlertFormData>({
    collectionName: '',
    thresholdPrice: '',
    thresholdType: 'below',
    currency: 'ETH'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingAlertId, setDeletingAlertId] = useState<number | null>(null);
  const [isEmulateDialogOpen, setIsEmulateDialogOpen] = useState(false);
  const [emulateForm, setEmulateForm] = useState({
    collectionName: '',
    newPrice: '',
    currency: 'ETH' as 'ETH' | 'USD' | 'AVAX'
  });
  const [emulateLoading, setEmulateLoading] = useState(false);

  const userId = (window as any).REACT_APP_DEFAULT_USER_ID || 'testuser';

  // Load data on component mount
  useEffect(() => {
    loadAlerts();
    loadNotifications();
    loadWallet();
    loadMonitoringStatus();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      loadAlerts();
      loadNotifications();
      loadWallet();
      loadMonitoringStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await priceAlertService.getUserAlerts(userId);
      if (response.success && response.alerts) {
        setAlerts(response.alerts);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await priceAlertService.getUserNotifications(userId);
      if (response.success && response.notifications) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadWallet = async () => {
    try {
      const response = await dummyWalletService.getWallet(userId);
      if (response.success && response.wallet) {
        setWallet(response.wallet);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const loadMonitoringStatus = async () => {
    try {
      const response = await priceAlertService.getMonitoringStatus();
      if (response.success) {
        setMonitoringStatus(prev => ({
          ...prev,
          isMonitoring: response.monitoring || false,
          totalAlerts: alerts.length,
          activeAlerts: alerts.length
        }));
      }
    } catch (error) {
      console.error('Error loading monitoring status:', error);
    }
  };

  const handleCreateAlert = async () => {
    if (!alertForm.collectionName || !alertForm.thresholdPrice) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await priceAlertService.createAlert({
        userId,
        collectionName: alertForm.collectionName,
        thresholdPrice: parseFloat(alertForm.thresholdPrice),
        thresholdType: alertForm.thresholdType,
        currency: alertForm.currency
      });

      if (result.success) {
        setAlertForm({
          collectionName: '',
          thresholdPrice: '',
          thresholdType: 'below',
          currency: 'ETH'
        });
        setIsCreateDialogOpen(false);
        await loadAlerts();
      } else {
        setError(result.error || 'Failed to create alert');
      }
    } catch (error) {
      setError('Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAlert = async () => {
    if (!editingAlert || !alertForm.collectionName || !alertForm.thresholdPrice) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, we'll delete and recreate since we don't have an update endpoint
      await priceAlertService.deleteAlert(editingAlert.id);
      const result = await priceAlertService.createAlert({
        userId,
        collectionName: alertForm.collectionName,
        thresholdPrice: parseFloat(alertForm.thresholdPrice),
        thresholdType: alertForm.thresholdType,
        currency: alertForm.currency
      });

      if (result.success) {
        setEditingAlert(null);
        setAlertForm({
          collectionName: '',
          thresholdPrice: '',
          thresholdType: 'below',
          currency: 'ETH'
        });
        setIsEditDialogOpen(false);
        await loadAlerts();
      } else {
        setError(result.error || 'Failed to update alert');
      }
    } catch (error) {
      setError('Failed to update alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    setDeletingAlertId(alertId);
    setError(null);

    try {
      console.log('Deleting alert with ID:', alertId);
      const result = await priceAlertService.deleteAlert(alertId);
      console.log('Delete result:', result);
      
      if (result.success) {
        console.log('Alert deleted successfully, reloading alerts...');
        await loadAlerts();
        setError(null); // Clear any previous errors
      } else {
        console.error('Delete failed:', result.error);
        setError(result.error || 'Failed to delete alert');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete alert: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeletingAlertId(null);
    }
  };

  const openEditDialog = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setAlertForm({
      collectionName: alert.collectionName,
      thresholdPrice: alert.thresholdPrice.toString(),
      thresholdType: alert.thresholdType,
      currency: alert.currency
    });
    setIsEditDialogOpen(true);
  };

  const filteredAlerts = alerts
    .filter(alert => {
      if (filterBy === 'all') return true;
      if (filterBy === 'below') return alert.thresholdType === 'below';
      if (filterBy === 'above') return alert.thresholdType === 'above';
      if (filterBy === 'eth') return alert.currency === 'ETH';
      if (filterBy === 'usd') return alert.currency === 'USD';
      if (filterBy === 'avax') return alert.currency === 'AVAX';
      return true;
    })
    .filter(alert => 
      alert.collectionName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'collectionName':
          aValue = a.collectionName;
          bValue = b.collectionName;
          break;
        case 'thresholdPrice':
          aValue = a.thresholdPrice;
          bValue = b.thresholdPrice;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'currency':
          aValue = a.currency;
          bValue = b.currency;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleBuyNFT = async (collectionName: string, price: number, currency: string) => {
    if (!wallet) {
      setError('Wallet not loaded');
      return;
    }

    setWalletLoading(true);
    setError(null);

    try {
      const result = await dummyWalletService.buyNFT(userId, {
        collectionName,
        price,
        currency: currency as 'ETH' | 'USD' | 'AVAX',
        quantity: 1
      });

      if (result.success) {
        // Reload wallet to show updated balance and NFTs
        await loadWallet();
        setError(null);
        console.log('✅ NFT purchase successful!', result.message);
      } else {
        setError(result.error || 'Failed to buy NFT');
      }
    } catch (error) {
      setError('Failed to buy NFT');
      console.error('Purchase error:', error);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleEmulatePrice = async () => {
    if (!emulateForm.collectionName || !emulateForm.newPrice) {
      setError('Please fill in all required fields');
      return;
    }

    setEmulateLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${baseUrl}/emulate-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          collectionName: emulateForm.collectionName,
          newPrice: parseFloat(emulateForm.newPrice),
          currency: emulateForm.currency
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEmulateForm({
          collectionName: '',
          newPrice: '',
          currency: 'ETH'
        });
        setIsEmulateDialogOpen(false);
        
        // Reload alerts and notifications to show triggered alerts
        await loadAlerts();
        await loadNotifications();
        
        // Show success message
        setError(null);
        // You could add a success toast here if you have a toast system
        console.log('✅ Price emulation successful!', result.message);
      } else {
        setError(result.error || 'Failed to emulate price change');
      }
    } catch (error) {
      setError('Failed to emulate price change');
      console.error('Emulation error:', error);
    } finally {
      setEmulateLoading(false);
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
            <p className="text-sm font-medium text-sidebar-foreground truncate">NFT Tracker</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">Active Watches</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {[
          { id: 'chat', label: 'Chat', icon: MessageCircle, onClick: onNavigateToChat },
          { id: 'watches', label: 'Active Watches', icon: Bell, onClick: null },
          { id: 'notifications', label: 'Notifications', icon: AlertTriangle, onClick: () => console.log('Notifications clicked - feature coming soon') },
          { id: 'nfts', label: 'NFTs', icon: ImageIcon, onClick: onNavigateToNFTs },
          { id: 'settings', label: 'Settings', icon: Settings, onClick: onNavigateToSettings }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick || undefined}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.id === 'watches'
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

      {/* Monitoring Status */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${monitoringStatus.isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-sidebar-foreground/60">
            {monitoringStatus.isMonitoring ? 'Monitoring Active' : 'Monitoring Disabled'}
          </span>
        </div>
        <div className="text-xs text-sidebar-foreground/60 mt-1">
          {monitoringStatus.activeAlerts} active alerts
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
        <div className="flex-1 flex flex-col h-full overflow-hidden">
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

                <div className="hidden sm:flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Active Watches</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEmulateDialogOpen(true)}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Emulate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowValues(!showValues)}>
                  {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                  {isDarkMode ? '☀️' : '🌙'}
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {wallet ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {showValues ? `${wallet.balance.ETH.toFixed(4)} ETH` : '•••• ETH'}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-1 text-blue-500">
                          <span>Ξ</span>
                          <span>{showValues ? wallet.balance.ETH.toFixed(2) : '••••'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-500">
                          <span>$</span>
                          <span>{showValues ? wallet.balance.USD.toFixed(0) : '••••'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-orange-500">
                          <span>AVAX</span>
                          <span>{showValues ? wallet.balance.AVAX.toFixed(1) : '••••'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">NFT Holdings</CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {showValues ? (wallet?.nftHoldings?.length || 0) : '••••'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    NFTs in portfolio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Watches</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {showValues ? alerts.length : '••••'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Price alerts active
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Monitoring Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
                  {monitoringStatus.isMonitoring ? (
                    <Play className="h-4 w-4 text-green-500" />
                  ) : (
                    <Pause className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${monitoringStatus.isMonitoring ? 'text-green-500' : 'text-red-500'}`}>
                    {monitoringStatus.isMonitoring ? 'Active' : 'Disabled'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Real-time price monitoring
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notifications.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Recent alerts triggered
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wallet Address</CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-mono">
                    {wallet ? (
                      showValues ? 
                        `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` :
                        '••••••••••••••••'
                    ) : 'Loading...'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dummy wallet address
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Create Alert Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Price Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="collectionName">Collection Name</Label>
                    <Input
                      id="collectionName"
                      placeholder="e.g., Cool Cats, Bored Ape Yacht Club"
                      value={alertForm.collectionName}
                      onChange={(e) => setAlertForm(prev => ({ ...prev, collectionName: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="thresholdPrice">Threshold Price</Label>
                      <Input
                        id="thresholdPrice"
                        type="number"
                        step="0.001"
                        placeholder="0.209"
                        value={alertForm.thresholdPrice}
                        onChange={(e) => setAlertForm(prev => ({ ...prev, thresholdPrice: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={alertForm.currency} onValueChange={(value: 'ETH' | 'USD' | 'AVAX') => setAlertForm(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="AVAX">AVAX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="thresholdType">Alert Type</Label>
                    <Select value={alertForm.thresholdType} onValueChange={(value: 'below' | 'above') => setAlertForm(prev => ({ ...prev, thresholdType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below">Below (Price Drop)</SelectItem>
                        <SelectItem value="above">Above (Price Rise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAlert} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Alert'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Alert Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Price Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editCollectionName">Collection Name</Label>
                    <Input
                      id="editCollectionName"
                      placeholder="e.g., Cool Cats, Bored Ape Yacht Club"
                      value={alertForm.collectionName}
                      onChange={(e) => setAlertForm(prev => ({ ...prev, collectionName: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editThresholdPrice">Threshold Price</Label>
                      <Input
                        id="editThresholdPrice"
                        type="number"
                        step="0.001"
                        placeholder="0.209"
                        value={alertForm.thresholdPrice}
                        onChange={(e) => setAlertForm(prev => ({ ...prev, thresholdPrice: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCurrency">Currency</Label>
                      <Select value={alertForm.currency} onValueChange={(value: 'ETH' | 'USD' | 'AVAX') => setAlertForm(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="AVAX">AVAX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editThresholdType">Alert Type</Label>
                    <Select value={alertForm.thresholdType} onValueChange={(value: 'below' | 'above') => setAlertForm(prev => ({ ...prev, thresholdType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below">Below (Price Drop)</SelectItem>
                        <SelectItem value="above">Above (Price Rise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditAlert} disabled={loading}>
                      {loading ? 'Updating...' : 'Update Alert'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Emulate Price Dialog */}
            <Dialog open={isEmulateDialogOpen} onOpenChange={setIsEmulateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span>Emulate Price Change</span>
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Simulate a price change for any NFT collection to test your alerts and see notifications in action.
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This will simulate a price change for the specified collection and trigger notifications for any matching alerts.
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <Label htmlFor="emulateCollectionName">Collection Name</Label>
                    <Select 
                      value={emulateForm.collectionName} 
                      onValueChange={(value) => setEmulateForm(prev => ({ ...prev, collectionName: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection with active alerts..." />
                      </SelectTrigger>
                      <SelectContent>
                        {alerts.map((alert) => (
                          <SelectItem key={alert.id} value={alert.collectionName}>
                            {alert.collectionName} ({alert.thresholdType} {alert.thresholdPrice} {alert.currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {alerts.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        No active alerts found. Create an alert first to use this feature.
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emulateNewPrice">New Price</Label>
                      <Input
                        id="emulateNewPrice"
                        type="number"
                        step="0.001"
                        placeholder="0.15"
                        value={emulateForm.newPrice}
                        onChange={(e) => setEmulateForm(prev => ({ ...prev, newPrice: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emulateCurrency">Currency</Label>
                      <Select 
                        value={emulateForm.currency} 
                        onValueChange={(value: 'ETH' | 'USD' | 'AVAX') => setEmulateForm(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="AVAX">AVAX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {emulateForm.collectionName && alerts.filter(alert => alert.collectionName === emulateForm.collectionName).length > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Active Alerts for {emulateForm.collectionName}:</h4>
                      <div className="space-y-1">
                        {alerts
                          .filter(alert => alert.collectionName === emulateForm.collectionName)
                          .map((alert) => (
                            <div key={alert.id} className="text-sm flex items-center justify-between">
                              <span className="flex items-center space-x-2">
                                <Badge variant={alert.thresholdType === 'below' ? 'destructive' : 'default'} className="text-xs">
                                  {alert.thresholdType === 'below' ? (
                                    <>
                                      <TrendingDown className="w-3 h-3 mr-1" />
                                      Below
                                    </>
                                  ) : (
                                    <>
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      Above
                                    </>
                                  )}
                                </Badge>
                                <span>{alert.thresholdPrice} {alert.currency}</span>
                              </span>
                              <span className="text-muted-foreground">
                                {parseFloat(emulateForm.newPrice || '0') && alert.currency === emulateForm.currency ? (
                                  parseFloat(emulateForm.newPrice) <= alert.thresholdPrice && alert.thresholdType === 'below' ? (
                                    <Badge variant="destructive" className="text-xs">Will Trigger</Badge>
                                  ) : parseFloat(emulateForm.newPrice) >= alert.thresholdPrice && alert.thresholdType === 'above' ? (
                                    <Badge variant="destructive" className="text-xs">Will Trigger</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">No Trigger</Badge>
                                  )
                                ) : (
                                  <Badge variant="outline" className="text-xs">Different Currency</Badge>
                                )}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleBuyNFT(emulateForm.collectionName, parseFloat(emulateForm.newPrice || '0'), emulateForm.currency)}
                        disabled={emulateLoading || !emulateForm.collectionName || !emulateForm.newPrice || walletLoading || !wallet}
                        variant="outline"
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        {walletLoading ? 'Buying...' : '🛒 Buy NFT'}
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setIsEmulateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleEmulatePrice} 
                        disabled={emulateLoading || alerts.length === 0}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {emulateLoading ? 'Emulating...' : 'Emulate Price Change'}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Active Watches Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <CardTitle>Active Watches ({filteredAlerts.length})</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Alert
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search collections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-32">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="eth">ETH</SelectItem>
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="avax">AVAX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('collectionName')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Collection</span>
                          {sortBy === 'collectionName' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('thresholdType')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Type</span>
                          {sortBy === 'thresholdType' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('thresholdPrice')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Threshold</span>
                          {sortBy === 'thresholdPrice' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('currency')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Currency</span>
                          {sortBy === 'currency' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          {sortBy === 'createdAt' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{alert.collectionName}</div>
                              <div className="text-sm text-muted-foreground">NFT Collection</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={alert.thresholdType === 'below' ? 'destructive' : 'default'}>
                            {alert.thresholdType === 'below' ? (
                              <>
                                <TrendingDown className="w-3 h-3 mr-1" />
                                Below
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Above
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {showValues ? `${alert.thresholdPrice} ${alert.currency}` : '••••••'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{alert.currency}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTime(alert.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(alert)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete alert"
                              disabled={deletingAlertId === alert.id}
                            >
                              {deletingAlertId === alert.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No alerts found</p>
                    <p className="text-sm">Create your first price alert to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* NFT Holdings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>NFT Portfolio ({wallet?.nftHoldings?.length || 0})</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wallet?.nftHoldings && wallet.nftHoldings.length > 0 ? (
                    wallet.nftHoldings.map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{nft.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {nft.collection}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Purchased {formatTime(nft.purchaseDate)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {showValues ? 
                              `${dummyWalletService.formatCurrency(nft.purchasePrice, nft.purchaseCurrency)}` :
                              '••••••••'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Purchase Price
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {nft.purchaseCurrency}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No NFTs in portfolio</p>
                      <p className="text-sm">Buy NFTs using the Emulate feature to see them here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Notifications ({notifications.length})</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium">{notification.collectionName}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatTime(notification.triggeredAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {notification.currentPrice} {notification.currentCurrency}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {notification.message}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">
                            Triggered
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BellOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications yet</p>
                      <p className="text-sm">Alerts will appear here when triggered</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}