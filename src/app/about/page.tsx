"use client";

import { motion } from "framer-motion";
import { ComicButton } from "@/components/ui/ComicButton";
import { FloatingHearts } from "@/components/FloatingHearts";
import { springIn, slideUp, staggerContainer } from "@/lib/animations";
import { audio } from "@/lib/audio";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="flex flex-col items-center justify-start pt-12 md:pt-20 px-4 sm:p-6 pb-24 relative w-full min-h-full">
            <FloatingHearts />

            <div className="w-full max-w-2xl z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    variants={springIn}
                    initial="hidden"
                    animate="visible"
                >
                    <h1
                        className="text-3xl sm:text-6xl mb-2 text-stroke"
                        style={{
                            fontFamily: "Bangers, cursive",
                            color: "var(--hot-pink)",
                            textShadow: "3px 3px 0 #000",
                        }}
                    >
                        WTF IS RIZZ-14TH?
                    </h1>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Origin Story */}
                    <motion.div
                        variants={slideUp}
                        className="comic-panel p-5 sm:p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-9xl">
                            💔
                        </div>
                        <h2
                            className="text-2xl mb-4"
                            style={{ fontFamily: "Bangers, cursive" }}
                        >
                            THE ORIGIN STORY
                        </h2>
                        <p
                            className="text-base sm:text-lg text-purple-900 leading-relaxed mb-4"
                            style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}
                        >
                            It started with a tragedy. I watched a homie fumble a 10/10 so bad it set the human race back 50 years.
                        </p>
                        <p
                            className="text-base sm:text-lg text-pink-600 leading-relaxed"
                            style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}
                        >
                            So I built Rizz-14th. Not just an app, but a tactical nuke for your love life. No stuttering, just vibes.
                        </p>
                        <p
                            className="text-base sm:text-lg text-red-600 leading-relaxed mt-4"
                            style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}
                        >
                            Why "14th"? Because February 14th is the final boss of loneliness. And we're giving you the cheat codes.
                        </p>
                    </motion.div>

                    {/* How to Use */}
                    <motion.div variants={slideUp} className="comic-panel p-5 sm:p-8 bg-yellow-100">
                        <h2
                            className="text-2xl mb-6 text-center"
                            style={{ fontFamily: "Bangers, cursive" }}
                        >
                            HOW TO RIZZ (IN 3 STEPS)
                        </h2>

                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 text-center">
                            {/* Step 1 */}
                            <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0_#000] rounded-lg transform -rotate-2">
                                <div className="text-4xl mb-2">🔐</div>
                                <h3 className="font-bold mb-1" style={{ fontFamily: "Bangers, cursive" }}>1. SIGN IN</h3>
                                <p className="text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                                    Login with X (Twitter). We need to verify you're not a robot (unless you're a hot robot).
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0_#000] rounded-lg transform rotate-1 mt-4 sm:mt-0">
                                <div className="text-4xl mb-2">🤖</div>
                                <h3 className="font-bold mb-1" style={{ fontFamily: "Bangers, cursive" }}>2. GENERATE</h3>
                                <p className="text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                                    Tell us who you're crushing on. Our AI will cook up a line smoother than better.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0_#000] rounded-lg transform -rotate-1">
                                <div className="text-4xl mb-2">🚀</div>
                                <h3 className="font-bold mb-1" style={{ fontFamily: "Bangers, cursive" }}>3. SHOOT</h3>
                                <p className="text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                                    Send the link. If they accept, we'll let you know. If they reject... well, at least you tried?
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA */}
                    <motion.div variants={slideUp} className="text-center pt-4">
                        <p
                            className="text-lg mb-4 font-bold"
                            style={{ fontFamily: "Comic Neue, cursive" }}
                        >
                            Ready to risk it all?
                        </p>
                        <ComicButton
                            variant="pink"
                            size="lg"
                            onClick={() => {
                                audio.play("click");
                                // window.location.href = "/";
                            }}
                            className="w-full sm:w-auto"
                        >
                            <Link href={"/"}>
                                👈 GO BACK HOME & START
                            </Link>
                        </ComicButton>
                    </motion.div>

                    <div className="h-12"></div> {/* Spacer */}
                </motion.div>
            </div>
        </div>
    );
}

