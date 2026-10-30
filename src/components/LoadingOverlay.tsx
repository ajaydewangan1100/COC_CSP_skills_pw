import React from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
}

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[4px] z-[1000] flex items-center justify-center">
      <div className="bg-surface rounded-2xl py-8 px-10 text-center shadow-xl animate-scaleIn">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin-slow mx-auto mb-4"></div>
        <p className="text-[15px] font-semibold text-text m-0">
          Submitting... please wait
          <small className="block text-[13px] font-normal text-text-secondary mt-1">
            Saving your data
          </small>
        </p>
      </div>
    </div>
  );
}
