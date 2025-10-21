const crypto = require('crypto');

/**
 * PhonePe API Helper Functions
 * Handles AutoPay (Recurring Payments) integration
 */

class PhonePeHelper {
  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.clientId = process.env.PHONEPE_TEST_CLIENT_ID;
    this.clientSecret = process.env.PHONEPE_TEST_CLIENT_SECRET;
    this.baseUrl = process.env.PHONEPE_API_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
    this.webhookUrl = process.env.PHONEPE_WEBHOOK_URL;
  }

  /**
   * Generate X-VERIFY header for PhonePe API authentication
   * Format: BASE64(SHA256(payload + apiEndpoint + salt)) + ### + saltIndex
   */
  generateXVerify(payload, apiEndpoint, saltKey, saltIndex = 1) {
    const stringToHash = payload + apiEndpoint + saltKey;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return `${sha256Hash}###${saltIndex}`;
  }

  /**
   * Create AutoPay subscription request
   * This initiates the recurring payment mandate
   */
  async createAutoPaySubscription(customerData, subscriptionData) {
    try {
      const transactionId = `T${Date.now()}`;

      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: customerData.customerId || `MUID${Date.now()}`,
        amount: subscriptionData.firstPaymentAmount * 100, // Amount in paise
        redirectUrl: this.redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: this.webhookUrl,
        mobileNumber: customerData.phone,
        paymentInstrument: {
          type: 'UPI_COLLECT',
          vpa: customerData.upiId || 'success@ybl' // Use test VPA for simulator
        }
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const apiEndpoint = '/pg/v1/pay';
      const xVerify = this.generateXVerify(base64Payload, apiEndpoint, this.clientSecret);

      return {
        success: true,
        transactionId,
        payload: base64Payload,
        xVerify,
        apiEndpoint: `${this.baseUrl}${apiEndpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify
        },
        rawPayload: payload
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create simple payment request for testing with PhonePe Simulator
   * Use test VPAs: success@ybl, pending@ybl, failed@ybl
   */
  async createSimplePayment(customerData, amount) {
    try {
      const transactionId = `T${Date.now()}`;

      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: customerData.customerId || `MUID${Date.now()}`,
        amount: amount * 100, // Amount in paise
        redirectUrl: this.redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: this.webhookUrl,
        mobileNumber: customerData.phone,
        paymentInstrument: {
          type: 'UPI_COLLECT',
          vpa: customerData.upiId || 'success@ybl'
        }
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const apiEndpoint = '/pg/v1/pay';
      const xVerify = this.generateXVerify(base64Payload, apiEndpoint, this.clientSecret);

      return {
        success: true,
        transactionId,
        payload: base64Payload,
        xVerify,
        apiEndpoint: `${this.baseUrl}${apiEndpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify
        },
        rawPayload: payload
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute recurring payment after mandate is established
   */
  async executeRecurringPayment(subscriptionId, amount, customerId) {
    try {
      const transactionId = `REC${Date.now()}`;

      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: customerId,
        amount: amount * 100, // Amount in paise
        subscriptionId: subscriptionId,
        callbackUrl: this.webhookUrl
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const apiEndpoint = '/v3/recurring/debit/init';
      const xVerify = this.generateXVerify(base64Payload, apiEndpoint, this.clientSecret);

      return {
        success: true,
        transactionId,
        payload: base64Payload,
        xVerify,
        apiEndpoint: `${this.baseUrl}${apiEndpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': this.merchantId,
          'X-CLIENT-ID': this.clientId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check transaction/subscription status
   */
  async checkStatus(transactionId) {
    try {
      const apiEndpoint = `/v3/transaction/${this.merchantId}/${transactionId}/status`;
      const stringToHash = apiEndpoint + this.clientSecret;
      const xVerify = crypto.createHash('sha256').update(stringToHash).digest('hex') + '###1';

      return {
        success: true,
        apiEndpoint: `${this.baseUrl}${apiEndpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': this.merchantId,
          'X-CLIENT-ID': this.clientId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify webhook callback signature
   */
  verifyWebhookSignature(receivedSignature, payload) {
    const expectedSignature = crypto
      .createHash('sha256')
      .update(payload + this.clientSecret)
      .digest('hex');

    return receivedSignature === expectedSignature;
  }
}

module.exports = PhonePeHelper;
