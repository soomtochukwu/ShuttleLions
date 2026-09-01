'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 CheckCircle2,
 AlertTriangle,
 Info,
 XCircle,
 X,
 HelpCircle,
} from 'lucide-react';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { audio } from '@/lib/audio';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'danger';

export interface AlertOptions {
 title?: string;
 message: string;
 type?: FeedbackType;
 confirmText?: string;
 onConfirm?: () => void;
}

export interface ConfirmOptions {
 title?: string;
 message: string;
 confirmText?: string;
 cancelText?: string;
 type?: FeedbackType;
 onConfirm: () => void | Promise<void>;
 onCancel?: () => void;
}

interface FeedbackContextType {
 showAlert: (options: AlertOptions | string) => void;
 showConfirm: (options: ConfirmOptions) => void;
}

const FeedbackContext = createContext<FeedbackContextType>({
 showAlert: () => {},
 showConfirm: () => {},
});

export function FeedbackProvider({ children }: { children: ReactNode }) {
 const [modalState, setModalState] = useState<{
 isOpen: boolean;
 isConfirm: boolean;
 title: string;
 message: string;
 type: FeedbackType;
 confirmText: string;
 cancelText: string;
 onConfirm?: () => void | Promise<void>;
 onCancel?: () => void;
 }>({
 isOpen: false,
 isConfirm: false,
 title: '',
 message: '',
 type: 'info',
 confirmText: 'OK',
 cancelText: 'Cancel',
 });

 const showAlert = useCallback((options: AlertOptions | string) => {
 const opts: AlertOptions =
 typeof options === 'string' ? { message: options } : options;

 const type = opts.type || 'success';
 if (type === 'error' || type === 'danger') {
 audio.play('courtSqueak');
 } else if (type === 'success') {
 audio.play('whistle');
 } else {
 audio.play('rally');
 }

 setModalState({
 isOpen: true,
 isConfirm: false,
 title: opts.title || (type === 'error' ? 'Notice' : type === 'success' ? 'Success' : 'ShuttleLions'),
 message: opts.message,
 type,
 confirmText: opts.confirmText || 'Got it ',
 cancelText: '',
 onConfirm: opts.onConfirm,
 });
 }, []);

 const showConfirm = useCallback((options: ConfirmOptions) => {
 audio.play('rally');
 setModalState({
 isOpen: true,
 isConfirm: true,
 title: options.title || 'Confirm Action',
 message: options.message,
 type: options.type || 'warning',
 confirmText: options.confirmText || 'Confirm',
 cancelText: options.cancelText || 'Cancel',
 onConfirm: options.onConfirm,
 onCancel: options.onCancel,
 });
 }, []);

 const handleClose = () => {
 if (modalState.onCancel) modalState.onCancel();
 setModalState((prev) => ({ ...prev, isOpen: false }));
 };

 const handleConfirm = async () => {
 if (modalState.onConfirm) {
 await modalState.onConfirm();
 }
 setModalState((prev) => ({ ...prev, isOpen: false }));
 };

 const getIcon = () => {
 switch (modalState.type) {
 case 'success':
 return <CheckCircle2 className="w-8 h-8 text-sl-green animate-bounce" />;
 case 'error':
 case 'danger':
 return <XCircle className="w-8 h-8 text-rose-500 animate-pulse" />;
 case 'warning':
 return <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />;
 case 'info':
 default:
 return <Info className="w-8 h-8 text-cyan-400" />;
 }
 };

 const getBorderColor = () => {
 switch (modalState.type) {
 case 'success':
 return 'border-sl-green shadow-[0_0_30px_rgba(0,200,83,0.3)]';
 case 'error':
 case 'danger':
 return 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]';
 case 'warning':
 return 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]';
 case 'info':
 default:
 return 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]';
 }
 };

 return (
 <FeedbackContext.Provider value={{ showAlert, showConfirm }}>
 {children}

 <AnimatePresence>
 {modalState.isOpen && (
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
 {/* Full-Screen Frosted Glass Blur Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={handleClose}
 className="fixed inset-0 bg-black/80 backdrop-blur-md"
 />

 {/* Custom Modal Container */}
 <motion.div
 initial={{ opacity: 0, scale: 0.92, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.92, y: 20 }}
 transition={{ type: 'spring', damping: 25, stiffness: 350 }}
 className={`relative z-10 w-full max-w-md bg-sl-panel border-2 ${getBorderColor()} rounded-2xl p-6 shadow-2xl space-y-5 text-sl-foreground`}
 >
 {/* Header with Icon & Close button */}
 <div className="flex items-start gap-4">
 <div className="p-2.5 rounded-2xl bg-sl-bg border border-sl-border shrink-0 shadow-inner">
 {getIcon()}
 </div>
 <div className="flex-1 min-w-0">
 <h3
 className="text-lg font-black uppercase tracking-wider text-sl-foreground"
 style={{ fontFamily: 'var(--font-title)' }}
 >
 {modalState.title}
 </h3>
 <p className="text-xs text-sl-muted mt-1 leading-relaxed font-medium">
 {modalState.message}
 </p>
 </div>
 <button
 onClick={handleClose}
 className="text-slate-400 hover:text-sl-foreground p-1 rounded-lg hover:bg-sl-bg transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Action Buttons */}
 <div className="flex items-center justify-end gap-3 pt-2">
 {modalState.isConfirm && (
 <ShuttleButton
 type="button"
 variant="white"
 onClick={handleClose}
 className="py-2 px-4 text-xs font-bold"
 >
 {modalState.cancelText || 'Cancel'}
 </ShuttleButton>
 )}

 <ShuttleButton
 type="button"
 variant={modalState.type === 'danger' || modalState.type === 'error' ? 'dark' : 'green'}
 onClick={handleConfirm}
 className={`py-2 px-6 text-xs font-black shadow-md ${
 modalState.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''
 }`}
 >
 {modalState.confirmText}
 </ShuttleButton>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </FeedbackContext.Provider>
 );
}

export function useFeedback() {
 return useContext(FeedbackContext);
}
