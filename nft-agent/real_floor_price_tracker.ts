// real_floor_price_tracker.ts - Avalanche NFT Floor Price Tracker
import "dotenv/config";
import fetch from "node-fetch";

interface FloorPriceResult {
  floor_price_avax: string;
  floor_price_usd: string;
  marketplace: string;
  last_updated: string;
  total_listings: number;
  volume_24h?: string;
  market_cap?: string;
}

interface APIConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  endpoints: {
    floorPrice: string;
    collection: string;
  };
}

// API configurations for different services
const API_CONFIGS: APIConfig[] = [
  {
    name: "CoinGecko",
    baseUrl: "https://api.coingecko.com/api/v3",
    endpoints: {
      floorPrice: "/nfts",
      collection: "/nfts"
    }
  },
  {
    name: "GoldRush",
    baseUrl: "https://api.goldrush.dev",
    apiKey: process.env.GOLDRUSH_API_KEY,
    endpoints: {
      floorPrice: "/api/v1/collections",
      collection: "/api/v1/collections"
    }
  },
  {
    name: "Alchemy",
    baseUrl: "https://avalanche-mainnet.g.alchemy.com/nft/v2",
    apiKey: process.env.ALCHEMY_API_KEY,
    endpoints: {
      floorPrice: "/getFloorPrice",
      collection: "/getContractMetadata"
    }
  }
];

class AvalancheFloorPriceTracker {
  private cache: Map<string, FloorPriceResult> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Method 1: Try CoinGecko API
  private async tryCoinGecko(contractAddress: string): Promise<FloorPriceResult | null> {
    try {
      console.log("🦎 Trying CoinGecko API...");
      
      // CoinGecko uses collection names, not contract addresses
      // We'll try to find the collection by searching
      const searchResponse = await fetch(
        `${API_CONFIGS[0].baseUrl}/search?query=${contractAddress}&category=nft`
      );
      
      if (!searchResponse.ok) {
        console.log("❌ CoinGecko: Search failed");
        return null;
      }
      
      const searchData = await searchResponse.json();
      
      if (searchData.nfts && searchData.nfts.length > 0) {
        const nft = searchData.nfts[0];
        const detailResponse = await fetch(
          `${API_CONFIGS[0].baseUrl}/nfts/${nft.id}`
        );
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          
          if (detailData.floor_price && detailData.floor_price.usd) {
            return {
              floor_price_avax: (detailData.floor_price.usd / 25).toFixed(2), // Approximate AVAX conversion
              floor_price_usd: detailData.floor_price.usd.toString(),
              marketplace: "CoinGecko",
              last_updated: new Date().toISOString(),
              total_listings: detailData.number_of_unique_addresses || 0,
              volume_24h: detailData.volume_24h?.usd?.toString(),
              market_cap: detailData.market_cap?.usd?.toString()
            };
          }
        }
      }
      
      console.log("❌ CoinGecko: No floor price data found");
      return null;
      
    } catch (error) {
      console.log("❌ CoinGecko: API error");
      return null;
    }
  }

  // Method 2: Try GoldRush API (Direct approach)
  private async tryGoldRush(contractAddress: string): Promise<FloorPriceResult | null> {
    try {
      console.log("🏆 Trying GoldRush API...");
      
      if (!API_CONFIGS[1].apiKey) {
        console.log("❌ GoldRush: No API key configured");
        return null;
      }
      
      // Try direct GoldRush API endpoints
      const endpoints = [
        `https://api.goldrush.dev/api/v1/collections/${contractAddress}/floor-price`,
        `https://api.goldrush.dev/api/v1/collections/${contractAddress}/stats`,
        `https://api.goldrush.dev/api/v1/nft/${contractAddress}/floor-price`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'X-API-Key': API_CONFIGS[1].apiKey,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Try different response formats
            if (data.floor_price || data.floorPrice) {
              const floorPrice = data.floor_price || data.floorPrice;
              const avaxPrice = await this.getAVAXPrice();
              
              return {
                floor_price_avax: floorPrice.avax || floorPrice.native || "0",
                floor_price_usd: floorPrice.usd || (parseFloat(floorPrice.avax || "0") * avaxPrice).toFixed(2),
                marketplace: "GoldRush",
                last_updated: new Date().toISOString(),
                total_listings: data.total_supply || data.totalSupply || 0,
                volume_24h: data.volume_24h?.toString(),
                market_cap: data.market_cap?.toString(),
                source: "goldrush_api"
              };
            }
            
            // If no floor price, try to extract from stats
            if (data.stats || data.collection_stats) {
              const stats = data.stats || data.collection_stats;
              if (stats.floor_price) {
                const avaxPrice = await this.getAVAXPrice();
                
                return {
                  floor_price_avax: stats.floor_price.avax || stats.floor_price.native || "0",
                  floor_price_usd: stats.floor_price.usd || (parseFloat(stats.floor_price.avax || "0") * avaxPrice).toFixed(2),
                  marketplace: "GoldRush",
                  last_updated: new Date().toISOString(),
                  total_listings: stats.total_supply || 0,
                  volume_24h: stats.volume_24h?.toString(),
                  market_cap: stats.market_cap?.toString(),
                  source: "goldrush_stats"
                };
              }
            }
          }
        } catch (endpointError) {
          // Try next endpoint
          continue;
        }
      }
      
      console.log("❌ GoldRush: No floor price data found");
      return null;
      
    } catch (error) {
      console.log("❌ GoldRush: API error");
      return null;
    }
  }

  // Method 3: Try Alchemy API
  private async tryAlchemy(contractAddress: string): Promise<FloorPriceResult | null> {
    try {
      console.log("🔮 Trying Alchemy API...");
      
      if (!API_CONFIGS[2].apiKey) {
        console.log("❌ Alchemy: No API key configured");
        return null;
      }
      
      const response = await fetch(
        `${API_CONFIGS[2].baseUrl}/${API_CONFIGS[2].apiKey}/getFloorPrice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contractAddress: contractAddress,
            chain: 'avalanche'
          })
        }
      );
      
      if (!response.ok) {
        console.log("❌ Alchemy: API request failed");
        return null;
      }
      
      const data = await response.json();
      
      if (data.floorPrice) {
        return {
          floor_price_avax: data.floorPrice.avax || "0",
          floor_price_usd: data.floorPrice.usd || "0",
          marketplace: "Alchemy",
          last_updated: new Date().toISOString(),
          total_listings: data.totalSupply || 0,
          volume_24h: data.volume24h?.toString(),
          market_cap: data.marketCap?.toString()
        };
      }
      
      console.log("❌ Alchemy: No floor price data");
      return null;
      
    } catch (error) {
      console.log("❌ Alchemy: API error");
      return null;
    }
  }

  // Method 4: Real marketplace scanning
  private async scanRealMarketplaces(contractAddress: string): Promise<FloorPriceResult | null> {
    try {
      console.log("⛓️ Scanning real marketplaces...");
      
      // Try to get real data from actual marketplaces
      const marketplaces = [
        { name: "Kalao", url: "https://kalao.io" },
        { name: "NFTrade", url: "https://nftrade.com" },
        { name: "OpenSea", url: "https://opensea.io" }
      ];
      
      console.log("🔍 Checking real marketplaces:");
      marketplaces.forEach(marketplace => {
        console.log(`   - ${marketplace.name}: ${marketplace.url}`);
      });
      
      console.log("💡 Real marketplace integration requires:");
      console.log("   1. Direct marketplace API integration");
      console.log("   2. Web scraping of marketplace data");
      console.log("   3. Smart contract interaction for listings");
      console.log("   4. Real-time price monitoring");
      
      // Return null instead of dummy data
      console.log("❌ No real marketplace data available");
      return null;
      
    } catch (error) {
      console.log("❌ Marketplace scanning failed");
      return null;
    }
  }

  // Main method to get floor price
  public async getFloorPrice(contractAddress: string): Promise<FloorPriceResult | null> {
    // Check cache first
    const cached = this.cache.get(contractAddress);
    if (cached && Date.now() - new Date(cached.last_updated).getTime() < this.cacheTimeout) {
      console.log("📦 Using cached floor price data");
      return cached;
    }

    console.log(`🔍 Getting floor price for ${contractAddress}...\n`);

    // Try different APIs in order of preference
    const methods = [
      () => this.tryCoinGecko(contractAddress),
      () => this.tryGoldRush(contractAddress),
      () => this.tryAlchemy(contractAddress),
      () => this.scanRealMarketplaces(contractAddress)
    ];

    for (const method of methods) {
      const result = await method();
      if (result) {
        // Cache the result
        this.cache.set(contractAddress, result);
        return result;
      }
    }

    console.log("❌ No floor price data found from any source");
    return null;
  }

  // Get AVAX price in USD for conversion
  public async getAVAXPrice(): Promise<number> {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd"
      );
      
      if (response.ok) {
        const data = await response.json();
        return data['avalanche-2']?.usd || 25; // Default to $25 if API fails
      }
    } catch (error) {
      console.log("❌ Failed to get AVAX price, using default $25");
    }
    
    return 25; // Default AVAX price
  }

  // Convert USD to AVAX
  public async convertUSDToAVAX(usdAmount: number): Promise<string> {
    const avaxPrice = await this.getAVAXPrice();
    return (usdAmount / avaxPrice).toFixed(2);
  }

  // Convert AVAX to USD
  public async convertAVAXToUSD(avaxAmount: number): Promise<string> {
    const avaxPrice = await this.getAVAXPrice();
    return (avaxAmount * avaxPrice).toFixed(2);
  }
}

// Export for use in other files
export { AvalancheFloorPriceTracker, FloorPriceResult };

