import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
function formatDateDDMMMYYYY() {
  const date = new Date();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = String(date.getDate()).padStart(2, "0");
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

Promise.resolve().then(async () => {
  try {
    const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
    return bot.sendMessage(
      TELEGRAM_CHAT_ID,
      `Bitcoin Price Prediction (${formatDateDDMMMYYYY()})\n\nPrediction: $82323.32\nCurrent: $82323.12`
    );
  } catch (error) {
    console.error("Error sending message:", error);
  }
});
