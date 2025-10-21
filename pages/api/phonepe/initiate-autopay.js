import PhonePeHelper from '../../../lib/phonepe';
import axios from 'axios';

/**
 * API Route: Initiate AutoPay Subscription
 * POST /api/phonepe/initiate-autopay
 *
 * Request Body:
 * {
 *   customerName: string,
 *   phone: string,
 *   upiId: string (optional),
 *   packageName: string,
 *   totalAmount: number,
 *   installmentAmount: number,
 *   totalInstallments: number,
 *   firstPaymentAmount: number,
 *   startDate: string (YYYY-MM-DD)
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      customerName,
      phone,
      upiId,
      packageName,
      totalAmount,
      installmentAmount,
      totalInstallments,
      firstPaymentAmount,
      startDate
    } = req.body;

    // Validate required fields
    if (!customerName || !phone || !totalAmount || !installmentAmount || !totalInstallments) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customerName', 'phone', 'totalAmount', 'installmentAmount', 'totalInstallments']
      });
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number. Must be 10 digits.' });
    }

    const phonepe = new PhonePeHelper();

    // Create customer data
    const customerData = {
      customerId: `CUST_${Date.now()}`,
      name: customerName,
      phone: phone,
      upiId: upiId
    };

    // Create subscription data
    const subscriptionData = {
      subscriptionId: `SUB_${Date.now()}`,
      packageName: packageName || 'Service Package',
      totalAmount: totalAmount,
      installmentAmount: installmentAmount,
      totalInstallments: totalInstallments,
      firstPaymentAmount: firstPaymentAmount || installmentAmount,
      frequency: 'MONTHLY',
      startDate: startDate || new Date().toISOString().split('T')[0]
    };

    // Generate subscription request
    const subscriptionRequest = await phonepe.createAutoPaySubscription(
      customerData,
      subscriptionData
    );

    if (!subscriptionRequest.success) {
      return res.status(500).json({
        error: 'Failed to create subscription request',
        details: subscriptionRequest.error
      });
    }

    // Make API call to PhonePe
    try {
      const response = await axios.post(
        subscriptionRequest.apiEndpoint,
        {
          request: subscriptionRequest.payload
        },
        {
          headers: subscriptionRequest.headers
        }
      );

      // Store subscription details in your database here
      // For demo, we'll return the details
      const subscriptionDetails = {
        customerId: customerData.customerId,
        subscriptionId: subscriptionData.subscriptionId,
        transactionId: subscriptionRequest.transactionId,
        customerName: customerName,
        phone: phone,
        packageName: packageName,
        totalAmount: totalAmount,
        installmentAmount: installmentAmount,
        totalInstallments: totalInstallments,
        createdAt: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'AutoPay subscription initiated successfully',
        data: {
          ...subscriptionDetails,
          phonepeResponse: response.data,
          // If PhonePe returns a payment URL, include it
          paymentUrl: response.data?.data?.instrumentResponse?.redirectInfo?.url
        }
      });

    } catch (apiError) {
      console.error('PhonePe API Error:', apiError.response?.data || apiError.message);

      return res.status(500).json({
        error: 'PhonePe API call failed',
        details: apiError.response?.data || apiError.message,
        info: 'This might be due to test credentials. Check PhonePe documentation for sandbox setup.'
      });
    }

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
