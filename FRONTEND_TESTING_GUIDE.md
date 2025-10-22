# Frontend Testing Guide - PhonePe AutoPay Integration

## 🚀 Quick Start

### Step 1: Start the Development Server

```bash
cd "C:\Users\RaamGroup Digital\Downloads\Payment Integration"
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 2: Open Browser

Navigate to: **http://localhost:3000**

---

## 📝 Test Case 1: Successful AutoPay Setup

### Fill the Form:

```
Customer Details:
├─ Customer Name: John Doe
├─ Phone Number: 9999999999
└─ UPI ID: success@ybl

Package Details:
├─ Package Name: 3-Year Premium Service Package
├─ Total Amount: 36000
├─ Number of Installments: 36
├─ Start Date: 2025-11-01
└─ Monthly Installment: 1000.00 (auto-calculated)
```

### Click "Setup AutoPay"

### Expected Response:

```
✅ Success! AutoPay subscription setup initiated.

Order ID: OMO2510221444328696300240
Subscription ID: MS_1761121036037
Status: PENDING

📱 Next Step: Customer will receive authorization request in their UPI app
```

### What This Means:
- ✅ Subscription was created successfully
- ✅ PhonePe accepted the request
- ⏳ Customer needs to authorize in their UPI app
- 📱 In production, they'd get a UPI notification

---

## 📝 Test Case 2: Invalid Phone Number

### Fill the Form:

```
Customer Name: Jane Smith
Phone Number: 12345 (only 5 digits)
UPI ID: test@paytm
```

### Click "Setup AutoPay"

### Expected Response:

```
❌ Error: Invalid phone number. Must be 10 digits.
```

---

## 📝 Test Case 3: Invalid UPI ID

### Fill the Form:

```
Customer Name: Test User
Phone Number: 8888888888
UPI ID: invalid@ybl (this VPA doesn't exist in test)
```

### Click "Setup AutoPay"

### Expected Response:

```
❌ Error: Invalid UPI ID
The provided UPI ID is not valid. Please check and try again.
```

---

## 📝 Test Case 4: Missing Required Fields

### Fill the Form:

Leave "Customer Name" empty and try to submit.

### Expected Response:

Browser validation will prevent submission (HTML5 `required` attribute)

---

## 🎯 What Happens Behind the Scenes

### When You Click "Setup AutoPay":

```
1. Frontend validates form fields
   ↓
2. Sends POST request to /api/phonepe/initiate-autopay-v3
   ↓
3. Backend gets OAuth token from PhonePe
   ↓
4. Backend validates UPI VPA (if provided)
   ↓
5. Backend creates subscription with CORRECT payload structure:
   {
     "merchantOrderId": "MO...",
     "amount": 100000, (in paise)
     "paymentFlow": {
       "type": "SUBSCRIPTION_SETUP",
       "merchantSubscriptionId": "MS_...",
       "authWorkflowType": "TRANSACTION",
       "amountType": "FIXED",
       "maxAmount": 100000,
       "frequency": "MONTHLY",
       "paymentMode": {
         "type": "UPI_COLLECT",
         "details": {
           "type": "VPA",
           "vpa": "success@ybl"
         }
       }
     },
     "deviceContext": { "deviceOS": "ANDROID" }
   }
   ↓
6. PhonePe processes and returns:
   {
     "orderId": "OMO...",
     "state": "PENDING"
   }
   ↓
7. Backend returns success to frontend
   ↓
8. Frontend displays success message with order details
```

---

## 🔍 Check the Console

### Browser Console (F12):

You should see fetch request:
```javascript
POST http://localhost:3000/api/phonepe/initiate-autopay-v3
Status: 200 OK
```

### Server Console (Terminal):

You should see detailed logs:
```
═══════════════════════════════════════════════════════════
PhonePe AutoPay Subscription Request (v3 - CORRECT)
═══════════════════════════════════════════════════════════
Customer: John Doe | 9999999999
Package: 3-Year Premium Service Package
Amount: 1000 x 36 = 36000
VPA: success@ybl
═══════════════════════════════════════════════════════════

Validating UPI VPA...
✅ Auth token generated successfully
✅ UPI VPA Validation: { valid: true, name: 'Dummy User' }

═══════════════════════════════════════════════════════════
PhonePe AutoPay Subscription Setup (CORRECT STRUCTURE)
═══════════════════════════════════════════════════════════
Customer: John Doe | 9999999999
Package: 3-Year Premium Service Package
Amount: 1000 x 36 = 36000
VPA: success@ybl

Payload: { ... }
═══════════════════════════════════════════════════════════

✅ Subscription Setup Successful!
Response: {
  "orderId": "OMO2510221444328696300240",
  "state": "PENDING"
}

✅ Subscription created successfully
Order ID: OMO2510221444328696300240
State: PENDING
```

---

## 🎨 UI Features to Test

### 1. Auto-Calculation
- Change "Total Amount" to 50000
- Change "Number of Installments" to 50
- ✅ Should auto-calculate: Monthly Installment = 1000.00

### 2. Payment Summary
After filling all fields, scroll down to see:
```
Payment Summary
├─ Total Package Amount: ₹50,000.00
├─ Monthly Installment: ₹1,000.00
└─ Number of Months: 50
```

### 3. Loading State
When you click "Setup AutoPay":
- Button text changes to "Processing..."
- Button becomes disabled (gray)
- Can't submit again until response received

### 4. Error Display
If error occurs:
- Red box appears above submit button
- Shows clear error message
- Form remains filled (doesn't reset)

### 5. Success Display
If successful:
- Green box appears above submit button
- Shows Order ID, Subscription ID, Status
- Shows next steps for customer

---

## 🧪 Advanced Testing

### Test Different Amounts

```javascript
// Small subscription
Total Amount: 1200
Installments: 12
Monthly: 100

// Medium subscription
Total Amount: 36000
Installments: 36
Monthly: 1000

// Large subscription
Total Amount: 180000
Installments: 60
Monthly: 3000
```

### Test Different Frequencies

Currently set to "MONTHLY", but API supports:
- DAILY
- WEEKLY
- MONTHLY (default)
- QUARTERLY
- HALFYEARLY
- YEARLY
- FORTNIGHTLY
- BIMONTHLY
- ON_DEMAND

### Test Different VPAs

```
success@ybl - ✅ Valid (test account)
invalid@ybl - ❌ Invalid
test@paytm - ⚠️ Depends on test environment
```

---

## 📊 Success Criteria

### ✅ Frontend is Working If:
1. Form loads without errors
2. Auto-calculation works when changing amount/installments
3. Validation prevents invalid submissions
4. Submit button shows loading state
5. Success message displays after API call
6. Error messages are clear and helpful

### ✅ Backend is Working If:
1. Server console shows detailed logs
2. OAuth token is generated successfully
3. UPI VPA validation works
4. Subscription setup returns order ID
5. Response has `state: "PENDING"`
6. No error messages in server console

### ✅ Integration is Complete If:
1. All above items work
2. End-to-end flow completes successfully
3. Response data is displayed correctly in UI
4. Ready for real customer testing

---

## 🐛 Troubleshooting

### Issue 1: Form Doesn't Submit
**Solution**: Check browser console for JavaScript errors

### Issue 2: Gets "Network Error"
**Solution**:
- Ensure dev server is running (`npm run dev`)
- Check if port 3000 is available

### Issue 3: Gets "PR000" or "Bad Request"
**Solution**:
- This shouldn't happen with v3 endpoint
- Check that you're using `/api/phonepe/initiate-autopay-v3`
- Verify `.env.local` has correct credentials

### Issue 4: Success but No Order ID
**Solution**:
- Check server console logs
- Verify API response structure
- Check if `result.data.orderId` exists

### Issue 5: Page Redirects Unexpectedly
**Solution**:
- Check if `paymentUrl` is being returned
- This would trigger redirect to PhonePe
- In test mode, this might not be returned

---

## 🎯 Next Steps After Testing

### Once Frontend Works:

1. **Add Database Storage**
   - Store subscription details
   - Store customer information
   - Track payment history

2. **Implement Webhook Handler**
   - Receive payment notifications
   - Update subscription status
   - Send customer notifications

3. **Add Admin Dashboard**
   - View all subscriptions
   - Check payment status
   - Cancel subscriptions if needed

4. **Production Deployment**
   - Get production credentials from PhonePe
   - Update `.env.local` with prod values
   - Deploy to hosting platform
   - Test with real UPI app

---

## 📝 Test Checklist

### Before Going Live:

- [ ] Form validation works
- [ ] Auto-calculation works
- [ ] Phone number validation (10 digits)
- [ ] UPI VPA validation
- [ ] Submit button loading state
- [ ] Success message displays correctly
- [ ] Error messages are clear
- [ ] Order ID is shown
- [ ] Subscription ID is shown
- [ ] Backend logs are detailed
- [ ] OAuth token generation works
- [ ] Subscription setup succeeds
- [ ] Response has PENDING status
- [ ] No console errors
- [ ] Mobile responsive design
- [ ] Works in different browsers

---

## 🎉 Success Indicators

### You'll Know It's Working When:

```
✅ Form submits without errors
✅ Backend logs show successful API calls
✅ PhonePe returns order ID
✅ Success message appears in green box
✅ Order details are displayed
✅ Status shows "PENDING"
✅ Next steps are clear for customer
```

---

## 📞 Need Help?

### Check These Files:
1. `SUCCESS_REPORT.md` - Complete integration details
2. `QUICK_REFERENCE.md` - Quick reference guide
3. `test-correct-api.js` - Test the API directly

### Verify These Endpoints:
- OAuth: `https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token`
- Subscription: `https://api-preprod.phonepe.com/apis/pg-sandbox/subscriptions/v2/setup`
- VPA Validation: `https://api-preprod.phonepe.com/apis/pg-sandbox/v2/validate/upi`

---

**Happy Testing! 🎉**

Your PhonePe AutoPay integration is ready to use!
