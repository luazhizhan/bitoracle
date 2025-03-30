import JSBI from "jsbi";
import { db } from "../firebase";
import { ethers } from "ethers";
import { fetchBTCPrices } from "../apis";
import { tradeNumberToEnum, usdcDecimals, wbtcDecimals } from "../helper";

export async function GET() {
  // Fetch the latest 5 predictions and trades from Firestore
  const predictionResults = await db
    .collection("predictions")
    .orderBy("timestamp", "desc")
    .limit(5)
    .get();
  const { docs: predictionDocs } = predictionResults;

  const actualPrices = await fetchBTCPrices();

  let i = actualPrices.length - 1;
  const predictions = predictionDocs.map((doc) => {
    const { predictedPrice, timestamp } = doc.data();
    const predictedBtcPrice = JSBI.BigInt(predictedPrice);
    const formattedPredictedPrice = ethers.formatUnits(
      predictedBtcPrice.toString(),
      usdcDecimals
    );
    return {
      actual: actualPrices[i--][1].toString(),
      predicted: formattedPredictedPrice,
      timestamp,
      id: doc.id,
    };
  });

  // Fetch the latest 5 trades from Firestore
  const tradesResults = await db
    .collection("account")
    .doc(process.env.NEXT_PUBLIC_TRADING_ACCOUNT_ADDRESS || "")
    .collection("trades")
    .orderBy("timestamp", "desc")
    .limit(5)
    .get();
  i = actualPrices.length - 1;
  const trades = tradesResults.docs.map((doc) => {
    const data = doc.data();
    const formattedWbtcBalance = ethers.formatUnits(
      JSBI.BigInt(data.wbtcBalance).toString(),
      wbtcDecimals
    );
    const formattedUsdcBalance = ethers.formatUnits(
      JSBI.BigInt(data.usdcBalance).toString(),
      usdcDecimals
    );
    const totalBalance =
      Number(formattedWbtcBalance) * actualPrices[actualPrices.length - 1][1] +
      Number(formattedUsdcBalance);
    return {
      balance: {
        usdc: formattedUsdcBalance,
        wbtc: formattedWbtcBalance,
      },
      totalBalanceInUSD: totalBalance.toString(),
      trade: tradeNumberToEnum(data.trade).toString(),
      timestamp: data.timestamp,
      id: doc.id,
    };
  });

  return new Response(
    JSON.stringify({
      predictions,
      trades,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate",
      },
    }
  );
}
