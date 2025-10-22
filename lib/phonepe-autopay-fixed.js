const crypto = require('crypto');
const axios = require('axios');

/**
 * PhonePe AutoPay (Subscription) API Helper - FIXED VERSION
 *
 * Based on PhonePe's actual API requirements:
 * - Payload must be Base64 encoded
 * - X-VERIFY header with SHA256 signature is required
 * - Uses /v3/recurring/auth/init for subscription setup
 */

class PhonePeAutoPayFixed {
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
   * Generate X-VERIFY header (SHA256 + Base64)
   */
  generateXVerify(base64Payload, endpoint) {
    const string = base64Payload + endpoint + this.clientSecret;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    return sha256 + '###' + '1'; // Format: hash###keyIndex
  }

  /**
   * Step 1: Generate Authorization Token (OAuth)
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
   * Step 2: Subscription Setup using /v3/recurring/auth/init
   * This is the CORRECT endpoint for AutoPay mandate creation
   */
  async setupSubscription(customerData, subscriptionData) {
    try {
      // Get auth token first
      const authToken = await this.generateAuthToken();

      const merchantTransactionId = `TXN${Date.now()}`;
      const merchantSubscriptionId = subscriptionData.subscriptionId || `SUB${Date.now()}`;

      // Create the request payload
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: customerData.customerId || `CUST${Date.now()}`,
        amount: Math.round(subscriptionData.installmentAmount * 100), // in paise
        mobileNumber: customerData.phone,
        deviceContext: {
          deviceOS: "WEB"
        },
        paymentInstrument: {
          type: "UPI_MANDATE",
          targetApp: "com.phonepe.app",
          vpa: customerData.upiId || "success@ybl"
        },
        // Subscription/AutoPay specific fields
        subscriptionDetails: {
          subscriptionId: merchantSubscriptionId,
          authWorkflowType: "TRANSACTION",
          amountType: "FIXED",
          amount: Math.round(subscriptionData.installmentAmount * 100),
          frequency: "MONTHLY",
          recurringCount: parseInt(subscriptionData.totalInstallments),
          startDate: subscriptionData.startDate || new Date().toISOString().split('T')[0],
          endDate: this.calculateEndDate(subscriptionData.startDate, subscriptionData.totalInstallments)
        },
        merchantOrderId: merchantTransactionId,
        message: subscriptionData.packageName || "Service Package AutoPay",
        callbackUrl: this.redirectUrl,
        redirectUrl: this.redirectUrl,
        redirectMode: "REDIRECT"
      };

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('PhonePe AutoPay Subscription Request (FIXED)');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      // Base64 encode the payload
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      console.log('Base64 Payload:', base64Payload.substring(0, 100) + '...');

      // Generate X-VERIFY header
      const endpoint = '/v3/recurring/auth/init';
      const xVerify = this.generateXVerify(base64Payload, endpoint);
      console.log('X-VERIFY:', xVerify.substring(0, 50) + '...');
      console.log('═══════════════════════════════════════════════════════════\n');

      // Make the API call with Base64 payload and signature
      const response = await axios.post(
        `${this.baseUrl}${endpoint}`,
        {
          request: base64Payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'X-VERIFY': xVerify,
            'X-MERCHANT-ID': this.merchantId
          }
        }
      );

      console.log('Subscription Setup Response:', JSON.stringify(response.data, null, 2));

      // Decode the response if it's Base64 encoded
      let responseData = response.data;
      if (responseData.response) {
        const decodedResponse = JSON.parse(Buffer.from(responseData.response, 'base64').toString());
        responseData = { ...responseData, decoded: decodedResponse };
      }

      return {
        success: true,
        merchantTransactionId,
        merchantSubscriptionId,
        data: responseData
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
   * Alternative: Try /v3/recurring/debit/init (for recurring payments)
   */
  async setupRecurringDebit(customerData, subscriptionData) {
    try {
      const authToken = await this.generateAuthToken();

      const merchantTransactionId = `TXN${Date.now()}`;
      const merchantSubscriptionId = subscriptionData.subscriptionId || `SUB${Date.now()}`;

      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: customerData.customerId || `CUST${Date.now()}`,
        amount: Math.round(subscriptionData.installmentAmount * 100),
        mobileNumber: customerData.phone,
        deviceContext: {
          deviceOS: "WEB"
        },
        paymentInstrument: {
          type: "UPI_MANDATE",
          vpa: customerData.upiId || "success@ybl"
        },
        callbackUrl: this.redirectUrl,
        redirectUrl: this.redirectUrl,
        redirectMode: "REDIRECT"
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const endpoint = '/v3/recurring/debit/init';
      const xVerify = this.generateXVerify(base64Payload, endpoint);

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('Trying Alternative: /v3/recurring/debit/init');
      console.log('═══════════════════════════════════════════════════════════\n');

      const response = await axios.post(
        `${this.baseUrl}${endpoint}`,
        {
          request: base64Payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'X-VERIFY': xVerify,
            'X-MERCHANT-ID': this.merchantId
          }
        }
      );

      let responseData = response.data;
      if (responseData.response) {
        const decodedResponse = JSON.parse(Buffer.from(responseData.response, 'base64').toString());
        responseData = { ...responseData, decoded: decodedResponse };
      }

      return {
        success: true,
        merchantTransactionId,
        merchantSubscriptionId,
        data: responseData
      };

    } catch (error) {
      console.error('Recurring debit setup failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get Transaction Status
   */
  async getTransactionStatus(merchantTransactionId) {
    try {
      const authToken = await this.generateAuthToken();
      const endpoint = `/v3/transaction/${merchantTransactionId}/status`;

      // For status check, X-VERIFY = SHA256(endpoint + clientSecret)
      const string = endpoint + '###' + '1' + this.clientSecret;
      const xVerify = crypto.createHash('sha256').update(string).digest('hex') + '###' + '1';

      const response = await axios.get(
        `${this.baseUrl}${endpoint}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'X-VERIFY': xVerify,
            'X-MERCHANT-ID': this.merchantId
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get transaction status failed:', error.response?.data || error.message);
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

module.exports = PhonePeAutoPayFixed;
