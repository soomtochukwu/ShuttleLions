"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface RunawayButtonProps {
    onCaught: () => void;
    maxEscapes?: number;
}

export function RunawayButton({ onCaught, maxEscapes = 5 }: RunawayButtonProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [escapeCount, setEscapeCount] = useState(0);
    const [buttonSize, setButtonSize] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const runAway = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current.getBoundingClientRect();
        const btnWidth = 120 * buttonSize;
        const btnHeight = 50 * buttonSize;

        // Calculate new random position within container bounds
        const maxX = container.width - btnWidth - 20;
        const maxY = container.height - btnHeight - 20;

        const newX = Math.random() * Math.max(maxX, 50);
        const newY = Math.random() * Math.max(maxY, 50);

        setPosition({ x: newX, y: newY });
        setEscapeCount((prev) => prev + 1);

        // Button gets smaller with each escape
        setButtonSize((prev) => Math.max(0.6, prev - 0.06));

        // Vibrate on mobile
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }, [buttonSize]);

    useEffect(() => {
        if (escapeCount >= maxEscapes) {
            onCaught();
        }
    }, [escapeCount, maxEscapes, onCaught]);

    const handleMouseEnter = () => {
        if (escapeCount < maxEscapes) {
            runAway();
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        if (escapeCount < maxEscapes) {
            runAway();
        }
    };

    const handleClick = () => {
        // If they somehow click it, trigger the paywall
        onCaught();
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full"
            style={{ minHeight: "100px" }}
        >
            <motion.button
                ref={buttonRef}
                className="comic-btn comic-btn-gray absolute"
                style={{
                    transform: `scale(${buttonSize})`,
                    zIndex: 10,
                }}
                animate={{
                    x: position.x,
                    y: position.y,
                    scale: buttonSize,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    mass: 0.5,
                }}
                onMouseEnter={handleMouseEnter}
                onTouchStart={handleTouchStart}
                onClick={handleClick}
            >
                💔 NO
            </motion.button>

            {/* Escape counter */}
            {escapeCount > 0 && escapeCount < maxEscapes && (
                <motion.p
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-500 whitespace-nowrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontFamily: "Comic Neue, cursive" }}
                >
                    {escapeCount === 1 && "Hey! The button doesn't want to be clicked! 😤"}
                    {escapeCount === 2 && "Seriously? You're still trying? 😭"}
                    {escapeCount === 3 && "Don't break their heart like this... 💔"}
                    {escapeCount === 4 && "Last chance to change your mind! 🥺"}
                </motion.p>
            )}
        </div>
    );
}
