"use client";

import { motion } from "framer-motion";
import { comicPress } from "@/lib/animations";
import { type ReactNode } from "react";

interface ComicButtonProps {
    children: ReactNode;
    variant?: "pink" | "yellow" | "dark" | "gray";
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit";
    size?: "sm" | "md" | "lg";
}

export function ComicButton({
    children,
    variant = "pink",
    onClick,
    disabled = false,
    className = "",
    type = "button",
    size = "md",
}: ComicButtonProps) {
    const variantClass = `comic-btn-${variant}`;
    const sizeClasses = {
        sm: "!px-4 !py-2 !text-sm",
        md: "",
        lg: "!px-5 !py-3 !text-base sm:!px-8 sm:!py-4 sm:!text-xl",
    };

    return (
        <motion.button
            type={type}
            className={`comic-btn ${variantClass} ${sizeClasses[size]} ${className}`}
            onClick={onClick}
            disabled={disabled}
            whileTap={comicPress.whileTap}
            whileHover={disabled ? {} : comicPress.whileHover}
            style={{
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
            }}
        >
            {children}
        </motion.button>
    );
}
