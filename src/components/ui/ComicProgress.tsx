"use client";

interface ComicProgressProps {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
}

export function ComicProgress({
    currentStep,
    totalSteps,
    labels = [],
}: ComicProgressProps) {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="comic-progress mb-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                        key={i}
                        className={`comic-progress-step ${i < currentStep
                                ? "completed"
                                : i === currentStep
                                    ? "active"
                                    : ""
                            }`}
                    />
                ))}
            </div>
            {labels.length > 0 && (
                <div className="flex justify-between">
                    {labels.map((label, i) => (
                        <span
                            key={i}
                            className={`text-xs font-bold uppercase ${i <= currentStep ? "text-black" : "text-gray-400"
                                }`}
                            style={{ fontFamily: "Bangers, cursive" }}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
