"use client";

import { useEffect, useState } from "react";

export function FloatingHearts() {
    const [hearts, setHearts] = useState<
        Array<{ id: number; left: number; size: number; duration: number; delay: number }>
    >([]);

    useEffect(() => {
        const emojis = ["💘", "💕", "💗", "✨", "💖", "❤️‍🔥"];
        const generated = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: 0.8 + Math.random() * 1.2,
            duration: 8 + Math.random() * 12,
            delay: Math.random() * 10,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
        }));
        setHearts(generated);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="floating-heart"
                    style={{
                        left: `${heart.left}%`,
                        bottom: "-50px",
                        fontSize: `${heart.size}rem`,
                        animationDuration: `${heart.duration}s`,
                        animationDelay: `${heart.delay}s`,
                        animationIterationCount: "infinite",
                    }}
                >
                    💘
                </div>
            ))}
        </div>
    );
}
