// Quick test to check what's the error
const PhonePeHelper = require('./lib/phonepe');

console.log('Testing PhonePe Helper...\n');

try {
  const phonepe = new PhonePeHelper();
  console.log('✓ PhonePeHelper instantiated');
  console.log('Merchant ID:', phonepe.merchantId);
  console.log('Client ID:', phonepe.clientId);
  console.log('Base URL:', phonepe.baseUrl);

  // Test creating a payment request
  phonepe.createSimplePayment(
    {
      customerId: 'TEST123',
      name: 'Test',
      phone: '9999999999',
      upiId: 'success@ybl'
    },
    1000
  ).then(result => {
    console.log('\n✓ Payment request created:');
    console.log('Transaction ID:', result.transactionId);
    console.log('Success:', result.success);
    if (result.rawPayload) {
      console.log('Payload:', JSON.stringify(result.rawPayload, null, 2));
    }
  }).catch(err => {
    console.error('\n✗ Error creating payment:', err.message);
  });

} catch (error) {
  console.error('✗ Error:', error.message);
  console.error(error.stack);
}
