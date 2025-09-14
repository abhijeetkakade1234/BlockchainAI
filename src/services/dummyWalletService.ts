// Dummy Wallet Service for NFT Trading Simulation
export interface DummyWallet {
  id: string;
  address: string;
  balance: {
    ETH: number;
    USD: number;
    AVAX: number;
  };
  nftHoldings: NFT[];
  transactionHistory: Transaction[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface NFT {
  id: string;
  tokenId: string;
  name: string;
  collection: string;
  image: string;
  purchasePrice: number;
  purchaseCurrency: string;
  purchaseDate: Date;
  currentValue?: number;
  currentCurrency?: string;
}

export interface Transaction {
  id: string;
  type: 'buy_nft' | 'sell' | 'transfer' | 'deposit' | 'withdraw';
  nftId?: string;
  amount: number;
  currency: string;
  collectionName?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  gasFee?: number;
  // Auto-buy specific fields
  triggerPrice?: number;
  purchasePrice?: number;
  previousPrice?: number;
}

export interface BuyNFTRequest {
  collectionName: string;
  price: number;
  currency: 'ETH' | 'USD' | 'AVAX';
  quantity?: number;
}

export interface SellNFTRequest {
  nftId: string;
  price: number;
  currency: 'ETH' | 'USD' | 'AVAX';
}

class DummyWalletService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
  }

  // Get wallet information
  async getWallet(userId: string): Promise<{success: boolean, wallet?: DummyWallet, error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/wallet/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Buy NFT with dummy wallet
  async buyNFT(userId: string, buyRequest: BuyNFTRequest): Promise<{success: boolean, transaction?: Transaction, error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/wallet/${userId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buyRequest),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error buying NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Sell NFT from dummy wallet
  async sellNFT(userId: string, sellRequest: SellNFTRequest): Promise<{success: boolean, transaction?: Transaction, error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/wallet/${userId}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sellRequest),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error selling NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get transaction history
  async getTransactionHistory(userId: string): Promise<{success: boolean, transactions?: Transaction[], error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/wallet/${userId}/transactions`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Deposit funds to wallet
  async depositFunds(userId: string, amount: number, currency: 'ETH' | 'USD' | 'AVAX'): Promise<{success: boolean, transaction?: Transaction, error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/wallet/${userId}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error depositing funds:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Calculate portfolio value
  calculatePortfolioValue(nfts: NFT[], currentPrices: Record<string, number>): number {
    return nfts.reduce((total, nft) => {
      const currentPrice = currentPrices[nft.collection] || nft.purchasePrice;
      return total + currentPrice;
    }, 0);
  }

  // Format currency for display
  formatCurrency(amount: number, currency: string): string {
    const symbols = { ETH: 'Ξ', USD: '$', AVAX: 'AVAX' };
    const symbol = symbols[currency as keyof typeof symbols] || currency;
    return `${symbol}${amount.toFixed(currency === 'ETH' ? 4 : 2)}`;
  }

  // Get user transactions
  async getTransactions(userId: string): Promise<{success: boolean, transactions?: Transaction[], error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/wallet/${userId}/transactions`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get portfolio performance
  calculatePortfolioPerformance(nfts: NFT[], currentPrices: Record<string, number>): {
    totalInvested: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercent: number;
  } {
    const totalInvested = nfts.reduce((total, nft) => total + nft.purchasePrice, 0);
    const currentValue = this.calculatePortfolioValue(nfts, currentPrices);
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercent
    };
  }
}

export const dummyWalletService = new DummyWalletService();
