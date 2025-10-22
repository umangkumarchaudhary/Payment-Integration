# 🚀 Deployment Guide

Complete guide to deploy PhonePe AutoPay Integration to production.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- [x] PhonePe merchant account
- [x] Production credentials from PhonePe
- [x] MongoDB Atlas account (or PostgreSQL)
- [x] GitHub account
- [x] Vercel account (or hosting of choice)

---

## Step 1: Get Production Credentials

### Contact PhonePe

Email: **merchantsupport@phonepe.com**

```
Subject: Production Credentials Request - AutoPay Feature

Dear PhonePe Team,

We have successfully tested AutoPay integration in UAT.
Request production credentials:

Current UAT Credentials:
- Merchant ID: [Your UAT Merchant ID]
- Client ID: [Your UAT Client ID]

Business Details:
- Company: [Your Company Name]
- Use Case: Service package recurring payments
- Expected Volume: [X subscriptions/month]

Please provide production credentials and activation.

Thank you!
```

### You'll Receive:
```
PHONEPE_MERCHANT_ID: [Production ID]
PHONEPE_CLIENT_ID: [Production Client ID]
PHONEPE_CLIENT_SECRET: [Production Secret]
API URL: https://api.phonepe.com/apis/pg
```

---

## Step 2: Set Up Database

### Option A: MongoDB Atlas (Recommended)

1. **Sign up**: https://www.mongodb.com/cloud/atlas
2. **Create free cluster** (M0 - Free Forever)
3. **Create database user**
4. **Whitelist IP**: `0.0.0.0/0` (all IPs for serverless)
5. **Get connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/phonepe_autopay
   ```

### Option B: PostgreSQL (Supabase)

1. **Sign up**: https://supabase.com
2. **Create project**
3. **Get connection string**:
   ```
   postgresql://user:pass@host:5432/database
   ```

---

## Step 3: Deploy to Vercel

### 3.1 Push Code to GitHub

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Production ready - PhonePe AutoPay Integration"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/phonepe-autopay.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3.3 Add Environment Variables

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables:

```env
# PhonePe Production Credentials
PHONEPE_MERCHANT_ID=[From PhonePe]
PHONEPE_CLIENT_ID=[From PhonePe]
PHONEPE_CLIENT_SECRET=[From PhonePe]
PHONEPE_ENV=PRODUCTION
PHONEPE_API_BASE_URL=https://api.phonepe.com/apis/pg

# Your Production Domain
PHONEPE_REDIRECT_URL=https://yourdomain.com/api/phonepe/callback
PHONEPE_WEBHOOK_URL=https://yourdomain.com/api/phonepe/webhook
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=[From MongoDB Atlas or Supabase]

# Optional: Email/SMS
RESEND_API_KEY=[From resend.com]
FAST2SMS_API_KEY=[From fast2sms.com]

# Security
DEMO_MODE=false
NODE_ENV=production
```

Click **Save** → **Redeploy**

---

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Domain in Vercel

1. Go to **Vercel Dashboard** → **Domains**
2. Click **Add Domain**
3. Enter: `autopay.yourdomain.com`

### 4.2 Update DNS

Add CNAME record:
```
Type: CNAME
Name: autopay
Value: cname.vercel-dns.com
TTL: 3600
```

Wait 5-30 minutes for DNS propagation.

---

## Step 5: Update PhonePe URLs

Email PhonePe:

```
Subject: Update Webhook URLs - Production

Dear PhonePe Team,

Please update our production URLs:

Merchant ID: [Your Production Merchant ID]

New URLs:
- Callback: https://autopay.yourdomain.com/api/phonepe/callback
- Webhook: https://autopay.yourdomain.com/api/phonepe/webhook

Thank you!
```

---

## Step 6: Test Production

### 6.1 Create Test Subscription

1. Visit: `https://autopay.yourdomain.com`
2. Fill form with test data
3. Submit
4. Verify:
   - ✅ Success message
   - ✅ Database entry created
   - ✅ PhonePe order ID received

### 6.2 Monitor Logs

Check Vercel Dashboard → **Logs** for any errors.

---

## Step 7: Go Live!

### Soft Launch
- Week 1: Test with 5-10 customers
- Week 2: Expand to 20-30 customers
- Week 3: Full launch

### Monitor
- Daily: Check logs, database, webhooks
- Weekly: Review failed transactions, performance

---

## 📊 Estimated Costs

| Service | Cost |
|---------|------|
| Vercel Pro | $20/month |
| MongoDB Atlas M0 | Free |
| Domain | ~$10/year |
| Email (Resend) | Free tier |
| SMS (Fast2SMS) | ₹500-2000/month |
| **Total** | **~$25-45/month** |

Plus PhonePe fees: 1.5-2% per transaction

---

## 🔧 Troubleshooting

### Issue: "Module not found"
**Fix**: Check `package.json` dependencies, run `npm install`

### Issue: "Database connection failed"
**Fix**: Verify `DATABASE_URL` in environment variables

### Issue: "PhonePe returns error"
**Fix**: Check production credentials are correct

### Issue: "Webhook not receiving"
**Fix**: Verify webhook URL updated with PhonePe

---

## 📞 Support

- **PhonePe Support**: merchantsupport@phonepe.com
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Docs**: https://docs.mongodb.com

---

## ✅ Pre-Launch Checklist

- [ ] Production credentials from PhonePe
- [ ] Database set up
- [ ] Code deployed to Vercel
- [ ] Environment variables configured
- [ ] Custom domain configured
- [ ] PhonePe URLs updated
- [ ] Test subscription successful
- [ ] Monitoring enabled
- [ ] Team trained

---

**Timeline**: 3-4 weeks from credentials to launch

**Need help?** Check the README.md or contact support.
