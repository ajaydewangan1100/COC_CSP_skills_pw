"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

export interface StudentData {
  name: string;
  phone: string;
  email: string;
  batch: string;
  centre: string;
  date: string;
}

interface FormContextType {
  studentData: StudentData;
  setStudentData: React.Dispatch<React.SetStateAction<StudentData>>;
  signatureBase64: string | null;
  setSignatureBase64: React.Dispatch<React.SetStateAction<string | null>>;
  pdfBase64: string | null;
  setPdfBase64: React.Dispatch<React.SetStateAction<string | null>>;
  isAlreadySubmitted: boolean;
  setIsAlreadySubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultStudentData: StudentData = {
  name: "",
  phone: "",
  email: "",
  batch: "",
  centre: "",
  date: new Date().toLocaleDateString("en-GB"), 
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormContextProvider({ children }: { children: ReactNode }) {
  const [studentData, setStudentData] = useState<StudentData>(defaultStudentData);
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    
    if (!pathname.endsWith("/done") && typeof window !== "undefined") {
      if (sessionStorage.getItem("coc_completed") === "true") {
        sessionStorage.removeItem("coc_completed");
        
        window.location.href = "/";
      }
    }

    
    if (pathname === "/") {
      setStudentData({
        name: "",
        phone: "",
        email: "",
        batch: "",
        centre: "",
        date: new Date().toLocaleDateString("en-GB"),
      });
      setSignatureBase64(null);
      setPdfBase64(null);
      setIsAlreadySubmitted(false);
    }
  }, [pathname]);

  return (
    <FormContext.Provider
      value={{
        studentData,
        setStudentData,
        signatureBase64,
        setSignatureBase64,
        pdfBase64,
        setPdfBase64,
        isAlreadySubmitted,
        setIsAlreadySubmitted,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormContextProvider");
  }
  return context;
}
