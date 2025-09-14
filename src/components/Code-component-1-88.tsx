import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  MessageCircle, 
  User,
  Lock,
  Bell,
  Shield,
  Wallet,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings,
  Menu,
  Key,
  Globe,
  Smartphone,
  Mail,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Activity,
  BarChart3,
  HelpCircle,
  Image as ImageIcon,
  Save,
  RefreshCw,
  ExternalLink,
  Copy,
  Loader2
} from 'lucide-react';

interface SettingsPageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onNavigateBack: () => void;
  onNavigateToChat: () => void;
}

interface ConnectedWallet {
  id: string;
  name: string;
  address: string;
  type: string;
  balance: string;
  connected: boolean;
}

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function SettingsPage({ isDarkMode, toggleDarkMode, onNavigateBack, onNavigateToChat }: SettingsPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const [accountData, setAccountData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Crypto enthusiast and DeFi trader',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([
    {
      id: '1',
      name: 'MetaMask',
      address: '0x1234...5678',
      type: 'Ethereum',
      balance: '12.45 ETH',
      connected: true
    },
    {
      id: '2',
      name: 'Phantom',
      address: 'Abc123...xyz789',
      type: 'Solana',
      balance: '145.32 SOL',
      connected: true
    },
    {
      id: '3',
      name: 'Keplr',
      address: 'cosmos1abc...xyz789',
      type: 'Cosmos',
      balance: '89.21 ATOM',
      connected: false
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'transactions',
      label: 'Transaction Updates',
      description: 'Get notified when transactions are completed',
      enabled: true
    },
    {
      id: 'portfolio',
      label: 'Portfolio Changes',
      description: 'Alerts for significant portfolio value changes',
      enabled: true
    },
    {
      id: 'market',
      label: 'Market Alerts',
      description: 'Price alerts and market news',
      enabled: false
    },
    {
      id: 'security',
      label: 'Security Alerts',
      description: 'Login attempts and security notifications',
      enabled: true
    },
    {
      id: 'nft',
      label: 'NFT Activity',
      description: 'NFT sales, offers, and collection updates',
      enabled: false
    }
  ]);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('mainnet');
  const [gasPreference, setGasPreference] = useState('standard');

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    // Show success message
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountData.newPassword !== accountData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    
    // Reset password fields
    setAccountData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const toggleWalletConnection = (walletId: string) => {
    setConnectedWallets(prev =>
      prev.map(wallet =>
        wallet.id === walletId
          ? { ...wallet, connected: !wallet.connected }
          : wallet
      )
    );
  };

  const toggleNotification = (notificationId: string) => {
    setNotificationSettings(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  const exportData = () => {
    console.log('Exporting user data...');
  };

  const deleteAccount = () => {
    console.log('Account deletion requested...');
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
          { id: 'chat', label: 'Chat', icon: MessageCircle, onClick: onNavigateToChat },
          { id: 'portfolio', label: 'Portfolio', icon: BarChart3 },
          { id: 'transactions', label: 'Transactions', icon: Activity },
          { id: 'nfts', label: 'NFTs', icon: ImageIcon },
          { id: 'settings', label: 'Settings', icon: Settings, onClick: null }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick || undefined}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.id === 'settings'
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

      {/* Wallet Connection */}
      <div className="p-4 border-t border-sidebar-border">
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
                  <Settings className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Settings</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="account" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Account</span>
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">Wallet</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Privacy</span>
                  </TabsTrigger>
                </TabsList>

                {/* Account Settings */}
                <TabsContent value="account" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Profile Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center space-x-6">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
                          <AvatarFallback className="text-xl">JD</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG or GIF. Max size 2MB.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleAccountUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={accountData.name}
                              onChange={(e) => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={accountData.email}
                              onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Input
                            id="bio"
                            value={accountData.bio}
                            onChange={(e) => setAccountData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself"
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Update Profile
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lock className="w-5 h-5" />
                        <span>Change Password</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={accountData.currentPassword}
                              onChange={(e) => setAccountData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                              <Input
                                id="new-password"
                                type={showNewPassword ? 'text' : 'password'}
                                value={accountData.newPassword}
                                onChange={(e) => setAccountData(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="Enter new password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={accountData.confirmPassword}
                              onChange={(e) => setAccountData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Key className="w-4 h-4 mr-2" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Two-Factor Authentication</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                      </div>
                      {twoFactorEnabled && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Two-factor authentication is enabled using your authenticator app.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Wallet Settings */}
                <TabsContent value="wallet" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Wallet className="w-5 h-5" />
                        <span>Connected Wallets</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {connectedWallets.map((wallet) => (
                        <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              wallet.connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">{wallet.name}</p>
                              <p className="text-sm text-muted-foreground">{wallet.address}</p>
                              <p className="text-xs text-muted-foreground">{wallet.balance}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={wallet.connected ? 'default' : 'secondary'}>
                              {wallet.connected ? 'Connected' : 'Disconnected'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleWalletConnection(wallet.id)}
                            >
                              {wallet.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect New Wallet
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Globe className="w-5 h-5" />
                        <span>Network Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="network">Default Network</Label>
                        <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mainnet">Ethereum Mainnet</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                            <SelectItem value="bsc">BSC</SelectItem>
                            <SelectItem value="avalanche">Avalanche</SelectItem>
                            <SelectItem value="base">Base</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gas">Gas Price Preference</Label>
                        <Select value={gasPreference} onValueChange={setGasPreference}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slow">Slow (Lower fees)</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="fast">Fast (Higher fees)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications */}
                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="w-5 h-5" />
                        <span>Notification Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                              </p>
                            </div>
                          </div>
                          <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Push Notifications</p>
                              <p className="text-sm text-muted-foreground">
                                Receive push notifications on your device
                              </p>
                            </div>
                          </div>
                          <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {soundEnabled ? (
                              <Volume2 className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <VolumeX className="w-4 h-4 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium">Sound Notifications</p>
                              <p className="text-sm text-muted-foreground">
                                Play sound for notifications
                              </p>
                            </div>
                          </div>
                          <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Notification Types</h4>
                        {notificationSettings.map((notification) => (
                          <div key={notification.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{notification.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {notification.description}
                              </p>
                            </div>
                            <Switch 
                              checked={notification.enabled} 
                              onCheckedChange={() => toggleNotification(notification.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Privacy Settings */}
                <TabsContent value="privacy" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Privacy & Data</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Data Sharing</p>
                            <p className="text-sm text-muted-foreground">
                              Share anonymized data to improve our services
                            </p>
                          </div>
                          <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Analytics Opt-out</p>
                            <p className="text-sm text-muted-foreground">
                              Opt out of analytics and usage tracking
                            </p>
                          </div>
                          <Switch checked={analyticsOptOut} onCheckedChange={setAnalyticsOptOut} />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Data Management</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button variant="outline" onClick={exportData}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </Button>
                          <Button variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Privacy Policy
                          </Button>
                          <Button variant="outline">
                            <Copy className="w-4 h-4 mr-2" />
                            Terms of Service
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          <div className="space-y-3">
                            <p>
                              <strong>Danger Zone</strong><br />
                              Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <Button variant="destructive" size="sm" onClick={deleteAccount}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Account
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}