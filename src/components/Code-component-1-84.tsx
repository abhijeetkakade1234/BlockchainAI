import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  MessageCircle, 
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  Share,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Eye,
  Menu,
  MoreHorizontal,
  Zap,
  Send,
  ShoppingCart,
  Crown,
  Star,
  Activity,
  BarChart3,
  Settings,
  HelpCircle,
  Image as ImageIcon,
  Download,
  Copy
} from 'lucide-react';

interface NFTGalleryProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onNavigateBack: () => void;
  onNavigateToChat: () => void;
}

interface NFTItem {
  id: string;
  name: string;
  collection: string;
  tokenId: string;
  image: string;
  price: string;
  floorPrice: string;
  rarity: string;
  rarityRank: number;
  traits: number;
  liked: boolean;
  lastSale?: string;
  listed: boolean;
}

interface Collection {
  id: string;
  name: string;
  floorPrice: string;
  volume: string;
  change24h: string;
  isPositive: boolean;
}

export function NFTGallery({ isDarkMode, toggleDarkMode, onNavigateBack, onNavigateToChat }: NFTGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const collections: Collection[] = [
    {
      id: 'cryptopunks',
      name: 'CryptoPunks',
      floorPrice: '42.5 ETH',
      volume: '1,234 ETH',
      change24h: '+5.2%',
      isPositive: true
    },
    {
      id: 'bayc',
      name: 'Bored Ape Yacht Club',
      floorPrice: '28.8 ETH',
      volume: '856 ETH',
      change24h: '-2.1%',
      isPositive: false
    },
    {
      id: 'art-blocks',
      name: 'Art Blocks Curated',
      floorPrice: '2.1 ETH',
      volume: '324 ETH',
      change24h: '+12.7%',
      isPositive: true
    }
  ];

  const nfts: NFTItem[] = [
    {
      id: '1',
      name: 'Cosmic Wanderer #2847',
      collection: 'Cosmic Collection',
      tokenId: '2847',
      image: 'https://images.unsplash.com/photo-1654183621855-8fd86fd79d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxORlQlMjBkaWdpdGFsJTIwYXJ0JTIwZ2FsbGVyeXxlbnwxfHx8fDE3NTczNjI0MzB8MA&ixlib=rb-4.1.0&q=80&w=400',
      price: '3.2 ETH',
      floorPrice: '2.8 ETH',
      rarity: 'Legendary',
      rarityRank: 15,
      traits: 8,
      liked: true,
      lastSale: '2.9 ETH',
      listed: true
    },
    {
      id: '2',
      name: 'Abstract Dreams #1024',
      collection: 'Digital Dreams',
      tokenId: '1024',
      image: 'https://images.unsplash.com/photo-1706625517139-7cb5991fb69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyME5GVCUyMGFydHdvcmt8ZW58MXx8fHwxNzU3MzYyNDM0fDA&ixlib=rb-4.1.0&q=80&w=400',
      price: '1.8 ETH',
      floorPrice: '1.5 ETH',
      rarity: 'Rare',
      rarityRank: 142,
      traits: 6,
      liked: false,
      lastSale: '1.6 ETH',
      listed: false
    },
    {
      id: '3',
      name: 'Neon Genesis #0557',
      collection: 'Neon Collection',
      tokenId: '0557',
      image: 'https://images.unsplash.com/photo-1635438004811-54b5864e57eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGRpZ2l0YWwlMjBhcnQlMjBORlR8ZW58MXx8fHwxNzU3MzYyNDM4fDA&ixlib=rb-4.1.0&q=80&w=400',
      price: '0.9 ETH',
      floorPrice: '0.7 ETH',
      rarity: 'Common',
      rarityRank: 891,
      traits: 4,
      liked: true,
      lastSale: '0.8 ETH',
      listed: true
    },
    {
      id: '4',
      name: 'Pixel Art #3021',
      collection: 'Pixel Masters',
      tokenId: '3021',
      image: 'https://images.unsplash.com/photo-1642432556591-72cbc671b707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMEFJJTIwYmxvY2tjaGFpbiUyMHRlY2hub2xvZ3klMjBpbGx1c3RyYXRpb258ZW58MXx8fHwxNzU3MzYxOTUyfDA&ixlib=rb-4.1.0&q=80&w=400',
      price: '5.7 ETH',
      floorPrice: '4.2 ETH',
      rarity: 'Epic',
      rarityRank: 42,
      traits: 9,
      liked: false,
      lastSale: '4.8 ETH',
      listed: true
    },
    {
      id: '5',
      name: 'Cyber Punk #7890',
      collection: 'Cyber Collection',
      tokenId: '7890',
      image: 'https://images.unsplash.com/photo-1582693692339-3f6556e86f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMGJsb2NrY2hhaW4lMjBhYnN0cmFjdHxlbnwxfHx8fDE3NTczNjE5NTR8MA&ixlib=rb-4.1.0&q=80&w=400',
      price: '2.4 ETH',
      floorPrice: '2.1 ETH',
      rarity: 'Uncommon',
      rarityRank: 356,
      traits: 5,
      liked: true,
      lastSale: '2.2 ETH',
      listed: false
    },
    {
      id: '6',
      name: 'Ethereal Spirit #1337',
      collection: 'Spirit Realm',
      tokenId: '1337',
      image: 'https://images.unsplash.com/photo-1634097537825-b446635b2f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjBwb3J0Zm9saW8lMjBkYXNoYm9hcmQlMjBjaGFydHN8ZW58MXx8fHwxNzU3MzYyNDI3fDA&ixlib=rb-4.1.0&q=80&w=400',
      price: '1.2 ETH',
      floorPrice: '1.0 ETH',
      rarity: 'Rare',
      rarityRank: 201,
      traits: 7,
      liked: false,
      lastSale: '1.1 ETH',
      listed: true
    }
  ];

  const filteredNFTs = nfts
    .filter(nft => {
      if (selectedCollection !== 'all' && nft.collection !== selectedCollection) return false;
      if (searchQuery && !nft.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !nft.collection.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (rarityFilter !== 'all' && nft.rarity.toLowerCase() !== rarityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-high':
          return parseFloat(b.price.split(' ')[0]) - parseFloat(a.price.split(' ')[0]);
        case 'price-low':
          return parseFloat(a.price.split(' ')[0]) - parseFloat(b.price.split(' ')[0]);
        case 'rarity':
          return a.rarityRank - b.rarityRank;
        default:
          return 0;
      }
    });

  const toggleLike = (nftId: string) => {
    // In a real app, this would make an API call
    console.log('Toggle like for NFT:', nftId);
  };

  const handleAction = (action: string, nft: NFTItem) => {
    console.log(`${action} NFT:`, nft.name);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'text-yellow-500 bg-yellow-500/10';
      case 'epic': return 'text-purple-500 bg-purple-500/10';
      case 'rare': return 'text-blue-500 bg-blue-500/10';
      case 'uncommon': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
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
          { id: 'portfolio', label: 'Portfolio', icon: BarChart3 },
          { id: 'transactions', label: 'Transactions', icon: Activity },
          { id: 'nfts', label: 'NFTs', icon: ImageIcon, onClick: null },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick || undefined}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.id === 'nfts'
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
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">NFT Gallery</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                  {isDarkMode ? '☀️' : '🌙'}
                </Button>
              </div>
            </div>
          </header>

          {/* Filters Bar */}
          <div className="border-b border-border p-4 bg-card/30">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search NFTs, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Collections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Collections</SelectItem>
                    {collections.map(collection => (
                      <SelectItem key={collection.id} value={collection.name}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-1">Under 1 ETH</SelectItem>
                    <SelectItem value="1-5">1-5 ETH</SelectItem>
                    <SelectItem value="above-5">Above 5 ETH</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarity</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="rarity">Rarity Rank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Collections Stats */}
          <div className="p-4 border-b border-border bg-card/20">
            <h3 className="font-medium mb-3">Trending Collections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collections.map(collection => (
                <Card key={collection.id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{collection.name}</h4>
                    <div className={`text-xs flex items-center space-x-1 ${
                      collection.isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {collection.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{collection.change24h}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Floor: {collection.floorPrice}</span>
                    <span>Volume: {collection.volume}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* NFT Grid/List */}
          <div className="flex-1 overflow-auto p-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNFTs.map((nft) => (
                  <Card key={nft.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                    <div className="relative">
                      <ImageWithFallback
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-64 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(nft.id);
                          }}
                        >
                          <Heart className={`w-4 h-4 ${nft.liked ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className={getRarityColor(nft.rarity)}>
                          <Crown className="w-3 h-3 mr-1" />
                          {nft.rarity}
                        </Badge>
                      </div>
                      {nft.listed && (
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="default" className="bg-green-500 text-white">
                            Listed
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm truncate">{nft.name}</h3>
                          <p className="text-xs text-muted-foreground">{nft.collection}</p>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span>#{nft.tokenId}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>Rank #{nft.rarityRank}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Current Price</p>
                            <p className="font-semibold">{nft.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Floor Price</p>
                            <p className="text-sm">{nft.floorPrice}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="flex-1" onClick={() => setSelectedNFT(nft)}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{nft.name}</DialogTitle>
                              </DialogHeader>
                              {selectedNFT && (
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <ImageWithFallback
                                      src={selectedNFT.image}
                                      alt={selectedNFT.name}
                                      className="w-full rounded-lg"
                                    />
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="font-semibold text-lg">{selectedNFT.name}</h3>
                                      <p className="text-muted-foreground">{selectedNFT.collection}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">Token ID</p>
                                        <p className="font-medium">#{selectedNFT.tokenId}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Rarity Rank</p>
                                        <p className="font-medium">#{selectedNFT.rarityRank}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Traits</p>
                                        <p className="font-medium">{selectedNFT.traits}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Last Sale</p>
                                        <p className="font-medium">{selectedNFT.lastSale || 'N/A'}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Current Price</span>
                                        <span className="font-semibold">{selectedNFT.price}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Floor Price</span>
                                        <span>{selectedNFT.floorPrice}</span>
                                      </div>
                                    </div>

                                    <div className="flex space-x-2">
                                      <Button className="flex-1" onClick={() => handleAction('buy', selectedNFT)}>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Buy Now
                                      </Button>
                                      <Button variant="outline" onClick={() => handleAction('transfer', selectedNFT)}>
                                        <Send className="w-4 h-4 mr-2" />
                                        Transfer
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {nft.listed ? (
                            <Button size="sm" variant="outline" onClick={() => handleAction('buy', nft)}>
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleAction('sell', nft)}>
                              <Zap className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNFTs.map((nft) => (
                  <Card key={nft.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <ImageWithFallback
                        src={nft.image}
                        alt={nft.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{nft.name}</h3>
                            <p className="text-sm text-muted-foreground">{nft.collection}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span>#{nft.tokenId}</span>
                              <span>Rank #{nft.rarityRank}</span>
                              <span>{nft.traits} traits</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{nft.price}</p>
                            <p className="text-sm text-muted-foreground">Floor: {nft.floorPrice}</p>
                            <Badge className={`mt-2 ${getRarityColor(nft.rarity)}`}>
                              {nft.rarity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(nft.id)}
                        >
                          <Heart className={`w-4 h-4 ${nft.liked ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}