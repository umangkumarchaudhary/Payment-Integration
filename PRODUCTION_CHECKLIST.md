# Production Deployment Checklist

Use this checklist before deploying to production.

## 1. PhonePe Account Setup

- [ ] PhonePe merchant account created
- [ ] AutoPay/Recurring payments feature enabled
- [ ] Production credentials received
  - [ ] Production Merchant ID
  - [ ] Production Client ID
  - [ ] Production Client Secret
- [ ] Bank account linked and verified
- [ ] Test transactions completed in sandbox
- [ ] PhonePe support contact information saved

## 2. Environment Configuration

- [ ] Production environment variables set
  ```env
  PHONEPE_ENV=PRODUCTION
  PHONEPE_MERCHANT_ID=your-prod-merchant-id
  PHONEPE_TEST_CLIENT_ID=your-prod-client-id
  PHONEPE_TEST_CLIENT_SECRET=your-prod-client-secret
  PHONEPE_API_BASE_URL=https://api.phonepe.com/apis/hermes
  ```
- [ ] Webhook URL configured (public HTTPS URL)
- [ ] Redirect URLs configured
- [ ] Production API base URL updated
- [ ] All test credentials removed

## 3. Infrastructure Setup

- [ ] Production server selected (Vercel/AWS/DigitalOcean/etc.)
- [ ] Domain name purchased and configured
- [ ] SSL certificate installed
- [ ] DNS records configured
- [ ] Server scaling configured
- [ ] Load balancer setup (if needed)
- [ ] CDN configured (if needed)
- [ ] Backup server configured

## 4. Database Setup

- [ ] Database provider selected (MongoDB Atlas/PostgreSQL/etc.)
- [ ] Production database created
- [ ] Database schemas defined
  - [ ] Customers table/collection
  - [ ] Subscriptions table/collection
  - [ ] Payments table/collection
  - [ ] Transactions table/collection
- [ ] Database indexes created
- [ ] Backup strategy configured
- [ ] Database access controls set
- [ ] Connection pooling configured

### Recommended Database Schema

```javascript
// Customers
{
  customerId: String (unique),
  name: String,
  phone: String (unique),
  upiId: String,
  email: String,
  createdAt: Date,
  updatedAt: Date
}

// Subscriptions
{
  subscriptionId: String (unique),
  customerId: String,
  merchantTransactionId: String,
  packageName: String,
  totalAmount: Number,
  installmentAmount: Number,
  totalInstallments: Number,
  paidInstallments: Number,
  status: String, // ACTIVE, PAUSED, CANCELLED, COMPLETED
  startDate: Date,
  nextPaymentDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
}

// Payments
{
  paymentId: String (unique),
  subscriptionId: String,
  transactionId: String,
  amount: Number,
  status: String, // SUCCESS, FAILED, PENDING
  paymentDate: Date,
  failureReason: String,
  retryCount: Number,
  createdAt: Date
}

// Transactions (Audit Log)
{
  transactionId: String,
  type: String, // SUBSCRIPTION_CREATED, PAYMENT_SUCCESS, etc.
  payload: Object,
  response: Object,
  status: String,
  timestamp: Date
}
```

## 5. Security Implementation

- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] API rate limiting implemented
- [ ] CSRF protection added
- [ ] XSS protection enabled
- [ ] SQL injection prevention (parameterized queries)
- [ ] Input validation on all endpoints
- [ ] Webhook signature verification enabled
- [ ] Authentication/authorization implemented
- [ ] Sensitive data encrypted
- [ ] Security headers configured
  ```javascript
  {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000'
  }
  ```

## 6. Code Updates

- [ ] Database integration added to all API routes
- [ ] Error logging implemented
- [ ] Monitoring/analytics added
- [ ] Email/SMS notifications implemented
- [ ] Retry logic for failed payments added
- [ ] Admin dashboard created
- [ ] Customer portal created (optional)
- [ ] Testing suite added
- [ ] API documentation created

### Code to Add

#### In `initiate-autopay.js`:
```javascript
// Save to database after successful API call
await db.customers.upsert({ customerId, name, phone, upiId });
await db.subscriptions.create({
  subscriptionId,
  customerId,
  status: 'PENDING',
  // ... other fields
});
```

#### In `webhook.js`:
```javascript
// Update database on payment events
await db.payments.create({
  subscriptionId,
  transactionId,
  amount,
  status: 'SUCCESS'
});

await db.subscriptions.update(
  { subscriptionId },
  { $inc: { paidInstallments: 1 } }
);
```

## 7. Monitoring & Logging

- [ ] Error tracking service setup (Sentry, Rollbar)
- [ ] Application monitoring (New Relic, DataDog)
- [ ] Log aggregation (Loggly, Papertrail)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Performance monitoring
- [ ] Alert system configured
  - [ ] Payment failures
  - [ ] API errors
  - [ ] Server downtime
  - [ ] High error rates

## 8. Notification System

- [ ] SMS gateway integrated (Twilio, MSG91)
- [ ] Email service setup (SendGrid, AWS SES)
- [ ] Notification templates created
  - [ ] Subscription activated
  - [ ] Payment success
  - [ ] Payment failure
  - [ ] Payment reminder (3 days before)
  - [ ] Subscription expiring
  - [ ] Subscription cancelled

## 9. Testing

- [ ] Unit tests written
- [ ] Integration tests completed
- [ ] Load testing performed
- [ ] Security testing completed
- [ ] Payment flow tested end-to-end
- [ ] Webhook handling tested
- [ ] Error scenarios tested
- [ ] Mobile responsiveness tested
- [ ] Browser compatibility tested
- [ ] Accessibility tested

### Test Scenarios

- [ ] Successful subscription creation
- [ ] Failed subscription creation
- [ ] Successful payment
- [ ] Failed payment with retry
- [ ] Subscription cancellation
- [ ] Subscription pause/resume
- [ ] Multiple concurrent subscriptions
- [ ] Invalid input handling
- [ ] Network timeout handling
- [ ] Duplicate transaction prevention

## 10. Documentation

- [ ] API documentation created
- [ ] User manual written
- [ ] Admin guide created
- [ ] Troubleshooting guide prepared
- [ ] Support documentation ready
- [ ] Code comments added
- [ ] README updated
- [ ] Change log maintained

## 11. Legal & Compliance

- [ ] Terms of Service created
- [ ] Privacy Policy created
- [ ] Refund policy defined
- [ ] Data retention policy set
- [ ] GDPR compliance (if applicable)
- [ ] PCI DSS compliance reviewed
- [ ] Legal review completed
- [ ] Customer consent mechanism implemented

## 12. Business Operations

- [ ] Customer support system ready
- [ ] Support team trained
- [ ] Escalation process defined
- [ ] Refund process defined
- [ ] Dispute resolution process ready
- [ ] Accounting integration setup
- [ ] Reporting system created
- [ ] KPI dashboard created

## 13. PhonePe Integration

- [ ] Webhook URL registered with PhonePe
- [ ] Callback URL registered
- [ ] IP whitelisting configured (if required)
- [ ] API rate limits understood
- [ ] Settlement cycle confirmed
- [ ] Transaction fees confirmed
- [ ] Chargebacks policy understood
- [ ] Support SLA confirmed

## 14. Deployment

- [ ] Staging environment tested
- [ ] Production deployment plan created
- [ ] Rollback plan prepared
- [ ] Database migration scripts ready
- [ ] Zero-downtime deployment configured
- [ ] Health check endpoints added
- [ ] Smoke tests prepared
- [ ] Deployment scheduled (low-traffic time)

## 15. Post-Deployment

- [ ] Smoke tests executed
- [ ] Monitoring dashboards checked
- [ ] Test transaction completed
- [ ] Error logs reviewed
- [ ] Performance metrics validated
- [ ] User feedback collected
- [ ] Support tickets monitored
- [ ] PhonePe settlement verified

## 16. Maintenance Plan

- [ ] Backup schedule defined
- [ ] Update schedule planned
- [ ] Security patch process defined
- [ ] Database maintenance scheduled
- [ ] Log rotation configured
- [ ] Disaster recovery plan created
- [ ] Incident response plan ready

## Critical Configuration

### Production `.env` File
```env
# PhonePe Production
PHONEPE_MERCHANT_ID=your-production-merchant-id
PHONEPE_TEST_CLIENT_ID=your-production-client-id
PHONEPE_TEST_CLIENT_SECRET=your-production-secret
PHONEPE_ENV=PRODUCTION
PHONEPE_API_BASE_URL=https://api.phonepe.com/apis/hermes

# URLs (must be HTTPS)
PHONEPE_REDIRECT_URL=https://yourdomain.com/api/phonepe/callback
PHONEPE_WEBHOOK_URL=https://yourdomain.com/api/phonepe/webhook
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=your-production-database-url

# Notifications
SMS_API_KEY=your-sms-api-key
EMAIL_API_KEY=your-email-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=error

# Security
SESSION_SECRET=your-session-secret
ENCRYPTION_KEY=your-encryption-key
```

## Performance Targets

- [ ] API response time < 500ms
- [ ] Page load time < 2s
- [ ] Uptime > 99.9%
- [ ] Error rate < 0.1%
- [ ] Payment success rate > 95%

## Success Criteria

Before marking deployment as successful:

- [ ] 10+ test transactions completed successfully
- [ ] No errors in logs for 24 hours
- [ ] Monitoring shows healthy metrics
- [ ] Support team confirms readiness
- [ ] PhonePe settlement received for test transactions
- [ ] Customer feedback is positive

## Emergency Contacts

Document these contacts:

- [ ] PhonePe support: _______________
- [ ] Hosting provider support: _______________
- [ ] Database provider support: _______________
- [ ] DevOps team: _______________
- [ ] Security team: _______________

## Notes

```
Deployment Date: __________
Deployed By: __________
Version: __________
Special Considerations:




```

---

**Sign-off:**

- [ ] Development Lead: __________ Date: __________
- [ ] QA Lead: __________ Date: __________
- [ ] Security Lead: __________ Date: __________
- [ ] Business Owner: __________ Date: __________
