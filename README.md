# Solana Token Alert Bot Backend

This is a Node.js Express backend to receive Solana token mint events from Helius webhooks
and send Telegram alerts to a specified user.

## Setup

1. Rename `.env.example` to `.env` and fill in your bot token and chat ID
2. Deploy the app on Railway, Vercel, or any Node.js hosting
3. Point your Helius webhook to: `https://your-deployment-url/webhook`

## Environment Variables

```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
PORT=3000
```

## Run Locally

```bash
npm install
npm start
```
