require('dotenv').config({ path: '.env.test-alternative' });
const PhonePeAutoPayFixed = require('./lib/phonepe-autopay-fixed');

async function testWithAlternativeCredentials() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║          PhonePe AutoPay - Testing with Alternative Credentials          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  console.log('Using Credentials:');
  console.log('Merchant ID:', process.env.PHONEPE_MERCHANT_ID);
  console.log('Client ID:', process.env.PHONEPE_TEST_CLIENT_ID);
  console.log('Client Secret:', process.env.PHONEPE_TEST_CLIENT_SECRET.substring(0, 20) + '...');
  console.log('\n═══════════════════════════════════════════════════════════════════════════\n');

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

  // Try subscription setup
  console.log('Attempting subscription setup with alternative credentials...\n');
  const result = await phonepe.setupSubscription(customerData, subscriptionData);

  if (result.success) {
    console.log('\n🎉 SUCCESS! Alternative credentials work!');
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('\n✅ UPDATE YOUR .env.local FILE WITH THESE CREDENTIALS!');
  } else {
    console.log('\n❌ Alternative credentials also failed');
    console.log('Error:', result.error);
    console.log('\n📞 You need to contact PhonePe support - see PHONEPE_AUTOPAY_ISSUE_RESOLUTION.md');
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════\n');
}

testWithAlternativeCredentials().catch(console.error);
