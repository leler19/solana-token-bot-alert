require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

console.log('--- Starting Solana Token Alert Bot ---');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'not set, defaulting to 3000');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

const app = express();
app.use(bodyParser.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
const PORT = process.env.PORT || 3000;

async function sendTelegramMessage(text) {
  try {
    await axios.post(TELEGRAM_API, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    });
    console.log('Telegram message sent');
  } catch (error) {
    console.error('Telegram send error:', error.response?.data || error.message);
  }
}

app.post('/webhook', async (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body).slice(0, 500));

  try {
    const data = req.body;
    if (!data || !data.transactions) {
      console.log('No transactions found in webhook payload');
      return res.status(200).send('No transactions');
    }

    for (const tx of data.transactions) {
      if (!tx.meta) continue;
      if (!tx.transaction.message) continue;

      const instructions = tx.transaction.message.instructions || [];
      for (const ix of instructions) {
        if (
          ix.programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' &&
          ix.parsed && ix.parsed.type === 'mintTo'
        ) {
          const mintAddress = ix.parsed.info.mint;
          const amount = ix.parsed.info.amount;
          const decimals = ix.parsed.info.decimals || 0;

          const alertMessage = `🚨 *New Token Mint Detected!*

*Mint Address:* \`${mintAddress}\`
*Amount Minted:* \`${amount}\`
*Decimals:* \`${decimals}\`
Check token info on Solana explorers!`;

          await sendTelegramMessage(alertMessage);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Error');
  }
});

app.get('/', (req, res) => {
  res.send('Solana Token Alert Bot Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
