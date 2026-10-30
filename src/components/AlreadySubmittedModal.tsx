"use client";

import React from "react";
import { useFormContext } from "@/context/FormContext";
import { useRouter, usePathname } from "next/navigation";

export default function AlreadySubmittedModal() {
  const { isAlreadySubmitted, setIsAlreadySubmitted, setStudentData } = useFormContext();
  const router = useRouter();
  const pathname = usePathname();

  if (!isAlreadySubmitted) return null;

  
  const isCSP = pathname.includes("/csp/");
  const docName = isCSP ? "Career Services Policy" : "Code of Conduct";

  const handleClose = () => {
    setIsAlreadySubmitted(false);
    
    
    setStudentData({
      name: "",
      phone: "",
      email: "",
      batch: "",
      centre: "",
      date: new Date().toLocaleDateString("en-GB"),
    });

    
    router.push("/");
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-[9999] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl py-8 px-7 max-w-[420px] w-full shadow-[0_20px_50px_rgba(0,0,0,0.25)] text-center animate-modalPop">
        <div className="text-[48px] mb-4">🚫</div>
        <h3 className="text-xl font-bold text-[#1E293B] mb-2.5">Already Submitted</h3>
        <p className="text-[14px] text-[#64748B] leading-[1.6] mb-6">
          You have already completed and submitted the {docName}.<br />
          No further action is required from your side.<br /><br />
          For any queries, contact your <strong>Assistant Faculty</strong>.
        </p>
        <button
          onClick={handleClose}
          className="bg-primary text-white border-none py-3 px-8 rounded-lg text-[15px] font-semibold cursor-pointer transition-colors hover:bg-primary-dark"
        >
          OK, Got it
        </button>
      </div>
    </div>
  );
}
