import Image from "next/image";
import ViewPaperButton from "./components/ViewPaperButton";
import PerformanceChart from "./components/PerformanceChart";
import { MdiOpenInNew } from "./components/assets/MdiOpenInNew";
import Link from "next/link";

export default async function Home() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/home`);
  const { predictions, trades } = await response.json();
  return (
    <main className="w-full h-full flex flex-col justify-center items-center gap-12 py-4 px-4">
      {/* Header */}
      <header className="flex justify-between items-center w-full max-w-[100rem]">
        <h1 className="text-2xl font-semibold">DefiFolio</h1>
        <ViewPaperButton />
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center gap-6 px-2 w-full max-w-[80rem]">
        <h2 className="text-5xl font-bold text-center leading-snug">
          Automated Bitcoin Trading using Price Prediction from{" "}
          <span className="text-blue-400">AI Model</span>
        </h2>
        <p className="text-2xl font-normal text-gray-600 text-center">
          DefiFolio is a decentralised bitcoin AI Model that predict BTC price
          and trade automatically on your behalf.
        </p>
        <ViewPaperButton />
        <Image
          className="w-full max-w-[60rem] h-auto"
          width={100}
          height={100}
          src="/hero.svg"
          alt="Hero Image"
        />
      </div>

      {/* Back-tested Performance */}
      <div className="flex flex-col gap-4 justify-center items-center px-2 w-full max-w-[80rem]">
        <h2 className="text-4xl font-bold">Performance</h2>
        <p className="text-2xl font-normal text-gray-600 text-center">
          Our AI model outperforms Buy and Hold by over 60% on a $1,000 Bitcoin
          Investment over 2 years of backtesting.
        </p>
        <div className="w-full h-full">
          <PerformanceChart />
        </div>
      </div>

      {/* Price Prediction */}
      <div className="flex flex-col gap-4 justify-center items-center px-2 w-full max-w-[80rem]">
        <h2 className="text-4xl font-bold">Price Prediction</h2>
        <p className="text-2xl font-normal text-gray-600 text-center">
          Here are the latest price predictions from our AI model.
        </p>
        <div className="w-full mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {predictions.map(
              (p: {
                actual: string;
                predicted: string;
                timestamp: number;
                id: string;
              }) => (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-lg shadow-md border border-gray-100 flex flex-col"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {new Date(p.timestamp * 1000).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-gray-700 mb-1">
                    Prediction:{" "}
                    <span className="font-semibold text-blue-400">
                      ${Number(p.predicted).toFixed(2)}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    Actual:{" "}
                    <span className="font-medium">
                      ${Number(p.actual).toFixed(2)}
                    </span>
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Live Trading Portfolio */}
      <div className="flex flex-col gap-4 justify-center items-center px-2 w-full max-w-[80rem]">
        <h2 className="text-4xl font-bold">Live Trading Portfolio</h2>
        <p className="text-2xl font-normal text-gray-600 text-center">
          We are running our model on our decentralised wallet at Arbitrium L2
          Blockchain to trade on a Uniswap V3 USDC/WBTC pool. Here are the daily
          trades made by our model.
        </p>
        <div className="w-full mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {trades.map(
              (trade: {
                balance: {
                  usdc: string;
                  wbtc: string;
                };
                totalBalanceInUSD: string;
                trade: string;
                timestamp: number;
                id: string;
              }) => (
                <div
                  key={trade.id}
                  className="bg-white p-5 rounded-lg shadow-md border border-gray-100 flex flex-col"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {new Date(trade.timestamp * 1000).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </h3>
                  <p className="text-gray-700 mb-1">
                    USDC:{" "}
                    <span className="font-medium">
                      {Number(trade.balance.usdc)}
                    </span>
                  </p>
                  <p className="text-gray-700 mb-1">
                    WBTC:{" "}
                    <span className="font-medium">
                      {Number(trade.balance.wbtc)}
                    </span>
                  </p>
                  <p className="text-gray-700 mb-1">
                    Balance:{" "}
                    <span className="font-semibold">
                      ${Number(trade.totalBalanceInUSD).toFixed(2)}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    Action:{" "}
                    <span className="font-semibold text-blue-400">
                      {trade.trade}
                    </span>
                  </p>
                </div>
              )
            )}
          </div>
        </div>
        <Link
          href={`https://arbiscan.io/address/${process.env.NEXT_PUBLIC_TRADING_ACCOUNT_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 bg-blue-400 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-4xl transition-colors cursor-pointer flex items-center gap-2"
        >
          <MdiOpenInNew height={20} width={20} />
          View Wallet
        </Link>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[80rem] mt-8 py-6 px-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <h3 className="text-xl font-semibold">DefiFolio</h3>
          </div>
          <p className="text-gray-600">
            © 2025 DefiFolio. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
