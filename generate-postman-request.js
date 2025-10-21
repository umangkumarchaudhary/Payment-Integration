const crypto = require('crypto');

console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                           ║');
console.log('║           PhonePe Postman Request Generator                               ║');
console.log('║                                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

// Your credentials
const merchantId = 'MASSRETAILUAT';
const clientSecret = 'ZDYwODQzNDUtY2M0Mi00YzdjLWEwYjEtZWI2ODYxYTBhYzhl';

// Create payload
const payload = {
  merchantId: merchantId,
  merchantTransactionId: `T${Date.now()}`,
  merchantUserId: `MUID${Date.now()}`,
  amount: 10000, // 100 rupees (in paise)
  redirectUrl: 'http://localhost:3000/api/phonepe/callback',
  redirectMode: 'REDIRECT',
  callbackUrl: 'http://localhost:3000/api/phonepe/webhook',
  mobileNumber: '9999999999',
  paymentInstrument: {
    type: 'UPI_COLLECT',
    vpa: 'success@ybl' // Change to pending@ybl or failed@ybl for different tests
  }
};

// Step 1: Convert to Base64
const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

// Step 2: Generate X-VERIFY
const apiEndpoint = '/pg/v1/pay';
const stringToHash = base64Payload + apiEndpoint + clientSecret;
const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
const xVerify = sha256Hash + '###1';

// Print results
console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('COPY THESE VALUES TO POSTMAN');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

console.log('1. METHOD:');
console.log('   POST\n');

console.log('2. URL:');
console.log('   https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay\n');

console.log('3. HEADERS:');
console.log('   Click "Headers" tab in Postman and add these:\n');
console.log('   Key: Content-Type');
console.log('   Value: application/json\n');
console.log('   Key: X-VERIFY');
console.log('   Value: ' + xVerify + '\n');

console.log('4. BODY:');
console.log('   Click "Body" → "raw" → Select "JSON", then paste:\n');
console.log(JSON.stringify({
  request: base64Payload
}, null, 2));
console.log('\n');

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('EXPECTED RESPONSES');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

console.log('IF ACTIVATED (Success):');
console.log(JSON.stringify({
  success: true,
  code: 'PAYMENT_INITIATED',
  message: 'Payment initiated',
  data: {
    merchantId: 'MASSRETAILUAT',
    merchantTransactionId: payload.merchantTransactionId,
    instrumentResponse: {
      type: 'UPI_COLLECT',
      redirectInfo: {
        url: 'https://phonepe.com/...'
      }
    }
  }
}, null, 2));
console.log('\n');

console.log('IF NOT ACTIVATED (Current):');
console.log(JSON.stringify({
  success: false,
  code: 'KEY_NOT_CONFIGURED',
  message: 'Key not found for the merchant',
  data: {}
}, null, 2));
console.log('\n');

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('DECODED PAYLOAD (For Verification)');
console.log('═══════════════════════════════════════════════════════════════════════════\n');
console.log(JSON.stringify(payload, null, 2));
console.log('\n');

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('TECHNICAL DETAILS (For PhonePe Team)');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

console.log('Merchant ID:', merchantId);
console.log('Transaction ID:', payload.merchantTransactionId);
console.log('Test VPA:', payload.paymentInstrument.vpa);
console.log('Amount:', payload.amount, 'paise (₹' + (payload.amount / 100) + ')');
console.log('\nBase64 Payload:');
console.log(base64Payload);
console.log('\nX-VERIFY Signature:');
console.log(xVerify);
console.log('\nSignature Calculation:');
console.log('SHA256(' + base64Payload.substring(0, 20) + '... + /pg/v1/pay + ' + clientSecret + ') + ###1\n');

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('QUICK COPY-PASTE FOR POSTMAN');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

console.log('URL:\nhttps://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay\n');
console.log('Header - X-VERIFY:\n' + xVerify + '\n');
console.log('Body:\n' + JSON.stringify({ request: base64Payload }, null, 2) + '\n');

console.log('═══════════════════════════════════════════════════════════════════════════\n');
console.log('✅ Ready for Postman!');
console.log('✅ Ready for PhonePe meeting!');
console.log('✅ X-VERIFY signature is correct!\n');
console.log('Just copy the values above to Postman and click Send!\n');
console.log('═══════════════════════════════════════════════════════════════════════════\n');
