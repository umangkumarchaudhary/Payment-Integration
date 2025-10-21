import PhonePeHelper from '../../../lib/phonepe';

/**
 * API Route: PhonePe Payment Callback
 * POST /api/phonepe/callback
 *
 * This endpoint is called by PhonePe after customer completes authorization
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Missing response data' });
    }

    // Decode the base64 response
    const decodedResponse = JSON.parse(
      Buffer.from(response, 'base64').toString('utf-8')
    );

    console.log('PhonePe Callback Response:', decodedResponse);

    // Extract transaction details
    const {
      code,
      message,
      data
    } = decodedResponse;

    // Check if payment was successful
    if (code === 'PAYMENT_SUCCESS' || code === 'SUCCESS') {
      // Update your database with successful subscription
      // Save subscription ID, transaction ID, etc.

      const subscriptionInfo = {
        status: 'ACTIVE',
        merchantTransactionId: data?.merchantTransactionId,
        transactionId: data?.transactionId,
        subscriptionId: data?.subscriptionId,
        amount: data?.amount,
        state: data?.state,
        responseCode: code,
        message: message
      };

      // TODO: Save to database
      console.log('Subscription Activated:', subscriptionInfo);

      // Redirect to success page
      return res.redirect(302, `/success?subscriptionId=${data?.subscriptionId}`);

    } else if (code === 'PAYMENT_ERROR' || code === 'PAYMENT_DECLINED') {
      // Handle failed payment
      console.error('Payment Failed:', message);

      // Redirect to failure page
      return res.redirect(302, `/failure?reason=${encodeURIComponent(message)}`);

    } else {
      // Handle pending or other states
      console.log('Payment Pending or Other State:', code, message);

      return res.redirect(302, `/pending?status=${code}`);
    }

  } catch (error) {
    console.error('Callback Error:', error);
    return res.status(500).json({
      error: 'Failed to process callback',
      details: error.message
    });
  }
}
