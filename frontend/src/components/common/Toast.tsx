'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-600" />,
    error: <AlertCircle size={16} className="text-rose-600" />,
    info: <AlertCircle size={16} className="text-blue-600" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-rose-50 border-rose-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`flex items-center gap-3 p-3 rounded-lg border shadow-lg ${bgColors[type]}`}
    >
      {icons[type]}
      <span className="text-xs font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto">
        <X size={14} className="text-gray-400 hover:text-gray-600" />
      </button>
    </motion.div>
  );
};