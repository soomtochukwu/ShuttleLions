"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
import { popIn } from "@/lib/animations";

interface ComicModalProps {
    isOpen: boolean;
    onClose?: () => void;
    children: ReactNode;
    title?: string;
}

export function ComicModal({ isOpen, onClose, children, title }: ComicModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={onClose}>
                    <motion.div
                        className="comic-panel p-6 sm:p-8 mx-4 max-w-md w-full"
                        variants={popIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title && (
                            <h2
                                className="text-2xl sm:text-3xl mb-4 text-center"
                                style={{ fontFamily: "Bangers, cursive", color: "var(--hot-pink)" }}
                            >
                                {title}
                            </h2>
                        )}
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
