# PhonePe AutoPay Integration for Dealership Service Packages

A complete Next.js application for setting up PhonePe AutoPay (recurring payments) for dealership service packages with monthly installments.

## Overview

This system allows dealerships to:
- Collect customer details (Name, Phone, UPI ID)
- Setup automatic monthly payment mandates
- Process recurring installments for service packages (3-5 years)
- Receive automatic payment notifications
- Track subscription status

## Features

- **Customer Registration Form**: Easy-to-use UI for entering customer details
- **AutoPay Setup**: Automated recurring payment mandate creation
- **PhonePe Integration**: Complete integration with PhonePe Recurring Payments API
- **Webhook Support**: Real-time payment status updates
- **Status Tracking**: Check payment and subscription status
- **Success/Failure Handling**: User-friendly success and failure pages

## Tech Stack

- **Frontend**: Next.js, React
- **Backend**: Next.js API Routes (Node.js)
- **Payment Gateway**: PhonePe Recurring Payments API
- **Authentication**: SHA256 + Base64 signing

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- PhonePe Merchant Account with AutoPay enabled
- Test/UAT credentials from PhonePe

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Edit `.env.local` with your PhonePe credentials (already populated with test credentials)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
payment-integration/
├── pages/
│   ├── api/
│   │   └── phonepe/
│   │       ├── initiate-autopay.js   # Create AutoPay subscription
│   │       ├── callback.js           # Payment callback handler
│   │       ├── webhook.js            # Webhook for status updates
│   │       └── check-status.js       # Check transaction status
│   ├── index.js                      # Main registration form
│   ├── success.js                    # Success page
│   ├── failure.js                    # Failure page
│   └── _app.js                       # Next.js app wrapper
├── lib/
│   └── phonepe.js                    # PhonePe API helper class
├── styles/
│   └── globals.css                   # Global styles
├── .env.local                        # Environment variables
├── package.json                      # Dependencies
└── README.md                         # This file
```

## API Endpoints

### 1. Initiate AutoPay
**POST** `/api/phonepe/initiate-autopay`

Create a new AutoPay subscription for a customer.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "phone": "9876543210",
  "upiId": "john@paytm",
  "packageName": "3-Year Service Package",
  "totalAmount": 36000,
  "installmentAmount": 1000,
  "totalInstallments": 36,
  "startDate": "2025-11-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "AutoPay subscription initiated successfully",
  "data": {
    "customerId": "CUST_1234567890",
    "subscriptionId": "SUB_1234567890",
    "transactionId": "TXN1234567890",
    "paymentUrl": "https://phonepe.com/payment/..."
  }
}
```

### 2. Check Status
**GET** `/api/phonepe/check-status?transactionId=TXN123`

Check the status of a transaction or subscription.

### 3. Callback
**POST** `/api/phonepe/callback`

Handles redirect after customer authorization (called by PhonePe).

### 4. Webhook
**POST** `/api/phonepe/webhook`

Receives server-to-server notifications for payment events.

## Testing the Integration

### Step 1: Fill the Form

1. Navigate to http://localhost:3000
2. Fill in the customer details:
   - **Customer Name**: Test Customer
   - **Phone Number**: 9999999999 (10 digits)
   - **UPI ID**: test@paytm (optional)

3. Fill in package details:
   - **Package Name**: 3-Year Service Package
   - **Total Amount**: 36000
   - **Number of Installments**: 36
   - **Monthly Installment**: 1000 (auto-calculated)

4. Click "Setup AutoPay"

### Step 2: Expected Behavior

**Test Environment:**
- The API will attempt to connect to PhonePe sandbox
- You'll receive either a payment URL or an error response
- Check browser console and terminal logs for detailed information

**Production Environment:**
- Customer receives UPI intent/payment request on their phone
- Customer authorizes the AutoPay mandate
- Customer is redirected to success/failure page
- Webhook receives payment status updates

### Step 3: Check Logs

Monitor the terminal for detailed logs:
```
PhonePe API Response: {...}
Subscription Activated: {...}
```

### Step 4: Test Webhook (Local Development)

To test webhooks locally, you'll need to expose your local server:

1. Install ngrok:
```bash
npm install -g ngrok
```

2. Start ngrok:
```bash
ngrok http 3000
```

3. Update `.env.local` webhook URL:
```
PHONEPE_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/phonepe/webhook
```

4. Configure webhook URL in PhonePe merchant dashboard

## Important Notes

### Current Credentials

The system is configured with **TEST** credentials:
- Merchant ID: `M22YCAWLBCE2J`
- Test Client ID: `TEST-M22YCAWLBCE2J_25051`
- Environment: Sandbox/Preprod

### Before Going Live

1. **Get Production Credentials**: Contact PhonePe to get production credentials

2. **Update Environment Variables**:
```env
PHONEPE_ENV=PRODUCTION
PHONEPE_MERCHANT_ID=your-production-merchant-id
PHONEPE_CLIENT_ID=your-production-client-id
PHONEPE_CLIENT_SECRET=your-production-client-secret
PHONEPE_API_BASE_URL=https://api.phonepe.com/apis/hermes
```

3. **Add Database**: Integrate a database (MongoDB, PostgreSQL, etc.) to store:
   - Customer information
   - Subscription details
   - Payment history
   - Transaction logs

4. **Add Security**:
   - Implement authentication/authorization
   - Add rate limiting
   - Encrypt sensitive data
   - Add CSRF protection

5. **Setup Webhook URL**: Configure a publicly accessible webhook URL

6. **Test Thoroughly**: Test with small amounts first

## Additional Features to Implement

### Database Integration

Add database models for:
- `customers`: Store customer details
- `subscriptions`: Track subscription status
- `payments`: Record payment history
- `transactions`: Log all transactions

Example with MongoDB/Mongoose:
```javascript
// models/Subscription.js
const subscriptionSchema = new Schema({
  subscriptionId: String,
  customerId: String,
  customerName: String,
  phone: String,
  totalAmount: Number,
  installmentAmount: Number,
  totalInstallments: Number,
  paidInstallments: Number,
  status: String, // ACTIVE, PAUSED, CANCELLED, COMPLETED
  startDate: Date,
  nextPaymentDate: Date,
  createdAt: Date
});
```

### Notification System

Add SMS/Email notifications for:
- Subscription activation
- Payment success/failure
- Upcoming payment reminders
- Subscription cancellation

### Admin Dashboard

Create an admin panel to:
- View all subscriptions
- Track payment status
- Generate reports
- Manage customers
- Handle disputes

### Retry Logic

Implement automatic retry for failed payments:
```javascript
// Retry after 1 day, 3 days, 5 days
if (payment.failed) {
  scheduleRetry(subscriptionId, retryCount);
}
```

## PhonePe Documentation

- [Recurring Payments Guide](https://developer.phonepe.com/v1/docs/recurring-payments)
- [API Reference](https://developer.phonepe.com/v1/reference/recurring-auth-init-api)
- [Webhook Events](https://developer.phonepe.com/v1/docs/webhooks)

## What Else You Need

### 1. From PhonePe:
- **Production API Credentials** (currently using test)
- **Webhook Registration** (register your webhook URL)
- **API Documentation Access** (for latest updates)
- **Support Contact** (for technical issues)

### 2. Infrastructure:
- **Production Server** (Vercel, AWS, DigitalOcean, etc.)
- **Domain Name** with SSL certificate
- **Database** (MongoDB Atlas, PostgreSQL, etc.)
- **Monitoring Tools** (Sentry, LogRocket, etc.)

### 3. Business Setup:
- **Bank Account** linked to PhonePe merchant account
- **Legal Compliance** (Terms of Service, Privacy Policy)
- **Customer Support** system
- **Accounting Software** integration

### 4. Security & Compliance:
- **PCI DSS Compliance** (if storing card data)
- **Data Encryption** (for customer information)
- **Backup System** (for data recovery)
- **Audit Logs** (for tracking all operations)

## Testing Checklist

- [ ] Customer form validation works
- [ ] API creates subscription successfully
- [ ] PhonePe API responds (check logs)
- [ ] Callback handling works
- [ ] Webhook receives notifications
- [ ] Success page displays correctly
- [ ] Failure page shows errors
- [ ] Status check API works
- [ ] Edge cases handled (invalid phone, etc.)
- [ ] Error messages are user-friendly

## Demo for Your Team

To demonstrate this to your team:

1. **Start the server**: `npm run dev`

2. **Open the form**: Navigate to http://localhost:3000

3. **Fill sample data**:
   - Name: Test Customer
   - Phone: 9999999999
   - Package: 3-Year Service
   - Total: 36000
   - Installments: 36

4. **Submit the form**

5. **Show the API response** in browser DevTools Network tab

6. **Show server logs** in terminal

7. **Explain the flow**:
   - Customer fills form → API creates subscription → PhonePe sends payment request → Customer authorizes → Webhook receives updates → Monthly payments auto-deducted

## Support

For issues or questions:
- Check PhonePe documentation
- Review server logs for detailed error messages
- Contact PhonePe merchant support for API-related issues

## License

Proprietary - For internal dealership use only
