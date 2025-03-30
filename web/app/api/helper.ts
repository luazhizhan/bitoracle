export enum Trades {
  HOLD = "HOLD",
  BUY = "BUY",
  SELL = "SELL",
}

export const tradeNumberToEnum = (value: number): Trades => {
  switch (value) {
    case 1:
      return Trades.HOLD;
    case 2:
      return Trades.BUY;
    case 3:
      return Trades.SELL;
    default:
      throw new Error("Invalid value for Trades enum");
  }
};

export const usdcDecimals = 6;
export const wbtcDecimals = 8;
