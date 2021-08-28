const TelegramBot = require('node-telegram-bot-api');
const {processUrl} = require('./answers');
const {tiktokUrlRegex} = require('./utils');

const proxyHost = process.env.PROXY_HOST;
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.onText(tiktokUrlRegex, (msg, match) => {
  processUrl(match[0], msg.chat.id, bot, false, proxyHost);
});

bot.on("inline_query", (data) => {
  const match = data.query.match(tiktokUrlRegex);
  if (match && match.length > 0) {
    processUrl(match[0], data.id, bot, true, proxyHost);
  }
});