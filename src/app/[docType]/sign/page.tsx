"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import SignatureUpload from "@/components/SignatureUpload";
import FormInput from "@/components/FormInput";
import ErrorToast from "@/components/ErrorToast";
import { generatePdfBase64 } from "@/hooks/usePdfGenerator";
import { submitFormPayload, checkDuplicatePhone } from "@/lib/submitCoc";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function SignPage() {
  const router = useRouter();
  const params = useParams<{ docType: string }>();
  const { studentData, signatureBase64, setPdfBase64 } = useFormContext();
  const [verifyName, setVerifyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  
  useEffect(() => {
    if (!studentData.name) {
      router.replace(`/${params.docType}/details`);
    }
  }, [studentData, router]);

  const handleBack = () => router.push(`/${params.docType}/preview`);

  
  const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  const isNameMatch = normalize(verifyName) === normalize(studentData.name);
  const isNameLongEnough = verifyName.trim().length >= 2;
  const isSubmitDisabled =
    !signatureBase64 || !isNameMatch || !isNameLongEnough || submitting;

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      
      const tempPdf = await generatePdfBase64(
        studentData,
        signatureBase64!,
        verifyName.trim(),
        params.docType
      );
      const result = await submitFormPayload({ ...studentData, pdfBase64: tempPdf, docType: params.docType });

      if (!result.success) {
        
        const isDuplicate = result.error?.toUpperCase().includes("DUPLICATE");
        if (isDuplicate) {
          setSubmitError(result.error ?? "You have already submitted this document.");
          return;
        }

        
        
        await new Promise((res) => setTimeout(res, 3000));
        const savedSuccessfully = await checkDuplicatePhone(studentData.phone, params.docType);

        if (!savedSuccessfully) {
          
          setSubmitError(
            result.error ??
              "We could not save your submission. Please check your connection and try again."
          );
          return;
        }

        
        
        const fallbackDate = new Date().toLocaleDateString("en-GB");
        const finalPdf = await generatePdfBase64(
          { ...studentData, date: fallbackDate },
          signatureBase64!,
          verifyName.trim(),
          params.docType
        );
        setPdfBase64(finalPdf);
        sessionStorage.setItem("coc_completed", "true");
        router.replace(`/${params.docType}/done`);
        return;
      }

      
      const trustedDate = result.verifiedDate ?? studentData.date;
      const finalPdf = await generatePdfBase64(
        { ...studentData, date: trustedDate },
        signatureBase64!,
        verifyName.trim(),
        params.docType
      );
      setPdfBase64(finalPdf);

      sessionStorage.setItem("coc_completed", "true");
      router.replace(`/${params.docType}/done`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setSubmitError(
        `Submission failed — ${msg}. Please try again or contact support.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!studentData.name) return null; 

  return (
    <>
      <div className="bg-surface rounded-2xl border border-border shadow-[0_4px_16px_-2px_rgba(0,0,0,0.12),0_2px_6px_-2px_rgba(0,0,0,0.08)] animate-slideUp max-w-[560px] mx-auto">
        <div className="p-[18px_20px] border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[20px] bg-primary-bg shrink-0">
            ✍️
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-text m-0">
                Digital Signature
              </h2>
              <span className={`text-[10px] font-bold px-2.5 py-[3px] rounded-full hidden sm:inline-block ${params.docType === 'csp' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                {params.docType === 'csp' ? 'Career Services Policy' : 'Code of Conduct'}
              </span>
            </div>
            <p className="text-[12px] text-text-secondary mt-[1px] m-0">
              Upload your signature below
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <SignatureUpload />

          <div className="mt-6 pt-5 border-t border-border">
            <FormInput
              id="inputVerifyName"
              label="To confirm this is your true signature, type your full name below:"
              placeholder="Type your full name here"
              value={verifyName}
              onChange={(e) => setVerifyName(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              autoComplete="off"
              error={
                verifyName && !isNameMatch && isNameLongEnough
                  ? "⚠ Name does not match. Please type your valid full name."
                  : null
              }
            />
          </div>

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
              disabled={isSubmitDisabled}
              className={`flex-1 px-6 py-[14px] border-none rounded-sm font-sans text-[15px] font-semibold transition-all duration-300 active:scale-[0.98]
                ${
                  !isSubmitDisabled
                    ? "bg-gradient-to-br from-success to-success-dark text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] cursor-pointer"
                    : "bg-gradient-to-br from-success to-success-dark text-white opacity-50 cursor-not-allowed shadow-none active:scale-100"
                }
              `}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <LoadingOverlay isVisible={submitting} />

      {}
      {submitError && (
        <ErrorToast
          message={submitError}
          onClose={() => setSubmitError(null)}
        />
      )}
    </>
  );
}
