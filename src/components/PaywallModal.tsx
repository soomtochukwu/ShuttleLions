"use client";

import { useState, useEffect, useCallback } from "react";
import {
    useConnect,
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
    useSendTransaction,
    useSwitchChain,
} from "wagmi";
import { ComicButton } from "./ui/ComicButton";
import { ComicModal } from "./ui/ComicModal";
import {
    RECEIVER_ADDRESS,
    CHAIN_CONFIGS,
    ERC20_ABI,
    formatTokenBalance,
    scanAllChains,
    type ChainToken,
} from "@/lib/web3";

import { motion } from "framer-motion";
import type { Chain } from "viem";

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentComplete: (txHash: string) => void;
    linkId: string;
}

interface DiscoveredAsset {
    chain: Chain;
    chainIcon: string;
    token: ChainToken & { balance: bigint; hasEnough: boolean };
}

export function PaywallModal({
    isOpen,
    onClose,
    onPaymentComplete,
    linkId,
}: PaywallModalProps) {
    const [step, setStep] = useState<
        "info" | "connect" | "scanning" | "select" | "switching" | "paying" | "verifying" | "done" | "error"
    >("info");
    const [selectedAsset, setSelectedAsset] = useState<DiscoveredAsset | null>(null);
    const [allAssets, setAllAssets] = useState<DiscoveredAsset[]>([]);
    const [scanProgress, setScanProgress] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [verificationDone, setVerificationDone] = useState(false);

    const { connectors, connect } = useConnect();
    const { address, isConnected } = useAccount();
    const { switchChainAsync } = useSwitchChain();

    // ERC-20 token payment
    const {
        writeContract,
        data: erc20TxHash,
        isPending: isErc20Pending,
        error: erc20Error,
        reset: resetErc20,
    } = useWriteContract();

    // Native EVM payment
    const {
        sendTransaction,
        data: nativeTxHash,
        isPending: isNativePending,
        error: nativeError,
        reset: resetNative,
    } = useSendTransaction();

    const txHash = erc20TxHash || nativeTxHash;
    const isPending = isErc20Pending || isNativePending;
    const txError = erc20Error || nativeError;

    // Wait for on-chain confirmation
    const { isLoading: isConfirming, isSuccess: isTxConfirmed } =
        useWaitForTransactionReceipt({
            hash: txHash,
            confirmations: 2,
        });

    // ─── Scan all chains when wallet connects ────────────
    useEffect(() => {
        if (!address || !isConnected) return;
        if (step !== "connect" && step !== "scanning") return;

        setStep("scanning");

        const scan = async () => {
            const discoveredAssets: DiscoveredAsset[] = [];

            // Scan EVM chains in parallel
            setScanProgress("Scanning 19 EVM chains...");
            try {
                const evmResults = await scanAllChains(address);

                for (const result of evmResults) {
                    for (const token of result.tokens) {
                        if (token.balance > BigInt(0)) {
                            discoveredAssets.push({
                                chain: result.chain,
                                chainIcon: result.chainIcon,
                                token,
                            });
                        }
                    }
                }
            } catch (e) {
                console.error("EVM scan error:", e);
            }


            // Sort: sufficient balance first, then by type
            discoveredAssets.sort((a, b) => {
                const aEnough = a.token.hasEnough ? 1 : 0;
                const bEnough = b.token.hasEnough ? 1 : 0;
                if (aEnough !== bEnough) return bEnough - aEnough;
                return 0;
            });

            setAllAssets(discoveredAssets);
            setStep("select");
        };

        scan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, isConnected]);

    // ─── Handle payment ──────────────────────────────────
    const handlePay = useCallback(async () => {
        if (!selectedAsset) return;

        // EVM payment — switch chain first if needed
        setStep("switching");
        try {
            await switchChainAsync({ chainId: selectedAsset.chain.id });
        } catch {
            // User may reject chain switch, or already on correct chain
        }

        setStep("paying");

        if (selectedAsset.token.address === "native") {
            sendTransaction({
                to: RECEIVER_ADDRESS,
                value: selectedAsset.token.rejectionAmount,
            });
        } else {
            writeContract({
                address: selectedAsset.token.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "transfer",
                args: [RECEIVER_ADDRESS, selectedAsset.token.rejectionAmount],
            });
        }
    }, [selectedAsset, switchChainAsync, sendTransaction, writeContract]);

    // ─── Handle tx error ─────────────────────────────────
    useEffect(() => {
        if (txError && step === "paying") {
            setErrorMsg(
                txError.message.includes("rejected")
                    ? "Transaction rejected. Changed your mind? 😏"
                    : "Transaction failed. Try again or pick a different token."
            );
            setStep("error");
        }
    }, [txError, step]);

    // ─── Verify on-chain after EVM confirmation ──────────
    useEffect(() => {
        if (!isTxConfirmed || !txHash || verificationDone || !selectedAsset) return;


        setStep("verifying");
        setVerificationDone(true);

        fetch("/api/verify-tx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                txHash,
                linkId,
                chain: "evm",
                chainId: selectedAsset.chain.id,
                tokenAddress: selectedAsset.token.address,
                expectedAmount: selectedAsset.token.rejectionAmount.toString(),
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setStep("done");
                    onPaymentComplete(txHash);
                } else {
                    setErrorMsg("Payment verification failed on-chain.");
                    setStep("error");
                }
            })
            .catch(() => {
                setErrorMsg("Verification error. Please try again.");
                setStep("error");
            });
    }, [isTxConfirmed, txHash, linkId, selectedAsset, onPaymentComplete, verificationDone]);

    const resetToSelect = () => {
        setStep("select");
        setSelectedAsset(null);
        setErrorMsg("");
        setVerificationDone(false);
        resetErc20();
        resetNative();
    };

    const getExplorerUrl = () => {
        if (!txHash || !selectedAsset) return null;
        const explorer = selectedAsset.chain?.blockExplorers?.default?.url;
        return explorer ? `${explorer}/tx/${txHash}` : null;
    };

    return (
        <ComicModal isOpen={isOpen} title="⚡ REJECTION FEE ⚡" onClose={onClose}>
            {/* Step 1: Info */}
            {step === "info" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <p className="text-lg mb-2" style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}>
                        Rejecting true love costs a fine! 💸
                    </p>
                    <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        Pay <strong>~$2</strong> in any crypto across <strong>19 EVM chains</strong>.
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                        {["🔷 ETH", "🟣 Polygon", "🔵 Arbitrum", "🔴 OP", "🔵 Base", "💛 BSC", "⚡ zkSync", "+12 more"].map((c) => (
                            <span
                                key={c}
                                className="text-xs px-2 py-0.5 border border-gray-300 rounded-full"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                {c}
                            </span>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <ComicButton variant="dark" onClick={() => setStep("connect")} className="w-full">
                            🦊 Connect Wallet
                        </ComicButton>
                        <button
                            onClick={onClose}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            Actually, maybe I&apos;ll reconsider... 🤔
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Step 2: Connect */}
            {step === "connect" && !isConnected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <p className="text-sm mb-4" style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}>
                        Choose your wallet:
                    </p>
                    <div className="space-y-2">
                        {connectors.map((connector) => (
                            <ComicButton
                                key={connector.uid}
                                variant="dark"
                                onClick={() => connect({ connector })}
                                className="w-full"
                                size="sm"
                            >
                                {connector.name === "MetaMask" ? "🦊 " : "🔗 "}
                                {connector.name}
                            </ComicButton>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Step 3: Scanning */}
            {(step === "scanning" || (step === "connect" && isConnected)) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="text-5xl mb-4 inline-block"
                    >
                        🔍
                    </motion.div>
                    <p className="text-xs text-gray-500 mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                    <p style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}>
                        {scanProgress || "Scanning your wallet across 20 chains..."}
                    </p>
                    <motion.div className="mt-3 flex justify-center gap-1">
                        {CHAIN_CONFIGS.slice(0, 8).map((c, i) => (
                            <motion.span
                                key={c.chain.id}
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.12 }}
                            >
                                {c.chainIcon}
                            </motion.span>
                        ))}
                        <span>☀️</span>
                    </motion.div>
                </motion.div>
            )}

            {/* Step 4: Select token on chain */}
            {step === "select" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-xs text-gray-500 mb-1 text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                    <p className="text-sm mb-3 text-center font-bold" style={{ fontFamily: "Bangers, cursive" }}>
                        Found assets on {new Set(allAssets.map((a) => a.chain.name)).size} chain(s)
                    </p>

                    {allAssets.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-4xl mb-2">😱</p>
                            <p style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}>
                                No tokens found with sufficient balance!
                            </p>
                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                                You need ~$2 worth of crypto on any supported chain. Maybe that&apos;s a sign to say YES instead? 💘
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                            {allAssets.map((asset, idx) => {
                                const isSelected = selectedAsset === asset;
                                const bal = formatTokenBalance(asset.token.balance, asset.token.decimals);

                                return (
                                    <button
                                        key={`${asset.chain.name}-${asset.token.symbol}-${idx}`}
                                        onClick={() => asset.token.hasEnough && setSelectedAsset(asset)}
                                        disabled={!asset.token.hasEnough}
                                        className={`w-full p-2.5 border-2 border-black text-left flex items-center justify-between transition-all text-sm ${isSelected
                                            ? "bg-yellow-200 shadow-[3px_3px_0_#000]"
                                            : asset.token.hasEnough
                                                ? "bg-white hover:bg-gray-50 shadow-[2px_2px_0_#000] cursor-pointer"
                                                : "bg-gray-100 opacity-40 cursor-not-allowed"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{asset.chainIcon}</span>
                                            <div>
                                                <span className="font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
                                                    {asset.token.symbol}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-1">{asset.chain.name}</span>
                                                <p className="text-xs text-gray-500">Bal: {bal}</p>
                                            </div>
                                        </div>
                                        {asset.token.hasEnough ? (
                                            <span className="text-xs font-bold text-green-600">✓</span>
                                        ) : (
                                            <span className="text-xs text-red-400">Low</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {selectedAsset && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                            <ComicButton variant="gray" onClick={handlePay} className="w-full">
                                💸 Pay {formatTokenBalance(selectedAsset.token.rejectionAmount, selectedAsset.token.decimals)}{" "}
                                {selectedAsset.token.symbol} on {selectedAsset.chain.name}
                            </ComicButton>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Step 5: Switching chain */}
            {step === "switching" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="text-5xl mb-4"
                    >
                        🔄
                    </motion.div>
                    <p style={{ fontFamily: "Bangers, cursive", fontSize: "1.2rem" }}>
                        Switching to {selectedAsset?.chain.name}...
                    </p>
                    <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        Approve the network switch in your wallet
                    </p>
                </motion.div>
            )}

            {/* Step 6: Paying */}
            {step === "paying" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-5xl mb-4"
                    >
                        {isPending ? "✍️" : isConfirming ? "⏳" : "🔄"}
                    </motion.div>
                    <p style={{ fontFamily: "Bangers, cursive", fontSize: "1.2rem" }}>
                        {isPending ? "Confirm in your wallet..." : isConfirming ? "Waiting for confirmation..." : "Processing..."}
                    </p>
                    <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        {isPending
                            ? "Check your wallet for the transaction request"
                            : `Confirming on ${selectedAsset?.chain.name}...`}
                    </p>
                </motion.div>
            )}

            {/* Step 7: Verifying */}
            {step === "verifying" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="text-5xl mb-4 inline-block"
                    >
                        🔐
                    </motion.div>
                    <p style={{ fontFamily: "Bangers, cursive", fontSize: "1.2rem" }}>
                        Verifying payment on-chain...
                    </p>
                    <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        Confirming your transaction is legit. No shortcuts! 🔍
                    </p>
                </motion.div>
            )}

            {/* Step 8: Done */}
            {step === "done" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                    <p className="text-4xl mb-4">😢</p>
                    <p className="text-lg" style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}>
                        Rejection recorded on {selectedAsset?.chain.name}. Hope it was worth it.
                    </p>
                    {(() => {
                        const url = getExplorerUrl();
                        return url ? (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 underline mt-2 block"
                            >
                                View on Explorer ↗
                            </a>
                        ) : null;
                    })()}
                </motion.div>
            )}

            {/* Error */}
            {step === "error" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <p className="text-4xl mb-4">⚠️</p>
                    <p className="text-sm mb-4" style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}>
                        {errorMsg}
                    </p>
                    <div className="space-y-2">
                        <ComicButton variant="dark" onClick={resetToSelect} className="w-full" size="sm">
                            🔄 Try Again
                        </ComicButton>
                        <button
                            onClick={onClose}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            Actually, maybe I&apos;ll reconsider... 🤔
                        </button>
                    </div>
                </motion.div>
            )}
        </ComicModal>
    );
}
