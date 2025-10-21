import PhonePeHelper from '../../../lib/phonepe';
import axios from 'axios';

/**
 * API Route: Check Transaction/Subscription Status
 * GET /api/phonepe/check-status?transactionId=XXX
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const phonepe = new PhonePeHelper();
    const statusRequest = await phonepe.checkStatus(transactionId);

    if (!statusRequest.success) {
      return res.status(500).json({
        error: 'Failed to generate status request',
        details: statusRequest.error
      });
    }

    // Make API call to PhonePe
    const response = await axios.get(
      statusRequest.apiEndpoint,
      {
        headers: statusRequest.headers
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Status Check Error:', error);
    return res.status(500).json({
      error: 'Failed to check status',
      details: error.response?.data || error.message
    });
  }
}
