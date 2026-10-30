"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormContext } from "@/context/FormContext";

export default function DonePage() {
  const router = useRouter();
  const params = useParams<{ docType: string }>();
  const { studentData, pdfBase64 } = useFormContext();

  useEffect(() => {
    
    if (!pdfBase64) {
      router.replace(`/${params.docType}/details`);
    }
  }, [pdfBase64, router]);

  if (!pdfBase64) return null; 

  const handleDownload = () => {
    if (!pdfBase64) return;
    try {
      
      const base64Data = pdfBase64.startsWith("data:")
        ? pdfBase64.split(",")[1]
        : pdfBase64;

      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteNumbers], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const docName = params.docType === "csp" ? "Career_Services_Policy" : "Code_Of_Conduct";
      link.download = `PW_Skills_${docName}_${studentData.name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again or use a different browser.");
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-[0_4px_16px_-2px_rgba(0,0,0,0.12),0_2px_6px_-2px_rgba(0,0,0,0.08)] animate-slideUp max-w-[560px] mx-auto">
      <div className="text-center p-[40px_20px]">
        <div className="w-[80px] h-[80px] rounded-full bg-success-bg flex items-center justify-center text-[40px] mx-auto mb-5 animate-bounceIn">
          ✅
        </div>
        <h2 className="text-[22px] font-extrabold text-text mb-2">Submitted Successfully!</h2>
        
        <div className="bg-[#F8FAFC] rounded-sm p-4 my-5 text-left max-w-sm mx-auto">
          <div className="flex justify-between py-1.5 text-[14px]">
            <span className="text-text-secondary font-medium">Name</span>
            <span className="text-text font-semibold">{studentData.name}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[14px]">
            <span className="text-text-secondary font-medium">Batch</span>
            <span className="text-text font-semibold text-right pl-4">{studentData.batch}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[14px]">
            <span className="text-text-secondary font-medium">Centre</span>
            <span className="text-text font-semibold text-right pl-4">{studentData.centre}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[14px]">
            <span className="text-text-secondary font-medium">Date</span>
            <span className="text-text font-semibold text-right pl-4">{studentData.date}</span>
          </div>
        </div>

        <div className="text-[14px] text-text-secondary leading-[1.6] mt-4 p-[12px_16px] bg-success-bg rounded-sm border border-success/15 mb-6">
          🎉 Your {params.docType === "csp" ? "Career Services Policy" : "Code of Conduct"} has been submitted successfully. Thank you!
        </div>

        <button
          onClick={handleDownload}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-md shadow-[0_4px_14px_rgba(235,90,70,0.3)] hover:shadow-[0_6px_20px_rgba(235,90,70,0.4)] transition-all inline-flex items-center justify-center"
        >
          Download Signed {params.docType === "csp" ? "Career Services Policy" : "Code of Conduct"}
        </button>
      </div>
    </div>
  );
}
