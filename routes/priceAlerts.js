// NFT Price Alert API Endpoints
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { promisify } = require('util');
const path = require('path');

const router = express.Router();

// Simple Price Alert Service (JavaScript version)
class NFTPriceAlertService {
  constructor(dbPath = './nft-alerts.db') {
    this.db = new sqlite3.Database(dbPath);
    this.monitoringInterval = null;
    this.isMonitoring = false;
    // Initialize database synchronously
    this.initDatabaseSync();
  }

  initDatabaseSync() {
    const run = promisify(this.db.run.bind(this.db));
    
    run(`
      CREATE TABLE IF NOT EXISTS price_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        collectionName TEXT NOT NULL,
        collectionAddress TEXT,
        thresholdPrice REAL NOT NULL,
        thresholdType TEXT NOT NULL CHECK (thresholdType IN ('below', 'above')),
        currency TEXT NOT NULL CHECK (currency IN ('ETH', 'USD', 'AVAX')),
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        triggeredAt DATETIME,
        lastCheckedAt DATETIME
      )
    `).then(() => {
      return run(`
        CREATE TABLE IF NOT EXISTS price_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          collectionName TEXT NOT NULL,
          collectionAddress TEXT,
          price REAL NOT NULL,
          currency TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          source TEXT NOT NULL
        )
      `);
    }).then(() => {
      return run(`CREATE INDEX IF NOT EXISTS idx_alerts_user_active ON price_alerts(userId, isActive)`);
    }).then(() => {
      return run(`CREATE INDEX IF NOT EXISTS idx_alerts_collection ON price_alerts(collectionName)`);
    }).then(() => {
      return run(`CREATE INDEX IF NOT EXISTS idx_price_history_collection ON price_history(collectionName, timestamp)`);
    }).then(() => {
      return run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          alertId INTEGER NOT NULL,
          userId TEXT NOT NULL,
          collectionName TEXT NOT NULL,
          thresholdPrice REAL NOT NULL,
          thresholdType TEXT NOT NULL,
          currency TEXT NOT NULL,
          currentPrice REAL NOT NULL,
          currentCurrency TEXT NOT NULL,
          message TEXT NOT NULL,
          triggeredAt DATETIME NOT NULL,
          isRead BOOLEAN DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }).then(() => {
      return run(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId, triggeredAt)`);
    }).then(() => {
      console.log('✅ Database initialized successfully');
    }).catch((error) => {
      console.error('❌ Database initialization error:', error);
    });
  }

  async initDatabase() {
    const run = promisify(this.db.run.bind(this.db));
    
    try {
      await run(`
        CREATE TABLE IF NOT EXISTS price_alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          collectionName TEXT NOT NULL,
          collectionAddress TEXT,
          thresholdPrice REAL NOT NULL,
          thresholdType TEXT NOT NULL CHECK (thresholdType IN ('below', 'above')),
          currency TEXT NOT NULL CHECK (currency IN ('ETH', 'USD', 'AVAX')),
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          triggeredAt DATETIME,
          lastCheckedAt DATETIME
        )
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS price_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          collectionName TEXT NOT NULL,
          collectionAddress TEXT,
          price REAL NOT NULL,
          currency TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          source TEXT NOT NULL
        )
      `);

      await run(`CREATE INDEX IF NOT EXISTS idx_alerts_user_active ON price_alerts(userId, isActive)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_alerts_collection ON price_alerts(collectionName)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_price_history_collection ON price_history(collectionName, timestamp)`);
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
    }
  }

  async addAlert(alert) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO price_alerts (userId, collectionName, collectionAddress, thresholdPrice, thresholdType, currency, isActive, autoBuy, autoBuyPrice, autoBuyCurrency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        alert.userId,
        alert.collectionName,
        alert.collectionAddress || null,
        alert.thresholdPrice,
        alert.thresholdType,
        alert.currency,
        alert.isActive ? 1 : 0,
        alert.autoBuy ? 1 : 0,
        alert.autoBuyPrice || null,
        alert.autoBuyCurrency || null
      ], function(err) {
        if (err) {
          console.error('Error in addAlert:', err);
          reject(err);
        } else {
          console.log('Insert successful, lastID:', this.lastID);
          resolve(this.lastID);
        }
      });
    });
  }

  async getUserAlerts(userId) {
    const all = promisify(this.db.all.bind(this.db));
    const alerts = await all(`
      SELECT * FROM price_alerts 
      WHERE userId = ? AND isActive = 1 
      ORDER BY createdAt DESC
    `, [userId]);
    
    return alerts.map(this.mapRowToAlert);
  }

  async getActiveAlerts() {
    const all = promisify(this.db.all.bind(this.db));
    const alerts = await all(`
      SELECT * FROM price_alerts 
      WHERE isActive = 1 
      ORDER BY lastCheckedAt ASC, createdAt ASC
    `);
    
    return alerts.map(this.mapRowToAlert);
  }

  async deleteAlert(alertId) {
    const run = promisify(this.db.run.bind(this.db));
    
    await run(`
      DELETE FROM price_alerts 
      WHERE id = ?
    `, [alertId]);
    
    console.log(`🗑️ Alert ${alertId} deleted from database`);
  }

  async updateAlertStatus(alertId, triggered, currentPrice) {
    const run = promisify(this.db.run.bind(this.db));
    
    if (triggered) {
      await run(`
        UPDATE price_alerts 
        SET triggeredAt = CURRENT_TIMESTAMP, isActive = 0, lastCheckedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [alertId]);
      console.log(`✅ Alert ${alertId} marked as triggered`);
    } else {
      await run(`
        UPDATE price_alerts 
        SET lastCheckedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [alertId]);
      console.log(`📊 Alert ${alertId} status updated`);
    }
  }

  async recordPriceHistory(collectionName, price, currency, source, collectionAddress) {
    const run = promisify(this.db.run.bind(this.db));
    await run(`
      INSERT INTO price_history (collectionName, collectionAddress, price, currency, source)
      VALUES (?, ?, ?, ?, ?)
    `, [collectionName, collectionAddress || null, price, currency, source]);
  }

  async getLatestPrice(collectionName) {
    const get = promisify(this.db.get.bind(this.db));
    const row = await get(`
      SELECT * FROM price_history 
      WHERE collectionName = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `, [collectionName]);
    
    return row ? this.mapRowToPriceHistory(row) : null;
  }

  startMonitoring(checkIntervalMinutes = 5) {
    if (this.isMonitoring) {
      console.log('Price monitoring is already running');
      return;
    }

    console.log(`🚨 Starting NFT price monitoring (checking every ${checkIntervalMinutes} minutes)`);
    this.isMonitoring = true;

    // Initial check
    this.checkAllAlerts();

    // Set up interval
    this.monitoringInterval = setInterval(() => {
      this.checkAllAlerts();
    }, checkIntervalMinutes * 60 * 1000);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 NFT price monitoring stopped');
  }

  async checkAllAlerts() {
    try {
      console.log('🔍 Checking all active price alerts...');
      const alerts = await this.getActiveAlerts();
      
      if (alerts.length === 0) {
        console.log('No active alerts to check');
        return;
      }

      console.log(`Found ${alerts.length} active alerts to check`);

      // Group alerts by collection to minimize API calls
      const collectionGroups = new Map();
      alerts.forEach(alert => {
        const key = alert.collectionName;
        if (!collectionGroups.has(key)) {
          collectionGroups.set(key, []);
        }
        collectionGroups.get(key).push(alert);
      });

      // Check each collection with rate limiting
      let processedCount = 0;
      for (const [collectionName, collectionAlerts] of collectionGroups) {
        try {
          await this.checkCollectionAlerts(collectionName, collectionAlerts);
          processedCount++;
          
          // Rate limiting: wait 1 second between collections
          if (processedCount < collectionGroups.size) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error checking collection ${collectionName}:`, error);
          // Continue with other collections even if one fails
        }
      }

      console.log(`✅ Completed checking ${processedCount}/${collectionGroups.size} collections`);

    } catch (error) {
      console.error('❌ Critical error in checkAllAlerts:', error);
      // Don't throw - keep monitoring running
    }
  }

  async checkCollectionAlerts(collectionName, alerts) {
    try {
      console.log(`📊 Checking ${collectionName} (${alerts.length} alerts)`);
      
      // Get current price using the NFT Agent
      const currentPrice = await this.getCurrentPrice(collectionName);
      
      if (!currentPrice) {
        console.log(`❌ Could not get current price for ${collectionName}`);
        return;
      }

      // Record price history
      await this.recordPriceHistory(
        collectionName, 
        currentPrice.price, 
        currentPrice.currency, 
        currentPrice.source
      );

      // Check each alert
      for (const alert of alerts) {
        const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice);
        
        if (shouldTrigger) {
          console.log(`🚨 ALERT TRIGGERED: ${collectionName} ${alert.thresholdType} ${alert.thresholdPrice} ${alert.currency}`);
          await this.updateAlertStatus(alert.id, true);
          await this.notifyUser(alert, currentPrice);
        } else {
          await this.updateAlertStatus(alert.id, false);
        }
      }

    } catch (error) {
      console.error(`Error checking alerts for ${collectionName}:`, error);
    }
  }

  async getCurrentPrice(collectionName) {
    try {
      // Use the same approach as the main server - run NFT Agent via bun
      const { spawn } = require('child_process');
      const path = require('path');
      
      const query = `Get floor price for ${collectionName}`;
      const nftAgentPath = path.join(__dirname, 'nft-agent');
      
      return new Promise((resolve) => {
             const bunPath = process.env.BUN_PATH || '/Users/egoist/.bun/bin/bun';
             const bunProcess = spawn(bunPath, ['run', 'nftAgent.ts'], {
          cwd: nftAgentPath,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        bunProcess.on('error', (error) => {
          console.error(`Error spawning bun process for ${collectionName}:`, error);
          resolve(null);
        });
        
        let output = '';
        let errorOutput = '';
        
        bunProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        bunProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        bunProcess.on('close', (code) => {
          try {
            // Parse the last JSON line from output
            const lines = output.split('\n').filter(line => line.trim());
            let jsonResult = null;
            
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              if (line.startsWith('{') && line.endsWith('}')) {
                try {
                  jsonResult = JSON.parse(line);
                  break;
                } catch (e) {
                  continue;
                }
              }
            }
            
            if (jsonResult && jsonResult.success && jsonResult.result) {
              const result = jsonResult.result;
              resolve({
                price: parseFloat(result.floor_price_eth || result.floor_price_usd || 0),
                currency: result.floor_price_eth ? 'ETH' : 'USD',
                source: result.source || 'unknown'
              });
            } else {
              console.log(`No valid price data for ${collectionName}`);
              resolve(null);
            }
          } catch (error) {
            console.error(`Error parsing NFT Agent output for ${collectionName}:`, error);
            resolve(null);
          }
        });
        
        // Send the query to the NFT Agent
        bunProcess.stdin.write(query + '\n');
        bunProcess.stdin.end();
        
        // Timeout after 30 seconds
        setTimeout(() => {
          bunProcess.kill();
          resolve(null);
        }, 30000);
      });
      
    } catch (error) {
      console.error(`Error getting price for ${collectionName}:`, error);
      return null;
    }
  }

  async shouldTriggerAlert(alert, currentPrice) {
    // Get live exchange rates for accurate conversion
    let priceToCompare = currentPrice.price;
    
    if (alert.currency !== currentPrice.currency) {
      try {
        const exchangeRate = await this.getExchangeRate(currentPrice.currency, alert.currency);
        if (exchangeRate) {
          priceToCompare = currentPrice.price * exchangeRate;
        } else {
          console.error(`Could not get exchange rate from ${currentPrice.currency} to ${alert.currency}`);
          return false; // Don't trigger if we can't convert accurately
        }
      } catch (error) {
        console.error('Error getting exchange rate:', error);
        return false; // Don't trigger if conversion fails
      }
    }

    if (alert.thresholdType === 'below') {
      return priceToCompare <= alert.thresholdPrice;
    } else {
      return priceToCompare >= alert.thresholdPrice;
    }
  }

  // Make shouldTriggerAlert accessible for emulation
  async checkTriggerCondition(alert, currentPrice) {
    return this.shouldTriggerAlert(alert, currentPrice);
  }

  // Public method to check if alert should trigger
  async shouldAlertTrigger(alert, currentPrice) {
    return this.shouldTriggerAlert(alert, currentPrice);
  }

  async getExchangeRate(fromCurrency, toCurrency) {
    try {
      // Use CoinGecko API for live exchange rates
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${this.getCoinGeckoId(fromCurrency)}&vs_currencies=${this.getCoinGeckoId(toCurrency)}`);
      const data = await response.json();
      
      const fromId = this.getCoinGeckoId(fromCurrency);
      const toId = this.getCoinGeckoId(toCurrency);
      
      if (data[fromId] && data[fromId][toId]) {
        return data[fromId][toId];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return null;
    }
  }

  getCoinGeckoId(currency) {
    const mapping = {
      'ETH': 'ethereum',
      'USD': 'usd',
      'AVAX': 'avalanche-2',
      'BTC': 'bitcoin'
    };
    return mapping[currency] || currency.toLowerCase();
  }

  async notifyUser(alert, currentPrice) {
    const notificationMessage = `🚨 ALERT TRIGGERED: ${alert.collectionName} is now ${currentPrice.price} ${currentPrice.currency}! ${alert.thresholdType === 'below' ? 'Great time to buy!' : 'Price target reached!'}`;
    
    console.log(`📢 NOTIFICATION: User ${alert.userId} - ${notificationMessage}`);
    
    // Store notification in database for frontend to fetch
    try {
      await this.storeNotification(alert, currentPrice, notificationMessage);
      
      // Broadcast to all connected clients via Server-Sent Events
      this.broadcastNotification(alert.userId, {
        id: alert.id,
        collectionName: alert.collectionName,
        thresholdPrice: alert.thresholdPrice,
        thresholdType: alert.thresholdType,
        currency: alert.currency,
        currentPrice: currentPrice.price,
        currentCurrency: currentPrice.currency,
        message: notificationMessage,
        triggeredAt: new Date()
      });
      
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  async storeNotification(alert, currentPrice, message) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO notifications (alertId, userId, collectionName, thresholdPrice, thresholdType, currency, currentPrice, currentCurrency, message, triggeredAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        alert.id,
        alert.userId,
        alert.collectionName,
        alert.thresholdPrice,
        alert.thresholdType,
        alert.currency,
        currentPrice.price,
        currentPrice.currency,
        message,
        new Date().toISOString()
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  broadcastNotification(userId, notification) {
    // Store notification for frontend polling
    if (!this.activeNotifications) {
      this.activeNotifications = new Map();
    }
    
    if (!this.activeNotifications.has(userId)) {
      this.activeNotifications.set(userId, []);
    }
    
    this.activeNotifications.get(userId).push(notification);
    
    // Keep only last 10 notifications per user
    const userNotifications = this.activeNotifications.get(userId);
    if (userNotifications.length > 10) {
      userNotifications.splice(0, userNotifications.length - 10);
    }
  }

  getActiveNotifications(userId) {
    if (!this.activeNotifications || !this.activeNotifications.has(userId)) {
      return [];
    }
    return this.activeNotifications.get(userId) || [];
  }

  mapRowToAlert(row) {
    return {
      id: row.id,
      userId: row.userId,
      collectionName: row.collectionName,
      collectionAddress: row.collectionAddress,
      thresholdPrice: row.thresholdPrice,
      thresholdType: row.thresholdType,
      currency: row.currency,
      isActive: Boolean(row.isActive),
      autoBuy: Boolean(row.autoBuy),
      autoBuyPrice: row.autoBuyPrice,
      autoBuyCurrency: row.autoBuyCurrency,
      createdAt: new Date(row.createdAt),
      triggeredAt: row.triggeredAt ? new Date(row.triggeredAt) : undefined,
      lastCheckedAt: row.lastCheckedAt ? new Date(row.lastCheckedAt) : undefined
    };
  }

  mapRowToPriceHistory(row) {
    return {
      id: row.id,
      collectionName: row.collectionName,
      collectionAddress: row.collectionAddress,
      price: row.price,
      currency: row.currency,
      timestamp: new Date(row.timestamp),
      source: row.source
    };
  }

  close() {
    this.stopMonitoring();
    this.db.close();
  }
}

// Initialize the price alert service
const alertService = new NFTPriceAlertService();

// Start monitoring (check every 5 minutes)
alertService.startMonitoring(5);

// Middleware
router.use(cors());
router.use(express.json());

// Create a new price alert
router.post('/alerts', async (req, res) => {
  try {
    const { userId, collectionName, collectionAddress, thresholdPrice, thresholdType, currency, autoBuy, autoBuyPrice, autoBuyCurrency } = req.body;
    
    // Validate required fields
    if (!userId || !collectionName || !thresholdPrice || !thresholdType || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, collectionName, thresholdPrice, thresholdType, currency'
      });
    }

    // Validate threshold type
    if (!['below', 'above'].includes(thresholdType)) {
      return res.status(400).json({
        success: false,
        error: 'thresholdType must be "below" or "above"'
      });
    }

    // Validate currency
    if (!['ETH', 'USD', 'AVAX'].includes(currency)) {
      return res.status(400).json({
        success: false,
        error: 'currency must be "ETH", "USD", or "AVAX"'
      });
    }

    // Validate auto-buy fields if provided
    if (autoBuy && (!autoBuyPrice || !autoBuyCurrency)) {
      return res.status(400).json({
        success: false,
        error: 'When autoBuy is enabled, autoBuyPrice and autoBuyCurrency are required'
      });
    }

    if (autoBuyCurrency && !['ETH', 'USD', 'AVAX'].includes(autoBuyCurrency)) {
      return res.status(400).json({
        success: false,
        error: 'autoBuyCurrency must be "ETH", "USD", or "AVAX"'
      });
    }

    const alertData = {
      userId,
      collectionName,
      collectionAddress,
      thresholdPrice: parseFloat(thresholdPrice),
      thresholdType,
      currency,
      isActive: true
    };

    // Add auto-buy fields if specified
    if (autoBuy) {
      alertData.autoBuy = Boolean(autoBuy);
      alertData.autoBuyPrice = parseFloat(autoBuyPrice);
      alertData.autoBuyCurrency = autoBuyCurrency;
    }

    const alertId = await alertService.addAlert(alertData);

    const message = autoBuy ? 
      `Auto-buy alert created: Buy ${collectionName} when ${thresholdType} ${thresholdPrice} ${currency}` :
      `Price alert created: Notify when ${collectionName} ${thresholdType} ${thresholdPrice} ${currency}`;

    res.json({
      success: true,
      alertId,
      message,
      autoBuy: Boolean(autoBuy)
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create price alert'
    });
  }
});

// Get user's active alerts
router.get('/alerts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const alerts = await alertService.getUserAlerts(userId);
    
    res.json({
      success: true,
      alerts: alerts.map(alert => ({
        id: alert.id,
        collectionName: alert.collectionName,
        collectionAddress: alert.collectionAddress,
        thresholdPrice: alert.thresholdPrice,
        thresholdType: alert.thresholdType,
        currency: alert.currency,
        createdAt: alert.createdAt,
        lastCheckedAt: alert.lastCheckedAt
      }))
    });

  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alerts'
    });
  }
});

// Get triggered alerts (notifications)
router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get active notifications from memory (real-time)
    const activeNotifications = alertService.getActiveNotifications(userId);
    
    // Also get from database (persistent)
    const all = promisify(alertService.db.all.bind(alertService.db));
    const dbNotifications = await all(`
      SELECT * FROM notifications 
      WHERE userId = ? 
      ORDER BY triggeredAt DESC 
      LIMIT 20
    `, [userId]);
    
    // Combine and deduplicate
    const allNotifications = [...activeNotifications];
    dbNotifications.forEach(dbNotif => {
      if (!activeNotifications.find(n => n.id === dbNotif.alertId)) {
        allNotifications.push({
          id: dbNotif.alertId,
          collectionName: dbNotif.collectionName,
          thresholdPrice: dbNotif.thresholdPrice,
          thresholdType: dbNotif.thresholdType,
          currency: dbNotif.currency,
          currentPrice: dbNotif.currentPrice,
          currentCurrency: dbNotif.currentCurrency,
          message: dbNotif.message,
          triggeredAt: new Date(dbNotif.triggeredAt)
        });
      }
    });

    res.json({
      success: true,
      notifications: allNotifications.slice(0, 10) // Return latest 10
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications'
    });
  }
});

// Delete an alert
router.delete('/alerts/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    
    // Actually delete the alert from database
    await alertService.deleteAlert(parseInt(alertId));
    
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert'
    });
  }
});

// Get price history for a collection
router.get('/price-history/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    const { limit = 24 } = req.query; // Default to last 24 data points
    
    // Get price history (simplified - in production, implement proper query)
    const latestPrice = await alertService.getLatestPrice(collectionName);
    
    res.json({
      success: true,
      collectionName,
      latestPrice: latestPrice ? {
        price: latestPrice.price,
        currency: latestPrice.currency,
        timestamp: latestPrice.timestamp,
        source: latestPrice.source
      } : null
    });

  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get price history'
    });
  }
});

// Health check for monitoring service
router.get('/monitoring/status', (req, res) => {
  res.json({
    success: true,
    monitoring: alertService.isMonitoring,
    message: 'Price monitoring service status'
  });
});

// Emulate price change for testing/demo purposes
router.post('/emulate-price', async (req, res) => {
  try {
    console.log('🎭 Emulate price request received:', req.body);
    const { userId, collectionName, newPrice, currency } = req.body;
    
    // Validate required fields
    if (!userId || !collectionName || !newPrice || !currency) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, collectionName, newPrice, currency'
      });
    }

    // Validate currency
    if (!['ETH', 'USD', 'AVAX'].includes(currency)) {
      console.log('❌ Invalid currency:', currency);
      return res.status(400).json({
        success: false,
        error: 'currency must be "ETH", "USD", or "AVAX"'
      });
    }

    console.log(`🎭 EMULATING: ${collectionName} price change to ${newPrice} ${currency}`);

    // Get all active alerts for this collection and user
    console.log('🔍 Getting user alerts for:', userId);
    const userAlerts = await alertService.getUserAlerts(userId);
    console.log('📋 User alerts found:', userAlerts.length);
    
    const collectionAlerts = userAlerts.filter(alert => 
      alert.collectionName.toLowerCase() === collectionName.toLowerCase()
    );
    console.log('🎯 Collection alerts found:', collectionAlerts.length);

    if (collectionAlerts.length === 0) {
      console.log('❌ No alerts found for collection:', collectionName);
      return res.status(400).json({
        success: false,
        error: `No active alerts found for collection "${collectionName}"`
      });
    }

    // Record the emulated price in price history
    await alertService.recordPriceHistory(
      collectionName,
      parseFloat(newPrice),
      currency,
      'emulation_demo'
    );

    let triggeredCount = 0;
    const triggeredAlerts = [];

    // Check each alert to see if it should trigger
    for (const alert of collectionAlerts) {
      const shouldTrigger = await alertService.shouldAlertTrigger(alert, {
        price: parseFloat(newPrice),
        currency: currency
      });

      if (shouldTrigger) {
        console.log(`🚨 DEMO ALERT TRIGGERED: ${alert.collectionName} ${alert.thresholdType} ${alert.thresholdPrice} ${alert.currency}`);
        
        // Update alert status
        await alertService.updateAlertStatus(alert.id, true, parseFloat(newPrice));
        
        // Create notification
        await alertService.notifyUser(alert, {
          price: parseFloat(newPrice),
          currency: currency,
          source: 'emulation_demo'
        });

        triggeredCount++;
        triggeredAlerts.push({
          id: alert.id,
          thresholdPrice: alert.thresholdPrice,
          thresholdType: alert.thresholdType,
          currency: alert.currency
        });

        // Handle auto-buy if enabled
        console.log(`🔍 Checking auto-buy for alert ${alert.id}:`, {
          autoBuy: alert.autoBuy,
          autoBuyPrice: alert.autoBuyPrice,
          autoBuyCurrency: alert.autoBuyCurrency
        });
        
        if (alert.autoBuy && alert.autoBuyPrice && alert.autoBuyCurrency) {
          console.log(`🛒 AUTO-BUY TRIGGERED: ${alert.collectionName} at ${alert.autoBuyPrice} ${alert.autoBuyCurrency}`);
          
          try {
            // Import wallet service and execute auto-buy
            const { DummyWalletService } = require('./dummyWallet');
            const walletService = new DummyWalletService();
            
            // Get wallet
            const wallet = await walletService.getOrCreateWallet(alert.userId);
            if (wallet) {
              // Execute auto-buy with detailed information
              const buyResult = await walletService.buyNFT(wallet.id, {
                collectionName: alert.collectionName,
                price: alert.autoBuyPrice,
                currency: alert.autoBuyCurrency,
                quantity: 1,
                triggerPrice: alert.thresholdPrice,
                purchasePrice: alert.autoBuyPrice,
                previousPrice: parseFloat(newPrice)
              });

              if (buyResult.success) {
                console.log(`✅ AUTO-BUY SUCCESSFUL: ${alert.collectionName} NFT purchased!`);
                
                // Create auto-buy notification
                await alertService.notifyUser(alert, {
                  price: parseFloat(newPrice),
                  currency: currency,
                  source: 'auto_buy_demo',
                  autoBuy: true,
                  autoBuyPrice: alert.autoBuyPrice,
                  autoBuyCurrency: alert.autoBuyCurrency,
                  message: `🤖 AUTO-BUY EXECUTED: ${alert.collectionName} NFT purchased for ${alert.autoBuyPrice} ${alert.autoBuyCurrency} (triggered at ${newPrice} ${currency})`
                });

                triggeredAlerts.push({
                  id: alert.id,
                  thresholdPrice: alert.thresholdPrice,
                  thresholdType: alert.thresholdType,
                  currency: alert.currency,
                  autoBuy: true,
                  autoBuyPrice: alert.autoBuyPrice,
                  autoBuyCurrency: alert.autoBuyCurrency,
                  message: `🤖 AUTO-BUY: ${alert.collectionName} NFT purchased for ${alert.autoBuyPrice} ${alert.autoBuyCurrency}`
                });
              } else {
                console.log(`❌ AUTO-BUY FAILED: ${alert.collectionName} - ${buyResult.error}`);
                
                triggeredAlerts.push({
                  id: alert.id,
                  thresholdPrice: alert.thresholdPrice,
                  thresholdType: alert.thresholdType,
                  currency: alert.currency,
                  autoBuy: true,
                  autoBuyFailed: true,
                  autoBuyError: buyResult.error
                });
              }
            }
          } catch (error) {
            console.error(`❌ AUTO-BUY ERROR: ${alert.collectionName} -`, error);
            
            triggeredAlerts.push({
              id: alert.id,
              thresholdPrice: alert.thresholdPrice,
              thresholdType: alert.thresholdType,
              currency: alert.currency,
              autoBuy: true,
              autoBuyFailed: true,
              autoBuyError: error.message
            });
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Price emulation completed. ${triggeredCount} alert(s) triggered out of ${collectionAlerts.length} total alerts.`,
      details: {
        collectionName,
        newPrice: parseFloat(newPrice),
        currency,
        totalAlerts: collectionAlerts.length,
        triggeredCount,
        triggeredAlerts
      }
    });

  } catch (error) {
    console.error('❌ Error emulating price:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to emulate price change: ' + error.message
    });
  }
});

module.exports = router;