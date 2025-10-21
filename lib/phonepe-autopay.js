const crypto = require('crypto');
const axios = require('axios');

/**
 * PhonePe AutoPay (Subscription) API Helper
 * Based on official PhonePe AutoPay documentation
 */

class PhonePeAutoPay {
  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.clientId = process.env.PHONEPE_TEST_CLIENT_ID;
    this.clientSecret = process.env.PHONEPE_TEST_CLIENT_SECRET;
    this.clientVersion = process.env.PHONEPE_UAT_CLIENT_VERSION || '1';
    this.baseUrl = process.env.PHONEPE_API_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
    this.webhookUrl = process.env.PHONEPE_WEBHOOK_URL;
    this.authToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Step 1: Generate Authorization Token
   * As per documentation: POST /v1/oauth/token
   */
  async generateAuthToken() {
    try {
      // Check if we have a valid token
      if (this.authToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt * 1000) {
        console.log('Using cached auth token');
        return this.authToken;
      }

      console.log('Generating new auth token...');

      const response = await axios.post(
        `${this.baseUrl}/v1/oauth/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_version: this.clientVersion,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.authToken = response.data.access_token;
      this.tokenExpiresAt = response.data.expires_at;

      console.log('Auth token generated successfully');
      console.log('Token expires at:', new Date(this.tokenExpiresAt * 1000).toISOString());

      return this.authToken;
    } catch (error) {
      console.error('Failed to generate auth token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 2: Subscription Setup
   * As per documentation: POST /subscriptions/v2/setup
   */
  async setupSubscription(customerData, subscriptionData) {
    try {
      // Get auth token first
      const authToken = await this.generateAuthToken();

      const merchantSubscriptionId = subscriptionData.subscriptionId || `SUB${Date.now()}`;
      const merchantOrderId = `ORDER${Date.now()}`;

      const payload = {
        merchantId: this.merchantId,
        merchantSubscriptionId: merchantSubscriptionId,
        merchantOrderId: merchantOrderId,
        merchantUserId: customerData.customerId || `CUST${Date.now()}`,
        amount: Math.round(subscriptionData.installmentAmount * 100), // in paise
        currency: "INR",
        mobileNumber: customerData.phone,
        deviceContext: {
          deviceOS: "WEB"
        },
        paymentInstrument: {
          type: "UPI_COLLECT",
          vpa: customerData.upiId || "success@ybl"
        },
        autoDebit: {
          subscriptionStartDate: subscriptionData.startDate || new Date().toISOString().split('T')[0],
          subscriptionEndDate: this.calculateEndDate(subscriptionData.startDate, subscriptionData.totalInstallments),
          frequency: "MONTHLY",
          subscriptionAmountType: "FIXED",
          subscriptionAmount: Math.round(subscriptionData.installmentAmount * 100),
          maxAmount: Math.round(subscriptionData.installmentAmount * 100)
        },
        callbackUrl: this.webhookUrl,
        redirectUrl: this.redirectUrl,
        redirectMode: "REDIRECT"
      };

      console.log('Subscription Setup Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${this.baseUrl}/subscriptions/v2/setup`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      console.log('Subscription Setup Response:', response.data);

      return {
        success: true,
        merchantSubscriptionId,
        merchantOrderId,
        data: response.data
      };

    } catch (error) {
      console.error('Subscription setup failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Step 3: Get Subscription Order Status
   * GET /subscriptions/v2/order/{merchantOrderId}/status
   */
  async getOrderStatus(merchantOrderId) {
    try {
      const authToken = await this.generateAuthToken();

      const response = await axios.get(
        `${this.baseUrl}/subscriptions/v2/order/${merchantOrderId}/status`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get order status failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Step 4: Get Subscription Status
   * GET /subscriptions/v2/{merchantSubscriptionId}/status
   */
  async getSubscriptionStatus(merchantSubscriptionId) {
    try {
      const authToken = await this.generateAuthToken();

      const response = await axios.get(
        `${this.baseUrl}/subscriptions/v2/${merchantSubscriptionId}/status`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get subscription status failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Step 5: Redemption Notify
   * POST /subscriptions/v2/notify
   */
  async redemptionNotify(merchantSubscriptionId, merchantOrderId, amount) {
    try {
      const authToken = await this.generateAuthToken();

      const payload = {
        merchantId: this.merchantId,
        merchantSubscriptionId: merchantSubscriptionId,
        merchantOrderId: merchantOrderId,
        amount: Math.round(amount * 100), // in paise
        currency: "INR"
      };

      const response = await axios.post(
        `${this.baseUrl}/subscriptions/v2/notify`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Redemption notify failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Step 6: Redemption Execute
   * POST /subscriptions/v2/redeem
   */
  async redemptionExecute(merchantSubscriptionId, merchantOrderId, amount) {
    try {
      const authToken = await this.generateAuthToken();

      const payload = {
        merchantId: this.merchantId,
        merchantSubscriptionId: merchantSubscriptionId,
        merchantOrderId: merchantOrderId,
        amount: Math.round(amount * 100), // in paise
        currency: "INR"
      };

      const response = await axios.post(
        `${this.baseUrl}/subscriptions/v2/redeem`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Redemption execute failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Cancel Subscription
   * POST /subscriptions/v2/{merchantSubscriptionId}/cancel
   */
  async cancelSubscription(merchantSubscriptionId) {
    try {
      const authToken = await this.generateAuthToken();

      const response = await axios.post(
        `${this.baseUrl}/subscriptions/v2/${merchantSubscriptionId}/cancel`,
        {
          merchantId: this.merchantId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Cancel subscription failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Helper: Calculate subscription end date
   */
  calculateEndDate(startDate, totalInstallments) {
    const start = startDate ? new Date(startDate) : new Date();
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + parseInt(totalInstallments));
    return endDate.toISOString().split('T')[0];
  }
}

module.exports = PhonePeAutoPay;
