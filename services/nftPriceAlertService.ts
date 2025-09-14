// NFT Price Alert System
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

interface PriceAlert {
  id: number;
  userId: string;
  collectionName: string;
  collectionAddress?: string;
  thresholdPrice: number;
  thresholdType: 'below' | 'above';
  currency: 'ETH' | 'USD' | 'AVAX';
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  lastCheckedAt?: Date;
}

interface PriceHistory {
  id: number;
  collectionName: string;
  collectionAddress?: string;
  price: number;
  currency: string;
  timestamp: Date;
  source: string;
}

class NFTPriceAlertService {
  private db: sqlite3.Database;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor(dbPath: string = './nft-alerts.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initDatabase();
  }

  private async initDatabase() {
    const run = promisify(this.db.run.bind(this.db));
    
    // Create alerts table
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

    // Create price history table
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

    // Create indexes for better performance
    await run(`CREATE INDEX IF NOT EXISTS idx_alerts_user_active ON price_alerts(userId, isActive)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_alerts_collection ON price_alerts(collectionName)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_price_history_collection ON price_history(collectionName, timestamp)`);
  }

  // Add a new price alert
  async addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggeredAt' | 'lastCheckedAt'>): Promise<number> {
    const run = promisify(this.db.run.bind(this.db));
    const result = await run(`
      INSERT INTO price_alerts (userId, collectionName, collectionAddress, thresholdPrice, thresholdType, currency, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      alert.userId,
      alert.collectionName,
      alert.collectionAddress || null,
      alert.thresholdPrice,
      alert.thresholdType,
      alert.currency,
      alert.isActive ? 1 : 0
    ]);
    
    return (result as any).lastID;
  }

  // Get active alerts for a user
  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    const all = promisify(this.db.all.bind(this.db));
    const alerts = await all(`
      SELECT * FROM price_alerts 
      WHERE userId = ? AND isActive = 1 
      ORDER BY createdAt DESC
    `, [userId]);
    
    return alerts.map(this.mapRowToAlert);
  }

  // Get all active alerts for monitoring
  async getActiveAlerts(): Promise<PriceAlert[]> {
    const all = promisify(this.db.all.bind(this.db));
    const alerts = await all(`
      SELECT * FROM price_alerts 
      WHERE isActive = 1 
      ORDER BY lastCheckedAt ASC, createdAt ASC
    `);
    
    return alerts.map(this.mapRowToAlert);
  }

  // Update alert status
  async updateAlertStatus(alertId: number, triggered: boolean, currentPrice?: number): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    
    if (triggered) {
      await run(`
        UPDATE price_alerts 
        SET triggeredAt = CURRENT_TIMESTAMP, isActive = 0, lastCheckedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [alertId]);
    } else {
      await run(`
        UPDATE price_alerts 
        SET lastCheckedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [alertId]);
    }
  }

  // Record price history
  async recordPriceHistory(collectionName: string, price: number, currency: string, source: string, collectionAddress?: string): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    await run(`
      INSERT INTO price_history (collectionName, collectionAddress, price, currency, source)
      VALUES (?, ?, ?, ?, ?)
    `, [collectionName, collectionAddress || null, price, currency, source]);
  }

  // Get latest price for a collection
  async getLatestPrice(collectionName: string): Promise<PriceHistory | null> {
    const get = promisify(this.db.get.bind(this.db));
    const row = await get(`
      SELECT * FROM price_history 
      WHERE collectionName = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `, [collectionName]);
    
    return row ? this.mapRowToPriceHistory(row) : null;
  }

  // Start monitoring service
  startMonitoring(checkIntervalMinutes: number = 5): void {
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

  // Stop monitoring service
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 NFT price monitoring stopped');
  }

  // Check all active alerts
  private async checkAllAlerts(): Promise<void> {
    try {
      console.log('🔍 Checking all active price alerts...');
      const alerts = await this.getActiveAlerts();
      
      if (alerts.length === 0) {
        console.log('No active alerts to check');
        return;
      }

      console.log(`Found ${alerts.length} active alerts to check`);

      // Group alerts by collection to minimize API calls
      const collectionGroups = new Map<string, PriceAlert[]>();
      alerts.forEach(alert => {
        const key = alert.collectionName;
        if (!collectionGroups.has(key)) {
          collectionGroups.set(key, []);
        }
        collectionGroups.get(key)!.push(alert);
      });

      // Check each collection
      for (const [collectionName, collectionAlerts] of collectionGroups) {
        await this.checkCollectionAlerts(collectionName, collectionAlerts);
      }

    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  // Check alerts for a specific collection
  private async checkCollectionAlerts(collectionName: string, alerts: PriceAlert[]): Promise<void> {
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

  // Get current price using NFT Agent
  private async getCurrentPrice(collectionName: string): Promise<{price: number, currency: string, source: string} | null> {
    try {
      // Use the NFT Agent to get current price
      const { askGemini } = require('./nft-agent/gemini');
      const { runAction } = require('./nft-agent/actions');
      
      const query = `Get floor price for ${collectionName}`;
      const decision = await askGemini(query);
      
      if (decision.type === "action" && decision.action === "get_nft_floor_price") {
        const result = await runAction(decision.action, decision.params || {});
        
        if (result.success) {
          return {
            price: parseFloat(result.floor_price_eth || result.floor_price_usd || 0),
            currency: result.floor_price_eth ? 'ETH' : 'USD',
            source: result.source || 'unknown'
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting price for ${collectionName}:`, error);
      return null;
    }
  }

  // Check if alert should trigger
  private shouldTriggerAlert(alert: PriceAlert, currentPrice: {price: number, currency: string}): boolean {
    // Convert currencies if needed (simplified - in production, use proper conversion)
    let priceToCompare = currentPrice.price;
    
    if (alert.currency !== currentPrice.currency) {
      // Simple conversion (in production, use real exchange rates)
      if (alert.currency === 'USD' && currentPrice.currency === 'ETH') {
        priceToCompare = currentPrice.price * 2500; // Approximate ETH to USD
      } else if (alert.currency === 'ETH' && currentPrice.currency === 'USD') {
        priceToCompare = currentPrice.price / 2500; // Approximate USD to ETH
      }
    }

    if (alert.thresholdType === 'below') {
      return priceToCompare <= alert.thresholdPrice;
    } else {
      return priceToCompare >= alert.thresholdPrice;
    }
  }

  // Notify user (placeholder - implement actual notification)
  private async notifyUser(alert: PriceAlert, currentPrice: {price: number, currency: string, source: string}): Promise<void> {
    console.log(`📢 NOTIFICATION: User ${alert.userId} - ${alert.collectionName} is now ${currentPrice.price} ${currentPrice.currency} (${alert.thresholdType} ${alert.thresholdPrice} ${alert.currency})`);
    
    // TODO: Implement actual notification system
    // - WebSocket to frontend
    // - Email/SMS notifications
    // - Push notifications
  }

  // Helper methods
  private mapRowToAlert(row: any): PriceAlert {
    return {
      id: row.id,
      userId: row.userId,
      collectionName: row.collectionName,
      collectionAddress: row.collectionAddress,
      thresholdPrice: row.thresholdPrice,
      thresholdType: row.thresholdType,
      currency: row.currency,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      triggeredAt: row.triggeredAt ? new Date(row.triggeredAt) : undefined,
      lastCheckedAt: row.lastCheckedAt ? new Date(row.lastCheckedAt) : undefined
    };
  }

  private mapRowToPriceHistory(row: any): PriceHistory {
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

  // Cleanup
  close(): void {
    this.stopMonitoring();
    this.db.close();
  }
}

export { NFTPriceAlertService, PriceAlert, PriceHistory };
