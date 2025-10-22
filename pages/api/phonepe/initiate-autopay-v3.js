import PhonePeAutoPayCorrect from '../../../lib/phonepe-autopay-correct';

/**
 * API Route: Initiate AutoPay Subscription (CORRECT VERSION - v3)
 * POST /api/phonepe/initiate-autopay-v3
 *
 * This uses the CORRECT payload structure that actually works!
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

    const phonepe = new PhonePeAutoPayCorrect();

    // Create customer data
    const customerData = {
      customerId: `CUST_${Date.now()}`,
      name: customerName,
      phone: phone,
      upiId: upiId || 'success@ybl'
    };

    // Create subscription data
    const subscriptionData = {
      subscriptionId: `MS_${Date.now()}`,
      packageName: packageName || 'Service Package',
      totalAmount: totalAmount,
      installmentAmount: installmentAmount,
      totalInstallments: totalInstallments,
      frequency: 'MONTHLY',
      startDate: startDate || new Date().toISOString().split('T')[0]
    };

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('PhonePe AutoPay Subscription Request (v3 - CORRECT)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Customer:', customerName, '|', phone);
    console.log('Package:', packageName);
    console.log('Amount:', installmentAmount, 'x', totalInstallments, '=', totalAmount);
    console.log('VPA:', upiId || 'success@ybl');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Optional: Validate UPI VPA first (recommended)
    if (upiId) {
      console.log('Validating UPI VPA...');
      const validation = await phonepe.validateUpiVpa(upiId);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid UPI ID',
          message: 'The provided UPI ID is not valid. Please check and try again.'
        });
      }
      console.log('UPI VPA validated:', validation.name);
    }

    // Setup subscription using CORRECT API structure
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
      orderId: result.orderId,
      merchantOrderId: result.merchantOrderId,
      customerName: customerName,
      phone: phone,
      upiId: upiId,
      packageName: packageName,
      totalAmount: totalAmount,
      installmentAmount: installmentAmount,
      totalInstallments: totalInstallments,
      state: result.state,
      createdAt: new Date().toISOString()
    };

    // TODO: Save to database
    // await db.subscriptions.insert(subscriptionDetails);

    console.log('✅ Subscription created successfully');
    console.log('Order ID:', result.orderId);
    console.log('State:', result.state);

    return res.status(200).json({
      success: true,
      message: 'AutoPay subscription setup initiated successfully',
      data: {
        ...subscriptionDetails,
        phonepeResponse: result.data,
        // If intent URL is returned (for UPI_INTENT), include it
        intentUrl: result.intentUrl,
        // Customer should check their UPI app for authorization request
        nextSteps: result.state === 'PENDING'
          ? 'Customer will receive authorization request in their UPI app'
          : 'Check order status',
        checkStatusUrl: `/api/phonepe/subscription-status?orderId=${result.orderId}`
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
