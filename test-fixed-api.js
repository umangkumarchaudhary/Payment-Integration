require('dotenv').config({ path: '.env.local' });
const PhonePeAutoPayFixed = require('./lib/phonepe-autopay-fixed');

async function testFixedAPI() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   PhonePe AutoPay API - FIXED VERSION TEST               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const phonepe = new PhonePeAutoPayFixed();

  // Test customer data
  const customerData = {
    customerId: `CUST${Date.now()}`,
    name: 'Test Customer',
    phone: '9999999999',
    upiId: 'success@ybl'
  };

  // Test subscription data
  const subscriptionData = {
    subscriptionId: `SUB${Date.now()}`,
    packageName: 'Test Service Package',
    totalAmount: 1000,
    installmentAmount: 100,
    totalInstallments: 10,
    startDate: '2025-10-22'
  };

  console.log('Test Data:');
  console.log('Customer:', customerData);
  console.log('Subscription:', subscriptionData);
  console.log('\n═══════════════════════════════════════════════════════════════════════════\n');

  // Test 1: Try /v3/recurring/auth/init
  console.log('TEST 1: Trying /v3/recurring/auth/init (Mandate Creation)...\n');
  const result1 = await phonepe.setupSubscription(customerData, subscriptionData);

  if (result1.success) {
    console.log('\n✅ SUCCESS - Approach 1 worked!');
    console.log('Response:', JSON.stringify(result1, null, 2));
  } else {
    console.log('\n❌ FAILED - Approach 1 did not work');
    console.log('Error:', result1.error);

    // Test 2: Try alternative endpoint
    console.log('\n\n═══════════════════════════════════════════════════════════════════════════\n');
    console.log('TEST 2: Trying /v3/recurring/debit/init (Alternative)...\n');

    const result2 = await phonepe.setupRecurringDebit(customerData, subscriptionData);

    if (result2.success) {
      console.log('\n✅ SUCCESS - Approach 2 worked!');
      console.log('Response:', JSON.stringify(result2, null, 2));
    } else {
      console.log('\n❌ FAILED - Approach 2 did not work');
      console.log('Error:', result2.error);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('DIAGNOSIS');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  console.log('The PR000 error typically means:');
  console.log('1. Wrong API endpoint');
  console.log('2. Missing required fields');
  console.log('3. Incorrect payload structure');
  console.log('4. Merchant ID not activated for AutoPay/Recurring');
  console.log('\nRECOMMENDATION:');
  console.log('Contact PhonePe support and ask:');
  console.log('- Which endpoint to use for AutoPay/Subscription?');
  console.log('- Is MASSRETAILUAT activated for recurring payments?');
  console.log('- What is the correct payload structure?');
  console.log('\n═══════════════════════════════════════════════════════════════════════════\n');
}

testFixedAPI().catch(console.error);
