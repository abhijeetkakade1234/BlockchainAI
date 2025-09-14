// real_nft_api.ts - Real NFT Floor Price API Integration
import "dotenv/config";
import fetch from "node-fetch";

interface RealNFTData {
  collection_name: string;
  contract_address: string;
  floor_price_eth: number;
  floor_price_usd: number;
  volume_24h: number;
  total_supply: number;
  owners_count: number;
  marketplace: string;
  last_updated: string;
}

class RealNFTAPI {
  private openSeaAPIKey = process.env.OPENSEA_API_KEY || '';
  private searchCache: Map<string, { result: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private lastRequestTime = 0;
  private requestDelay = 1000; // 1 second between requests

  // Get real floor price from OpenSea API (requires API key)
  async getOpenSeaFloorPrice(contractAddress: string): Promise<RealNFTData | null> {
    try {
      console.log("🌊 Getting real data from OpenSea API...");
      
      if (!this.openSeaAPIKey) {
        console.log("❌ OpenSea API key required - skipping");
        return null;
      }
      
      // OpenSea API v2 endpoint for collection stats
      const url = `https://api.opensea.io/api/v2/collections/${contractAddress}/stats`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': this.openSeaAPIKey,
          'User-Agent': 'Mozilla/5.0 (compatible; NFT-Agent/1.0)'
        }
      });
      
      if (!response.ok) {
        console.log(`❌ OpenSea API error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.stats) {
        const stats = data.stats;
        
        // Get current ETH price
        const ethPrice = await this.getETHPrice();
        
        return {
          collection_name: data.name || 'Unknown Collection',
          contract_address: contractAddress,
          floor_price_eth: stats.floor_price || 0,
          floor_price_usd: (stats.floor_price || 0) * ethPrice,
          volume_24h: stats.volume_1d || 0,
          total_supply: stats.total_supply || 0,
          owners_count: stats.num_owners || 0,
          marketplace: 'OpenSea',
          last_updated: new Date().toISOString()
        };
      }
      
      console.log("❌ No stats data found in OpenSea response");
      return null;
      
    } catch (error) {
      console.log("❌ OpenSea API error:", error);
      return null;
    }
  }

  // Get real floor price from CoinGecko NFT API with rate limiting
  async getCoinGeckoFloorPrice(collectionName: string): Promise<RealNFTData | null> {
    try {
      // Rate limiting
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.requestDelay) {
        const delay = this.requestDelay - timeSinceLastRequest;
        console.log(`⏳ Rate limiting: waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      console.log("🦎 Getting real data from CoinGecko NFT API...");
      this.lastRequestTime = Date.now();
      
      // CoinGecko NFT API endpoint using collection name
      const url = `https://api.coingecko.com/api/v3/nfts/${collectionName}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NFT-Agent/1.0)'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          console.log(`⚠️ Rate limited by CoinGecko. Please wait a moment and try again.`);
          return null;
        }
        console.log(`❌ CoinGecko API error: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.floor_price) {
        const ethPrice = await this.getETHPrice();
        
        return {
          collection_name: data.name || collectionName,
          contract_address: data.contract_address || 'unknown',
          floor_price_eth: data.floor_price?.native_currency || 0,
          floor_price_usd: data.floor_price?.usd || 0,
          volume_24h: data.volume_24h?.usd || 0,
          total_supply: data.number_of_unique_addresses || 0,
          owners_count: data.number_of_unique_addresses || 0,
          marketplace: 'CoinGecko',
          last_updated: new Date().toISOString()
        };
      }
      
      console.log("❌ No floor price data found in CoinGecko response");
      return null;
      
    } catch (error) {
      console.log("❌ CoinGecko API error:", error);
      return null;
    }
  }

  // Search for NFT collections on CoinGecko with caching and rate limiting
  async searchCollectionOnCoinGecko(query: string): Promise<{ id: string; name: string } | null> {
    try {
      // Check cache first
      const cached = this.searchCache.get(query);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📦 Using cached search result for: ${query}`);
        return cached.result;
      }
      
      // Rate limiting
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.requestDelay) {
        const delay = this.requestDelay - timeSinceLastRequest;
        console.log(`⏳ Rate limiting: waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      console.log(`🔍 Searching CoinGecko for: ${query}`);
      this.lastRequestTime = Date.now();
      
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          console.log(`⚠️ Rate limited by CoinGecko. Please wait a moment and try again.`);
          return null;
        }
        console.log(`❌ CoinGecko search error: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.nfts && data.nfts.length > 0) {
        // Find the best match using fuzzy matching
        const bestMatch = this.findBestMatch(query, data.nfts);
        const result = {
          id: bestMatch.id,
          name: bestMatch.name
        };
        
        // Cache the result
        this.searchCache.set(query, { result, timestamp: Date.now() });
        
        console.log(`✅ Found collection: ${bestMatch.name} (${bestMatch.id})`);
        return result;
      }
      
      console.log("❌ No collections found in search results");
      // Cache negative results too (for shorter time)
      this.searchCache.set(query, { result: null, timestamp: Date.now() });
      return null;
      
    } catch (error) {
      console.log("❌ CoinGecko search error:", error);
      return null;
    }
  }

  // Generate alternative search terms for fuzzy matching
  generateAlternativeSearchTerms(input: string): string[] {
    const alternatives: string[] = [];
    
    // Remove special characters and spaces
    const cleanInput = input.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    // Add original input
    alternatives.push(input);
    
    // Add clean version
    alternatives.push(cleanInput);
    
    // Add space-separated version
    if (cleanInput.includes('-')) {
      alternatives.push(cleanInput.replace(/-/g, ' '));
    }
    
    // Add hyphenated version
    if (cleanInput.includes(' ')) {
      alternatives.push(cleanInput.replace(/\s+/g, '-'));
    }
    
    // Add camelCase version
    alternatives.push(cleanInput.replace(/\s+/g, ''));
    
    // Add lowercase version
    alternatives.push(cleanInput.toLowerCase());
    
    // Add uppercase version
    alternatives.push(cleanInput.toUpperCase());
    
    // Add title case version
    alternatives.push(cleanInput.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    ));
    
    // Common abbreviations mapping
    const abbreviations: { [key: string]: string[] } = {
      'bayc': ['bored ape yacht club', 'bored ape', 'boredape'],
      'mayc': ['mutant ape yacht club', 'mutant ape', 'mutantapes'],
      'cc': ['cool cats', 'coolcats'],
      'punks': ['cryptopunks', 'crypto punks'],
      'wow': ['world of women', 'worldofwomen'],
      'clonex': ['clone x', 'clone-x']
    };
    
    const lowerInput = input.toLowerCase();
    if (abbreviations[lowerInput]) {
      alternatives.push(...abbreviations[lowerInput]);
    }
    
    // Reverse lookup - if input is a full name, add abbreviations
    for (const [abbr, fullNames] of Object.entries(abbreviations)) {
      if (fullNames.some(fullName => lowerInput.includes(fullName))) {
        alternatives.push(abbr);
      }
    }
    
    // Remove duplicates and empty strings
    return [...new Set(alternatives)].filter(term => term.length > 0);
  }

  // Find the best match using improved fuzzy matching
  private findBestMatch(query: string, collections: any[]): any {
    const queryLower = query.toLowerCase().trim();
    
    // Calculate similarity score for each collection
    const scoredCollections = collections.map(collection => {
      const nameLower = collection.name.toLowerCase();
      const idLower = collection.id.toLowerCase();
      
      let score = 0;
      
      // Exact match gets highest score
      if (nameLower === queryLower || idLower === queryLower) {
        score = 100;
      }
      // Exact word match gets high score
      else if (nameLower.includes(queryLower) || idLower.includes(queryLower)) {
        score = 80;
      }
      // Partial word match gets medium score
      else if (queryLower.includes(nameLower) || queryLower.includes(idLower)) {
        score = 60;
      }
      // Check for word boundaries (more precise matching)
      else {
        const queryWords = queryLower.split(/\s+/);
        const nameWords = nameLower.split(/\s+/);
        const idWords = idLower.split(/[-_\s]+/);
        
        let wordMatches = 0;
        for (const queryWord of queryWords) {
          if (nameWords.some(word => word.includes(queryWord)) || 
              idWords.some(word => word.includes(queryWord))) {
            wordMatches++;
          }
        }
        
        if (wordMatches > 0) {
          score = (wordMatches / queryWords.length) * 40;
        }
      }
      
      return { collection, score };
    });
    
    // Sort by score (highest first)
    scoredCollections.sort((a, b) => b.score - a.score);
    
    // Only return if we have a reasonable match (score > 30)
    const bestMatch = scoredCollections[0];
    if (bestMatch && bestMatch.score > 30) {
      console.log(`🎯 Best match: "${bestMatch.collection.name}" (score: ${bestMatch.score})`);
      return bestMatch.collection;
    }
    
    // If no good match found, return null instead of first result
    console.log(`❌ No good match found for "${query}" (best score: ${bestMatch?.score || 0})`);
    return null;
  }

  // Get current ETH price in USD
  async getETHPrice(): Promise<number> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.ethereum?.usd || 2000; // Default to $2000 if API fails
      }
    } catch (error) {
      console.log("❌ Failed to get ETH price, using default $2000");
    }
    
    return 2000; // Default ETH price
  }

  // Get real floor price from multiple sources
  async getRealFloorPrice(contractAddress: string): Promise<RealNFTData | null> {
    console.log(`🔍 Getting REAL floor price for ${contractAddress}...\n`);
    
    // Try different APIs in order of preference
    const methods = [
      () => this.getOpenSeaFloorPrice(contractAddress),
      () => this.getCoinGeckoFloorPrice(contractAddress)
    ];
    
    for (const method of methods) {
      const result = await method();
      if (result) {
        return result;
      }
    }
    
    console.log("❌ No real floor price data found from any source");
    return null;
  }
}

// Export for use in other files
export { RealNFTAPI, RealNFTData };
