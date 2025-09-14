// Dummy Wallet API Endpoints
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { promisify } = require('util');

const router = express.Router();

// Dummy Wallet Service
class DummyWalletService {
  constructor(dbPath = './dummy-wallets.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initDatabaseSync();
  }

  initDatabaseSync() {
    const run = promisify(this.db.run.bind(this.db));
    
    run(`
      CREATE TABLE IF NOT EXISTS dummy_wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL,
        eth_balance REAL DEFAULT 10.0,
        usd_balance REAL DEFAULT 10000.0,
        avax_balance REAL DEFAULT 100.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).then(() => {
      return run(`
        CREATE TABLE IF NOT EXISTS nft_holdings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_id INTEGER NOT NULL,
          token_id TEXT NOT NULL,
          name TEXT NOT NULL,
          collection TEXT NOT NULL,
          image_url TEXT,
          purchase_price REAL NOT NULL,
          purchase_currency TEXT NOT NULL,
          purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          current_value REAL,
          current_currency TEXT,
          FOREIGN KEY (wallet_id) REFERENCES dummy_wallets (id)
        )
      `);
    }).then(() => {
      return run(`
        CREATE TABLE IF NOT EXISTS wallet_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_id INTEGER NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'transfer', 'deposit')),
          nft_id INTEGER,
          amount REAL NOT NULL,
          currency TEXT NOT NULL,
          collection_name TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
          gas_fee REAL DEFAULT 0,
          FOREIGN KEY (wallet_id) REFERENCES dummy_wallets (id),
          FOREIGN KEY (nft_id) REFERENCES nft_holdings (id)
        )
      `);
    }).then(() => {
      return run(`CREATE INDEX IF NOT EXISTS idx_wallets_user ON dummy_wallets(userId)`);
    }).then(() => {
      return run(`CREATE INDEX IF NOT EXISTS idx_nft_holdings_wallet ON nft_holdings(wallet_id)`);
    }).then(() => {
      return run(`CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON wallet_transactions(wallet_id)`);
    }).then(() => {
      return run(`CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON wallet_transactions(timestamp)`);
    }).then(() => {
      console.log('✅ Dummy wallet database initialized successfully');
    }).catch((error) => {
      console.error('❌ Dummy wallet database initialization error:', error);
    });
  }

  async initDatabase() {
    const run = promisify(this.db.run.bind(this.db));
    
    try {
      // Create wallets table
      await run(`
        CREATE TABLE IF NOT EXISTS dummy_wallets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL UNIQUE,
          address TEXT NOT NULL,
          eth_balance REAL DEFAULT 10.0,
          usd_balance REAL DEFAULT 10000.0,
          avax_balance REAL DEFAULT 100.0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create NFT holdings table
      await run(`
        CREATE TABLE IF NOT EXISTS nft_holdings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_id INTEGER NOT NULL,
          token_id TEXT NOT NULL,
          name TEXT NOT NULL,
          collection TEXT NOT NULL,
          image_url TEXT,
          purchase_price REAL NOT NULL,
          purchase_currency TEXT NOT NULL,
          purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          current_value REAL,
          current_currency TEXT,
          FOREIGN KEY (wallet_id) REFERENCES dummy_wallets (id)
        )
      `);

      // Create transactions table
      await run(`
        CREATE TABLE IF NOT EXISTS wallet_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_id INTEGER NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('buy_nft', 'sell', 'transfer', 'deposit', 'withdraw')),
          nft_id INTEGER,
          amount REAL NOT NULL,
          currency TEXT NOT NULL,
          collection_name TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
          gas_fee REAL DEFAULT 0,
          trigger_price REAL,
          purchase_price REAL,
          previous_price REAL,
          FOREIGN KEY (wallet_id) REFERENCES dummy_wallets (id),
          FOREIGN KEY (nft_id) REFERENCES nft_holdings (id)
        )
      `);

      // Create indexes
      await run(`CREATE INDEX IF NOT EXISTS idx_wallets_user ON dummy_wallets(userId)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_nft_holdings_wallet ON nft_holdings(wallet_id)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON wallet_transactions(wallet_id)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON wallet_transactions(timestamp)`);
      
      // Add new columns to existing wallet_transactions table if they don't exist
      try {
        await run(`ALTER TABLE wallet_transactions ADD COLUMN trigger_price REAL`);
      } catch (error) {
        // Column already exists, ignore error
      }
      
      try {
        await run(`ALTER TABLE wallet_transactions ADD COLUMN purchase_price REAL`);
      } catch (error) {
        // Column already exists, ignore error
      }
      
      try {
        await run(`ALTER TABLE wallet_transactions ADD COLUMN previous_price REAL`);
      } catch (error) {
        // Column already exists, ignore error
      }

      console.log('✅ Dummy wallet database initialized successfully');
    } catch (error) {
      console.error('❌ Dummy wallet database initialization error:', error);
    }
  }

  async getOrCreateWallet(userId) {
    const get = promisify(this.db.get.bind(this.db));
    const run = promisify(this.db.run.bind(this.db));
    
    try {
      // Try to get existing wallet
      let wallet = await get(`
        SELECT * FROM dummy_wallets WHERE userId = ?
      `, [userId]);

      if (!wallet) {
        // Create new wallet
        const address = `0x${Math.random().toString(16).substr(2, 40)}`;
        const result = await run(`
          INSERT INTO dummy_wallets (userId, address, eth_balance, usd_balance, avax_balance)
          VALUES (?, ?, 10.0, 10000.0, 100.0)
        `, [userId, address]);
        
        wallet = await get(`
          SELECT * FROM dummy_wallets WHERE id = ?
        `, [result.lastID]);
      }

      return this.mapRowToWallet(wallet);
    } catch (error) {
      console.error('Error getting/creating wallet:', error);
      return null;
    }
  }

  async getNFTs(walletId) {
    const all = promisify(this.db.all.bind(this.db));
    const nfts = await all(`
      SELECT * FROM nft_holdings WHERE wallet_id = ?
      ORDER BY purchase_date DESC
    `, [walletId]);
    
    return nfts.map(this.mapRowToNFT);
  }

  async getTransactions(walletId) {
    const all = promisify(this.db.all.bind(this.db));
    const transactions = await all(`
      SELECT * FROM wallet_transactions WHERE wallet_id = ?
      ORDER BY timestamp DESC
      LIMIT 50
    `, [walletId]);
    
    return transactions.map(this.mapRowToTransaction);
  }

  async buyNFT(walletId, buyRequest) {
    const run = promisify(this.db.run.bind(this.db));
    const get = promisify(this.db.get.bind(this.db));
    
    try {
      // Check if user has enough balance
      const wallet = await get(`
        SELECT * FROM dummy_wallets WHERE id = ?
      `, [walletId]);

      const balanceField = `${buyRequest.currency.toLowerCase()}_balance`;
      const currentBalance = wallet[balanceField];
      const totalCost = buyRequest.price * (buyRequest.quantity || 1);

      if (currentBalance < totalCost) {
        throw new Error(`Insufficient ${buyRequest.currency} balance. Required: ${totalCost}, Available: ${currentBalance}`);
      }

      // Deduct balance
      const updateResult = await run(`
        UPDATE dummy_wallets 
        SET ${balanceField} = ${balanceField} - ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [totalCost, walletId]);

      // Add NFT to holdings
      const quantity = buyRequest.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        const tokenId = `${Math.floor(Math.random() * 10000)}`;
        const nftName = `${buyRequest.collectionName} #${tokenId}`;
        const imageUrl = `https://via.placeholder.com/300x300/6366f1/ffffff?text=${encodeURIComponent(buyRequest.collectionName)}`;
        
        const nftResult = await run(`
          INSERT INTO nft_holdings (wallet_id, token_id, name, collection, image_url, purchase_price, purchase_currency)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [walletId, tokenId, nftName, buyRequest.collectionName, imageUrl, buyRequest.price, buyRequest.currency]);
      }

      // Record transaction with auto-buy details if provided
      const transactionResult = await run(`
        INSERT INTO wallet_transactions (wallet_id, type, amount, currency, collection_name, status, trigger_price, purchase_price, previous_price)
        VALUES (?, 'buy_nft', ?, ?, ?, 'completed', ?, ?, ?)
      `, [
        walletId, 
        totalCost, 
        buyRequest.currency, 
        buyRequest.collectionName,
        buyRequest.triggerPrice || null,
        buyRequest.purchasePrice || buyRequest.price,
        buyRequest.previousPrice || null
      ]);

      return {
        success: true,
        transactionId: transactionResult ? transactionResult.lastID : null,
        transaction: {
          id: transactionResult ? transactionResult.lastID : null,
          type: 'buy_nft',
          amount: totalCost,
          currency: buyRequest.currency,
          collectionName: buyRequest.collectionName,
          triggerPrice: buyRequest.triggerPrice,
          purchasePrice: buyRequest.purchasePrice || buyRequest.price,
          previousPrice: buyRequest.previousPrice,
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        message: `Successfully purchased ${quantity} ${buyRequest.collectionName} NFT(s) for ${buyRequest.currency} ${totalCost}`
      };

    } catch (error) {
      console.error('Error buying NFT:', error);
      throw error;
    }
  }

  async depositFunds(walletId, amount, currency) {
    const run = promisify(this.db.run.bind(this.db));
    
    try {
      const balanceField = `${currency.toLowerCase()}_balance`;
      
      await run(`
        UPDATE dummy_wallets 
        SET ${balanceField} = ${balanceField} + ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [amount, walletId]);

      // Record transaction
      const transactionResult = await run(`
        INSERT INTO wallet_transactions (wallet_id, type, amount, currency, status)
        VALUES (?, 'deposit', ?, ?, 'completed')
      `, [walletId, amount, currency]);

      return {
        success: true,
        transactionId: transactionResult ? transactionResult.lastID : null,
        message: `Successfully deposited ${currency} ${amount}`
      };

    } catch (error) {
      console.error('Error depositing funds:', error);
      throw error;
    }
  }

  mapRowToWallet(row) {
    return {
      id: row.id,
      userId: row.userId,
      address: row.address,
      balance: {
        ETH: row.eth_balance,
        USD: row.usd_balance,
        AVAX: row.avax_balance
      },
      createdAt: new Date(row.created_at),
      lastUpdated: new Date(row.last_updated)
    };
  }

  mapRowToNFT(row) {
    return {
      id: row.id,
      tokenId: row.token_id,
      name: row.name,
      collection: row.collection,
      image: row.image_url,
      purchasePrice: row.purchase_price,
      purchaseCurrency: row.purchase_currency,
      purchaseDate: new Date(row.purchase_date),
      currentValue: row.current_value,
      currentCurrency: row.current_currency
    };
  }

  mapRowToTransaction(row) {
    return {
      id: row.id,
      type: row.type,
      nftId: row.nft_id,
      amount: row.amount,
      currency: row.currency,
      collectionName: row.collection_name,
      timestamp: new Date(row.timestamp),
      status: row.status,
      gasFee: row.gas_fee,
      triggerPrice: row.trigger_price,
      purchasePrice: row.purchase_price,
      previousPrice: row.previous_price
    };
  }

  close() {
    this.db.close();
  }
}

// Initialize the dummy wallet service
const walletService = new DummyWalletService();

// Middleware
router.use(cors());
router.use(express.json());

// Get or create wallet
router.get('/wallet/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`💰 Getting wallet for user: ${userId}`);
    
    const wallet = await walletService.getOrCreateWallet(userId);
    
    if (!wallet) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get or create wallet'
      });
    }

    // Get NFTs and transactions
    const nfts = await walletService.getNFTs(wallet.id);
    const transactions = await walletService.getTransactions(wallet.id);
    
    wallet.nftHoldings = nfts;
    wallet.transactionHistory = transactions;

    res.json({
      success: true,
      wallet
    });

  } catch (error) {
    console.error('Error getting wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet'
    });
  }
});

// Buy NFT
router.post('/wallet/:userId/buy', async (req, res) => {
  try {
    const { userId } = req.params;
    const { collectionName, price, currency, quantity = 1 } = req.body;
    
    console.log(`🛒 Buying NFT: ${collectionName} for ${price} ${currency} (quantity: ${quantity})`);
    
    // Get wallet
    const wallet = await walletService.getOrCreateWallet(userId);
    if (!wallet) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get wallet'
      });
    }

    // Validate request
    if (!collectionName || !price || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: collectionName, price, currency'
      });
    }

    if (!['ETH', 'USD', 'AVAX'].includes(currency)) {
      return res.status(400).json({
        success: false,
        error: 'currency must be "ETH", "USD", or "AVAX"'
      });
    }

    const result = await walletService.buyNFT(wallet.id, {
      collectionName,
      price: parseFloat(price),
      currency,
      quantity: parseInt(quantity)
    });

    res.json({
      success: true,
      message: result.message,
      transaction: {
        id: result.transactionId,
        type: 'buy',
        amount: parseFloat(price) * parseInt(quantity),
        currency,
        collectionName,
        timestamp: new Date(),
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Error buying NFT:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to buy NFT'
    });
  }
});

// Deposit funds
router.post('/wallet/:userId/deposit', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, currency } = req.body;
    
    console.log(`💰 Depositing ${amount} ${currency} to wallet`);
    
    // Get wallet
    const wallet = await walletService.getOrCreateWallet(userId);
    if (!wallet) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get wallet'
      });
    }

    // Validate request
    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, currency'
      });
    }

    if (!['ETH', 'USD', 'AVAX'].includes(currency)) {
      return res.status(400).json({
        success: false,
        error: 'currency must be "ETH", "USD", or "AVAX"'
      });
    }

    const result = await walletService.depositFunds(wallet.id, parseFloat(amount), currency);

    res.json({
      success: true,
      message: result.message,
      transaction: {
        id: result.transactionId,
        type: 'deposit',
        amount: parseFloat(amount),
        currency,
        timestamp: new Date(),
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Error depositing funds:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to deposit funds'
    });
  }
});

// Get transaction history
router.get('/wallet/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const wallet = await walletService.getOrCreateWallet(userId);
    if (!wallet) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get wallet'
      });
    }

    const transactions = await walletService.getTransactions(wallet.id);

    res.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction history'
    });
  }
});

module.exports = router;
module.exports.DummyWalletService = DummyWalletService;
