// Price Alert Service for Frontend
export interface PriceAlert {
  id: number;
  collectionName: string;
  collectionAddress?: string;
  thresholdPrice: number;
  thresholdType: 'below' | 'above';
  currency: 'ETH' | 'USD' | 'AVAX';
  createdAt: Date;
  lastCheckedAt?: Date;
}

export interface PriceNotification {
  id: number;
  collectionName: string;
  thresholdPrice: number;
  thresholdType: 'below' | 'above';
  currency: 'ETH' | 'USD' | 'AVAX';
  currentPrice: number;
  currentCurrency: string;
  triggeredAt: Date;
  message: string;
}

export interface CreateAlertRequest {
  userId: string;
  collectionName: string;
  collectionAddress?: string;
  thresholdPrice: number;
  thresholdType: 'below' | 'above';
  currency: 'ETH' | 'USD' | 'AVAX';
}

class PriceAlertService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
  }

  // Create a new price alert
  async createAlert(alertData: CreateAlertRequest): Promise<{success: boolean, alertId?: number, message?: string, error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating price alert:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get user's active alerts
  async getUserAlerts(userId: string): Promise<{success: boolean, alerts?: PriceAlert[], error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting user alerts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get user's notifications
  async getUserNotifications(userId: string): Promise<{success: boolean, notifications?: PriceNotification[], error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete an alert
  async deleteAlert(alertId: number): Promise<{success: boolean, message?: string, error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts/${alertId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting alert:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get price history for a collection
  async getPriceHistory(collectionName: string): Promise<{success: boolean, latestPrice?: any, error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/price-history/${encodeURIComponent(collectionName)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting price history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Check monitoring status
  async getMonitoringStatus(): Promise<{success: boolean, monitoring?: boolean, error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/monitoring/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting monitoring status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper method to format alert for display
  formatAlertForDisplay(alert: PriceAlert): string {
    const action = alert.thresholdType === 'below' ? 'drops below' : 'rises above';
    return `${alert.collectionName} ${action} ${alert.thresholdPrice} ${alert.currency}`;
  }

  // Helper method to format notification for display
  formatNotificationForDisplay(notification: PriceNotification): string {
    return notification.message;
  }
}

export const priceAlertService = new PriceAlertService();
