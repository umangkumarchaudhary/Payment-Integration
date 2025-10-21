import PhonePeHelper from '../../../lib/phonepe';

/**
 * API Route: PhonePe Webhook
 * POST /api/phonepe/webhook
 *
 * This endpoint receives server-to-server notifications from PhonePe
 * for subscription status updates and recurring payment events
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { response, xVerify } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Missing response data' });
    }

    // Verify webhook signature
    const phonepe = new PhonePeHelper();
    const isValid = phonepe.verifyWebhookSignature(
      xVerify?.split('###')[0],
      response
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Decode the base64 response
    const decodedResponse = JSON.parse(
      Buffer.from(response, 'base64').toString('utf-8')
    );

    console.log('PhonePe Webhook Notification:', decodedResponse);

    const { code, message, data } = decodedResponse;

    // Handle different webhook events
    switch (code) {
      case 'PAYMENT_SUCCESS':
      case 'SUCCESS':
        // Recurring payment successful
        await handleSuccessfulPayment(data);
        break;

      case 'PAYMENT_ERROR':
      case 'PAYMENT_DECLINED':
        // Recurring payment failed
        await handleFailedPayment(data);
        break;

      case 'SUBSCRIPTION_ACTIVATED':
        // Subscription mandate approved
        await handleSubscriptionActivated(data);
        break;

      case 'SUBSCRIPTION_CANCELLED':
        // Subscription cancelled by user
        await handleSubscriptionCancelled(data);
        break;

      case 'SUBSCRIPTION_PAUSED':
        // Subscription paused
        await handleSubscriptionPaused(data);
        break;

      default:
        console.log('Unknown webhook event:', code);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    // Still return 200 to prevent retries
    return res.status(200).json({ success: false, error: error.message });
  }
}

// Helper functions to handle different events
async function handleSuccessfulPayment(data) {
  console.log('Processing successful payment:', data);

  // TODO: Update database
  // - Mark installment as paid
  // - Update payment history
  // - Send confirmation SMS/Email to customer

  const paymentRecord = {
    transactionId: data.transactionId,
    merchantTransactionId: data.merchantTransactionId,
    subscriptionId: data.subscriptionId,
    amount: data.amount / 100, // Convert from paise to rupees
    status: 'SUCCESS',
    paymentDate: new Date().toISOString()
  };

  console.log('Payment Record:', paymentRecord);
  // Save to database
}

async function handleFailedPayment(data) {
  console.log('Processing failed payment:', data);

  // TODO: Update database
  // - Mark installment as failed
  // - Trigger retry logic
  // - Send notification to customer

  const failureRecord = {
    transactionId: data.transactionId,
    subscriptionId: data.subscriptionId,
    reason: data.message,
    status: 'FAILED',
    failureDate: new Date().toISOString()
  };

  console.log('Failure Record:', failureRecord);
  // Save to database and trigger alerts
}

async function handleSubscriptionActivated(data) {
  console.log('Subscription activated:', data);

  // TODO: Update database
  // - Set subscription status to ACTIVE
  // - Schedule first recurring payment

  const subscriptionRecord = {
    subscriptionId: data.subscriptionId,
    status: 'ACTIVE',
    activatedAt: new Date().toISOString()
  };

  console.log('Subscription Activated:', subscriptionRecord);
  // Save to database
}

async function handleSubscriptionCancelled(data) {
  console.log('Subscription cancelled:', data);

  // TODO: Update database
  // - Set subscription status to CANCELLED
  // - Stop future payments

  const cancellationRecord = {
    subscriptionId: data.subscriptionId,
    status: 'CANCELLED',
    cancelledAt: new Date().toISOString()
  };

  console.log('Subscription Cancelled:', cancellationRecord);
  // Save to database
}

async function handleSubscriptionPaused(data) {
  console.log('Subscription paused:', data);

  // TODO: Update database
  // - Set subscription status to PAUSED

  const pauseRecord = {
    subscriptionId: data.subscriptionId,
    status: 'PAUSED',
    pausedAt: new Date().toISOString()
  };

  console.log('Subscription Paused:', pauseRecord);
  // Save to database
}
