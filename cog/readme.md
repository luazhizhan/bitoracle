# replicate

Deploye model to replicate serverless cloud

## Installation

See https://github.com/replicate/cog?tab=readme-ov-file#how-it-works

Get `best_bi_lstm_model.keras` from onedrive and place it in this folder

## Deploy

Create new model at https://replicate.com/

Login

```

cog login

```

Push

```

cog push r8.im/luazhizhan/defifolio-paper

```

## Test

sample data to test

```json
{
  "btcOpen": 67404.53,
  "tenYearOpenPrice": 4.404,
  "adaOpenPrice": 0.4243173,
  "bnbOpenPrice": 607.943,
  "btcFearGreedIndex": 72,
  "btcFeesTotalUSD": 2927841.9142650114,
  "btcSupplyMinerHeldByAllMiningEntitiesUSD": 120439296265.40547,
  "btcMinerRevenueUSD": 28822518.199548658,
  "btcDifficultyLast": 83716654861184.52,
  "btcHashRateMean": 511874032.7312927,
  "btcRevenuePerHashUnitUSD": 6.51711e-7,
  "btcBlockSizeMeanBytes": 1571309.9349593497,
  "btcCapitalizationMVRVFreeFloat": 1.538412372643,
  "btcFlowInExchangesUSD": 1511698720.4951978,
  "btcFlowOutExchangesUSD": 1730842670.908319,
  "cryptoMarketCap": 38204697.194754295,
  "csi300OpenPrice": 3536.8506,
  "djiOpenPrice": 38747.42,
  "dogeOpenPrice": 0.13879022,
  "dxyOpenPrice": 105.267,
  "ethOpenPrice": 3510.278,
  "goldOpenPrice": 2330.9,
  "maticOpenPrice": 0.6232443,
  "nasdaqOpenPrice": 17343.547,
  "nikkie225OpenPrice": 38884.54,
  "oilOpenPrice": 78.36,
  "sAndP500OpenPrice": 5375.32,
  "silverOpenPrice": 29.55,
  "solOpenPrice": 149.687
}
```

Command to test

```bash
cog predict -i btcOpen=69121.304688 -i tenYearOpenPrice=4.418 -i adaOpenPrice=0.48313 -i bnbOpenPrice=614.671875 \
-i btcFearGreedIndex=76 -i btcFeesTotalUSD=1470202.273 -i btcSupplyMinerHeldByAllMiningEntitiesUSD=123574000000.0 \
-i btcMinerRevenueUSD=34496645.59 -i btcDifficultyLast=83148400000000.0 -i btcHashRateMean=632399054.8 \
-i btcRevenuePerHashUnitUSD=0.0000000631353 -i btcBlockSizeMeanBytes=1654761.111 \
-i btcCapitalizationMVRVFreeFloat=1.619017494 -i btcFlowInExchangesUSD=2005791750.0 \
-i btcFlowOutExchangesUSD=1967831461.0 -i googleBTCTrend=34 -i cryptoMarketCap=2612954699072.72 \
-i csi300OpenPrice=3672.840088 -i djiOpenPrice=39694.949219 -i dogeOpenPrice=0.166163 \
-i dxyOpenPrice=104.900002 -i ethOpenPrice=3737.178467 -i goldOpenPrice=2371.199951 \
-i maticOpenPrice=0.722946 -i nasdaqOpenPrice=16996.390625 -i nikkie225OpenPrice=38803.128906 \
-i oilOpenPrice=77.290001 -i sAndP500OpenPrice=5340.259766 -i silverOpenPrice=30.344999 \
-i solOpenPrice=176.863113
```
