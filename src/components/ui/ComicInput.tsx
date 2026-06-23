"use client";

import { forwardRef } from "react";

interface ComicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: string;
    error?: string;
}

export const ComicInput = forwardRef<HTMLInputElement, ComicInputProps>(
    ({ label, icon, error, className = "", ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        className="block mb-2 font-bold text-sm uppercase tracking-wide"
                        style={{ fontFamily: "Bangers, cursive", letterSpacing: "1px" }}
                    >
                        {icon && <span className="mr-2">{icon}</span>}
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`comic-input ${error ? "!border-red-500 !shadow-red-500" : ""} ${className}`}
                    {...props}
                />
                {error && (
                    <p
                        className="mt-1 text-red-600 text-sm font-bold"
                        style={{ fontFamily: "Comic Neue, cursive" }}
                    >
                        ⚠️ {error}
                    </p>
                )}
            </div>
        );
    }
);

ComicInput.displayName = "ComicInput";
