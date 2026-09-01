'use client';

import { motion } from 'framer-motion';

interface StepProgressProps {
 steps: string[];
 currentStep: number;
 className?: string;
}

export function StepProgress({ steps, currentStep, className = '' }: StepProgressProps) {
 return (
 <div className={`flex flex-col gap-3 ${className}`}>
 {/* Labels */}
 <div className="flex gap-2">
 {steps.map((step, i) => (
 <div
 key={step}
 className="flex-1 text-center text-xs font-semibold truncate"
 style={{
 color:
 i <= currentStep
 ? 'var(--sl-green)'
 : 'var(--sl-muted)',
 }}
 >
 {step}
 </div>
 ))}
 </div>

 {/* Progress bars */}
 <div className="shuttle-progress">
 {steps.map((step, i) => (
 <motion.div
 key={step}
 className={`shuttle-progress-step ${
 i < currentStep
 ? 'completed'
 : i === currentStep
 ? 'active'
 : ''
 }`}
 initial={{ scaleX: 0 }}
 animate={{ scaleX: 1 }}
 transition={{ delay: i * 0.1, duration: 0.3 }}
 style={{ transformOrigin: 'left' }}
 />
 ))}
 </div>
 </div>
 );
}
