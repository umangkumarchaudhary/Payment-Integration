const axios = require('axios');

/**
 * PhonePe AutoPay API Helper - CORRECT VERSION
 * Based on actual working Postman request
 *
 * API Documentation: https://developer.phonepe.com/payment-gateway/autopay/
 */

class PhonePeAutoPayCorrect {
  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.clientId = process.env.PHONEPE_TEST_CLIENT_ID;
    this.clientSecret = process.env.PHONEPE_TEST_CLIENT_SECRET;
    this.clientVersion = process.env.PHONEPE_UAT_CLIENT_VERSION || '1';

    // Try without /hermes first
    this.baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
    this.webhookUrl = process.env.PHONEPE_WEBHOOK_URL;
    this.authToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Step 1: Generate Authorization Token
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
        'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
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

      console.log('✅ Auth token generated successfully');
      console.log('Token expires at:', new Date(this.tokenExpiresAt * 1000).toISOString());

      return this.authToken;
    } catch (error) {
      console.error('❌ Failed to generate auth token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 2: Setup Subscription (CORRECT PAYLOAD STRUCTURE)
   */
  async setupSubscription(customerData, subscriptionData) {
    try {
      // Get auth token first
      const authToken = await this.generateAuthToken();

      const merchantOrderId = `MO${Date.now()}`;
      const merchantSubscriptionId = subscriptionData.subscriptionId || `MS${Date.now()}`;

      // Calculate expiry times
      const expireAt = Date.now() + (10 * 60 * 1000); // 10 minutes from now
      const subscriptionExpireAt = Date.now() + (subscriptionData.totalInstallments * 30 * 24 * 60 * 60 * 1000); // months

      // CORRECT PAYLOAD STRUCTURE (as per PhonePe documentation)
      const payload = {
        merchantOrderId: merchantOrderId,
        amount: Math.round(subscriptionData.installmentAmount * 100), // in paise
        expireAt: expireAt,
        paymentFlow: {
          type: "SUBSCRIPTION_SETUP",
          merchantSubscriptionId: merchantSubscriptionId,
          authWorkflowType: "TRANSACTION", // or "PENNY_DROP"
          amountType: "FIXED", // or "VARIABLE"
          maxAmount: Math.round(subscriptionData.installmentAmount * 100), // in paise
          frequency: "MONTHLY", // DAILY, WEEKLY, MONTHLY, YEARLY, FORTNIGHTLY, BIMONTHLY, ON_DEMAND, QUARTERLY, HALFYEARLY
          expireAt: subscriptionExpireAt,
          paymentMode: {
            type: "UPI_COLLECT",
            details: {
              type: "VPA",
              vpa: customerData.upiId || "success@ybl"
            }
          }
        },
        deviceContext: {
          deviceOS: "ANDROID" // or "iOS" or "WEB"
        },
        metaInfo: {
          udf1: customerData.name,
          udf2: customerData.phone,
          udf3: subscriptionData.packageName,
          udf4: `Installments: ${subscriptionData.totalInstallments}`,
          udf5: `Total: ${subscriptionData.totalAmount}`
        }
      };

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('PhonePe AutoPay Subscription Setup (CORRECT STRUCTURE)');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('Customer:', customerData.name, '|', customerData.phone);
      console.log('Package:', subscriptionData.packageName);
      console.log('Amount:', subscriptionData.installmentAmount, 'x', subscriptionData.totalInstallments, '=', subscriptionData.totalAmount);
      console.log('VPA:', customerData.upiId || 'success@ybl');
      console.log('\nPayload:', JSON.stringify(payload, null, 2));
      console.log('═══════════════════════════════════════════════════════════\n');

      // Make the API call
      const response = await axios.post(
        `${this.baseUrl}/subscriptions/v2/setup`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `O-Bearer ${authToken}`
          }
        }
      );

      console.log('✅ Subscription Setup Successful!');
      console.log('Response:', JSON.stringify(response.data, null, 2));

      return {
        success: true,
        merchantOrderId,
        merchantSubscriptionId,
        orderId: response.data.orderId,
        state: response.data.state,
        intentUrl: response.data.intentUrl,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Subscription setup failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Step 2a: Validate UPI VPA (before UPI_COLLECT)
   */
  async validateUpiVpa(vpa) {
    try {
      const authToken = await this.generateAuthToken();

      const response = await axios.post(
        `${this.baseUrl}/v2/validate/upi`,
        {
          type: "VPA",
          vpa: vpa
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `O-Bearer ${authToken}`
          }
        }
      );

      console.log('✅ UPI VPA Validation:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ UPI VPA validation failed:', error.response?.data || error.message);
      return { valid: false };
    }
  }

  /**
   * Step 3: Get Subscription Order Status
   */
  async getOrderStatus(orderId) {
    try {
      const authToken = await this.generateAuthToken();

      const response = await axios.get(
        `${this.baseUrl}/subscriptions/v2/order/${orderId}/status`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `O-Bearer ${authToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Get order status failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Step 4: Get Subscription Status
   */
  async getSubscriptionStatus(merchantSubscriptionId) {
    try {
      const authToken = await this.generateAuthToken();

      const response = await axios.get(
        `${this.baseUrl}/subscriptions/v2/subscription/${merchantSubscriptionId}/status`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `O-Bearer ${authToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Get subscription status failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

module.exports = PhonePeAutoPayCorrect;
