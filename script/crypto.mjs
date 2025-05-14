import dotenv from "dotenv";
import { ethers } from "ethers";
import { FullMath, TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";

dotenv.config();

const ROUTER_ABI = [
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

async function wbtcPrice() {
  const provider = new ethers.JsonRpcProvider(process.env.HTTP_URL);

  const stateViewContract = new ethers.Contract(
    process.env.STATEVIEW_ADDRESS,
    STATEVIEW_ABI,
    provider
  );
  const address = await stateViewContract.getAddress();
  console.log(address);
  const tokenContract = new ethers.Contract(
    process.env.WBTC_ADDRESS,
    ERC20_ABI,
    provider
  );
  const decimals = await tokenContract.decimals();

  const slot0 = await stateViewContract.getSlot0(process.env.POOL_ID);
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(Number(slot0[1]));
  const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96);
  const baseAmount = JSBI.BigInt(1 * 10 ** Number(decimals));
  const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192));
  const quoteAmount = FullMath.mulDivRoundingUp(ratioX192, baseAmount, shift);
  const formattedQuoteAmount = ethers.formatUnits(quoteAmount.toString(), 6);
  console.log("WBTC Price:", formattedQuoteAmount);
  return quoteAmount;
}

async function allowance() {
  const provider = new ethers.JsonRpcProvider(process.env.HTTP_URL);

  const permit2Contract = new ethers.Contract(
    process.env.PERMIT2_ADDRESS,
    PERMIT2_ABI,
    provider
  );

  const wbtcAllowance = await permit2Contract.allowance(
    process.env.ACCOUNT_ADDRESS,
    process.env.WBTC_ADDRESS,
    process.env.UNIVERSAL_ROUTER_ADDRESS
  );

  const usdcAllowance = await permit2Contract.allowance(
    process.env.ACCOUNT_ADDRESS,
    process.env.USDC_ADDRESS,
    process.env.UNIVERSAL_ROUTER_ADDRESS
  );

  return {
    wbtcAllowance: {
      amount: wbtcAllowance[0].toString(),
      expiration: wbtcAllowance[1].toString(),
      nonce: wbtcAllowance[2].toString(),
    },
    usdcAllowance: {
      amount: usdcAllowance[0].toString(),
      expiration: usdcAllowance[1].toString(),
      nonce: usdcAllowance[2].toString(),
    },
  };
}

async function approve(tokenAddress) {
  const provider = new ethers.JsonRpcProvider(process.env.HTTP_URL);
  const wallet = new ethers.Wallet(process.env.ACCOUNT_PRIVATE_KEY, provider);

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const permit2Contract = new ethers.Contract(
    process.env.PERMIT2_ADDRESS,
    PERMIT2_ABI,
    wallet
  );

  const decimals = await tokenContract.decimals();
  const maxApproval = ethers.utils.parseUnits("1000000000", decimals);

  // Approve Permit2
  const tx1 = await tokenContract.approve(
    process.env.PERMIT2_ADDRESS,
    maxApproval
  );
  await tx1.wait();

  // Approve Universal Router via Permit2
  const tx2 = await permit2Contract.approve(
    process.env.WBTC_ADDRESS,
    process.env.UNIVERSAL_ROUTER_ADDRESS,
    maxApproval,
    Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  );
  await tx2.wait();

  console.log("Approval successful");
}

Promise.resolve()
  .then(wbtcPrice)
  .then((result) => {
    console.log("Result:", result.toString());
  })
  .catch((error) => {
    console.error("Error:", error);
  });
