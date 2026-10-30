"use client";

import React, { useEffect, useRef, useState } from "react";


interface PdfViewerProps {
  onLoadSuccess: () => void;
  docType?: string;
  batch?: string;
}

export default function PdfViewer({ onLoadSuccess, docType = "coc", batch }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        let pdfPath = docType === "csp" ? "/pwskills_csp.pdf" : "/pwskills_coc.pdf";
        if (docType === "csp" && batch === "Data Analytics with Gen AI - Batch 6") {
          pdfPath = "/pwskills_csp_batch6.pdf";
        }
        const loadingTask = pdfjsLib.getDocument({ url: pdfPath });
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;
        setTotalPages(pdf.numPages);
        setLoading(false);

        const container = containerRef.current;
        if (!container) return;

        
        container.innerHTML = "";

        let pagesRendered = 0;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          if (!isMounted) return;

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          
          const containerWidth = container.clientWidth - 24; 
          const originalViewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / originalViewport.width;
          const viewport = page.getViewport({ scale });

          
          const outputScale = Math.max(2, window.devicePixelRatio || 1);
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = "100%";
          canvas.style.height = "auto";

          const transform =
            outputScale !== 1
              ? [outputScale, 0, 0, outputScale, 0, 0]
              : undefined;

          const renderContext: any = {
            canvasContext: ctx,
            transform: transform,
            viewport: viewport,
          };

          await page.render(renderContext).promise;
          
          if (!isMounted) return;

          
          canvas.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
          canvas.style.borderRadius = "4px";
          canvas.style.backgroundColor = "#FFFFFF";

          const placeholder = document.createElement("div");
          placeholder.setAttribute("data-page", pageNum.toString());
          placeholder.style.width = "100%";
          placeholder.style.display = "flex";
          placeholder.style.justifyContent = "center";
          placeholder.appendChild(canvas);

          container.appendChild(placeholder);

          pagesRendered++;
          if (pagesRendered === pdf.numPages) {
            onLoadSuccess();
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("PDF load error:", err);
        setError("Failed to load PDF");
        setLoading(false);
        onLoadSuccess(); 
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [onLoadSuccess, docType]);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-[#E2E8F0] shadow-inner w-full relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-10 p-4">
          <div className="flex flex-col items-center justify-center gap-4 text-text-secondary">
            <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
            <p className="text-[14px] font-medium m-0">Loading PDF document...</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="h-[650px] overflow-y-auto w-full flex flex-col items-center" style={{ WebkitOverflowScrolling: 'touch' }}>
          {Array.from({ length: docType === "csp" ? (batch === "Data Analytics with Gen AI - Batch 6" ? 8 : 7) : 9 }).map((_, i) => (
            <img 
              key={i} 
              src={`/${docType === "csp" ? (batch === "Data Analytics with Gen AI - Batch 6" ? "csp-batch6" : "csp") : "coc"}-fallback/page-${i + 1}.png`} 
              alt={`${docType === "csp" ? "Career Services Policy" : "Code of Conduct"} Page ${i + 1}`}
              className="w-full h-auto block m-0 border-b border-gray-200"
              loading="lazy"
            />
          ))}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-[650px] overflow-y-auto p-4 flex flex-col items-center gap-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
        </div>
      )}

      {(totalPages || error) && (
        <div className="text-center p-2.5 bg-surface border-t border-border text-[13px] font-semibold text-text-secondary shadow-[0_-2px_10px_rgba(0,0,0,0.05)] relative z-20">
          Total Pages: {totalPages || (docType === "csp" ? (batch === "Data Analytics with Gen AI - Batch 6" ? 8 : 7) : 9)}
        </div>
      )}
    </div>
  );
}
