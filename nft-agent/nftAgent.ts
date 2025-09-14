// nftAgent.ts - Main NFT Agent Application
import "dotenv/config";
import readline from "readline";
import { askGemini } from "./gemini";
import { runAction } from "./actions";

// CLI setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🚀 NFT Agent started! Ask me about balances, swaps, or NFTs.\n");

async function handleQuery(query: string) {
  try {
    const response = await askGemini(query);
    
    // Handle multiple JSON responses separated by newlines
    // Split by double newlines to get complete JSON objects
    const jsonBlocks = response.split('\n\n').filter(block => block.trim());
    
    let finalMessage = '';
    let hasActions = false;
    
    for (const block of jsonBlocks) {
      try {
        const decision = JSON.parse(block.trim());
        
        if (decision.type === "action") {
          hasActions = true;
          console.log(`⚡ Running action: ${decision.action}...`);
          const result = await runAction(decision.action, decision.params || {});

          // 🔍 Pretty formatting
          if (decision.action === "GetBalanceAction") {
            console.log(`💰 Balance: ${result.balance}`);
            finalMessage += `💰 Your wallet balance: ${result.balance}\n`;
          } else if (decision.action === "GetAddressAction") {
            console.log(`📍 Address: ${result.address}`);
            finalMessage += `📍 Your wallet address: ${result.address}\n`;
          } else if (decision.action === "SmartTransferAction") {
            console.log(`✅ Transfer sent! Tx hash: ${result.txHash}`);
            finalMessage += `✅ Transfer sent! Transaction hash: ${result.txHash}\n`;
          } else if (decision.action === "get_nft_floor_price") {
            if (result.success) {
              if (result.source === "real_nft_api") {
                console.log(`💰 NFT Floor Price: ${result.floor_price_eth} ETH ($${result.floor_price_usd} USD)`);
                console.log(`📛 Collection: ${result.collection_name}`);
                console.log(`🏪 Marketplace: ${result.marketplace}`);
                console.log(`📊 Total Supply: ${result.total_supply?.toLocaleString()}`);
                console.log(`👥 Owners: ${result.owners_count?.toLocaleString()}`);
                console.log(`📈 24h Volume: $${result.volume_24h}`);
                console.log(`🔧 Source: Real NFT API`);
              } else {
                console.log(`💰 NFT Floor Price: ${result.floor_price_avax || result.floor_price_eth} ${result.floor_price_avax ? 'AVAX' : 'ETH'} ($${result.floor_price_usd} USD)`);
                console.log(`🏪 Marketplace: ${result.marketplace}`);
                console.log(`📊 Total Listings: ${result.total_listings}`);
                if (result.volume_24h) console.log(`📈 24h Volume: $${result.volume_24h}`);
                if (result.market_cap) console.log(`🏦 Market Cap: $${result.market_cap}`);
                console.log(`🔧 Source: ${result.source}`);
              }
            } else {
              console.log(`📊 ${result.message}`);
              console.log(`📈 Collection Stats: ${JSON.stringify(result.collection_stats)}`);
            }
          } else if (decision.action === "create_price_alert") {
            if (result.success) {
              console.log(`🚨 ${result.message}`);
              console.log(`📋 Alert ID: ${result.alertId}`);
            } else {
              console.log(`❌ Failed to create price alert: ${result.error}`);
            }
          } else {
            console.log("📦 Result:", JSON.stringify(result, null, 2));
          }
        } else if (decision.type === "chat") {
          console.log(`🤖 ${decision.message}`);
        }
      } catch (parseError) {
        // Skip non-JSON lines
        continue;
      }
    }
    
    // Output final result as JSON for the server
    console.log(JSON.stringify({
      type: 'chat',
      message: finalMessage.trim() || 'Request processed successfully!',
      success: true
    }));
  } catch (err: any) {
    console.error("❌ Error:", err.message || err);
    console.log(JSON.stringify({
      type: 'chat',
      message: 'Error: ' + err.message,
      success: false
    }));
  }
}

function main() {
  // Check if input is piped
  if (process.stdin.isTTY) {
    // Interactive mode
    rl.setPrompt("You: ");
    rl.prompt();

    rl.on("line", async (line) => {
      await handleQuery(line.trim());
      rl.prompt();
    }).on("close", () => {
      console.log("\n👋 Goodbye!");
      process.exit(0);
    });
  } else {
    // Piped input mode
    let input = '';
    process.stdin.on('data', (chunk) => {
      input += chunk.toString();
    });
    
    process.stdin.on('end', async () => {
      const query = input.trim();
      if (query) {
        await handleQuery(query);
      }
      process.exit(0);
    });
  }
}

main();
