'use client';

import React from 'react';
import { AlertTriangle, Trash2, CheckCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, type = 'danger', confirmText = 'Xác nhận', cancelText = 'Hủy', onConfirm, onCancel }) => {
  if (!isOpen) return null;
  const getIcon = () => { if (type === 'danger') return <Trash2 size={24} className="text-rose-600" />; if (type === 'warning') return <AlertTriangle size={24} className="text-amber-600" />; return <CheckCircle size={24} className="text-emerald-600" />; };
  const getButtonClass = () => { if (type === 'danger') return 'bg-rose-600 hover:bg-rose-700'; if (type === 'warning') return 'bg-amber-600 hover:bg-amber-700'; return 'bg-emerald-600 hover:bg-emerald-700'; };
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"><div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"><div className="p-6"><div className="flex items-start gap-4"><div className={`p-3 rounded-full ${type === 'danger' ? 'bg-rose-50' : type === 'warning' ? 'bg-amber-50' : 'bg-emerald-50'}`}>{getIcon()}</div><div className="flex-1"><h3 className="text-lg font-semibold text-slate-800">{title}</h3><p className="text-sm text-slate-500 mt-1">{message}</p></div><button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button></div></div><div className="bg-slate-50 px-6 py-4 flex justify-end gap-3"><button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">{cancelText}</button><button onClick={onConfirm} className={`px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${getButtonClass()}`}>{confirmText}</button></div></div></div>);
};