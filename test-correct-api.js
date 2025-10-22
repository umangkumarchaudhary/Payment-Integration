require('dotenv').config({ path: '.env.local' });
const PhonePeAutoPayCorrect = require('./lib/phonepe-autopay-correct');

async function testCorrectAPI() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║          PhonePe AutoPay - CORRECT API STRUCTURE (From Postman)         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const phonepe = new PhonePeAutoPayCorrect();

  // Test customer data
  const customerData = {
    customerId: `CUST${Date.now()}`,
    name: 'Test Customer',
    phone: '9999999999',
    upiId: 'success@ybl'
  };

  // Test subscription data
  const subscriptionData = {
    subscriptionId: `MS${Date.now()}`,
    packageName: '3-Year Service Package',
    totalAmount: 1000,
    installmentAmount: 100,
    totalInstallments: 10,
    startDate: '2025-10-22'
  };

  console.log('Test Data:');
  console.log('Customer:', customerData);
  console.log('Subscription:', subscriptionData);
  console.log('\n═══════════════════════════════════════════════════════════════════════════\n');

  // Optional: Validate UPI VPA first
  console.log('Step 1: Validating UPI VPA...');
  const validationResult = await phonepe.validateUpiVpa(customerData.upiId);
  console.log('Validation Result:', validationResult);
  console.log('\n═══════════════════════════════════════════════════════════════════════════\n');

  // Setup subscription
  console.log('Step 2: Setting up subscription with CORRECT payload structure...\n');
  const result = await phonepe.setupSubscription(customerData, subscriptionData);

  if (result.success) {
    console.log('\n🎉🎉🎉 SUCCESS! The correct API structure works! 🎉🎉🎉');
    console.log('\nResponse Details:');
    console.log('Order ID:', result.orderId);
    console.log('State:', result.state);
    console.log('Merchant Order ID:', result.merchantOrderId);
    console.log('Merchant Subscription ID:', result.merchantSubscriptionId);

    if (result.intentUrl) {
      console.log('Intent URL:', result.intentUrl);
    }

    console.log('\nFull Response:', JSON.stringify(result.data, null, 2));

    // Try to get order status
    console.log('\n═══════════════════════════════════════════════════════════════════════════\n');
    console.log('Step 3: Checking order status...\n');
    const statusResult = await phonepe.getOrderStatus(result.orderId);
    if (statusResult.success) {
      console.log('Order Status:', JSON.stringify(statusResult.data, null, 2));
    }

  } else {
    console.log('\n❌ Still failed. Error:', result.error);
    console.log('\nIf still getting PR000, possible issues:');
    console.log('1. Merchant account still not activated for AutoPay');
    console.log('2. Need to use production URL instead of sandbox');
    console.log('3. Different credentials needed');
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════\n');
}

testCorrectAPI().catch(console.error);
