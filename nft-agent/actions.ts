// actions.ts - Core NFT Agent Actions
import "dotenv/config";
import fetch from "node-fetch";
import { Agentkit } from "@0xgasless/agentkit";
import { ethers } from "ethers";
import { AvalancheFloorPriceTracker } from "./real_floor_price_tracker";
import { RealNFTAPI } from "./real_nft_api";

// ✅ Ensure env vars
const { PRIVATE_KEY, API_KEY, RPC_URL, MORALIS_API_KEY } = process.env;
if (!PRIVATE_KEY) throw new Error("Missing PRIVATE_KEY");
if (!API_KEY) throw new Error("Missing API_KEY");
if (!RPC_URL) throw new Error("Missing RPC_URL");
if (!MORALIS_API_KEY) throw new Error("Missing MORALIS_API_KEY");

const MORALIS_BASE = process.env.MORALIS_BASE_URL || "https://deep-index.moralis.io/api/v2.2";
const CHAIN_NAME = process.env.CHAIN_NAME || "${CHAIN_NAME}";

let agentkit: Agentkit;
let floorPriceTracker: AvalancheFloorPriceTracker;
let realNFTAPI: RealNFTAPI;

async function initAgentkit() {
  if (!agentkit) {
    agentkit = await Agentkit.configureWithWallet({
      privateKey: PRIVATE_KEY!,
      rpcUrl: RPC_URL!,
      apiKey: API_KEY!,
      chainID: parseInt(process.env.CHAIN_ID || '43114'), // Avalanche C-Chain by default
    });
  }
  return agentkit;
}

async function initFloorPriceTracker() {
  if (!floorPriceTracker) {
    floorPriceTracker = new AvalancheFloorPriceTracker();
  }
  return floorPriceTracker;
}

async function initRealNFTAPI() {
  if (!realNFTAPI) {
    realNFTAPI = new RealNFTAPI();
  }
  return realNFTAPI;
}

// 🔍 Resolve collection name → contract address (Avalanche only)
async function resolveNFTAddress(nameOrAddress: string): Promise<string> {
  if (!nameOrAddress) throw new Error("Missing collection or address");

  // ✅ If it's already a contract address
  if (/^0x[a-fA-F0-9]{40}$/.test(nameOrAddress)) {
    return nameOrAddress;
  }

  // ❌ Moralis doesn't support Avalanche name search
  throw new Error(
    `Moralis cannot resolve collection names on Avalanche. Please provide contract address for: ${nameOrAddress}`
  );
}


// 🔗 Moralis fetch wrapper
async function moralisFetch(path: string) {
  const res = await fetch(`${MORALIS_BASE}${path}`, {
    headers: { "X-API-Key": MORALIS_API_KEY! },
  });
  if (!res.ok) throw new Error(`Moralis API error: ${res.status}`);
  return res.json();
}

export async function runAction(action: string, params: any) {
  const agent = await initAgentkit();
  const address = await agent.getAddress();

  switch (action) {
    case "GetAddressAction":
      return { address };

    case "GetBalanceAction": {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const balance = await provider.getBalance(address);
      return { balance: ethers.formatEther(balance) + " AVAX" };
    }

    case "SmartTransferAction": {
      const amountWei = ethers.parseEther(params.amount.toString());
      return {
        txHash: await agent.run(
          {
            name: "SendTransaction",
            description: "Send a transaction",
            argsSchema: {} as any,
            func: async () =>
              JSON.stringify({
                to: params.to,
                value: amountWei.toString(),
                data: "0x",
              }),
          },
          {}
        ),
      };
    }

    case "SmartSwapAction":
      throw new Error("Swap functionality not yet implemented");

    // ✅ NFT Functions (Avalanche only)
    case "get_wallet_nfts":
      return moralisFetch(`/${address}/nft?chain=${CHAIN_NAME}`);

    case "get_nft_metadata": {
      const addr = await resolveNFTAddress(params.collection || params.address);
      return moralisFetch(`/nft/${addr}/${params.tokenId}?chain=${CHAIN_NAME}`);
    }

    case "get_nft_trades": {
      const addr = await resolveNFTAddress(params.collection || params.address);
      return moralisFetch(`/nft/${addr}/trades?chain=${CHAIN_NAME}`);
    }

    case "get_nft_floor_price": {
      // Fully dynamic NFT floor price system - no hardcoded collections!
      try {
        const realAPI = await initRealNFTAPI();
        const input = (params.collection || params.address || "").trim();
        
        if (!input) {
          return {
            success: false,
            message: "Please provide a collection name or contract address",
            source: "validation_error"
          };
        }
        
        console.log(`🔍 Searching for NFT collection: "${input}"`);
        
        // Step 1: Try direct lookup first (in case it's already a CoinGecko ID)
        console.log("📋 Trying direct collection lookup...");
        let realData = await realAPI.getCoinGeckoFloorPrice(input);
        
        if (realData) {
          return {
            success: true,
            floor_price_eth: realData.floor_price_eth.toFixed(4),
            floor_price_usd: realData.floor_price_usd.toFixed(2),
            marketplace: realData.marketplace,
            last_updated: realData.last_updated,
            total_supply: realData.total_supply,
            owners_count: realData.owners_count,
            volume_24h: realData.volume_24h.toFixed(2),
            collection_name: realData.collection_name,
            source: "real_nft_api_direct"
          };
        }
        
        // Step 2: Try dynamic discovery via CoinGecko search
        console.log("🔍 Trying dynamic collection discovery...");
        const searchResult = await realAPI.searchCollectionOnCoinGecko(input);
        
        if (searchResult) {
          console.log(`✅ Found collection: ${searchResult.name} (${searchResult.id})`);
          realData = await realAPI.getCoinGeckoFloorPrice(searchResult.id);
          
          if (realData) {
            return {
              success: true,
              floor_price_eth: realData.floor_price_eth.toFixed(4),
              floor_price_usd: realData.floor_price_usd.toFixed(2),
              marketplace: realData.marketplace,
              last_updated: realData.last_updated,
              total_supply: realData.total_supply,
              owners_count: realData.owners_count,
              volume_24h: realData.volume_24h.toFixed(2),
              collection_name: realData.collection_name,
              source: "real_nft_api_discovered"
            };
          }
        }
        
        // Step 3: Try only the most relevant alternative terms (avoid overkill)
        console.log("🔍 Trying most relevant alternatives...");
        const alternativeTerms = realAPI.generateAlternativeSearchTerms(input);
        
        // Only try the first 3 most relevant alternatives to avoid overkill
        const relevantTerms = alternativeTerms.slice(0, 3);
        
        for (const term of relevantTerms) {
          if (term.toLowerCase() === input.toLowerCase()) continue; // Skip if same as input
          
          console.log(`🔍 Searching with: "${term}"`);
          const altSearchResult = await realAPI.searchCollectionOnCoinGecko(term);
          
          if (altSearchResult) {
            console.log(`✅ Found collection with alternative term: ${altSearchResult.name}`);
            realData = await realAPI.getCoinGeckoFloorPrice(altSearchResult.id);
            
            if (realData) {
              return {
                success: true,
                floor_price_eth: realData.floor_price_eth.toFixed(4),
                floor_price_usd: realData.floor_price_usd.toFixed(2),
                marketplace: realData.marketplace,
                last_updated: realData.last_updated,
                total_supply: realData.total_supply,
                owners_count: realData.owners_count,
                volume_24h: realData.volume_24h.toFixed(2),
                collection_name: realData.collection_name,
                source: "real_nft_api_fuzzy_match"
              };
            }
          }
        }
        
        // If all searches fail, return helpful error
        return {
          success: false,
          message: `Could not find NFT collection "${input}". Please try a more specific search term.`,
          suggestions: [
            "Try the exact collection name (e.g., 'Bored Ape Yacht Club')",
            "Use common abbreviations (e.g., 'bayc' for Bored Ape Yacht Club)",
            "Check spelling and try again",
            "Provide the contract address if available"
          ],
          source: "collection_not_found"
        };
        
      } catch (error: any) {
        console.log("⚠️ Real NFT API failed, trying other sources");
      }
      
      // Try to resolve address for Avalanche collections
      let addr: string;
      try {
        addr = await resolveNFTAddress(params.collection || params.address);
      } catch (error) {
        return {
          success: false,
          message: `Cannot resolve collection: ${params.collection || params.address}. Try using popular collection names like 'boredape', 'cryptopunks', or provide a contract address.`,
          source: "collection_resolution_failed"
        };
      }
      
      // Try Avalanche-specific floor price tracker
      try {
        const tracker = await initFloorPriceTracker();
        const realFloorPrice = await tracker.getFloorPrice(addr);
        
        if (realFloorPrice) {
          return {
            success: true,
            floor_price_avax: realFloorPrice.floor_price_avax,
            floor_price_usd: realFloorPrice.floor_price_usd,
            marketplace: realFloorPrice.marketplace,
            last_updated: realFloorPrice.last_updated,
            total_listings: realFloorPrice.total_listings,
            volume_24h: realFloorPrice.volume_24h,
            market_cap: realFloorPrice.market_cap,
            source: "${CHAIN_NAME}_tracker"
          };
        }
      } catch (error: any) {
        console.log("⚠️ Avalanche tracker failed, falling back to Moralis");
      }
      
      // Fallback to Moralis stats
      try {
        const stats = await moralisFetch(`/nft/${addr}/stats?chain=${CHAIN_NAME}`);
        return {
          success: false,
          message: "No real floor price data available",
          collection_stats: stats,
          source: "moralis_stats_fallback"
        };
      } catch (e: any) {
        throw new Error(`No floor price data available: ${e.message}`);
      }
    }


    case "get_nft_collection_stats": {
      const addr = await resolveNFTAddress(params.collection || params.address);
      return moralisFetch(`/nft/${addr}/stats?chain=${CHAIN_NAME}`);
    }

    case "get_contract_nfts": {
      const addr = await resolveNFTAddress(params.collection || params.address);
      return moralisFetch(`/nft/${addr}?chain=${CHAIN_NAME}`);
    }

    case "get_nft_owners": {
      const addr = await resolveNFTAddress(params.collection || params.address);
      return moralisFetch(`/nft/${addr}/owners?chain=${CHAIN_NAME}`);
    }

    case "get_nft_transfers": {
      const addr = await resolveNFTAddress(params.collection || params.address);
      return moralisFetch(`/nft/${addr}/transfers?chain=${CHAIN_NAME}`);
    }

    case "get_wallet_nft_transfers": {
      const result = await moralisFetch(`/${address}/nft/transfers?chain=${CHAIN_NAME}`);
      // Ensure consistent response structure with other wallet actions
      return {
        status: "SYNCED",
        page: result.page || 0,
        page_size: result.page_size || 100,
        cursor: result.cursor || null,
        result: result.result || [],
        block_exists: result.block_exists || true
      };
    }

    case "get_wallet_nft_collections":
      return moralisFetch(`/${address}/nft/collections?chain=${CHAIN_NAME}`);

    case "create_price_alert": {
      try {
        const { collectionName, thresholdPrice, thresholdType, currency, autoBuy, autoBuyPrice, autoBuyCurrency } = params;
        
        if (!collectionName || !thresholdPrice || !thresholdType || !currency) {
          return {
            success: false,
            error: "Missing required parameters: collectionName, thresholdPrice, thresholdType, currency"
          };
        }

        // Create the price alert via API call to our backend
        const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
        const userId = process.env.DEFAULT_USER_ID || 'testuser';
        
        const alertData = {
          userId,
          collectionName,
          thresholdPrice: parseFloat(thresholdPrice),
          thresholdType,
          currency
        };

        // Add auto-buy fields if specified
        if (autoBuy && autoBuyPrice && autoBuyCurrency) {
          alertData.autoBuy = true;
          alertData.autoBuyPrice = parseFloat(autoBuyPrice);
          alertData.autoBuyCurrency = autoBuyCurrency;
        }
        
        const response = await fetch(`${apiBaseUrl}/api/alerts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(alertData)
        });

        const result = await response.json();
        
        if (result.success) {
          if (autoBuy) {
            return {
              success: true,
              message: `🚨 Auto-buy alert created! I'll automatically buy ${collectionName} NFT when price drops below ${thresholdPrice} ${currency}`,
              alertId: result.alertId,
              autoBuy: true
            };
          } else {
            return {
              success: true,
              message: `✅ Price alert created successfully! I'll notify you when ${collectionName} ${thresholdType} ${thresholdPrice} ${currency}`,
              alertId: result.alertId
            };
          }
        } else {
          return {
            success: false,
            error: result.error || 'Failed to create price alert'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to create price alert: ${error.message}`
        };
      }
    }

    case "buy_nft": {
      try {
        const { collectionName, price, currency, quantity = 1 } = params;
        
        if (!collectionName || !price || !currency) {
          return {
            success: false,
            error: "Missing required parameters: collectionName, price, currency"
          };
        }

        // Buy NFT via API call to our dummy wallet backend
        const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
        const userId = process.env.DEFAULT_USER_ID || 'testuser';
        
        const response = await fetch(`${apiBaseUrl}/api/wallet/${userId}/buy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionName,
            price: parseFloat(price),
            currency,
            quantity: parseInt(quantity)
          })
        });

        const result = await response.json();
        
        if (result.success) {
          return {
            success: true,
            message: `🎉 NFT purchase successful! ${collectionName} NFT purchased for ${price} ${currency}`,
            transaction: result.transaction
          };
        } else {
          return {
            success: false,
            error: result.error || 'Failed to buy NFT'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to buy NFT: ${error.message}`
        };
      }
    }

    // Note: get_nft_lowest_price endpoint is deprecated in Moralis API v2.2
    // case "get_nft_lowest_price": {
    //   const addr = await resolveNFTAddress(params.collection || params.address);
    //   return moralisFetch(`/nft/${addr}/lowestprice?chain=${CHAIN_NAME}`);
    // }

    default:
      return { error: `Unknown action: ${action}` };
  }
}
