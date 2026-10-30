"use client";

import React, { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { checkDuplicatePhone } from "@/lib/submitCoc";
import FormInput from "@/components/FormInput";
import CustomSelect from "@/components/CustomSelect";
import { BATCHES } from "@/constants/batches";
import { CENTRES } from "@/constants/centres";

export default function DetailsPage() {
  const router = useRouter();
  const params = useParams<{ docType: string }>();
  const { studentData, setStudentData, setIsAlreadySubmitted } = useFormContext();
  const { isValidName, isValidPhone, isValidEmail } = useFormValidation();
  
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    batch: "",
    centre: "",
  });
  
  const [checking, setChecking] = useState(false);
  
  const prefetchPromise = useRef<{ phone: string; promise: Promise<boolean> } | null>(null);

  
  const batchOptions = BATCHES.filter(
    (b) => !(params.docType === "csp" && b === "Data Analytics with Gen AI - Batch 2")
  ).map((b) => ({ value: b, label: b }));
  
  const centreOptions = CENTRES.map((c) => ({ value: c, label: c }));

  const startPrefetch = (phoneVal: string) => {
    if (prefetchPromise.current?.phone === phoneVal) return; 
    const promise = checkDuplicatePhone(phoneVal, params.docType);
    prefetchPromise.current = { phone: phoneVal, promise };
  };

  const validateAll = () => {
    return (
      isValidName(studentData.name.trim()) &&
      isValidPhone(studentData.phone.trim()) &&
      isValidEmail(studentData.email.trim()) &&
      studentData.batch !== "" &&
      studentData.centre !== ""
    );
  };

  const handleBlur = async (field: string) => {
    let errMsg = "";
    
    switch (field) {
      case "name":
        const nameVal = studentData.name.trim();
        if (!nameVal) errMsg = "⚠ Full name is required";
        else if (!isValidName(nameVal)) errMsg = "⚠ Name should only contain letters and spaces";
        break;
      case "phone":
        const phoneVal = studentData.phone.trim();
        if (!phoneVal) errMsg = "⚠ Phone number is required";
        else if (!/^\d{10}$/.test(phoneVal)) errMsg = "⚠ Please enter a valid 10-digit phone number";
        else if (/^(\d)\1{9}$/.test(phoneVal)) errMsg = "⚠ Please enter a valid phone number";
        else if (!/^[6-9]\d{9}$/.test(phoneVal)) errMsg = "⚠ Please enter a valid 10-digit phone number";
        
        if (!errMsg && phoneVal.length === 10) {
          startPrefetch(phoneVal);
        }
        break;
      case "email":
        const emailVal = studentData.email.trim();
        if (!emailVal) errMsg = "⚠ Email address is required";
        else if (!isValidEmail(emailVal)) errMsg = "⚠ Please enter a valid email";
        break;
      case "batch":
        if (studentData.batch === "") errMsg = "⚠ Please select a batch";
        break;
      case "centre":
        if (studentData.centre === "") errMsg = "⚠ Please select a centre";
        break;
    }
    
    setErrors((prev) => ({ ...prev, [field]: errMsg }));
  };

  const handleChange = (field: string, value: string) => {
    setStudentData((prev) => ({ ...prev, [field]: value }));
    
    if (field === "phone" && value.length === 10) {
      const isValid = /^[6-9]\d{9}$/.test(value) && !/^(\d)\1{9}$/.test(value);
      if (isValid) {
        startPrefetch(value);
      }
    }

    
    if (errors[field as keyof typeof errors]) {
      let isNowValid = false;
      if (field === "name") isNowValid = isValidName(value.trim());
      if (field === "phone") isNowValid = isValidPhone(value.trim());
      if (field === "email") isNowValid = isValidEmail(value.trim());
      if (field === "batch") isNowValid = value !== "";
      if (field === "centre") isNowValid = value !== "";
      
      if (isNowValid) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    const newErrors = {
      name: !studentData.name.trim() ? "⚠ Full name is required" : !isValidName(studentData.name.trim()) ? "⚠ Name should only contain letters and spaces" : "",
      phone: !studentData.phone.trim() ? "⚠ Phone number is required" : !/^[6-9]\d{9}$/.test(studentData.phone.trim()) ? "⚠ Please enter a valid 10-digit phone number" : "",
      email: !studentData.email.trim() ? "⚠ Email address is required" : !isValidEmail(studentData.email.trim()) ? "⚠ Please enter a valid email" : "",
      batch: studentData.batch === "" ? "⚠ Please select a batch" : "",
      centre: studentData.centre === "" ? "⚠ Please select a centre" : "",
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err !== "")) {
      return;
    }

    const phone = studentData.phone.trim();
    setChecking(true);
    
    let isDup = false;
    
    if (prefetchPromise.current && prefetchPromise.current.phone === phone) {
      isDup = await prefetchPromise.current.promise;
    } else {
      isDup = await checkDuplicatePhone(phone, params.docType);
      prefetchPromise.current = { phone, promise: Promise.resolve(isDup) };
    }
    
    setChecking(false);

    if (isDup) {
      setIsAlreadySubmitted(true);
      return;
    }

    router.push(`/${params.docType}/preview`);
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-[0_4px_16px_-2px_rgba(0,0,0,0.12),0_2px_6px_-2px_rgba(0,0,0,0.08)] animate-slideUp max-w-[560px] mx-auto">
      <div className="p-[18px_20px] border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[20px] bg-primary-bg shrink-0">
          👤
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-text m-0">Student Details</h2>
            <span className={`text-[10px] font-bold px-2.5 py-[3px] rounded-full hidden sm:inline-block ${params.docType === 'csp' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
              {params.docType === 'csp' ? 'Career Services Policy' : 'Code of Conduct'}
            </span>
          </div>
          <p className="text-[12px] text-text-secondary mt-[1px] m-0">Fill in your details below</p>
        </div>
      </div>
      
      <div className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            id="inputName"
            label="Full Name"
            placeholder="Enter your full name"
            required
            autoComplete="name"
            value={studentData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            error={errors.name || null}
          />
          
          <FormInput
            id="inputPhone"
            label="Phone Number"
            type="tel"
            placeholder="10-digit mobile number"
            required
            maxLength={10}
            pattern="[0-9]{10}"
            inputMode="numeric"
            autoComplete="tel"
            value={studentData.phone}
            onChange={(e) => handleChange("phone", e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={() => handleBlur("phone")}
            error={errors.phone || null}
          />
          
          <FormInput
            id="inputEmail"
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            required
            autoComplete="email"
            inputMode="email"
            value={studentData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            error={errors.email || null}
          />

          <CustomSelect
            id="inputBatch"
            label="Course & Batch"
            required
            options={batchOptions}
            value={studentData.batch}
            onChange={(val) => { handleChange("batch", val); }}
            error={errors.batch || null}
          />

          <CustomSelect
            id="inputCentre"
            label="Centre"
            required
            options={centreOptions}
            value={studentData.centre}
            onChange={(val) => { handleChange("centre", val); }}
            error={errors.centre || null}
          />

          <FormInput
            id="inputDate"
            label="Date"
            value={studentData.date}
            readOnly
            readonly
          />

          <button
            type="submit"
            disabled={!validateAll() || checking}
            className={`w-full mt-5 px-6 py-[14px] border-none rounded-sm font-sans text-[15px] font-semibold flex items-center justify-center gap-2 outline-none transition-all duration-300 active:scale-[0.98]
              ${
                validateAll() && !checking
                  ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] cursor-pointer"
                  : "bg-gradient-to-br from-primary to-primary-dark text-white opacity-50 cursor-not-allowed shadow-none"
              }
            `}
          >
            {checking ? (
              <>
                <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Checking...
              </>
            ) : (
              "Continue →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
