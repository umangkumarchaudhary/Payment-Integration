# Fix Callback URL Issue - Use ngrok

## The Problem:

PhonePe requires:
- ✅ HTTPS URLs (not http)
- ✅ Publicly accessible URLs (not localhost)

Current URLs causing error:
```
❌ http://localhost:3000/api/phonepe/webhook
❌ http://localhost:3000/api/phonepe/callback
```

---

## Solution: Use ngrok to Expose Your Local Server

### Step 1: Install ngrok

**Option A: Download**
1. Go to: https://ngrok.com/download
2. Download for Windows
3. Extract and run

**Option B: Using npm**
```bash
npm install -g ngrok
```

### Step 2: Start Your App
```bash
npm run dev
```

Note the port (e.g., 3002)

### Step 3: Start ngrok
```bash
ngrok http 3002
```

Replace `3002` with your actual port.

### Step 4: Get Your Public URL

ngrok will show:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3002
```

Copy this URL: `https://abc123.ngrok.io`

### Step 5: Update .env.local

Edit `.env.local`:
```env
PHONEPE_REDIRECT_URL=https://abc123.ngrok.io/api/phonepe/callback
PHONEPE_WEBHOOK_URL=https://abc123.ngrok.io/api/phonepe/webhook
```

Replace `abc123.ngrok.io` with YOUR ngrok URL.

### Step 6: Restart Your App
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 7: Test Again!

Now test with your app or run:
```bash
node generate-autopay-postman.js
```

The URLs will be:
- ✅ `https://abc123.ngrok.io/api/phonepe/callback`
- ✅ `https://abc123.ngrok.io/api/phonepe/webhook`

Both HTTPS and publicly accessible! ✅

---

## Alternative: Use Dummy URLs (Just for Testing)

If ngrok doesn't work, try dummy URLs:

Edit `.env.local`:
```env
PHONEPE_REDIRECT_URL=https://webhook.site/unique-url
PHONEPE_WEBHOOK_URL=https://webhook.site/unique-url
```

Get a unique URL from: https://webhook.site

---

## After ngrok is Running:

Your payload will have:
```json
{
  "callbackUrl": "https://abc123.ngrok.io/api/phonepe/webhook",
  "redirectUrl": "https://abc123.ngrok.io/api/phonepe/callback",
  ...
}
```

✅ HTTPS
✅ Publicly accessible
✅ Should work!

---

## Expected Result:

Instead of:
```
❌ ERROR: Bad Request (PR000)
```

You should get:
```
✅ SUCCESS: Subscription created!
{
  "success": true,
  "code": "PAYMENT_INITIATED",
  ...
}
```

---

## Quick Commands:

```bash
# Terminal 1: Run your app
npm run dev

# Terminal 2: Run ngrok
ngrok http 3002

# Update .env.local with ngrok URL
# Restart app
# Test again!
```

Try this and let me know what happens!
