function App() {
  return (
    <main>
      <header>
        <h1>DefiFolio</h1>
      </header>
      <div>
        <h2>Automated Bitcoin Trading using Price Prediction from AI Model</h2>
        <p>
          DefiFolio is a decentralised bitcoin AI Model that predict BTC price
          and trade automatically on your behalf.
        </p>
        <button>Read the Paper</button>
      </div>
      <div>
        <h2>Performance</h2>
        <p>
          Our AI model outperforms Buy and Hold by over 60% on a $1,000 Bitcoin
          Investment over 2 years of backtesting.
        </p>
        <button>See the performance</button>
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

export default App;
