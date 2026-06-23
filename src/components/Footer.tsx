import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full mb-9 text-center py-2 shrink-0 relative z-50 flex justify-between items-center px-4 md:px-6 pb-2 safe-area-bottom">
            <div className="flex gap-4 items-center">
                <Link
                    href="/about"
                    className="inline-flex items-center gap-1 text-xs md:text-sm font-bold uppercase tracking-wider text-black/60 hover:text-black md:text-black md:bg-yellow-400 md:border-2 md:border-black md:px-3 md:py-1.5 md:hover:translate-x-1 md:hover:translate-y-1 md:hover:shadow-none md:transition-all md:shadow-[3px_3px_0px_#000]"
                    style={{ fontFamily: "Bangers, cursive" }}
                >
                    <span>🤔 What is this?</span>
                </Link>
                <Link
                    href="https://twitter.com/intent/follow?screen_name=rizz_14th"
                    target="follow"
                    className="inline-flex items-center gap-1 text-xs md:text-sm font-bold uppercase tracking-wider text-black/60 hover:text-black md:text-black md:bg-white md:border-2 md:border-black md:px-3 md:py-1.5 md:hover:translate-x-1 md:hover:translate-y-1 md:hover:shadow-none md:transition-all md:shadow-[3px_3px_0px_#000]"
                    style={{ fontFamily: "Bangers, cursive" }}
                >
                    <span>𝕏</span>
                </Link>
                <Link
                    href="https://github.com/soomtochukwu/rizz-14"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs md:text-sm font-bold uppercase tracking-wider text-black/60 hover:text-black md:text-black md:bg-white md:border-2 md:border-black md:px-3 md:py-1.5 md:hover:translate-x-1 md:hover:translate-y-1 md:hover:shadow-none md:transition-all md:shadow-[3px_3px_0px_#000]"
                    style={{ fontFamily: "Bangers, cursive" }}
                >
                    <span>📂 GitHub</span>
                </Link>
            </div>
            <p className="text-[10px] font-mono text-black/40 hidden md:block pointer-events-auto">
                Built with vibes and insha'Allah
            </p>
        </footer>
    );
}
