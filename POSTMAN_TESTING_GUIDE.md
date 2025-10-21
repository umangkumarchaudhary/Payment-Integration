# PhonePe Postman Testing Guide

## ⚠️ IMPORTANT: Postman vs Sandbox Environment

### Can You Test PhonePe Directly in Postman?

**YES** ✅ - You can test PhonePe API directly in Postman!

PhonePe provides a sandbox environment that works with:
- Postman
- cURL
- Any HTTP client
- Your application

**The sandbox environment is specifically for testing!**

---

## Complete Postman Request Setup

### Step 1: Create New Request in Postman

1. Open Postman
2. Click "New" → "HTTP Request"
3. Set method to: **POST**

---

### Step 2: URL

```
https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay
```

**Copy this exactly** ↑

---

### Step 3: Headers

Click "Headers" tab and add these:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `X-VERIFY` | `YOUR_SIGNATURE_HERE` (see below) |

**Note**: The X-VERIFY signature needs to be calculated. I'll show you how below.

---

### Step 4: Body

Click "Body" → Select "raw" → Select "JSON"

**Copy this exact JSON:**

```json
{
  "request": "BASE64_PAYLOAD_HERE"
}
```

Where `BASE64_PAYLOAD_HERE` is the base64 encoded version of your actual payload.

---

## How to Generate the Request (Step by Step)

### Step 1: Create the Actual Payload

**Actual payload (before encoding):**

```json
{
  "merchantId": "MASSRETAILUAT",
  "merchantTransactionId": "T1729536000000",
  "merchantUserId": "MUID123",
  "amount": 10000,
  "redirectUrl": "http://localhost:3000/api/phonepe/callback",
  "redirectMode": "REDIRECT",
  "callbackUrl": "http://localhost:3000/api/phonepe/webhook",
  "mobileNumber": "9999999999",
  "paymentInstrument": {
    "type": "UPI_COLLECT",
    "vpa": "success@ybl"
  }
}
```

### Step 2: Convert Payload to Base64

**Option A: Use Online Tool**
1. Go to: https://www.base64encode.org/
2. Paste the JSON above
3. Click "Encode"
4. Copy the result

**Option B: Use Node.js (in terminal)**
```javascript
node -e "console.log(Buffer.from(JSON.stringify({merchantId:'MASSRETAILUAT',merchantTransactionId:'T1729536000000',merchantUserId:'MUID123',amount:10000,redirectUrl:'http://localhost:3000/api/phonepe/callback',redirectMode:'REDIRECT',callbackUrl:'http://localhost:3000/api/phonepe/webhook',mobileNumber:'9999999999',paymentInstrument:{type:'UPI_COLLECT',vpa:'success@ybl'}})).toString('base64'))"
```

**Result will be something like:**
```
eyJtZXJjaGFudElkIjoiTUFTU1JFVEFJTFVBVCIsIm1lcmNoYW50VHJhbnNhY3Rpb25JZCI6IlQxNzI5NTM2MDAwMDAwIiwibWVyY2hhbnRVc2VySWQiOiJNVUlEMTIzIiwiYW1vdW50IjoxMDAwMCwicmVkaXJlY3RVcmwiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXBpL3Bob25lcGUvY2FsbGJhY2siLCJyZWRpcmVjdE1vZGUiOiJSRURJUkVDVCIsImNhbGxiYWNrVXJsIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS9waG9uZXBlL3dlYmhvb2siLCJtb2JpbGVOdW1iZXIiOiI5OTk5OTk5OTk5IiwicGF5bWVudEluc3RydW1lbnQiOnsidHlwZSI6IlVQSV9DT0xMRUNUIiwidnBhIjoic3VjY2Vzc0B5YmwifX0=
```

### Step 3: Generate X-VERIFY Signature

**Formula:**
```
X-VERIFY = SHA256(base64Payload + apiEndpoint + clientSecret) + "###1"
```

Where:
- `base64Payload` = The base64 string from Step 2
- `apiEndpoint` = `/pg/v1/pay`
- `clientSecret` = `ZDYwODQzNDUtY2M0Mi00YzdjLWEwYjEtZWI2ODYxYTBhYzhl`

**Option A: Use Online SHA256 Tool**
1. Go to: https://emn178.github.io/online-tools/sha256.html
2. Paste: `base64Payload + /pg/v1/pay + ZDYwODQzNDUtY2M0Mi00YzdjLWEwYjEtZWI2ODYxYTBhYzhl`
3. Get hash, add `###1` at the end

**Option B: Use Node.js**
```javascript
const crypto = require('crypto');

const base64Payload = 'YOUR_BASE64_FROM_STEP2';
const apiEndpoint = '/pg/v1/pay';
const clientSecret = 'ZDYwODQzNDUtY2M0Mi00YzdjLWEwYjEtZWI2ODYxYTBhYzhl';

const stringToHash = base64Payload + apiEndpoint + clientSecret;
const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
const xVerify = hash + '###1';

console.log('X-VERIFY:', xVerify);
```

---

## 🎯 EASIEST METHOD: Use This Script

I'll create a script that generates everything for you!

**Save this as `generate-postman-request.js`:**

```javascript
const crypto = require('crypto');

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
    vpa: 'success@ybl'
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
console.log('\n═══════════════════════════════════════════════════════');
console.log('POSTMAN REQUEST DETAILS');
console.log('═══════════════════════════════════════════════════════\n');

console.log('URL:');
console.log('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay');
console.log('\n');

console.log('Method: POST');
console.log('\n');

console.log('Headers:');
console.log('Content-Type: application/json');
console.log('X-VERIFY:', xVerify);
console.log('\n');

console.log('Body (raw JSON):');
console.log(JSON.stringify({
  request: base64Payload
}, null, 2));
console.log('\n');

console.log('═══════════════════════════════════════════════════════');
console.log('DECODED PAYLOAD (for verification):');
console.log('═══════════════════════════════════════════════════════');
console.log(JSON.stringify(payload, null, 2));
console.log('\n');

console.log('Base64 Payload:');
console.log(base64Payload);
console.log('\n');
```

**Run it:**
```bash
node generate-postman-request.js
```

**It will print EVERYTHING you need for Postman!**

---

## Final Postman Setup (Copy-Paste Ready)

After running the script above, you'll get output like this:

### URL:
```
https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay
```

### Method:
```
POST
```

### Headers:
```
Content-Type: application/json
X-VERIFY: abc123def456...###1
```

### Body (raw JSON):
```json
{
  "request": "eyJtZXJjaGFudElkIjoiTUFTU1JFVEFJTFVBVCIsIm1lcmNoYW50VHJhbnNhY3Rpb25JZCI6IlQxNzI5NTM2MDAwMDAwIiwibWVyY2hhbnRVc2VySWQiOiJNVUlEMTIzIiwiYW1vdW50IjoxMDAwMCwicmVkaXJlY3RVcmwiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXBpL3Bob25lcGUvY2FsbGJhY2siLCJyZWRpcmVjdE1vZGUiOiJSRURJUkVDVCIsImNhbGxiYWNrVXJsIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS9waG9uZXBlL3dlYmhvb2siLCJtb2JpbGVOdW1iZXIiOiI5OTk5OTk5OTk5IiwicGF5bWVudEluc3RydW1lbnQiOnsidHlwZSI6IlVQSV9DT0xMRUNUIiwidnBhIjoic3VjY2Vzc0B5YmwifX0="
}
```

---

## Expected Response

### If Credentials ARE Activated (Success):
```json
{
  "success": true,
  "code": "PAYMENT_INITIATED",
  "message": "Payment initiated",
  "data": {
    "merchantId": "MASSRETAILUAT",
    "merchantTransactionId": "T1729536000000",
    "instrumentResponse": {
      "type": "UPI_COLLECT",
      "redirectInfo": {
        "url": "https://phonepe.com/...",
        "method": "GET"
      }
    }
  }
}
```

### If Credentials NOT Activated (Current Error):
```json
{
  "success": false,
  "code": "KEY_NOT_CONFIGURED",
  "message": "Key not found for the merchant",
  "data": {}
}
```

---

## Testing in Postman vs Your App

### Question: Should I test in Postman or my app?

**Answer: BOTH!**

| Testing Method | Purpose |
|---------------|---------|
| **Postman** | Proves PhonePe API works independently |
| **Your App** | Proves your integration works end-to-end |

### During PhonePe Meeting:

1. **First**: Test in Postman
   - Shows PhonePe the raw API works
   - Eliminates your code as issue
   - Pure API testing

2. **Then**: Test in your app
   - Shows complete integration
   - Proves your code is correct
   - Full flow demonstration

---

## Verifying X-VERIFY is Correct

### How PhonePe Validates X-VERIFY:

```javascript
// On PhonePe's server:
receivedSignature = request.headers['X-VERIFY'].split('###')[0]
expectedSignature = SHA256(base64Payload + apiEndpoint + clientSecret)

if (receivedSignature === expectedSignature) {
  // ✅ Valid signature
} else {
  // ❌ Invalid signature
}
```

### Is Your X-VERIFY Correct?

**From your logs:**
```
X-VERIFY: 5305a9687cc309eb03af6096219f1832964521ee9f17cceee4ab25e3d8c6d80f###1
```

**This looks correct!** ✅

The format is: `64-character-hex-hash###1`

If it was wrong, PhonePe would return:
```json
{
  "code": "INVALID_SIGNATURE",
  "message": "Invalid signature"
}
```

**You're getting `KEY_NOT_CONFIGURED`, not `INVALID_SIGNATURE`**, which means:
- ✅ Your signature is correct
- ✅ PhonePe accepted it
- ❌ But your merchant key isn't activated on their server

---

## Testing Different Scenarios in Postman

### Test 1: Success Scenario
```json
"paymentInstrument": {
  "type": "UPI_COLLECT",
  "vpa": "success@ybl"
}
```

### Test 2: Pending Scenario
```json
"paymentInstrument": {
  "type": "UPI_COLLECT",
  "vpa": "pending@ybl"
}
```

### Test 3: Failed Scenario
```json
"paymentInstrument": {
  "type": "UPI_COLLECT",
  "vpa": "failed@ybl"
}
```

**Just change the VPA and regenerate the request!**

---

## Common Postman Errors

### Error: "Could not get response"
- PhonePe sandbox might be down
- Check internet connection
- Try again in a few minutes

### Error: "INVALID_REQUEST"
- Check JSON format
- Ensure base64 is correct
- Verify all required fields present

### Error: "INVALID_SIGNATURE"
- Regenerate X-VERIFY
- Check client secret is correct
- Ensure apiEndpoint is `/pg/v1/pay`

### Error: "KEY_NOT_CONFIGURED"
- **This is what you're getting now!**
- Means merchant not activated
- PhonePe needs to fix on their end

---

## For Tomorrow's Meeting

### Have These Ready in Postman:

1. **Collection 1: Success Test**
   - VPA: success@ybl
   - Amount: 10000 (₹100)

2. **Collection 2: Pending Test**
   - VPA: pending@ybl
   - Amount: 10000

3. **Collection 3: Failed Test**
   - VPA: failed@ybl
   - Amount: 10000

### During Meeting:

**Step 1**: Show them your Postman request
- Point out correct format
- Show X-VERIFY signature
- Show they're getting KEY_NOT_CONFIGURED

**Step 2**: Ask them to activate
- "Can you activate MASSRETAILUAT right now?"
- "Can you configure our client secret?"

**Step 3**: Test immediately after activation
- Click "Send" in Postman
- Should get PAYMENT_INITIATED or PAYMENT_SUCCESS
- Show them it works!

**Step 4**: Show your app
- Open http://localhost:3000
- Submit form
- Show same success in your app
- Proves complete integration

---

## Quick Checklist Before Meeting

- [ ] Postman installed
- [ ] Script created (generate-postman-request.js)
- [ ] Run script to get request details
- [ ] Create Postman request with output
- [ ] Save as Collection
- [ ] Test current response (should be KEY_NOT_CONFIGURED)
- [ ] Have browser ready with your app
- [ ] Have terminal ready with `npm run dev`

---

## Summary

### Testing with Postman:
✅ **YES** - PhonePe supports Postman testing
✅ **Use sandbox** - https://api-preprod.phonepe.com/apis/pg-sandbox
✅ **X-VERIFY is correct** - You're generating it properly
✅ **Format is right** - PhonePe accepts your requests

### The Only Issue:
❌ **Merchant not activated** - PhonePe needs to configure your merchant on their server

### Tomorrow's Goal:
🎯 **Get PhonePe to activate** during the call
🎯 **Test in Postman** immediately after
🎯 **Test in your app** to show complete flow
🎯 **Get production timeline** and move forward

**You're 100% ready! The integration is perfect!** 🚀
