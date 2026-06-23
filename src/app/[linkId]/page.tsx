"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ComicButton } from "@/components/ui/ComicButton";
import { RunawayButton } from "@/components/ui/RunawayButton";
import { PaywallModal } from "@/components/PaywallModal";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { FloatingHearts } from "@/components/FloatingHearts";
import { springIn, slideUp, heartbeat } from "@/lib/animations";
import type { CrushRequest } from "@/lib/supabase";
import { audio } from "@/lib/audio";

type ViewState = "loading" | "reveal" | "accepted" | "rejected" | "error";

export default function CrushPage() {
    const params = useParams();
    const linkId = params.linkId as string;

    const [state, setState] = useState<ViewState>("loading");
    const [request, setRequest] = useState<CrushRequest | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [acceptanceMessage, setAcceptanceMessage] = useState("");
    const [justAccepted, setJustAccepted] = useState(false);

    const getLinkUrl = () => {
        if (typeof window !== "undefined") {
            return `${window.location.origin}/${linkId}`;
        }
        return `/${linkId}`;
    };

    useEffect(() => {
        async function fetchRequest() {
            try {
                const res = await fetch(`/api/request/${linkId}`);
                if (res.ok) {
                    const data = await res.json();
                    setRequest(data);
                    setState(
                        data.status === "pending"
                            ? "reveal"
                            : data.status === "accepted"
                                ? "accepted"
                                : "rejected"
                    );
                } else {
                    setState("error");
                }
            } catch {
                setState("error");
            }
        }
        fetchRequest();
    }, [linkId]);

    const handleYes = async () => {
        audio.play("celebrate");
        setShowCelebration(true);
        setJustAccepted(true);
        setState("accepted");

        // Update status in DB
        await fetch("/api/respond", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linkId, status: "accepted" }),
        });

        // Fetch dynamic acceptance message for WhatsApp DM
        try {
            const res = await fetch("/api/acceptance-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    crushHandle: request?.crush_x_handle || "",
                }),
            });
            const data = await res.json();
            setAcceptanceMessage(data.message);
        } catch {
            setAcceptanceMessage(
                "I just said YES! 💘 Let's make this Valentine's unforgettable!"
            );
        }

        // Vibrate on mobile
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 200]);
        }
    };

    const handleNoCaught = useCallback(() => {
        audio.play("whoosh");
        setShowPaywall(true);
    }, []);

    const handlePaymentComplete = (txHash: string) => {
        setShowPaywall(false);
        setState("rejected");
        console.log("Payment TX:", txHash);
    };

    const shareAcceptanceOnX = () => {
        audio.play("click");
        const text = encodeURIComponent(
            `I just said YES to @${request?.crush_x_handle || "someone"} 💘🎉\n\n👉 ${getLinkUrl()}\n\n#rizz_14th @rizz_14th`
        );
        window.open(
            `https://twitter.com/intent/tweet?text=${text}`,
            "_blank"
        );
    };

    const openWhatsApp = () => {
        audio.play("click");
        if (!request?.sender_whatsapp) return;
        const phone = request.sender_whatsapp.replace(/[^0-9]/g, "");
        const msg = encodeURIComponent(
            acceptanceMessage ||
            "I just said YES! 💘 Let's make this Valentine's unforgettable!"
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 relative w-full min-h-full">
            <FloatingHearts />
            <CelebrationOverlay show={showCelebration} />

            <div className="w-full max-w-md z-10">
                {/* Header — hide "YOU'VE GOT A CRUSH" on revisit of accepted link */}
                {!(state === "accepted" && !justAccepted) && (
                    <motion.div
                        className="text-center mb-5 sm:mb-6"
                        variants={springIn}
                        initial="hidden"
                        animate="visible"
                    >
                        {request?.crush_x_handle && (
                            <span
                                className="inline-block text-xl sm:text-3xl mb-1"
                                style={{
                                    color: "var(--electric-yellow)",
                                    textShadow: "2px 2px 0 #000",
                                    fontFamily: "Bangers, cursive",
                                    transform: "rotate(-2deg)",
                                }}
                            >
                                @{request.crush_x_handle}
                            </span>
                        )}
                        <h1
                            className="text-2xl sm:text-4xl text-stroke"
                            style={{
                                fontFamily: "Bangers, cursive",
                                color: "var(--hot-pink)",
                                textShadow: "2px 2px 0 #000",
                            }}
                        >
                            YOU&apos;VE GOT A CRUSH! 💘
                        </h1>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {/* Loading */}
                    {state === "loading" && (
                        <motion.div
                            key="loading"
                            className="comic-panel p-6 text-center"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="text-4xl mb-3 inline-block"
                            >
                                💌
                            </motion.div>
                            <p
                                style={{
                                    fontFamily: "Comic Neue, cursive",
                                    fontWeight: 700,
                                }}
                            >
                                Opening your love letter...
                            </p>
                        </motion.div>
                    )}

                    {/* The Reveal */}
                    {state === "reveal" && request && (
                        <motion.div
                            key="reveal"
                            className="comic-panel p-5 sm:p-6"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            {/* Avatar */}
                            <motion.div
                                className="flex justify-center mb-4"
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                            >
                                <div
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-black flex items-center justify-center text-3xl sm:text-4xl"
                                    style={{
                                        background: "var(--electric-yellow)",
                                    }}
                                >
                                    😍
                                </div>
                            </motion.div>

                            {/* AI Message */}
                            <motion.div
                                className="speech-bubble mb-5"
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.2 }}
                            >
                                <p className="text-base sm:text-lg leading-relaxed">
                                    {request.ai_message}
                                </p>
                            </motion.div>

                            {/* Countdown */}
                            <motion.p
                                className="text-center text-xs text-gray-400 mb-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                ⏰ This link expires in 24 hours
                            </motion.p>

                            {/* Decision Buttons */}
                            <div className="relative">
                                <motion.div
                                    className="flex justify-center mb-4"
                                    {...heartbeat}
                                >
                                    <ComicButton
                                        variant="pink"
                                        onClick={handleYes}
                                        size="lg"
                                        className="w-full starburst"
                                    >
                                        💖 YES! I&apos;M IN!
                                    </ComicButton>
                                </motion.div>

                                {/* The Runaway NO Button */}
                                <RunawayButton
                                    onCaught={handleNoCaught}
                                    maxEscapes={5}
                                />
                            </div>

                            {/* Social proof */}
                            <motion.p
                                className="text-center text-xs text-gray-500 mt-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                style={{ fontFamily: "Comic Neue, cursive" }}
                            >
                                92% of people say YES. Just saying... 👀
                            </motion.p>
                        </motion.div>
                    )}

                    {/* Accepted — just now (crush sees this) */}
                    {state === "accepted" && justAccepted && (
                        <motion.div
                            key="accepted"
                            className="comic-panel p-5 sm:p-6 text-center"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="text-4xl mb-2">🎉</div>

                            <h2
                                className="text-2xl mb-1"
                                style={{
                                    fontFamily: "Bangers, cursive",
                                    color: "var(--hot-pink)",
                                }}
                            >
                                IT&apos;S A MATCH!
                            </h2>

                            <p
                                className="text-sm text-gray-600 mb-4"
                                style={{
                                    fontFamily: "Comic Neue, cursive",
                                    fontWeight: 700,
                                }}
                            >
                                Love wins! 💘 Now go make magic happen ✨
                            </p>

                            <div className="flex flex-col gap-2">
                                <ComicButton
                                    variant="dark"
                                    onClick={shareAcceptanceOnX}
                                    className="w-full"
                                >
                                    𝕏 BRAG ON X!
                                </ComicButton>

                                <ComicButton
                                    variant="pink"
                                    onClick={openWhatsApp}
                                    className="w-full"
                                >
                                    📱 SLIDE INTO DMs
                                </ComicButton>
                            </div>
                        </motion.div>
                    )}

                    {/* Accepted — revisit (public view) */}
                    {state === "accepted" && !justAccepted && (
                        <motion.div
                            key="accepted-public"
                            className="comic-panel p-5 sm:p-6 text-center"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="text-4xl mb-2">💘</div>

                            <h2
                                className="text-2xl mb-1"
                                style={{
                                    fontFamily: "Bangers, cursive",
                                    color: "var(--hot-pink)",
                                }}
                            >
                                LOVE WON HERE!
                            </h2>

                            <p
                                className="text-sm text-gray-600 mb-4"
                                style={{
                                    fontFamily: "Comic Neue, cursive",
                                    fontWeight: 700,
                                }}
                            >
                                {request?.crush_x_handle
                                    ? `@${request.crush_x_handle} said YES to their crush! 🎉`
                                    : "This crush was accepted! 🎉"}
                            </p>

                            <ComicButton
                                variant="pink"
                                onClick={() => { audio.play("click"); window.location.href = "/"; }}
                                className="w-full"
                            >
                                � SHOOT YOUR OWN SHOT
                            </ComicButton>
                        </motion.div>
                    )}

                    {/* Rejected */}
                    {state === "rejected" && (
                        <motion.div
                            key="rejected"
                            className="comic-panel p-6 text-center"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="text-5xl mb-3">😢</div>
                            <h2
                                className="text-2xl mb-2"
                                style={{ fontFamily: "Bangers, cursive" }}
                            >
                                REJECTION RECORDED
                            </h2>
                            <p
                                className="text-sm text-gray-600"
                                style={{
                                    fontFamily: "Comic Neue, cursive",
                                }}
                            >
                                At least it cost you $2. Hope it was worth
                                it. 💸
                            </p>
                        </motion.div>
                    )}

                    {/* Error */}
                    {state === "error" && (
                        <motion.div
                            key="error"
                            className="comic-panel p-6 text-center"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="text-5xl mb-3">🤔</div>
                            <h2
                                className="text-2xl mb-2"
                                style={{ fontFamily: "Bangers, cursive" }}
                            >
                                LINK NOT FOUND
                            </h2>
                            <p
                                className="text-sm text-gray-600"
                                style={{
                                    fontFamily: "Comic Neue, cursive",
                                }}
                            >
                                This crush link doesn&apos;t exist or has
                                expired.
                            </p>
                            <ComicButton
                                variant="pink"
                                onClick={() => {
                                    audio.play("click");
                                    window.location.href = "/";
                                }}
                                className="mt-4"
                            >
                                CREATE YOUR OWN 💘
                            </ComicButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                onPaymentComplete={handlePaymentComplete}
                linkId={linkId}
            />
        </div>
    );
}
