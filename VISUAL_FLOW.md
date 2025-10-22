# PhonePe AutoPay - Visual Flow Guide

## 🎬 Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 1: Customer Opens Your Website                       │
│  URL: http://localhost:3000                                 │
│                                                             │
│  [Service Package AutoPay Setup]                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Customer Details                                   │   │
│  │  ├─ Customer Name: [John Doe        ]              │   │
│  │  ├─ Phone Number:  [9999999999      ]              │   │
│  │  └─ UPI ID:        [success@ybl     ]              │   │
│  │                                                      │   │
│  │  Package Details                                    │   │
│  │  ├─ Package Name:  [3-Year Service  ]              │   │
│  │  ├─ Total Amount:  [36000           ]              │   │
│  │  ├─ Installments:  [36              ]              │   │
│  │  ├─ Start Date:    [2025-11-01      ]              │   │
│  │  └─ Monthly:       [₹1,000.00       ] ← Auto-calc  │   │
│  │                                                      │   │
│  │            [ Setup AutoPay ]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Click!
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 2: Frontend Validation                                │
│                                                             │
│  ✅ All fields filled?                                      │
│  ✅ Phone is 10 digits?                                     │
│  ✅ Total amount > 0?                                       │
│  ✅ Installments > 0?                                       │
│                                                             │
│  → If YES: Continue                                         │
│  → If NO: Show error message                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Valid!
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 3: API Call to Backend                                │
│                                                             │
│  POST /api/phonepe/initiate-autopay-v3                      │
│  {                                                          │
│    customerName: "John Doe",                                │
│    phone: "9999999999",                                     │
│    upiId: "success@ybl",                                    │
│    packageName: "3-Year Service Package",                   │
│    totalAmount: 36000,                                      │
│    installmentAmount: 1000,                                 │
│    totalInstallments: 36                                    │
│  }                                                          │
│                                                             │
│  Button shows: "Processing..."                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 4: Backend - Get OAuth Token                          │
│                                                             │
│  POST https://api-preprod.phonepe.com/...                   │
│       /v1/oauth/token                                       │
│                                                             │
│  Request:                                                   │
│  {                                                          │
│    client_id: "MASSRETAILUAT_2510171534",                   │
│    client_secret: "ZDYwODQ...",                             │
│    grant_type: "client_credentials"                         │
│  }                                                          │
│                                                             │
│  Response:                                                  │
│  {                                                          │
│    access_token: "eyJhbGci...",                             │
│    expires_at: 1761126662                                   │
│  }                                                          │
│                                                             │
│  ✅ Token cached for 1 hour                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 5: Backend - Validate UPI VPA                         │
│                                                             │
│  POST https://api-preprod.phonepe.com/...                   │
│       /v2/validate/upi                                      │
│                                                             │
│  Headers:                                                   │
│  Authorization: O-Bearer eyJhbGci...                        │
│                                                             │
│  Request:                                                   │
│  {                                                          │
│    type: "VPA",                                             │
│    vpa: "success@ybl"                                       │
│  }                                                          │
│                                                             │
│  Response:                                                  │
│  {                                                          │
│    valid: true,                                             │
│    name: "Dummy User"                                       │
│  }                                                          │
│                                                             │
│  ✅ VPA is valid, continue                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 6: Backend - Create Subscription                      │
│                                                             │
│  POST https://api-preprod.phonepe.com/...                   │
│       /subscriptions/v2/setup                               │
│                                                             │
│  Headers:                                                   │
│  Authorization: O-Bearer eyJhbGci...                        │
│  Content-Type: application/json                             │
│                                                             │
│  Request Body (CORRECT STRUCTURE):                          │
│  {                                                          │
│    "merchantOrderId": "MO1761121036037",                    │
│    "amount": 100000,  ← (₹1000 in paise)                    │
│    "expireAt": 1761121636037,                               │
│    "paymentFlow": {                                         │
│      "type": "SUBSCRIPTION_SETUP",                          │
│      "merchantSubscriptionId": "MS_1761121035560",          │
│      "authWorkflowType": "TRANSACTION",                     │
│      "amountType": "FIXED",                                 │
│      "maxAmount": 100000,                                   │
│      "frequency": "MONTHLY",                                │
│      "expireAt": 1787041036037,                             │
│      "paymentMode": {                                       │
│        "type": "UPI_COLLECT",                               │
│        "details": {                                         │
│          "type": "VPA",                                     │
│          "vpa": "success@ybl"                               │
│        }                                                    │
│      }                                                      │
│    },                                                       │
│    "deviceContext": { "deviceOS": "ANDROID" },              │
│    "metaInfo": {                                            │
│      "udf1": "John Doe",                                    │
│      "udf2": "9999999999",                                  │
│      "udf3": "3-Year Service Package"                       │
│    }                                                        │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 7: PhonePe Response                                   │
│                                                             │
│  200 OK                                                     │
│  {                                                          │
│    "orderId": "OMO2510221444328696300240",                  │
│    "state": "PENDING"                                       │
│  }                                                          │
│                                                             │
│  ✅ SUCCESS! Subscription created                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 8: Backend Response to Frontend                       │
│                                                             │
│  200 OK                                                     │
│  {                                                          │
│    "success": true,                                         │
│    "message": "AutoPay subscription setup initiated",       │
│    "data": {                                                │
│      "orderId": "OMO2510221444328696300240",                │
│      "subscriptionId": "MS_1761121035560",                  │
│      "merchantOrderId": "MO1761121036037",                  │
│      "state": "PENDING",                                    │
│      "nextSteps": "Customer will receive authorization..."  │
│    }                                                        │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 9: Frontend Shows Success                             │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✅ Success! AutoPay subscription setup initiated.  │    │
│  │                                                     │    │
│  │ Order ID: OMO2510221444328696300240                │    │
│  │ Subscription ID: MS_1761121035560                  │    │
│  │ Status: PENDING                                    │    │
│  │                                                     │    │
│  │ ┌─────────────────────────────────────────────┐   │    │
│  │ │ 📱 Next Step: Customer will receive         │   │    │
│  │ │    authorization request in their UPI app   │   │    │
│  │ └─────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ In Production...
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 10: Customer's UPI App (Production Only)              │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  📱 PhonePe / Google Pay / Paytm                   │    │
│  │                                                     │    │
│  │  🔔 New Mandate Request                            │    │
│  │                                                     │    │
│  │  Merchant: Your Dealership                         │    │
│  │  Amount: ₹1,000 per month                          │    │
│  │  Frequency: Monthly                                │    │
│  │  Duration: 36 months                               │    │
│  │                                                     │    │
│  │  [ Authorize ]  [ Reject ]                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Customer clicks Authorize
                            │ Enters UPI PIN
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 11: PhonePe Webhook to Your Server                    │
│                                                             │
│  POST http://localhost:3000/api/phonepe/webhook             │
│                                                             │
│  {                                                          │
│    "event": "SUBSCRIPTION_ACTIVATED",                       │
│    "subscriptionId": "MS_1761121035560",                    │
│    "orderId": "OMO2510221444328696300240",                  │
│    "status": "ACTIVE"                                       │
│  }                                                          │
│                                                             │
│  → Your webhook handler updates database                    │
│  → Sends confirmation email/SMS to customer                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 12: Monthly Auto-Debits Begin                         │
│                                                             │
│  Every month on the same date:                              │
│                                                             │
│  Month 1: ₹1,000 debited → Webhook notification            │
│  Month 2: ₹1,000 debited → Webhook notification            │
│  Month 3: ₹1,000 debited → Webhook notification            │
│  ...                                                        │
│  Month 36: ₹1,000 debited → Subscription complete          │
│                                                             │
│  Customer doesn't need to do anything!                      │
│  ✅ Automatic monthly payments                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Files Involved

```
Frontend Flow:
┌──────────────────────────────────┐
│  pages/index.js                  │  ← Customer fills form
│       │                          │
│       ├─ Validates input         │
│       ├─ Auto-calculates monthly │
│       └─ Calls API on submit     │
└──────────────────────────────────┘
          │
          │ POST /api/phonepe/initiate-autopay-v3
          ▼
Backend Flow:
┌──────────────────────────────────────────────────┐
│  pages/api/phonepe/initiate-autopay-v3.js       │
│       │                                          │
│       ├─ Uses PhonePeAutoPayCorrect class       │
│       ├─ Validates phone, UPI                   │
│       └─ Returns success/error                  │
└──────────────────────────────────────────────────┘
          │
          │ import PhonePeAutoPayCorrect
          ▼
Helper Class:
┌──────────────────────────────────────────────────┐
│  lib/phonepe-autopay-correct.js                 │
│       │                                          │
│       ├─ generateAuthToken()                    │
│       ├─ validateUpiVpa()                       │
│       ├─ setupSubscription()   ← CORRECT        │
│       └─ getOrderStatus()                       │
└──────────────────────────────────────────────────┘
          │
          │ Makes API calls to PhonePe
          ▼
PhonePe APIs:
┌──────────────────────────────────────────────────┐
│  1. /v1/oauth/token                              │
│  2. /v2/validate/upi                             │
│  3. /subscriptions/v2/setup      ← MAIN API      │
│  4. /subscriptions/v2/order/{id}/status          │
└──────────────────────────────────────────────────┘
```

---

## 📊 Data Transformation

```
User Input → Frontend → Backend → PhonePe
─────────────────────────────────────────

Total Amount: 36000
Installments: 36
              ↓
Monthly: 1000 (calculated)
              ↓
amount: 100000 (converted to paise)
              ↓
paymentFlow.maxAmount: 100000
```

---

## ✅ Success Response Chain

```
PhonePe → Backend → Frontend → User
────────────────────────────────────

{                              {
  orderId: "OMO...",            success: true,           ┌──────────────┐
  state: "PENDING"    →         data: {          →       │ ✅ Success!  │
}                                 orderId: "..."         │ Order ID: ..│
                                  state: "PENDING"       │ Status: ...  │
                               }                         └──────────────┘
                             }
```

---

## 🎨 UI States

```
Initial State:
┌────────────────────────┐
│  [ Setup AutoPay ]     │  ← Blue button, enabled
└────────────────────────┘

Loading State:
┌────────────────────────┐
│  [ Processing... ]     │  ← Gray button, disabled
└────────────────────────┘

Success State:
┌────────────────────────────────────┐
│  ✅ Success! AutoPay setup...      │  ← Green box
│  Order ID: OMO...                  │
└────────────────────────────────────┘

Error State:
┌────────────────────────────────────┐
│  ❌ Error: Invalid phone number... │  ← Red box
└────────────────────────────────────┘
```

---

**This is the complete flow of your PhonePe AutoPay integration!** 🎉
