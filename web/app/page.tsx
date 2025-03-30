import Image from "next/image";
import ViewPaperButton from "./components/ViewPaperButton";
import PerformanceChart from "./components/PerformanceChart";

export default function Home() {
  return (
    <main className="w-full h-full flex flex-col justify-center items-center gap-8 py-4 px-4">
      <header className="flex justify-between w-full max-w-[100rem]">
        <h1 className="text-2xl font-semibold">DefiFolio</h1>
        <ViewPaperButton />
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center gap-6 px-2">
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

      <div className="flex flex-col gap-4 justify-center items-center px-2">
        <h2 className="text-4xl font-bold">Performance</h2>
        <p className="text-2xl font-normal text-gray-600 text-center">
          Our AI model outperforms Buy and Hold by over 60% on a $1,000 Bitcoin
          Investment over 2 years of backtesting.
        </p>
        <section className="w-full max-w-[80rem] h-full">
          <PerformanceChart />
        </section>
      </div>
      <div>
        <h2>Price prediction</h2>
        <p>Here are the latest price predictions from our AI model.</p>
        <section>
          <div>
            <h3>2021-10-01</h3>
            <p>Price: $44,000</p>
            <p>Actual: $45,000</p>
          </div>
          <div>
            <h3>2021-10-02</h3>
            <p>Price: $45,000</p>
            <p>Actual: $45,000</p>
          </div>
          <div>
            <h3>2021-10-03</h3>
            <p>Price: $46,000</p>
            <p>Actual: $45,000</p>
          </div>
        </section>
        <button>View all predictions</button>
      </div>
      <div>
        <h2>Live Trading Portfolio</h2>
        <p>
          We are running our model on our decentralised wallet at Arbtrium L2
          Blockchain to trade on a Uniswap V3 USDC/WBTC pool. Here are the daily
          trades made by our model.{" "}
        </p>
        <section>
          <div>
            <h3>2021-10-01</h3>
            <p>balance USDC: $10,000</p>
            <p>balance WBTC: 0.1</p>
            <p>trade: HOLD</p>
          </div>
          <div>
            <h3>2021-10-02</h3>
            <p>balance USDC: $10,000</p>
            <p>balance WBTC: 0.1</p>
            <p>trade: BUY 0.01 WBTC</p>
          </div>
        </section>
        <button>View all trades</button>
      </div>
      <footer>
        <p>© 2025 DefiFolio. All rights reserved.</p>
      </footer>
    </main>
  );
}
