import { useState } from "react";
import { ethers } from "ethers";

// Universal Router and Permit2 Addresses (Change accordingly)
const UNIVERSAL_ROUTER_ADDRESS = "0x1095692A6237d83C6a72F3F5eFEdb9A670C49223";
const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

// ERC20 ABI (for approve function)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

// Permit2 ABI
const PERMIT2_ABI = [
  "function approve(address token, address spender, uint160 amount, uint48 expiration) external",
];
// Router ABI
const ROUTER_ABI = [
  "function execute(bytes calldata commands, bytes[] calldata inputs) public payable",
];

function SwapComponent() {
  const [tokenIn, setTokenIn] = useState(
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"
  );
  const [tokenOut, setTokenOut] = useState(
    "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39"
  );
  const [amount, setAmount] = useState("1000000");
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    setWallet(provider.getSigner());
    setProvider(provider);
  };

  const approveToken = async () => {
    if (!wallet || !tokenIn) return alert("Connect wallet and enter token");
    const tokenContract = new ethers.Contract(tokenIn, ERC20_ABI, wallet);
    const permit2Contract = new ethers.Contract(
      PERMIT2_ADDRESS,
      PERMIT2_ABI,
      wallet
    );
    const decimals = await tokenContract.decimals();
    console.log({ decimals });
    const maxApproval = ethers.utils.parseUnits("1000000000", decimals);
    console.log({ maxApproval: Number(maxApproval) });
    // Approve Permit2
    const tx1 = await tokenContract.approve(PERMIT2_ADDRESS, maxApproval);
    await tx1.wait();

    // Approve Universal Router via Permit2
    const tx2 = await permit2Contract.approve(
      tokenIn,
      UNIVERSAL_ROUTER_ADDRESS,
      maxApproval,
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    );
    await tx2.wait();

    alert("Approval successful");
  };

  const swapTokens = async () => {
    if (!wallet || !tokenIn || !tokenOut || !amount)
      return alert("Fill all fields");

    const router = new ethers.Contract(
      UNIVERSAL_ROUTER_ADDRESS,
      ROUTER_ABI,
      wallet
    );

    console.log({ wallet, tokenIn, tokenOut, amount });

    // Define PoolKey
    const poolKey = {
      currency0: tokenIn, // address
      currency1: tokenOut, // address
      fee: 3000, // uint24
      tickSpacing: 60, // int24
      hooks: "0x0000000000000000000000000000000000000000", // address (no hooks)
    };

    // Encode the Universal Router command
    const commands = ethers.utils.solidityPack(["uint8"], [0x10]); // SWAP_EXACT_IN_SINGLE

    // Encode swap actions
    const actions = ethers.utils.solidityPack(
      ["uint8", "uint8", "uint8"],
      [0x06, 0x0c, 0x0f] // Actions: SWAP_EXACT_IN_SINGLE, SETTLE_ALL, TAKE_ALL
    );

    // Define ExactInputSingleParams
    const exactInputSingleParams = ethers.utils.defaultAbiCoder.encode(
      [
        "tuple(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, bool zeroForOne, uint128 amountIn, uint128 amountOutMinimum, bytes hookData)",
      ],
      [
        {
          poolKey,
          zeroForOne: true, // Swap tokenIn -> tokenOut
          amountIn: ethers.BigNumber.from(amount), // uint128
          amountOutMinimum: ethers.BigNumber.from(0), // uint128
          hookData: "0x", // bytes (empty)
        },
      ]
    );

    const params = [
      exactInputSingleParams,
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint128"],
        [poolKey.currency0, amount]
      ),
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint128"],
        [poolKey.currency1, 0]
      ),
    ];

    const inputs = [
      ethers.utils.defaultAbiCoder.encode(
        ["bytes", "bytes[]"],
        [actions, params]
      ),
    ];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5-minute expiry

    console.log({ commands, inputs });

    const tx = await router.execute(commands, inputs, { value: 0 });
    await tx.wait();

    alert("Swap Successful");
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Uniswap v4 Swap</h2>
      <button
        onClick={connectWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {wallet ? "Wallet Connected" : "Connect Wallet"}
      </button>
      <input
        type="text"
        placeholder="Token In Address"
        value={tokenIn}
        onChange={(e) => setTokenIn(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        placeholder="Token Out Address"
        value={tokenOut}
        onChange={(e) => setTokenOut(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={approveToken}
        className="bg-green-500 text-white px-4 py-2 rounded mb-2"
      >
        Approve
      </button>
      <button
        onClick={swapTokens}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Swap
      </button>
    </div>
  );
}

export default SwapComponent;
