// NFT Agent Service - Bridge between React frontend and NFT Agent backend
export interface NFTAgentResponse {
  type: 'action' | 'chat';
  action?: string;
  params?: any;
  message?: string;
  result?: any;
  success?: boolean;
  error?: string;
}

export interface NFTAgentRequest {
  query: string;
}

class NFTAgentService {
  private baseUrl: string;

  constructor() {
    // For development, we'll use a local server
    // In production, this would be your deployed backend URL
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
  }

  async sendMessage(query: string): Promise<NFTAgentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to NFT Agent:', error);
      
      // Fallback response for development
      return {
        type: 'chat',
        message: 'I apologize, but I\'m having trouble connecting to the NFT Agent service. Please make sure the backend server is running.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper method to format NFT Agent responses for the chat interface
  formatResponse(response: NFTAgentResponse): string {
    if (response.type === 'chat') {
      return response.message || 'I received your message but couldn\'t process it properly.';
    }

    if (response.type === 'action' && response.result) {
      const { action, result } = response;
      
      switch (action) {
        case 'GetBalanceAction':
          return `💰 Your wallet balance: ${result.balance}`;
        
        case 'GetAddressAction':
          return `📍 Your wallet address: ${result.address}`;
        
        case 'SmartTransferAction':
          return `✅ Transfer completed! Transaction hash: ${result.txHash}`;
        
        case 'get_nft_floor_price':
          if (result.success) {
            if (result.source === "real_nft_api") {
              return `💰 NFT Floor Price: ${result.floor_price_eth} ETH ($${result.floor_price_usd} USD)
📛 Collection: ${result.collection_name}
🏪 Marketplace: ${result.marketplace}
📊 Total Supply: ${result.total_supply?.toLocaleString()}
👥 Owners: ${result.owners_count?.toLocaleString()}
📈 24h Volume: $${result.volume_24h}`;
            } else {
              return `💰 NFT Floor Price: ${result.floor_price_avax || result.floor_price_eth} ${result.floor_price_avax ? 'AVAX' : 'ETH'} ($${result.floor_price_usd} USD)
🏪 Marketplace: ${result.marketplace}
📊 Total Listings: ${result.total_listings}
${result.volume_24h ? `📈 24h Volume: $${result.volume_24h}` : ''}
${result.market_cap ? `🏦 Market Cap: $${result.market_cap}` : ''}`;
            }
          } else {
            return `📊 ${result.message}
📈 Collection Stats: ${JSON.stringify(result.collection_stats)}`;
          }
        
        case 'get_wallet_nfts':
          if (result.success && result.nfts && result.nfts.length > 0) {
            return `🎨 Found ${result.nfts.length} NFTs in your wallet:
${result.nfts.slice(0, 5).map((nft: any) => 
  `• ${nft.name || 'Unnamed'} (${nft.collection_name || 'Unknown Collection'})`
).join('\n')}
${result.nfts.length > 5 ? `... and ${result.nfts.length - 5} more` : ''}`;
          } else {
            return '🎨 No NFTs found in your wallet.';
          }
        
        default:
          return `📦 Action completed: ${action}
Result: ${JSON.stringify(result, null, 2)}`;
      }
    }

    return 'I received your request but couldn\'t process it properly.';
  }
}

export const nftAgentService = new NFTAgentService();
