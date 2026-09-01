'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';

interface ShuttleModalProps {
 isOpen: boolean;
 onClose: () => void;
 title?: string;
 children: ReactNode;
 maxWidth?: string;
}

export function ShuttleModal({
 isOpen,
 onClose,
 title,
 children,
 maxWidth = '480px',
}: ShuttleModalProps) {
 useEffect(() => {
 if (!isOpen) return;
 const handler = (e: KeyboardEvent) => {
 if (e.key === 'Escape') onClose();
 };
 window.addEventListener('keydown', handler);
 return () => window.removeEventListener('keydown', handler);
 }, [isOpen, onClose]);

 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = '';
 }
 return () => {
 document.body.style.overflow = '';
 };
 }, [isOpen]);

 return (
 <AnimatePresence>
 {isOpen && (
 <motion.div
 className="modal-overlay"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 >
 <motion.div
 className="shuttle-panel p-6 mx-4"
 style={{ maxWidth, width: '100%' }}
 initial={{ scale: 0.85, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.85, opacity: 0, y: 20 }}
 transition={{ type: 'spring', stiffness: 350, damping: 25 }}
 onClick={(e) => e.stopPropagation()}
 >
 {title && (
 <div
 className="flex items-center justify-between mb-4 pb-3"
 style={{ borderBottom: '2px solid var(--sl-border)' }}
 >
 <h2 className="text-lg font-bold" style={{ color: 'var(--sl-green)' }}>
 {title}
 </h2>
 <button
 onClick={onClose}
 className="text-xl font-bold hover:opacity-70 transition-opacity"
 style={{ color: 'var(--sl-muted)' }}
 aria-label="Close modal"
 >
 
 </button>
 </div>
 )}
 {children}
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
