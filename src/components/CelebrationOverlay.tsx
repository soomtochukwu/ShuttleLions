"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

interface CelebrationOverlayProps {
    show: boolean;
}

export function CelebrationOverlay({ show }: CelebrationOverlayProps) {
    useEffect(() => {
        if (!show) return;

        // Fire confetti burst
        const duration = 3000;
        const end = Date.now() + duration;

        const colors = ["#FF007F", "#FFD700", "#00E5FF", "#FF69B4"];

        const frame = () => {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors,
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        // Big center burst
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 100,
                origin: { x: 0.5, y: 0.5 },
                colors,
                startVelocity: 45,
            });
        }, 500);
    }, [show]);

    if (!show) return null;

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="text-center"
            >
                <h1
                    className="text-6xl sm:text-8xl text-stroke"
                    style={{
                        fontFamily: "Bangers, cursive",
                        color: "var(--hot-pink)",
                        textShadow: "4px 4px 0 #000",
                    }}
                >
                    IT&apos;S A MATCH!
                </h1>
                <p
                    className="text-2xl mt-4"
                    style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}
                >
                    💘 Love wins! 💘
                </p>
            </motion.div>
        </motion.div>
    );
}
