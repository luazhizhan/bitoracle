const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineString } = require("firebase-functions/params");
const fs = require("firebase-admin");
const JSBI = require("jsbi");
const { TickMath, FullMath, FeeAmount } = require("@uniswap/v3-sdk");
const { ethers } = require("ethers");
const Replicate = require("replicate");
const logger = require("firebase-functions/logger");
const TelegramBot = require("node-telegram-bot-api");

//#region environment variables
const httpURL = defineString("HTTP_URL");
const replicateModel = defineString("REPLICATE_MODEL");
const replicateApiToken = defineString("REPLICATE_API_TOKEN");
const accountAddress = defineString("ACCOUNT_ADDRESS");
const accountPrivateKey = defineString("ACCOUNT_PRIVATE_KEY");
const wbtcAddress = defineString("WBTC_ADDRESS");
const usdcAddress = defineString("USDC_ADDRESS");
const universalRouterAddress = defineString("UNIVERSAL_ROUTER_ADDRESS");
const poolId = defineString("POOL_ID");
const stateViewAddress = defineString("STATEVIEW_ADDRESS");
const permit2Address = defineString("PERMIT2_ADDRESS");
// #endregion

//#region datetime functions
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
// #endregion

//#region smart contract functions
const UNIVERSAL_ROUTER_ABI = [
  "function execute(bytes calldata commands, bytes[] calldata inputs) public payable",
];
const PERMIT2_ABI = [
  "function approve(address token, address spender, uint160 amount, uint48 expiration) external",
  "function allowance(address user, address token, address spender) external view returns (uint160 amount, uint48 expiration, uint48 nonce)",
];
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

async function hasPermit2Approval(tokenAddress, provider, signer) {
  const permit2Contract = new ethers.Contract(
    permit2Address.value(),
    PERMIT2_ABI,
    provider
  );

  // accepts [user, token, address]
  // returns [amount, expiration, nonce] in bigNumber
  const allowance = await permit2Contract
    .connect(signer)
    .allowance(
      accountAddress.value(),
      tokenAddress,
      universalRouterAddress.value()
    );

  // before expiration
  if (getTimeStamp() < Number(allowance[1])) return true;
  return false;
}

async function approveToken(tokenContract, provider, signer) {
  const permit2Contract = new ethers.Contract(
    permit2Address.value(),
    PERMIT2_ABI,
    provider
  );
  const decimals = await tokenContract.decimals();
  const maxApproval = ethers.utils.parseUnits("1000000000", decimals);

  // Approve Permit2
  const tokenTx = await tokenContract
    .connect(signer)
    .approve(permit2Address.value(), maxApproval);
  await tokenTx.wait();

  const tokenIn = await tokenContract.getAddress();

  // Approve Universal Router via Permit2
  const permit2Tx = await permit2Contract
    .connect(signer)
    .approve(
      tokenIn,
      universalRouterAddress.value(),
      maxApproval,
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    );
  await permit2Tx.wait();
}

async function swap(tokenInContract, tokenOutContract, provider, signer) {
  const tokenInBalance = await tokenInContract.balanceOf(signer.address);
  const router = new ethers.Contract(
    universalRouterAddress.value(),
    UNIVERSAL_ROUTER_ABI,
    provider
  );
  const tokenInAddress = await tokenInContract.getAddress();
  const tokenOutAddress = await tokenOutContract.getAddress();

  const approval = hasPermit2Approval(tokenInAddress, provider, signer);
  if (!approval) {
    await approveToken(tokenInContract, provider, signer);
  }

  const poolKey = {
    currency0: tokenInAddress, // address
    currency1: tokenOutAddress, // address
    fee: FeeAmount.MEDIUM, // uint24
    tickSpacing: 60, // int24
    hooks: "0x0000000000000000000000000000000000000000", // address (no hooks)
  };
  const commands = ethers.solidityPacked(["uint8"], [0x10]);
  const actions = ethers.solidityPacked(
    ["uint8", "uint8", "uint8"],
    [0x06, 0x0c, 0x0f] // Actions: SWAP_EXACT_IN_SINGLE, SETTLE_ALL, TAKE_ALL
  );
  const abiCoder = new ethers.AbiCoder();
  const exactInputSingleParams = abiCoder.encode(
    [
      "tuple(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, bool zeroForOne, uint128 amountIn, uint128 amountOutMinimum, bytes hookData)",
    ],
    [
      {
        poolKey,
        zeroForOne: true, // Swap tokenIn -> tokenOut
        amountIn: tokenInBalance, // uint128
        amountOutMinimum: BigInt(0), // uint128
        hookData: "0x", // bytes (empty)
      },
    ]
  );
  const params = [
    exactInputSingleParams,
    abiCoder.encode(
      ["address", "uint128"],
      [poolKey.currency0, tokenInBalance]
    ),
    abiCoder.encode(["address", "uint128"], [poolKey.currency1, 0]),
  ];
  const inputs = [abiCoder.encode(["bytes", "bytes[]"], [actions, params])];

  const tx = await router
    .connect(signer)
    .execute(commands, inputs, { value: 0 });
  await tx.wait();
}
//#endregion

exports.tradeScheduled = onSchedule(
  {
    schedule: "every day 13:00",
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
      const wallet = new ethers.Wallet(accountPrivateKey.value());
      const signer = wallet.connect(provider);

      // get wbtc and predicted prices
      const timestamp = getTimeStamp();
      const output = await fetchPredictedPrice(
        accountAddress.value(),
        timestamp
      );
      const predictedBtcPrice = JSBI.BigInt(output);
      const wbtcPrice = await fetchWbtcPrice();

      logger.info(
        "Predicted BTC Price:",
        predictedBtcPrice.toString(),
        "WBTC Price:",
        wbtcPrice.toString()
      );

      const diff = JSBI.subtract(predictedBtcPrice, wbtcPrice);
      const five = JSBI.BigInt(5 * 10 ** usdcDecimal);
      const nFive = JSBI.BigInt(-5 * 10 ** usdcDecimal);
      const formattedDiff = ethers.formatUnits(diff.toString(), usdcDecimal);

      const usdcContract = new ethers.Contract(
        usdcAddress.value(),
        ERC20_ABI,
        provider
      );
      const wbtcContract = new ethers.Contract(
        wbtcAddress.value(),
        ERC20_ABI,
        provider
      );
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
        if (JSBI.greaterThan(diff, five) && usdcBalance > 0) {
          logger.info(
            `Swap USDC to WBTC where diff is ${formattedDiff} and WBTC balance is ${formattedWBTCBalance}`
          );
          await swap(usdcContract, wbtcContract, provider, signer);
          return 3;
        }
        if (JSBI.lessThan(diff, nFive) && wbtcBalance > 0) {
          logger.info(
            `Swap WBTC to USDC where diff is ${formattedDiff} and USDC balance is ${formattedUSDCBalance}`
          );
          await swap(wbtcContract, usdcContract, provider, signer);
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
        `*${formatDateDDMMYYYY()}* \nPrediction: $${Number(
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
