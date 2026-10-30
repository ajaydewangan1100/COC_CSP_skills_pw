"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function Header({ isMaintenanceMode = false }: { isMaintenanceMode?: boolean }) {
  const pathname = usePathname();
  const params = useParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isHomePage = pathname === "/";
  const docType = (params?.docType as string) || "coc";
  const steps = [
    { id: 1, label: "Details", path: `/${docType}/details` },
    { id: 2, label: docType === "csp" ? "CSP" : "COC", path: `/${docType}/preview` },
    { id: 3, label: "Sign", path: `/${docType}/sign` },
    { id: 4, label: "Done", path: `/${docType}/done` },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    
    handleResize();
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  let currentStep = steps.findIndex((s) => pathname.startsWith(s.path)) + 1;
  if (currentStep === 0) currentStep = 1;

  
  const showProgressBar = !isHomePage && currentStep !== 4 && !isMaintenanceMode;
  const isDone = currentStep === 4 || isMaintenanceMode || isHomePage;

  return (
    <>
      {}
      <div className={`w-full ${isDone ? 'h-[70px]' : 'h-[145px]'}`} />

      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 w-full pointer-events-none`}>
        
        {}
        {showProgressBar && (
          <>
            {}
            <div 
              className={`w-full bg-surface border-b border-border absolute top-0 left-0 transition-transform duration-500 ease-in-out pointer-events-auto ${
                isScrolled && !isMobile ? '-translate-y-full' : 'translate-y-0'
              }`}
              style={{ height: '65px', zIndex: 10 }}
            />
            {}
            <div 
              className={`w-full bg-surface border-b border-border absolute left-0 transition-all duration-500 ease-in-out pointer-events-auto ${
                isScrolled && !isMobile ? 'top-0 h-[85px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : 
                isScrolled && isMobile ? 'top-[65px] h-[80px] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'top-[65px] h-[80px]'
              }`}
              style={{ zIndex: 20 }}
            />
          </>
        )}

        {}
        {isDone && (
          <div 
            className={`w-full bg-surface border-b border-border absolute top-0 left-0 pointer-events-auto h-[70px] transition-shadow duration-300 ${
              isScrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'shadow-none'
            }`}
            style={{ zIndex: 20 }}
          />
        )}

        <div className="w-full relative h-[145px] pointer-events-none" style={{ zIndex: 30 }}>
          
          {}
          <div 
            className="absolute transition-all duration-500 ease-in-out flex items-center justify-start gap-3 whitespace-nowrap pointer-events-auto"
            style={{
              top: isScrolled && showProgressBar && !isMobile ? '24px' : '16px',
              left: isScrolled && showProgressBar && !isMobile ? '24px' : 'max(24px, calc(50% - 480px))',
              transform: isScrolled && showProgressBar && !isMobile ? 'scale(0.85)' : 'scale(1)',
              transformOrigin: 'left center'
            }}
          >
            <Link href="/" className="flex items-center no-underline">
              <img src="/pwskills-logo.png" alt="PW Skills" className="h-[40px] sm:h-[48px] w-auto object-contain" />
            </Link>
            {!isHomePage && (
              <h1 className="text-text-secondary text-[14px] sm:text-[15px] font-medium m-0 border-l border-border pl-3 sm:pl-4 leading-[1]">
                {docType === 'csp' ? 'Career Services Policy' : 'Code of Conduct'}
              </h1>
            )}
          </div>

          {}
          {showProgressBar && (
            <div 
              className="absolute transition-all duration-500 ease-in-out flex items-center justify-center w-full max-w-[400px] pointer-events-auto"
              style={{
                top: isScrolled && !isMobile ? '14px' : '78px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[12px] sm:text-[13px] font-bold border-2 transition-all duration-300
                          ${isActive ? "border-primary bg-primary text-white shadow-[0_0_0_4px_rgba(235,90,70,0.15)]" : ""}
                          ${isCompleted ? "border-success bg-success text-white" : ""}
                          ${!isActive && !isCompleted ? "border-border bg-surface text-text-muted" : ""}
                        `}
                      >
                        {isCompleted ? "✓" : step.id}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.3px] whitespace-nowrap transition-all duration-300
                          ${isActive ? "text-primary" : ""}
                          ${isCompleted ? "text-success" : ""}
                          ${!isActive && !isCompleted ? "text-text-muted" : ""}
                        `}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-[2px] mx-[4px] sm:mx-[6px] max-w-[50px] mb-[15px] sm:mb-[18px] transition-all duration-500 ${
                          isCompleted ? "bg-success" : "bg-border"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
