"use client";

import React, { useRef, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useFormContext } from "@/context/FormContext";

export default function SignatureUpload() {
  const { signatureBase64, setSignatureBase64 } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleCropComplete = () => {
    if (!completedCrop || !imgRef.current) {
      setIsCropping(false);
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    
    if (completedCrop.width === 0 || completedCrop.height === 0) {
      setIsCropping(false);
      return;
    }
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );

      setSignatureBase64(canvas.toDataURL("image/png"));
    }
    setIsCropping(false);
    setCrop(undefined);
  };

  const validateSignature = (dataUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        
        const MAX_WIDTH = 200;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        if (!ctx) {
          resolve(true); 
          return;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let totalBrightness = 0;
        let validPixels = 0;
        
        let redPixels = 0;
        let bluePixels = 0;
        let greenPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a < 10) continue;
          
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;
          validPixels++;

          
          if (r > g + 40 && r > b + 40) redPixels++;
          if (b > r + 40 && b > g + 40) bluePixels++;
          if (g > r + 40 && g > b + 40) greenPixels++;
        }
        
        if (validPixels === 0) {
          resolve(true);
          return;
        }

        const avgBrightness = totalBrightness / validPixels;
        let darkPixels = 0;

        
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 10) continue;
          
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          if (brightness < avgBrightness - 40) {
            darkPixels++;
          }
        }
        
        const dynamicDarkRatio = darkPixels / validPixels;
        
        
        
        const hasRed = (redPixels / validPixels) > 0.015; 
        const hasBlue = (bluePixels / validPixels) > 0.015;
        const hasGreen = (greenPixels / validPixels) > 0.015;
        
        let colorCount = 0;
        if (hasRed) colorCount++;
        if (hasBlue) colorCount++;
        if (hasGreen) colorCount++;
        
        const isMultiColor = colorCount >= 2;

        
        if (dynamicDarkRatio > 0.30 || isMultiColor) {
          resolve(false); 
        } else {
          resolve(true);
        }
      };
      img.onerror = () => resolve(true); 
      img.src = dataUrl;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) {
        const msg = "⚠️ File too large! Please upload a signature under 200KB.";
        alert(msg);
        setErrorMsg(msg);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        const msg = "⚠️ Invalid file format! Please upload your signature as a JPG or PNG image only.";
        alert(msg);
        setErrorMsg(msg);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          const isValid = await validateSignature(dataUrl);
          
          if (!isValid) {
            setErrorMsg("⚠️ Invalid Image Detected! Please upload a clear photo of your signature on white paper. selfies, any other images, or heavy dark images are not allowed.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          
          
          setSignatureBase64(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setSignatureBase64(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRotate = () => {
    if (!signatureBase64) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2); 
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        setSignatureBase64(canvas.toDataURL("image/png"));
      }
    };
    img.src = signatureBase64;
  };

  return (
    <div className="border-2 border-dashed border-border rounded-xl p-[30px_20px] text-center bg-[#FAFAFA]">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />
      
      {!signatureBase64 ? (
        <>
          <button
            type="button"
            className="w-full px-6 py-3.5 border-[1.5px] border-border rounded-sm font-sans text-[15px] font-semibold bg-surface text-text cursor-pointer transition-colors hover:bg-[#F8FAFC] hover:border-text-muted"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </button>
          <p className="mt-2.5 text-[13px] text-text-secondary">
            Upload a clear photo of your signature (PNG or JPG, under 200KB)
          </p>
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-md text-left leading-relaxed">
              {errorMsg}
            </div>
          )}
        </>
      ) : isCropping ? (
        <div className="mt-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-[60vh] overflow-hidden rounded-lg border border-[#E2E8F0] mx-auto"
          >
            <img
              ref={imgRef}
              src={signatureBase64}
              alt="Crop me"
              className="max-h-[60vh] max-w-full"
            />
          </ReactCrop>
          <div className="flex justify-center gap-3 mt-4">
            <button
              type="button"
              className="px-5 py-2.5 border border-success bg-success-bg text-success-dark font-semibold rounded-sm text-[14px] cursor-pointer transition-colors hover:bg-success hover:text-white flex items-center gap-2"
              onClick={handleCropComplete}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Save Crop
            </button>
            <button
              type="button"
              className="px-5 py-2.5 border-[1.5px] border-border rounded-sm text-[14px] font-semibold bg-surface text-text-secondary cursor-pointer transition-colors hover:bg-[#F8FAFC] hover:border-text-muted"
              onClick={() => { setIsCropping(false); setCrop(undefined); }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <img
            src={signatureBase64}
            alt="Signature Preview"
            className="max-h-[120px] max-w-full border border-[#E2E8F0] rounded-lg mx-auto"
          />
          <div className="flex justify-center flex-wrap gap-3 mt-4">
            <button
              type="button"
              className="px-5 py-2.5 border-[1.5px] border-border rounded-sm text-[14px] font-semibold bg-surface text-text cursor-pointer transition-colors hover:bg-[#F8FAFC] hover:border-text-muted flex items-center gap-2"
              onClick={() => setIsCropping(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
                <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
              </svg>
              Crop
            </button>
            <button
              type="button"
              className="px-5 py-2.5 border-[1.5px] border-border rounded-sm text-[14px] font-semibold bg-surface text-text cursor-pointer transition-colors hover:bg-[#F8FAFC] hover:border-text-muted flex items-center gap-2"
              onClick={handleRotate}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Rotate
            </button>
            <button
              type="button"
              className="px-5 py-2.5 border-[1.5px] border-border rounded-sm text-[14px] font-semibold bg-surface text-text-secondary cursor-pointer transition-colors hover:bg-error-bg hover:border-error hover:text-error flex items-center gap-2"
              onClick={handleRemove}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
