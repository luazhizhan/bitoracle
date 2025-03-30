export const fetchBTCPrices = async (
  id: string = "bitcoin",
  currency: string = "usd",
  days: 1 | 14 | 30 | "max" = 14,
  interval = "daily"
) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${days}&interval=${interval}`
  );
  const data = await response.json();
  return data.prices;
};
