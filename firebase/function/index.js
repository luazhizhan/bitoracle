const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineString } = require("firebase-functions/params");
const fs = require("firebase-admin");
const JSBI = require("jsbi");
const { ethers } = require("ethers");
const Replicate = require("replicate");
const logger = require("firebase-functions/logger");
const TelegramBot = require("node-telegram-bot-api");

fs.initializeApp();

//#region environment variables
const replicateModel = defineString("REPLICATE_MODEL");
const replicateApiToken = defineString("REPLICATE_API_TOKEN");
const telegramApiToken = defineString("TELEGRAM_API_TOKEN");
const telegramChatId = defineString("TELEGRAM_CHAT_ID");
// #endregion

//#region datetime functions
function getTimeStamp() {
  const today = new Date();
  const timestamp = Math.floor(today.getTime() / 1000);
  return timestamp;
}

function formattedDate() {
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

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  hours = String(hours).padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
}
//#endregion

//#region external data
async function fetchYahooFinance(quote) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${quote}?interval=1d`
  );
  const data = await response.json();
  return data.chart.result[0].meta.regularMarketPrice;
}
async function fetchFearGreed() {
  const response = await fetch(`https://api.alternative.me/fng/?limit=1`);
  const data = await response.json();
  return Number(data.data[0].value);
}
async function fetchCoinMetrics(metrics) {
  const response = await fetch(
    `https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=btc&metrics=${metrics}&page_size=1&timezone=Asia%2FSingapore`
  );
  const data = await response.json();
  return Number(data.data[0][metrics]);
}
async function fetchCryptoMarketCap() {
  const response = await fetch(`https://api.coingecko.com/api/v3/global`);
  const data = await response.json();
  return Number(data.data.total_market_cap.btc);
}
async function currentAndPredictedBtcPrice(timestamp) {
  const predictionsCollectionDoc = fs
    .firestore()
    .collection("predictions")
    .doc(timestamp.toString());
  const predictionDoc = await predictionsCollectionDoc.get();
  if (predictionDoc.exists) {
    const data = predictionDoc.data();
    logger.info("Using cached prediction", data.predictedPrice);
    return data.predictedPrice;
  }
  const replicate = new Replicate({
    auth: replicateApiToken.value(),
  });
  const btcOpen = await fetchYahooFinance("BTC-USD");
  const tenYearOpenPrice = await fetchYahooFinance("%5ETNX");
  const adaOpenPrice = await fetchYahooFinance("ADA-USD");
  const bnbOpenPrice = await fetchYahooFinance("BNB-USD");
  const btcFearGreedIndex = await fetchFearGreed();
  const btcFeesTotalUSD = await fetchCoinMetrics("FeeTotUSD");
  const btcSupplyMinerHeldByAllMiningEntitiesUSD = await fetchCoinMetrics(
    "SplyMiner0HopAllUSD"
  );
  const btcMinerRevenueUSD = await fetchCoinMetrics("RevUSD");
  const btcDifficultyLast = await fetchCoinMetrics("DiffLast");
  const btcHashRateMean = await fetchCoinMetrics("HashRate");
  const btcRevenuePerHashUnitUSD = await fetchCoinMetrics("RevHashUSD");
  const btcBlockSizeMeanBytes = await fetchCoinMetrics("BlkSizeMeanByte");
  const btcCapitalizationMVRVFreeFloat = await fetchCoinMetrics("CapMVRVFF");
  const btcFlowInExchangesUSD = await fetchCoinMetrics("FlowInExUSD");
  const btcFlowOutExchangesUSD = await fetchCoinMetrics("FlowOutExUSD");
  const cryptoMarketCap = await fetchCryptoMarketCap();
  const csi300OpenPrice = await fetchYahooFinance("000300.SS");
  const djiOpenPrice = await fetchYahooFinance("%5EDJI");
  const dogeOpenPrice = await fetchYahooFinance("DOGE-USD");
  const dxyOpenPrice = await fetchYahooFinance("DX-Y.NYB");
  const ethOpenPrice = await fetchYahooFinance("ETH-USD");
  const goldOpenPrice = await fetchYahooFinance("GC=F");
  const maticOpenPrice = await fetchYahooFinance("MATIC-USD");
  const nasdaqOpenPrice = await fetchYahooFinance("%5EIXIC");
  const nikkie225OpenPrice = await fetchYahooFinance("%5EN225");
  const oilOpenPrice = await fetchYahooFinance("CL=F");
  const sAndP500OpenPrice = await fetchYahooFinance("%5EGSPC");
  const silverOpenPrice = await fetchYahooFinance("SI=F");
  const solOpenPrice = await fetchYahooFinance("SOL-USD");
  const output = await replicate.run(replicateModel.value(), {
    input: {
      btcOpen,
      tenYearOpenPrice,
      adaOpenPrice,
      bnbOpenPrice,
      btcFearGreedIndex,
      btcFeesTotalUSD,
      btcSupplyMinerHeldByAllMiningEntitiesUSD,
      btcMinerRevenueUSD,
      btcDifficultyLast,
      btcHashRateMean,
      btcRevenuePerHashUnitUSD,
      btcBlockSizeMeanBytes,
      btcCapitalizationMVRVFreeFloat,
      btcFlowInExchangesUSD,
      btcFlowOutExchangesUSD,
      cryptoMarketCap,
      csi300OpenPrice,
      djiOpenPrice,
      dogeOpenPrice,
      dxyOpenPrice,
      ethOpenPrice,
      goldOpenPrice,
      maticOpenPrice,
      nasdaqOpenPrice,
      nikkie225OpenPrice,
      oilOpenPrice,
      sAndP500OpenPrice,
      silverOpenPrice,
      solOpenPrice,
    },
  });
  logger.info("Predicted btc price is", output);
  await predictionsCollectionDoc.set({
    predictedPrice: output,
    btcOpen,
    tenYearOpenPrice,
    adaOpenPrice,
    bnbOpenPrice,
    btcFearGreedIndex,
    btcFeesTotalUSD,
    btcSupplyMinerHeldByAllMiningEntitiesUSD,
    btcMinerRevenueUSD,
    btcDifficultyLast,
    btcHashRateMean,
    btcRevenuePerHashUnitUSD,
    btcBlockSizeMeanBytes,
    btcCapitalizationMVRVFreeFloat,
    btcFlowInExchangesUSD,
    btcFlowOutExchangesUSD,
    cryptoMarketCap,
    csi300OpenPrice,
    djiOpenPrice,
    dogeOpenPrice,
    dxyOpenPrice,
    ethOpenPrice,
    goldOpenPrice,
    maticOpenPrice,
    nasdaqOpenPrice,
    nikkie225OpenPrice,
    oilOpenPrice,
    sAndP500OpenPrice,
    silverOpenPrice,
    solOpenPrice,
    timestamp,
  });
  return [btcOpen, output];
}
// #endregion

exports.btcPricePrediction = onSchedule(
  {
    schedule: "every 4 hours",
    timeZone: "Asia/Singapore",
    timeoutSeconds: 180,
    memory: "256MiB",
    maxInstances: 1,
    region: "asia-southeast1",
  },
  async (_) => {
    try {
      const timestamp = getTimeStamp();
      const [current, predicted] = await currentAndPredictedBtcPrice(timestamp);
      const currentBtcPrice = JSBI.BigInt(Number(current));
      const predictedBtcPrice = JSBI.BigInt(
        Number(ethers.formatUnits(predicted.toString(), 6)) // usdc has 6 decimals
      );
      const diff = JSBI.subtract(predictedBtcPrice, currentBtcPrice);

      // send telegram message
      const bot = new TelegramBot(telegramApiToken.value(), { polling: true });
      await bot.sendMessage(
        telegramChatId.value(),
        `*${formattedDate()}* \nPrediction: $${Number(
          predictedBtcPrice.toString()
        ).toFixed(2)} \nCurrent: $${Number(currentBtcPrice.toString()).toFixed(
          2
        )} \nDiff: $${Number(diff.toString()).toFixed(2)}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      logger.error("Error in tradeScheduled:", error);
      return;
    }
  }
);
