import PhonePeAutoPay from '../../../lib/phonepe-autopay';

/**
 * API Route: Initiate AutoPay Subscription (Correct AutoPay API)
 * POST /api/phonepe/initiate-autopay-v2
 *
 * This uses the CORRECT PhonePe AutoPay/Subscription APIs as per documentation
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

    const phonepe = new PhonePeAutoPay();

    // Create customer data
    const customerData = {
      customerId: `CUST_${Date.now()}`,
      name: customerName,
      phone: phone,
      upiId: upiId || 'success@ybl'
    };

    // Create subscription data
    const subscriptionData = {
      subscriptionId: `SUB_${Date.now()}`,
      packageName: packageName || 'Service Package',
      totalAmount: totalAmount,
      installmentAmount: installmentAmount,
      totalInstallments: totalInstallments,
      frequency: 'MONTHLY',
      startDate: startDate || new Date().toISOString().split('T')[0]
    };

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('PhonePe AutoPay Subscription Request');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Customer:', customerName, '|', phone);
    console.log('Package:', packageName);
    console.log('Amount:', installmentAmount, 'x', totalInstallments, '=', totalAmount);
    console.log('VPA:', upiId || 'success@ybl');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Setup subscription using CORRECT AutoPay API
    const result = await phonepe.setupSubscription(customerData, subscriptionData);

    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to setup subscription',
        details: result.error
      });
    }

    // Store subscription details in your database here
    const subscriptionDetails = {
      customerId: customerData.customerId,
      subscriptionId: result.merchantSubscriptionId,
      orderId: result.merchantOrderId,
      customerName: customerName,
      phone: phone,
      upiId: upiId,
      packageName: packageName,
      totalAmount: totalAmount,
      installmentAmount: installmentAmount,
      totalInstallments: totalInstallments,
      createdAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: 'AutoPay subscription setup initiated successfully',
      data: {
        ...subscriptionDetails,
        phonepeResponse: result.data,
        // If PhonePe returns a payment URL, include it
        paymentUrl: result.data?.data?.instrumentResponse?.intentLink,
        checkStatusUrl: `/api/phonepe/subscription-status?subscriptionId=${result.merchantSubscriptionId}`
      }
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
