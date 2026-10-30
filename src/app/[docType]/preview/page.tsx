"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import PdfViewer from "@/components/PdfViewer";
import CspQuickSummaryModal from "@/components/CspQuickSummaryModal";

export default function CocPage() {
  const router = useRouter();
  const params = useParams<{ docType: string }>();
  const { studentData } = useFormContext();
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  
  useEffect(() => {
    if (!studentData.name || !studentData.phone || !studentData.email || !studentData.batch || !studentData.centre) {
      router.replace(`/${params.docType}/details`);
    }
  }, [studentData, router]);

  
  useEffect(() => {
    if (params.docType === "csp" && studentData.batch === "Data Analytics with Gen AI - Batch 6") {
      const timer = setTimeout(() => {
        setShowSummary(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [params.docType, studentData.batch]);

  const handleBack = () => router.push(`/${params.docType}/details`);
  const handleNext = () => {
    if (agreed) router.push(`/${params.docType}/sign`);
  };

  if (!studentData.name) return null; 

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-[0_4px_16px_-2px_rgba(0,0,0,0.12),0_2px_6px_-2px_rgba(0,0,0,0.08)] animate-slideUp max-w-[800px] mx-auto">
      <div className="p-[18px_20px] border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[20px] bg-primary-bg shrink-0">
          📄
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-text m-0">{params.docType === "csp" ? "Career Services Policy" : "Code of Conduct"}</h2>
          <p className="text-[12px] text-text-secondary mt-[1px] m-0">Please read the entire document carefully</p>
        </div>
      </div>
      
      <div className="p-5 sm:p-6">
        <PdfViewer onLoadSuccess={() => setPdfLoaded(true)} docType={params.docType} batch={studentData.batch} />

        {pdfLoaded && (
          <div className="flex items-start gap-3 p-4 bg-primary-bg border-[1.5px] border-indigo-500/15 rounded-sm mt-5 cursor-pointer transition-colors hover:border-indigo-500/30" onClick={() => setAgreed(!agreed)}>
            <input
              type="checkbox"
              id="agreementCheckbox"
              className="w-5 h-5 accent-primary shrink-0 mt-0.5 cursor-pointer"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor="agreementCheckbox" className="text-[14px] font-medium text-text leading-[1.5] cursor-pointer" onClick={(e) => e.stopPropagation()}>
              I have read the PW Skills {params.docType === "csp" ? "Career Services Policy" : "Code of Conduct"} and I commit to following all its rules and regulations
            </label>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            className="flex-1 px-6 py-[14px] bg-surface text-text border-[1.5px] border-border rounded-sm font-sans text-[15px] font-semibold cursor-pointer transition-colors hover:bg-[#F8FAFC] hover:border-text-muted active:scale-[0.98]"
            onClick={handleBack}
          >
            ← Back
          </button>
          <button
            type="button"
            disabled={!agreed}
            className={`flex-1 px-6 py-[14px] border-none rounded-sm font-sans text-[15px] font-semibold transition-all duration-300 active:scale-[0.98]
              ${
                agreed
                  ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] cursor-pointer"
                  : "bg-gradient-to-br from-primary to-primary-dark text-white opacity-50 cursor-not-allowed shadow-none"
              }
            `}
            onClick={handleNext}
          >
            Continue →
          </button>
        </div>
      </div>
      
      <CspQuickSummaryModal isOpen={showSummary} onAccept={() => setShowSummary(false)} />
    </div>
  );
}
