"use client";

import React, { useEffect } from "react";

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export default function ErrorToast({ message, onClose }: ErrorToastProps) {
  
  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-40px)] max-w-[520px] animate-slideUp">
      <div className="bg-[#1E293B] text-white rounded-xl px-5 py-4 flex items-start gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        {}
        <div className="mt-[2px] shrink-0 w-5 h-5 rounded-full bg-error flex items-center justify-center text-[11px] font-bold">
          !
        </div>

        {}
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-white m-0 mb-[2px]">
            Submission Failed
          </p>
          <p className="text-[12px] text-white/70 m-0 leading-[1.5]">{message}</p>
        </div>

        {}
        <button
          onClick={onClose}
          className="shrink-0 text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-[18px] leading-none mt-[-2px]"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
