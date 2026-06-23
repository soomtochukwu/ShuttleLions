'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

type ButtonVariant = 'green' | 'white' | 'dark' | 'gray';

interface ShuttleButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  green: 'shuttle-btn shuttle-btn-green',
  white: 'shuttle-btn shuttle-btn-white',
  dark: 'shuttle-btn shuttle-btn-dark',
  gray: 'shuttle-btn shuttle-btn-gray',
};

export const ShuttleButton = forwardRef<HTMLButtonElement, ShuttleButtonProps>(
  ({ variant = 'green', fullWidth = false, className = '', children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={`${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        whileTap={{
          scale: 0.96,
          transition: { duration: 0.08 },
        }}
        whileHover={{
          scale: 1.015,
          transition: { duration: 0.15 },
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

ShuttleButton.displayName = 'ShuttleButton';
