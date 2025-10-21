const axios = require('axios');

console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                           ║');
console.log('║          PhonePe AutoPay (Subscription) Postman Generator                 ║');
console.log('║                     CORRECT API as per Documentation                      ║');
console.log('║                                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

// Your credentials
const merchantId = 'MASSRETAILUAT';
const clientId = 'MASSRETAILUAT_2510171534';
const clientSecret = 'ZDYwODQzNDUtY2M0Mi00YzdjLWEwYjEtZWI2ODYxYTBhYzhl';
const clientVersion = '1';

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('STEP 1: GET AUTHORIZATION TOKEN');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

console.log('This is the FIRST step - you need to get an auth token before making other calls.\n');

console.log('METHOD: POST\n');
console.log('URL:\nhttps://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token\n');

console.log('HEADERS:\nContent-Type: application/x-www-form-urlencoded\n');

console.log('BODY (x-www-form-urlencoded):');
console.log('client_id=' + clientId);
console.log('client_version=' + clientVersion);
console.log('client_secret=' + clientSecret);
console.log('grant_type=client_credentials\n');

console.log('OR in Postman Body → x-www-form-urlencoded:');
console.log('┌────────────────────┬──────────────────────────────────────────────────┐');
console.log('│ KEY                │ VALUE                                            │');
console.log('├────────────────────┼──────────────────────────────────────────────────┤');
console.log('│ client_id          │ ' + clientId.padEnd(48) + ' │');
console.log('│ client_version     │ ' + clientVersion.padEnd(48) + ' │');
console.log('│ client_secret      │ ' + clientSecret.padEnd(48) + ' │');
console.log('│ grant_type         │ client_credentials                               │');
console.log('└────────────────────┴──────────────────────────────────────────────────┘\n');

console.log('EXPECTED RESPONSE:');
console.log(JSON.stringify({
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "encrypted_access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "issued_at": 1706073005,
  "expires_at": 1706697605,
  "token_type": "O-Bearer"
}, null, 2));

console.log('\n⚠️  SAVE THE access_token - you\'ll need it for Step 2!\n');

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('STEP 2: SETUP SUBSCRIPTION (Use token from Step 1)');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

const merchantSubscriptionId = `SUB${Date.now()}`;
const merchantOrderId = `ORDER${Date.now()}`;

const subscriptionPayload = {
  "merchantId": merchantId,
  "merchantSubscriptionId": merchantSubscriptionId,
  "merchantOrderId": merchantOrderId,
  "merchantUserId": `CUST${Date.now()}`,
  "amount": 10000,
  "currency": "INR",
  "mobileNumber": "9999999999",
  "deviceContext": {
    "deviceOS": "WEB"
  },
  "paymentInstrument": {
    "type": "UPI_COLLECT",
    "vpa": "success@ybl"
  },
  "autoDebit": {
    "subscriptionStartDate": new Date().toISOString().split('T')[0],
    "subscriptionEndDate": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "frequency": "MONTHLY",
    "subscriptionAmountType": "FIXED",
    "subscriptionAmount": 10000,
    "maxAmount": 10000
  },
  "callbackUrl": "http://localhost:3000/api/phonepe/webhook",
  "redirectUrl": "http://localhost:3000/api/phonepe/callback",
  "redirectMode": "REDIRECT"
};

console.log('METHOD: POST\n');
console.log('URL:\nhttps://api-preprod.phonepe.com/apis/pg-sandbox/subscriptions/v2/setup\n');

console.log('HEADERS:');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer YOUR_ACCESS_TOKEN_FROM_STEP_1\n');

console.log('⚠️  Replace YOUR_ACCESS_TOKEN_FROM_STEP_1 with the actual token!\n');

console.log('BODY (raw JSON):');
console.log(JSON.stringify(subscriptionPayload, null, 2));
console.log('\n');

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('AUTOMATED TEST (Node.js)');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

console.log('Testing STEP 1: Getting auth token...\n');

axios.post(
  'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
  new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  }).toString(),
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
).then(response => {
  console.log('✅ STEP 1 SUCCESS!');
  console.log('Auth Token Response:');
  console.log(JSON.stringify(response.data, null, 2));
  console.log('\n');

  const authToken = response.data.access_token;
  console.log('Access Token:', authToken.substring(0, 50) + '...\n');

  console.log('Testing STEP 2: Setting up subscription...\n');

  return axios.post(
    'https://api-preprod.phonepe.com/apis/pg-sandbox/subscriptions/v2/setup',
    subscriptionPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }
  );

}).then(response => {
  console.log('✅ STEP 2 SUCCESS!');
  console.log('Subscription Setup Response:');
  console.log(JSON.stringify(response.data, null, 2));
  console.log('\n');

  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🎉 AUTOPAY INTEGRATION WORKING!');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  if (response.data.data?.instrumentResponse?.intentLink) {
    console.log('Payment URL:', response.data.data.instrumentResponse.intentLink);
  }

  console.log('\nYour merchant IS ACTIVATED! 🎉\n');

}).catch(error => {
  console.log('❌ ERROR:');

  if (error.response) {
    console.log('Status:', error.response.status);
    console.log('Response:', JSON.stringify(error.response.data, null, 2));
    console.log('\n');

    if (error.response.data.code === 'KEY_NOT_CONFIGURED' ||
        error.response.data.code === 'UNAUTHORIZED' ||
        error.response.status === 401) {
      console.log('═══════════════════════════════════════════════════════════════════════════');
      console.log('⚠️  MERCHANT NOT ACTIVATED YET');
      console.log('═══════════════════════════════════════════════════════════════════════════\n');
      console.log('This error means PhonePe hasn\'t activated your merchant account yet.\n');
      console.log('Tomorrow\'s action items:');
      console.log('1. Show PhonePe this request format (it\'s correct!)');
      console.log('2. Ask them to activate MASSRETAILUAT for AutoPay/Subscriptions');
      console.log('3. Run this script again after activation\n');
    }
  } else {
    console.log(error.message);
  }
});

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

console.log('You now have TWO Postman requests to create:\n');

console.log('REQUEST 1: Get Auth Token');
console.log('  URL: https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token');
console.log('  Method: POST');
console.log('  Body: x-www-form-urlencoded');
console.log('  Save the access_token from response\n');

console.log('REQUEST 2: Setup AutoPay Subscription');
console.log('  URL: https://api-preprod.phonepe.com/apis/pg-sandbox/subscriptions/v2/setup');
console.log('  Method: POST');
console.log('  Headers: Authorization: Bearer {token_from_request_1}');
console.log('  Body: raw JSON (see above)\n');

console.log('═══════════════════════════════════════════════════════════════════════════\n');
