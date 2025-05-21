const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineString } = require("firebase-functions/params");
const fs = require("firebase-admin");
const JSBI = require("jsbi");
const { TickMath, FullMath, FeeAmount } = require("@uniswap/v3-sdk");
const { ethers } = require("ethers");
const Replicate = require("replicate");
const logger = require("firebase-functions/logger");
const TelegramBot = require("node-telegram-bot-api");

fs.initializeApp();

//#region environment variables
const replicateModel = defineString("REPLICATE_MODEL");
const replicateApiToken = defineString("REPLICATE_API_TOKEN");

const httpURL = defineString("HTTP_URL");
const poolId = defineString("POOL_ID");
const wbtcAddress = defineString("WBTC_ADDRESS");
const usdcAddress = defineString("USDC_ADDRESS");
const stateViewAddress = defineString("STATEVIEW_ADDRESS");

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

  // Convert to Singapore timezone (UTC+8)
  const options = {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  // Format using Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat("en-US", options);
  // The formatted string will be like "06 Jun 2024, 09:30 AM"
  // Let's rearrange to match the original format: "06 Jun 2024 09:30 AM"
  const parts = formatter.formatToParts(date);
  const day = parts.find((p) => p.type === "day").value;
  const month = parts.find((p) => p.type === "month").value;
  const year = parts.find((p) => p.type === "year").value;
  const hour = parts.find((p) => p.type === "hour").value;
  const minute = parts.find((p) => p.type === "minute").value;
  const dayPeriod = parts.find((p) => p.type === "dayPeriod").value;

  return `${day} ${month} ${year} ${hour}:${minute} ${dayPeriod}`;
}
//#endregion

//#region external data
async function fetchYahooFinance(quote) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${quote}?interval=1m`
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
async function fetchPredictedPrice() {
  const timestamp = getTimeStamp();
  const predictionsCollectionDoc = fs
    .firestore()
    .collection("predictions")
    .doc(timestamp.toString());
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
  return output;
}
// #endregion

//#region smart contract functions
const STATEVIEW_ABI = [
  "function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)",
];
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

async function fetchWbtcPrice() {
  const provider = new ethers.JsonRpcProvider(httpURL.value());

  const stateViewContract = new ethers.Contract(
    stateViewAddress.value(),
    STATEVIEW_ABI,
    provider
  );
  const tokenContract = new ethers.Contract(
    wbtcAddress.value(),
    ERC20_ABI,
    provider
  );
  const decimals = await tokenContract.decimals();

  const slot0 = await stateViewContract.getSlot0(poolId.value());
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(Number(slot0[1]));
  const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96);
  const baseAmount = JSBI.BigInt(1 * 10 ** Number(decimals)); // 1 WBTC
  const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192));
  const quoteAmount = FullMath.mulDivRoundingUp(ratioX192, baseAmount, shift);
  return quoteAmount;
}

//#endregion

exports.btcPricePrediction = onSchedule(
  {
    schedule: "every 1 hours",
    timeZone: "Asia/Singapore",
    timeoutSeconds: 180,
    memory: "256MiB",
    maxInstances: 1,
    region: "asia-southeast1",
  },
  async (_) => {
    try {
      // setup blockchain stuff
      const provider = new ethers.JsonRpcProvider(httpURL.value());

      // get wbtc and predicted prices
      const output = await fetchPredictedPrice();
      const predictedBtcPrice = JSBI.BigInt(output);
      const wbtcPrice = await fetchWbtcPrice();

      logger.info(
        "Predicted BTC Price:",
        predictedBtcPrice.toString(),
        "WBTC Price:",
        wbtcPrice.toString()
      );

      const usdcContract = new ethers.Contract(
        usdcAddress.value(),
        ERC20_ABI,
        provider
      );

      const usdcDecimal = await usdcContract.decimals();
      const diff = JSBI.subtract(predictedBtcPrice, wbtcPrice);

      // send telegram message
      const bot = new TelegramBot(telegramApiToken.value(), { polling: true });
      await bot.sendMessage(
        telegramChatId.value(),
        `*${formattedDate()}* \nPrediction: $${Number(
          ethers.formatUnits(predictedBtcPrice.toString(), usdcDecimal)
        ).toFixed(2)} \nCurrent: $${Number(
          ethers.formatUnits(wbtcPrice.toString(), usdcDecimal)
        ).toFixed(2)} \nDiff: $${Number(
          ethers.formatUnits(diff.toString(), usdcDecimal)
        ).toFixed(2)}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      logger.error("Error in tradeScheduled:", error);
      return;
    }
  }
);
