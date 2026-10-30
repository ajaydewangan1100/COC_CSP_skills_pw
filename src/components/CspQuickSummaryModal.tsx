import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CspQuickSummaryModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function CspQuickSummaryModal({ isOpen, onAccept }: CspQuickSummaryModalProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!mounted || !shouldRender) return null;

  const modalContent = (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div 
        className={`bg-white rounded-2xl w-full max-w-[700px] max-h-[85vh] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        <div className="bg-[#1B2A4A] p-5 sm:p-6 text-white text-center shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-md">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold m-0 tracking-tight">Career Services – Quick Summary</h2>
          <p className="text-white/80 mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium">Please read these important highlights before proceeding.</p>
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-[#FAFAFA]">
          <ul className="space-y-5 text-[14px] text-slate-700 leading-relaxed">
            <li className="flex items-start gap-4">
              <span className="text-[#1B2A4A] mt-1 text-lg leading-none shrink-0">•</span>
              <span><strong>Career Services</strong> provides access to job and internship opportunities but <strong>does not guarantee placement</strong>.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#1B2A4A] mt-1 text-lg leading-none shrink-0">•</span>
              <span>You must meet the eligibility criteria, register on Career Services Platform, and follow all Career Services rules.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#1B2A4A] mt-1 text-lg leading-none shrink-0">•</span>
              <span><strong>Education:</strong> Graduation and above; eligible if graduated within the last 5 years or graduating in the current/upcoming academic year. Tech learners must have B.Tech, B.E., BCA, or MCA.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#1B2A4A] mt-1 text-lg leading-none shrink-0">•</span>
              <span>Your <strong>Career Readiness Score</strong> determines the level and range of opportunities available to you.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#1B2A4A] mt-1 text-lg leading-none shrink-0">•</span>
              <span><strong>Certification & Assessment:</strong> Maintain 60%+ attendance to appear for assessments and qualify for certification with a Final Career Readiness Score of ≥40%. Learners with 50%–59% attendance may take a remedial assessment.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#1B2A4A] mt-1 text-lg leading-none shrink-0">•</span>
              <span>You can get a <strong>maximum of 5 interview opportunities</strong> during the 3-month Career Services period.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#1B2A4A] mt-1 text-lg leading-none shrink-0">•</span>
              <span>Once you receive a job offer, access to Career Services generally stops.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#1B2A4A] mt-1 text-lg leading-none shrink-0">•</span>
              <span>After applying, attend interviews and complete the recruitment process; <strong>repeated absence or misconduct can lead to permanent debarment</strong>.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#1B2A4A] mt-1 text-lg leading-none shrink-0">•</span>
              <span>Keep your details updated and participate responsibly throughout the process.</span>
            </li>
          </ul>
        </div>

        <div className="p-4 sm:p-5 border-t border-border bg-white flex justify-end shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] relative z-10">
          <button
            onClick={onAccept}
            className="w-full sm:w-auto px-6 sm:px-10 py-3.5 bg-[#1B2A4A] text-white rounded-lg font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#15223c] transition-all active:scale-95 text-sm sm:text-[15px]"
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
