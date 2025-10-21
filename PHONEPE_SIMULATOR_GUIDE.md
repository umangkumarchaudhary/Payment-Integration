# PhonePe Simulator Testing Guide

## How to Test with PhonePe Simulator App

### Step 1: Install PhonePe Simulator App

**Download the PhonePe Simulator App:**
- Android: Download from PhonePe merchant dashboard or contact PhonePe support
- This is a special testing app, different from regular PhonePe app

### Step 2: Use Test VPAs

PhonePe provides these test VPAs for simulating different scenarios:

| Test VPA | Simulates | Use When |
|----------|-----------|----------|
| `success@ybl` | ✅ Successful payment | Testing happy path |
| `pending@ybl` | ⏳ Pending payment | Testing pending state |
| `failed@ybl` | ❌ Failed payment | Testing failure handling |

### Step 3: Test the Integration

#### Test Scenario 1: Successful Payment

1. **Open the form**: http://localhost:3000

2. **Fill in details:**
   ```
   Customer Name: Test Customer
   Phone: 9999999999
   UPI ID: success@ybl ← Select this!
   Package Name: 3-Year Service
   Total Amount: 1000
   Installments: 12
   Monthly: 83.33
   ```

3. **Click "Setup AutoPay"**

4. **Expected Result:**
   - API call succeeds
   - PhonePe returns success response
   - You see transaction details

#### Test Scenario 2: Pending Payment

1. Fill same details but select: **UPI ID: pending@ybl**
2. Submit
3. You should see pending status

#### Test Scenario 3: Failed Payment

1. Fill same details but select: **UPI ID: failed@ybl**
2. Submit
3. You should see failure response

### Step 4: Check Server Logs

In your terminal, you'll see:

```
Making request to PhonePe...
Endpoint: https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay
Payload: {
  merchantId: 'M22YCAWLBCE2J',
  merchantTransactionId: 'T1729536000000',
  amount: 100000,
  paymentInstrument: {
    type: 'UPI_COLLECT',
    vpa: 'success@ybl'
  }
}
PhonePe Response: { ... }
```

---

## Troubleshooting

### Issue: Still getting "KEY_NOT_CONFIGURED"

**Solution 1: Update API Endpoint**

Your `.env.local` should have:
```env
PHONEPE_API_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

**Solution 2: Check Merchant ID**

Make sure your merchant ID is activated for sandbox testing. Contact PhonePe support:
- Email: business@phonepe.com
- Subject: "Activate Sandbox for Merchant M22YCAWLBCE2J"

**Solution 3: Use Alternative UAT Credentials**

Try the MASSRETAILUAT credentials instead:

Update `.env.local`:
```env
PHONEPE_MERCHANT_ID=MASSRETAILUAT
PHONEPE_TEST_CLIENT_ID=MASSRETAILUAT_2510171534
PHONEPE_TEST_CLIENT_SECRET=ZDYwODQzNDUtY2M0Mi00YzdjLWEwYjEtZWI2ODYxYTBhYzhl
```

Restart the server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Understanding PhonePe Responses

### Success Response
```json
{
  "success": true,
  "code": "PAYMENT_SUCCESS",
  "message": "Payment completed successfully",
  "data": {
    "merchantTransactionId": "T1729536000000",
    "transactionId": "PP123456789",
    "amount": 100000,
    "state": "COMPLETED"
  }
}
```

### Pending Response
```json
{
  "success": true,
  "code": "PAYMENT_PENDING",
  "message": "Payment is pending",
  "data": {
    "merchantTransactionId": "T1729536000000",
    "state": "PENDING"
  }
}
```

### Failed Response
```json
{
  "success": false,
  "code": "PAYMENT_ERROR",
  "message": "Payment failed",
  "data": {
    "merchantTransactionId": "T1729536000000",
    "state": "FAILED"
  }
}
```

---

## Complete Test Flow

### 1. Start Server
```bash
npm run dev
```

### 2. Open Browser
http://localhost:3000

### 3. Open DevTools
Press F12 → Network tab

### 4. Fill Form
- Customer Name: Rajesh Kumar
- Phone: 9876543210
- **UPI ID: success@ybl** ← Important!
- Package: 3-Year Service
- Amount: 36000
- Installments: 36

### 5. Submit and Watch

**In Browser Console:**
- Check Network tab
- Look at request payload
- Look at response

**In Terminal:**
- Watch server logs
- See PhonePe response

### 6. Check Status

If you got a transaction ID, check its status:
```
http://localhost:3000/api/phonepe/check-status?transactionId=T1729536000000
```

---

## Alternative: Test Without Simulator

If you don't have access to PhonePe Simulator, you can still test the integration:

### Mock the Response

Create a test endpoint that simulates PhonePe response:

`pages/api/phonepe/mock-test.js`:
```javascript
export default function handler(req, res) {
  // Simulate successful PhonePe response
  const mockResponse = {
    success: true,
    code: 'PAYMENT_SUCCESS',
    message: 'Payment completed successfully (MOCKED)',
    data: {
      merchantTransactionId: `T${Date.now()}`,
      transactionId: `PP${Date.now()}`,
      amount: 100000,
      state: 'COMPLETED',
      paymentInstrument: {
        type: 'UPI',
        vpa: 'success@ybl'
      }
    }
  };

  return res.status(200).json(mockResponse);
}
```

---

## Common Errors and Solutions

### Error: "INVALID_MERCHANT"
**Cause**: Merchant ID not recognized
**Solution**: Contact PhonePe to activate your merchant account for sandbox

### Error: "KEY_NOT_CONFIGURED"
**Cause**: Client Secret not configured on PhonePe's end
**Solution**: Contact PhonePe support to configure your keys

### Error: "INVALID_SIGNATURE"
**Cause**: X-VERIFY signature mismatch
**Solution**: Check that your client secret matches PhonePe's records

### Error: "INVALID_VPA"
**Cause**: VPA format incorrect
**Solution**: Use exact test VPAs: success@ybl, pending@ybl, failed@ybl

### Error: Connection Timeout
**Cause**: PhonePe sandbox might be down
**Solution**: Check PhonePe status or try again later

---

## Contact PhonePe Support

If test VPAs still don't work:

**Email Template:**
```
To: business@phonepe.com
CC: support@phonepe.com
Subject: Activate Sandbox Testing - Merchant M22YCAWLBCE2J

Dear PhonePe Support,

I am testing the PhonePe payment gateway integration using sandbox environment.

Merchant Details:
- Merchant ID: M22YCAWLBCE2J
- Client ID: TEST-M22YCAWLBCE2J_25051
- Environment: Sandbox/Preprod

Issue:
I am unable to test using the test VPAs (success@ybl, pending@ybl, failed@ybl).
Getting error: "KEY_NOT_CONFIGURED"

Request:
Please activate sandbox testing for this merchant account and configure
the required keys so I can test with PhonePe Simulator app.

Integration Details:
- Using /pg/v1/pay endpoint
- Request format: UPI_COLLECT
- Test VPAs: success@ybl, pending@ybl, failed@ybl

Next Steps Needed:
1. Activate merchant for sandbox
2. Configure client secret
3. Confirm test VPAs are working
4. Provide PhonePe Simulator app download link

Thank you,
[Your Name]
[Contact Number]
[Company Name]
```

---

## Expected Timeline

| Step | Duration | Action |
|------|----------|--------|
| Contact PhonePe | Day 1 | Send email |
| PhonePe Response | 1-2 days | Wait for response |
| Account Activation | 3-5 days | PhonePe activates sandbox |
| Testing | 1 day | Test with simulator |
| Production Setup | 1 week | Deploy to production |

---

## Success Checklist

- [ ] PhonePe Simulator app installed
- [ ] Test VPA selected (success@ybl)
- [ ] Form submitted successfully
- [ ] PhonePe API responds (not KEY_NOT_CONFIGURED)
- [ ] Transaction ID received
- [ ] Status check works
- [ ] Tested all 3 scenarios (success, pending, failed)

Once all checked, you're ready for production! 🎉

---

## Quick Test Command

For quick API testing without UI:

```bash
curl -X POST http://localhost:3000/api/phonepe/initiate-autopay \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "phone": "9999999999",
    "upiId": "success@ybl",
    "totalAmount": 1000,
    "installmentAmount": 100,
    "totalInstallments": 10
  }'
```

---

**Remember**: The test VPAs (success@ybl, etc.) only work after PhonePe activates your sandbox account!
