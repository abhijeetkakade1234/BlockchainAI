// Real NFT Agent API Server - Uses bun to run TypeScript NFT Agent
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

// Import price alert routes
const priceAlertRoutes = require('./routes/priceAlerts');

// Import dummy wallet routes
const dummyWalletRoutes = require('./routes/dummyWallet');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Real NFT Agent API Server is running' });
});

// Price alert routes
app.use('/api', priceAlertRoutes);

// Dummy wallet routes
app.use('/api', dummyWalletRoutes);

// Function to create auto-buy alert
async function createAutoBuyAlert(userId, collectionName, thresholdPrice, currency) {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./nft-alerts.db');
    const { promisify } = require('util');
    const run = promisify(db.run.bind(db));

    // Create auto-buy alert
    const result = await run(`
      INSERT INTO price_alerts (userId, collectionName, thresholdPrice, thresholdType, currency, autoBuy, autoBuyPrice, autoBuyCurrency, isActive)
      VALUES (?, ?, ?, 'below', ?, 1, ?, ?, 1)
    `, [userId, collectionName, thresholdPrice, currency, thresholdPrice, currency]);

    db.close();

    return {
      success: true,
      alertId: result ? result.lastID : null,
      message: `Auto-buy alert created for ${collectionName}`
    };

  } catch (error) {
    console.error('Error creating auto-buy alert:', error);
    return {
      success: false,
      error: error.message || 'Failed to create auto-buy alert'
    };
  }
}

// Function to check for NFT purchase intent
async function checkNFTPurchaseIntent(query) {
  const purchasePatterns = [
    /buy\s+(.+?)\s+for\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
    /purchase\s+(.+?)\s+at\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
    /get\s+(.+?)\s+nft\s+for\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
    /buy\s+(.+?)\s+nft/i,
    /purchase\s+(.+?)\s+nft/i,
  ];

  const autoBuyPatterns = [
    /buy\s+(.+?)\s+when\s+it\s+drops?\s+below\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
    /auto.*buy\s+(.+?)\s+below\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
    /set\s+auto.*buy\s+for\s+(.+?)\s+at\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
    /buy\s+(.+?)\s+if\s+price\s+drops?\s+below\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
    /alert\s+me\s+to\s+buy\s+(.+?)\s+when\s+below\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
  ];

  for (const pattern of purchasePatterns) {
    const match = query.match(pattern);
    if (match) {
      const collectionName = match[1].trim();
      let price = match[2] ? parseFloat(match[2]) : null;
      let currency = match[3] ? match[3].toUpperCase() : 'ETH';

      // If no price specified, use a default
      if (!price) {
        price = 0.1;
        currency = 'ETH';
      }

      try {
        const userId = 'testuser'; // Default user for demo
        
        // Import the wallet service directly instead of making HTTP calls
        const { DummyWalletService } = require('./routes/dummyWallet');
        const walletService = new DummyWalletService();
        
        // Get wallet first
        const wallet = await walletService.getOrCreateWallet(userId);
        if (!wallet) {
          throw new Error('Failed to get wallet');
        }
        
        // Buy NFT
        const result = await walletService.buyNFT(wallet.id, {
          collectionName,
          price,
          currency,
          quantity: 1
        });

        if (result.success) {
          return {
            handled: true,
            success: true,
            message: `🎉 **NFT Purchase Successful!**

🛒 **Purchased:** ${collectionName} NFT
💰 **Price:** ${price} ${currency}
✅ Your NFT has been added to your portfolio!`,
            data: result
          };
        } else {
          return {
            handled: true,
            success: false,
            message: `❌ **Purchase Failed**

${result.error || 'Unable to complete the purchase. Please check your balance and try again.'}`,
          };
        }
      } catch (error) {
        return {
          handled: true,
          success: false,
          message: `❌ **Purchase Error**

${error instanceof Error ? error.message : 'An unexpected error occurred during purchase.'}`,
        };
      }
    }
  }

  // Check for auto-buy patterns
  for (const pattern of autoBuyPatterns) {
    const match = query.match(pattern);
    if (match) {
      const collectionName = match[1].trim();
      const thresholdPrice = parseFloat(match[2]);
      const currency = match[3].toUpperCase();

      try {
        const userId = 'testuser'; // Default user for demo
        
        // Create auto-buy alert
        const result = await createAutoBuyAlert(userId, collectionName, thresholdPrice, currency);
        
        if (result.success) {
          return {
            handled: true,
            success: true,
            message: `🚨 **Auto-Buy Alert Created!**

📊 **Collection:** ${collectionName}
💰 **Buy Trigger:** When price drops below ${thresholdPrice} ${currency}
🛒 **Auto-Purchase:** Enabled
⏰ **Status:** Active and monitoring

✅ I'll automatically buy ${collectionName} NFT when the price drops below ${thresholdPrice} ${currency}!`,
            data: result
          };
        } else {
          return {
            handled: true,
            success: false,
            message: `❌ **Failed to Create Auto-Buy Alert**

${result.error || 'Unable to create the auto-buy alert. Please try again.'}`,
          };
        }
      } catch (error) {
        return {
          handled: true,
          success: false,
          message: `❌ **Auto-Buy Error**

${error instanceof Error ? error.message : 'An unexpected error occurred while setting up auto-buy.'}`,
        };
      }
    }
  }

  return { handled: false };
}

// Function to run NFT Agent command using bun
async function runNFTAgent(query) {
  return new Promise((resolve, reject) => {
    const nftAgentPath = path.join(__dirname, 'nft-agent');
    
    // Create a temporary script to run the full NFT Agent functionality
    const script = `
import "dotenv/config";
import { askGemini } from './gemini';
import { runAction } from './actions';

async function handleQuery(query) {
  try {
    const response = await askGemini(query);
    
    // Handle multiple JSON responses separated by newlines
    // Split by double newlines to get complete JSON objects
    const jsonBlocks = response.split('\\n\\n').filter(block => block.trim());
    
    let finalMessage = '';
    let hasActions = false;
    
    for (const block of jsonBlocks) {
      try {
        const decision = JSON.parse(block.trim());
        
        if (decision.type === "action") {
          hasActions = true;
          const result = await runAction(decision.action, decision.params || {});
          
          // Build response message based on action result
          if (decision.action === "GetBalanceAction") {
            finalMessage += \`💰 Your wallet balance: \${result.balance}\\n\`;
          } else if (decision.action === "GetAddressAction") {
            finalMessage += \`📍 Your wallet address: \${result.address}\\n\`;
          } else if (decision.action === "SmartTransferAction") {
            finalMessage += \`✅ Transfer sent! Transaction hash: \${result.txHash}\\n\`;
          } else if (decision.action === "get_nft_floor_price") {
            if (result.success) {
              finalMessage += \`💰 \${result.collection_name}: \${result.floor_price_eth} ETH ($\${result.floor_price_usd} USD)\\n\`;
            } else {
              finalMessage += \`❌ Could not get floor price: \${result.message}\\n\`;
            }
          } else if (decision.action === "create_price_alert") {
            if (result.success) {
              finalMessage += \`🚨 \${result.message}\\n\`;
            } else {
              finalMessage += \`❌ Failed to create alert: \${result.error}\\n\`;
            }
          }
        } else if (decision.type === "chat") {
          finalMessage += decision.message + '\\n';
        }
      } catch (parseError) {
        // Skip non-JSON lines
        continue;
      }
    }
    
    // Output final result as JSON for the server
    console.log(JSON.stringify({
      type: 'chat',
      message: finalMessage.trim() || 'Price alert processed successfully!',
      success: true
    }));
  } catch (err) {
    console.log(JSON.stringify({
      type: 'chat',
      message: 'Error: ' + err.message,
      success: false
    }));
  }
}

async function main() {
  const query = process.argv[2];
  await handleQuery(query);
}

main();
`;

    // Write the script to a temporary file
    const fs = require('fs');
    const tempScriptPath = path.join(nftAgentPath, 'temp-runner.ts');
    fs.writeFileSync(tempScriptPath, script);

    // Run the script using bun
    const child = spawn('bun', ['run', tempScriptPath, query], {
      cwd: nftAgentPath,
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (e) {
        // Ignore cleanup errors
      }

      if (code === 0) {
        try {
          // Extract JSON from output (handle SQLite initialization messages)
          const lines = output.trim().split('\n');
          let jsonLines = [];
          
          // Find all lines that look like JSON
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('{') && line.endsWith('}')) {
              jsonLines.push(line);
            }
          }
          
          if (jsonLines.length > 0) {
            // Use the last JSON response (which should be the final result)
            const result = JSON.parse(jsonLines[jsonLines.length - 1]);
            resolve(result);
          } else {
            reject(new Error('No valid JSON found in NFT Agent output: ' + output));
          }
        } catch (e) {
          reject(new Error('Failed to parse NFT Agent output: ' + output));
        }
      } else {
        reject(new Error('NFT Agent failed: ' + errorOutput));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        type: 'chat',
        message: 'Please provide a valid query.',
        error: 'Invalid query format'
      });
    }

    console.log(`🤖 Received query: ${query}`);

    // Check for immediate NFT purchase intent (not auto-buy)
    const immediatePurchasePatterns = [
      /buy\s+(.+?)\s+for\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
      /purchase\s+(.+?)\s+at\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
      /get\s+(.+?)\s+nft\s+for\s+(\d+(?:\.\d+)?)\s*(eth|usd|avax)/i,
    ];
    
    const isImmediatePurchase = immediatePurchasePatterns.some(pattern => pattern.test(query));
    
    if (isImmediatePurchase) {
      const purchaseResult = await checkNFTPurchaseIntent(query);
      if (purchaseResult.handled) {
        console.log('🛒 Immediate purchase intent detected, handling directly');
        return res.json({
          type: 'purchase',
          message: purchaseResult.message,
          success: purchaseResult.success,
          result: purchaseResult.data
        });
      }
    }

    // Run the NFT Agent for non-purchase queries
    const result = await runNFTAgent(query);
    console.log(`📤 NFT Agent result:`, result);

    res.json(result);

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      type: 'chat',
      message: 'I apologize, but I encountered an error processing your request.',
      error: error.message || 'Unknown error',
      success: false
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Real NFT Agent API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🔧 Using REAL NFT Agent functionality via bun`);
});

module.exports = app;