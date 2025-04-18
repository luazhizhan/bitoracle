const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineString } = require("firebase-functions/params");
const JSBI = require("jsbi");
const { ethers } = require("ethers");
const Replicate = require("replicate");
const fs = require("firebase-admin");
const logger = require("firebase-functions/logger");
const erc20Abi = require("./abis/erc20.json");
const { TickMath, FullMath, FeeAmount } = require("@uniswap/v3-sdk");
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const SwapRouter = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
const TelegramBot = require("node-telegram-bot-api");

fs.initializeApp();

const httpURL = defineString("HTTP_URL");

const replicateModel = defineString("REPLICATE_MODEL");
const replicateApiToken = defineString("REPLICATE_API_TOKEN");

const accountAddress = defineString("ACCOUNT_ADDRESS");
const accountPrivateKey = defineString("ACCOUNT_PRIVATE_KEY");
const wbtcAddress = defineString("WBTC_ADDRESS");
const usdcAddress = defineString("USDC_ADDRESS");
const routerAddress = defineString("ROUTER_ADDRESS");
const wbtcUsdcPoolAddress = defineString("WBTC_USDC_POOL_ADDRESS");

const telegramApiToken = defineString("TELEGRAM_API_TOKEN");
const telegramChatId = defineString("TELEGRAM_CHAT_ID");

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

function getTimeStamp() {
  const today = new Date();
  today.setHours(today.getHours(), 0, 0, 0);
  const timestamp = Math.floor(today.getTime() / 1000);
  return timestamp;
}

function formatDateDDMMYYYY() {
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

async function fetchPredictedPrice(address, timestamp) {
  const predictionsCollectionDoc = fs
    .firestore()
    .collection("predictions")
    .doc(timestamp.toString());
  const predictionDoc = await predictionsCollectionDoc.get();
  if (predictionDoc.exists) {
    const data = predictionDoc.data();
    logger.info(
      "Using cached prediction for",
      address,
      "with predicted price:",
      data.predictedPrice
    );
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
  logger.info("Predicted price for", address, "is", output);
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

exports.tradeScheduled = onSchedule(
  {
    schedule: "every day 13:00",
    timeZone: "Asia/Singapore",
    timeoutSeconds: 300,
    memory: "256MiB",
    maxInstances: 1,
    region: "asia-southeast1",
  },
  async (_) => {
    try {
      // setup blockchain stuff
      const provider = new ethers.JsonRpcProvider(httpURL.value());
      const wallet = new ethers.Wallet(accountPrivateKey.value());
      const signer = wallet.connect(provider);
      const routerContract = new ethers.Contract(
        routerAddress.value(),
        SwapRouter.abi,
        provider
      );
      const poolContract = new ethers.Contract(
        wbtcUsdcPoolAddress.value(),
        IUniswapV3Pool.abi,
        provider
      );
      const wbtcDecimal = 8;
      const usdcDecimal = 6;
      const usdcContract = new ethers.Contract(
        usdcAddress.value(),
        erc20Abi,
        provider
      );
      const wbtcContract = new ethers.Contract(
        wbtcAddress.value(),
        erc20Abi,
        provider
      );

      // get predicted price
      const timestamp = getTimeStamp();
      const output = await fetchPredictedPrice(
        accountAddress.value(),
        timestamp
      );

      const fetchWBTCPrice = async (inputAmount) => {
        const slot0 = await poolContract.slot0();
        const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(Number(slot0[1]));
        const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96);
        const baseAmount = JSBI.BigInt(inputAmount * 10 ** wbtcDecimal);
        const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192));
        const quoteAmount = FullMath.mulDivRoundingUp(
          ratioX192,
          baseAmount,
          shift
        );
        return quoteAmount;
      };

      // logic to perform swap
      const swap = async (tokenInContract, tokenOutContract) => {
        const tokenInBalance = await tokenInContract.balanceOf(signer.address);
        const routerAddress = await routerContract.getAddress();

        const tx1 = await tokenInContract
          .connect(signer)
          .approve(routerAddress, tokenInBalance);
        await tx1.wait();

        const tokenInAddress = await tokenInContract.getAddress();
        const tokenOutAddress = await tokenOutContract.getAddress();

        const tx2 = await routerContract.connect(signer).exactInputSingle({
          tokenIn: tokenInAddress,
          tokenOut: tokenOutAddress,
          fee: FeeAmount.MEDIUM,
          recipient: signer.address,
          deadline: Math.floor(Date.now() / 1000) + 60 * 10,
          amountIn: tokenInBalance,
          amountOutMinimum: 0,
          sqrtPriceLimitX96: 0,
        });
        return tx2.wait();
      };

      const predictedBtcPrice = JSBI.BigInt(output);
      const wbtcPrice = await fetchWBTCPrice(1);
      logger.info(
        "Predicted BTC Price:",
        predictedBtcPrice.toString(),
        "WBTC Price:",
        wbtcPrice.toString()
      );
      const diff = JSBI.subtract(predictedBtcPrice, wbtcPrice);
      const fifty = JSBI.BigInt(50 * 10 ** usdcDecimal);
      const nFify = JSBI.BigInt(-50 * 10 ** usdcDecimal);
      const formattedDiff = ethers.formatUnits(diff.toString(), usdcDecimal);

      let usdcBalance = await usdcContract.balanceOf(signer.address);
      let wbtcBalance = await wbtcContract.balanceOf(signer.address);
      let formattedUSDCBalance = ethers.formatUnits(usdcBalance, usdcDecimal);
      let formattedWBTCBalance = ethers.formatUnits(wbtcBalance, wbtcDecimal);

      /**
       * 1 - no trade performed
       * 2 - swap WBTC to USDC
       * 3 - swap USDC to WBTC
       */
      const trade = await (async () => {
        if (JSBI.greaterThan(diff, fifty) && usdcBalance > 0) {
          logger.info(
            `Swap USDC to WBTC where diff is ${formattedDiff} and WBTC balance is ${formattedWBTCBalance}`
          );
          await swap(usdcContract, wbtcContract);
          return 3;
        }
        if (JSBI.lessThan(diff, nFify) && wbtcBalance > 0) {
          logger.info(
            `Swap WBTC to USDC where diff is ${formattedDiff} and USDC balance is ${formattedUSDCBalance}`
          );
          await swap(wbtcContract, usdcContract);
          return 2;
        }
        logger.info(
          `No swap needed where diff is ${formattedDiff} and USDC balance is ${formattedUSDCBalance} and WBTC balance is ${formattedWBTCBalance}`
        );
        return 1;
      })();

      usdcBalance = await usdcContract.balanceOf(signer.address);
      wbtcBalance = await wbtcContract.balanceOf(signer.address);
      formattedUSDCBalance = ethers.formatUnits(usdcBalance, usdcDecimal);
      formattedWBTCBalance = ethers.formatUnits(wbtcBalance, wbtcDecimal);
      logger.info(
        "Account Address",
        accountAddress.value(),
        "USDC Balance:",
        formattedUSDCBalance,
        "WBTC Balance:",
        formattedWBTCBalance
      );

      await fs
        .firestore()
        .collection("account")
        .doc(accountAddress.value())
        .collection("trades")
        .doc(timestamp.toString())
        .set({
          predictedBtcPrice: predictedBtcPrice.toString(),
          wbtcPrice: wbtcPrice.toString(),
          trade,
          usdcBalance: usdcBalance.toString(),
          wbtcBalance: wbtcBalance.toString(),
          timestamp,
        });

      // send telegram message
      const bot = new TelegramBot(telegramApiToken.value(), { polling: true });
      await bot.sendMessage(
        telegramChatId.value(),
        `Bitcoin Price Prediction (${formatDateDDMMYYYY()})\n\nPrediction: ${ethers.formatEther(
          predictedBtcPrice.toString(),
          wbtcDecimal
        )}\nCurrent: ${ethers.formatEther(wbtcPrice.toString(), wbtcDecimal)}`
      );
    } catch (error) {
      logger.error(error);
    }
  }
);
