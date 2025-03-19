from cog import BasePredictor, Input
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model

class Predictor(BasePredictor):
    def setup(self):
        self.model = load_model("best_bi_lstm_model.keras")

    def predict(self,
            btcOpen: float = Input(description="BTC Open Price"),
            tenYearOpenPrice: float = Input(description="10 Year Open Price"),
            adaOpenPrice: float = Input(description="Ada Open Price"),
            bnbOpenPrice: float = Input(description="BNB Open Price"),
            btcFearGreedIndex: int = Input(description="BTC Fear Greed Index"),
            btcFeesTotalUSD: float = Input(description="BTC Fees Total USD"),            
            btcSupplyMinerHeldByAllMiningEntitiesUSD: float = Input(description="BTC Supply Miner Held By All Mining Entities USD"),
            btcMinerRevenueUSD: float = Input(description="BTC Miner Revenue USD"),
            btcDifficultyLast: float = Input(description="BTC Difficulty Last"),
            btcHashRateMean: float = Input(description="BTC Hash Rate Mean"),
            btcRevenuePerHashUnitUSD: float = Input(description="BTC Revenue Per Hash Unit USD"),
            btcBlockSizeMeanBytes: float = Input(description="BTC Block Size Mean Bytes"),
            btcCapitalizationMVRVFreeFloat: float = Input(description="BTC Capitalization MVRV Free Float"),
            btcFlowInExchangesUSD: float = Input(description="BTC Flow In Exchanges USD"),
            btcFlowOutExchangesUSD: float = Input(description="BTC Flow Out Exchanges USD"),
            cryptoMarketCap: float = Input(description="Crypto Market Cap"),
            csi300OpenPrice: float = Input(description="CSI300 Open Price"),
            djiOpenPrice: float = Input(description="DJI Open Price"),
            dogeOpenPrice: float = Input(description="DOGE Open Price"),
            dxyOpenPrice: float = Input(description="DXY Open Price"),
            ethOpenPrice: float = Input(description="ETH Open Price"),
            goldOpenPrice: float = Input(description="GOLD Open Price"),
            maticOpenPrice: float = Input(description="MATIC Open Price"),
            nasdaqOpenPrice: float = Input(description="NASDAQ Open Price"),
            nikkie225OpenPrice: float = Input(description="NIKKEI225 Open Price"),
            oilOpenPrice: float = Input(description="OIL Open Price"),
            sAndP500OpenPrice: float = Input(description="S&P500 Open Price"),
            silverOpenPrice: float = Input(description="SILVER Open Price"),
            solOpenPrice: float = Input(description="SOL Open Price")
    ) -> str:
        dataset = [[btcOpen, tenYearOpenPrice, adaOpenPrice, bnbOpenPrice, btcFearGreedIndex, 
                    btcFeesTotalUSD, btcSupplyMinerHeldByAllMiningEntitiesUSD, 
                    btcMinerRevenueUSD, btcDifficultyLast, btcHashRateMean, btcRevenuePerHashUnitUSD, 
                    btcBlockSizeMeanBytes, btcCapitalizationMVRVFreeFloat, btcFlowInExchangesUSD, 
                    btcFlowOutExchangesUSD, cryptoMarketCap, csi300OpenPrice, djiOpenPrice, 
                    dogeOpenPrice, dxyOpenPrice, ethOpenPrice, goldOpenPrice, maticOpenPrice, nasdaqOpenPrice, 
                    nikkie225OpenPrice, oilOpenPrice, sAndP500OpenPrice, silverOpenPrice, solOpenPrice]]

        data = pd.DataFrame(dataset, columns=["Open", "10YR Open Price", "ADA Open Price", "BNB Open Price", 
                                              "BTC Fear Greed Index", "BTC / Fees, total, USD", 
                                              "BTC / Supply, Miner, held by all mining entities, USD", 
                                              "BTC / Miner revenue, USD", "BTC / Difficulty, last", "BTC / Hash rate, mean", 
                                              "BTC / Revenue, per hash unit, USD", "BTC / Block, size, mean, bytes", "BTC / Capitalization, MVRV, free float", 
                                              "BTC / Flow, in, to exchanges, USD", "BTC / Flow, out, from exchanges, USD",
                                              "Crypto Market Cap", "CSI300 Open Price", "DJI Open Price", "DOGE Open Price", 
                                              "DXY Open Price", "ETH Open Price", "GOLD Open Price", "MATIC Open Price", 
                                              "NASDAQ Open Price", "NIKKEI225 Open Price", "OIL Open Price", "S&P500 Open Price", 
                                              "SILVER Open Price", "SOL Open Price"])
        scaler = MinMaxScaler(feature_range=(0, 1))
        data = scaler.fit_transform(data)
        data = data.reshape((data.shape[0], 1, data.shape[1]))
        prediction = self.model.predict(data)
        data = data.reshape((data.shape[0], data.shape[2]))
        inv_prediction = np.concatenate((prediction, data[:, 1:]), axis=1)
        inv_prediction = scaler.inverse_transform(inv_prediction)
        inv_prediction = inv_prediction[:,0]

        formatted_prediction = inv_prediction[0] * (10 ** 6) # USDC has 6 decimals
        formatted_prediction = str(int(formatted_prediction))

        return formatted_prediction
