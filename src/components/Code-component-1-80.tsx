import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
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
  EyeOff
} from 'lucide-react';

interface PortfolioDashboardProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onNavigateBack: () => void;
  onNavigateToChat: () => void;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  value: string;
  price: string;
  change24h: string;
  changePercent: string;
  isPositive: boolean;
  icon: string;
}

interface PerformanceData {
  date: string;
  value: number;
}

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

interface Transaction {
  id: string;
  type: 'Buy' | 'Sell' | 'Swap' | 'Send' | 'Receive';
  asset: string;
  amount: string;
  value: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  hash?: string;
}

export function PortfolioDashboard({ isDarkMode, toggleDarkMode, onNavigateBack, onNavigateToChat }: PortfolioDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [showValues, setShowValues] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const portfolioStats = {
    totalValue: '$12,847.32',
    change24h: '+$234.12',
    changePercent: '+1.86%',
    isPositive: true
  };

  const assets: Asset[] = [
    {
      id: '1',
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '3.2458',
      value: '$8,240.00',
      price: '$2,540.00',
      change24h: '+$25.40',
      changePercent: '+1.01%',
      isPositive: true,
      icon: '⟠'
    },
    {
      id: '2',
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: '0.1502',
      value: '$4,200.00',
      price: '$27,962.00',
      change24h: '+$340.12',
      changePercent: '+1.23%',
      isPositive: true,
      icon: '₿'
    },
    {
      id: '3',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '407.32',
      value: '$407.32',
      price: '$1.00',
      change24h: '+$0.00',
      changePercent: '+0.00%',
      isPositive: true,
      icon: '🔵'
    },
    {
      id: '4',
      symbol: 'SOL',
      name: 'Solana',
      balance: '42.18',
      value: '$837.17',
      price: '$19.85',
      change24h: '+$0.45',
      changePercent: '+2.32%',
      isPositive: true,
      icon: '◉'
    },
    {
      id: '5',
      symbol: 'MATIC',
      name: 'Polygon',
      balance: '156.89',
      value: '$125.51',
      price: '$0.80',
      change24h: '-$0.02',
      changePercent: '-2.44%',
      isPositive: false,
      icon: '⬢'
    }
  ];

  const performanceData: PerformanceData[] = [
    { date: '2024-01-01', value: 10500 },
    { date: '2024-01-02', value: 10800 },
    { date: '2024-01-03', value: 10650 },
    { date: '2024-01-04', value: 11200 },
    { date: '2024-01-05', value: 11800 },
    { date: '2024-01-06', value: 12100 },
    { date: '2024-01-07', value: 12400 },
    { date: '2024-01-08', value: 12847 }
  ];

  const allocationData: AllocationData[] = [
    { name: 'ETH', value: 64.1, color: '#627EEA' },
    { name: 'BTC', value: 32.7, color: '#F7931A' },
    { name: 'USDC', value: 3.2, color: '#2775CA' },
    { name: 'Others', value: 3.5, color: '#8B5CF6' }
  ];

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      type: 'Swap',
      asset: 'ETH → USDC',
      amount: '0.5 ETH',
      value: '$1,270.00',
      timestamp: new Date(Date.now() - 3600000),
      status: 'completed',
      hash: '0x1234...5678'
    },
    {
      id: '2',
      type: 'Buy',
      asset: 'SOL',
      amount: '50 SOL',
      value: '$992.50',
      timestamp: new Date(Date.now() - 7200000),
      status: 'completed'
    },
    {
      id: '3',
      type: 'Send',
      asset: 'USDC',
      amount: '100 USDC',
      value: '$100.00',
      timestamp: new Date(Date.now() - 10800000),
      status: 'pending'
    },
    {
      id: '4',
      type: 'Receive',
      asset: 'BTC',
      amount: '0.01 BTC',
      value: '$280.00',
      timestamp: new Date(Date.now() - 86400000),
      status: 'completed',
      hash: '0xabcd...efgh'
    }
  ];

  const filteredAssets = assets
    .filter(asset => {
      if (filterBy === 'all') return true;
      if (filterBy === 'gainers') return asset.isPositive;
      if (filterBy === 'losers') return !asset.isPositive;
      return true;
    })
    .filter(asset => 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'balance':
          aValue = parseFloat(a.balance);
          bValue = parseFloat(b.balance);
          break;
        case 'value':
          aValue = parseFloat(a.value.replace('$', '').replace(',', ''));
          bValue = parseFloat(b.value.replace('$', '').replace(',', ''));
          break;
        case 'change':
          aValue = parseFloat(a.changePercent.replace('%', ''));
          bValue = parseFloat(b.changePercent.replace('%', ''));
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

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
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
          { id: 'portfolio', label: 'Portfolio', icon: BarChart3, onClick: null },
          { id: 'transactions', label: 'Transactions', icon: Activity },
          { id: 'nfts', label: 'NFTs', icon: ImageWithFallback },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick || undefined}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.id === 'portfolio'
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
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Portfolio</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {showValues ? portfolioStats.totalValue : '••••••'}
                  </div>
                  <div className={`text-xs flex items-center space-x-1 ${
                    portfolioStats.isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {portfolioStats.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {showValues ? `${portfolioStats.change24h} (${portfolioStats.changePercent})` : '•••••'}
                    </span>
                    <span className="text-muted-foreground">from yesterday</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">24h Change</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {showValues ? portfolioStats.changePercent : '••••'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {showValues ? portfolioStats.change24h : '••••••'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assets</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assets.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across multiple networks
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Portfolio Performance</CardTitle>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1D</SelectItem>
                      <SelectItem value="7d">7D</SelectItem>
                      <SelectItem value="30d">30D</SelectItem>
                      <SelectItem value="1y">1Y</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).getDate().toString()}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Portfolio Value']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#4A90E2" 
                          strokeWidth={2}
                          dot={{ fill: '#4A90E2', strokeWidth: 0, r: 4 }}
                          activeDot={{ r: 6, stroke: '#4A90E2', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Allocation Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          dataKey="value"
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {allocationData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assets Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <CardTitle>Your Assets</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search assets..."
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
                        <SelectItem value="gainers">Gainers</SelectItem>
                        <SelectItem value="losers">Losers</SelectItem>
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
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Asset</span>
                          {sortBy === 'name' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('balance')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Balance</span>
                          {sortBy === 'balance' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('value')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Value</span>
                          {sortBy === 'value' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('change')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>24h Change</span>
                          {sortBy === 'change' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-lg">{asset.icon}</span>
                            </div>
                            <div>
                              <div className="font-medium">{asset.symbol}</div>
                              <div className="text-sm text-muted-foreground">{asset.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{showValues ? asset.balance : '••••••'}</div>
                            <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                          </div>
                        </TableCell>
                        <TableCell>{showValues ? asset.price : '••••••'}</TableCell>
                        <TableCell className="font-medium">
                          {showValues ? asset.value : '••••••'}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center space-x-1 ${
                            asset.isPositive ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {asset.isPositive ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span className="text-sm">
                              {showValues ? asset.changePercent : '•••'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'Buy' ? 'bg-green-500/10 text-green-500' :
                          tx.type === 'Sell' ? 'bg-red-500/10 text-red-500' :
                          tx.type === 'Swap' ? 'bg-blue-500/10 text-blue-500' :
                          tx.type === 'Send' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-purple-500/10 text-purple-500'
                        }`}>
                          {tx.type === 'Buy' && <TrendingUp className="w-5 h-5" />}
                          {tx.type === 'Sell' && <TrendingDown className="w-5 h-5" />}
                          {tx.type === 'Swap' && <RefreshCw className="w-5 h-5" />}
                          {tx.type === 'Send' && <ArrowLeft className="w-5 h-5" />}
                          {tx.type === 'Receive' && <ArrowLeft className="w-5 h-5 rotate-180" />}
                        </div>
                        <div>
                          <div className="font-medium">{tx.type} {tx.asset}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(tx.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {showValues ? tx.amount : '••••••'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {showValues ? tx.value : '••••••'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            tx.status === 'completed' ? 'default' : 
                            tx.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}