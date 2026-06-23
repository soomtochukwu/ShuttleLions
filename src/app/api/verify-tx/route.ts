import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import {
  mainnet, polygon, arbitrum, optimism, base, avalanche, bsc,
  fantom, gnosis, celo, linea, scroll, mantle, blast, mode,
  manta, zkSync, polygonZkEvm, opBNB,
} from "viem/chains";
import { supabase } from "@/lib/supabase";
import { RECEIVER_ADDRESS } from "@/lib/web3";
import type { Chain } from "viem";

// Map chain IDs to chain configs
const CHAIN_MAP: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [polygon.id]: polygon,
  [arbitrum.id]: arbitrum,
  [optimism.id]: optimism,
  [base.id]: base,
  [avalanche.id]: avalanche,
  [bsc.id]: bsc,
  [fantom.id]: fantom,
  [gnosis.id]: gnosis,
  [celo.id]: celo,
  [linea.id]: linea,
  [scroll.id]: scroll,
  [mantle.id]: mantle,
  [blast.id]: blast,
  [mode.id]: mode,
  [manta.id]: manta,
  [zkSync.id]: zkSync,
  [polygonZkEvm.id]: polygonZkEvm,
  [opBNB.id]: opBNB,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash, linkId, chainId, tokenAddress, expectedAmount } = body;

    if (!txHash || !linkId || !chainId) {
      return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 });
    }

    const chain = CHAIN_MAP[chainId];
    if (!chain) {
      return NextResponse.json({ error: "Unsupported chain", success: false }, { status: 400 });
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Get receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt || receipt.status !== "success") {
      return NextResponse.json({ error: "Transaction not confirmed", success: false }, { status: 400 });
    }

    let verified = false;

    if (tokenAddress === "native") {
      // Verify native transfer
      const tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` });
      if (
        tx.to?.toLowerCase() === RECEIVER_ADDRESS.toLowerCase() &&
        tx.value >= BigInt(expectedAmount || "0")
      ) {
        verified = true;
      }
    } else {
      // Verify ERC-20 Transfer event
      const transferEvent = parseAbiItem(
        "event Transfer(address indexed from, address indexed to, uint256 value)"
      );

      const logs = await publicClient.getLogs({
        address: tokenAddress as `0x${string}`,
        event: transferEvent,
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      verified = logs.some(
        (log) =>
          log.args.to?.toLowerCase() === RECEIVER_ADDRESS.toLowerCase() &&
          (log.args.value ?? BigInt(0)) >= BigInt(expectedAmount || "0")
      );
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Payment not verified", success: false },
        { status: 400 }
      );
    }

    // Update Supabase
    const { error } = await supabase
      .from("requests")
      .update({ status: "rejected_paid", payment_tx_hash: txHash })
      .eq("id", linkId);

    if (error) console.error("Supabase update error:", error);

    return NextResponse.json({ success: true, status: "rejected_paid" });
  } catch (err) {
    console.error("Verify TX error:", err);
    return NextResponse.json({ error: "Verification failed", success: false }, { status: 500 });
  }
}
