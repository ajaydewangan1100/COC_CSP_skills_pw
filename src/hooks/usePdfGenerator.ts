import { StudentData } from "@/context/FormContext";

export async function generatePdfBase64(
  studentData: StudentData,
  signatureBase64: string,
  verifyName: string,
  docType: string = "coc"
): Promise<string> {
  
  const { PDFDocument, rgb, StandardFonts, degrees } = await import("pdf-lib");

  
  let pdfUrl = docType === "csp" ? "/pwskills_csp.pdf" : "/pwskills_coc.pdf";
  if (docType === "csp" && studentData.batch === "Data Analytics with Gen AI - Batch 6") {
    pdfUrl = "/pwskills_csp_batch6.pdf";
  }
  const response = await fetch(pdfUrl);
  const existingPdfBytes = await response.arrayBuffer();

  
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize(); 

  
  page.drawText("Acknowledgement (Signature)", {
    x: 50,
    y: height - 80,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  
  const policyName = docType === "csp" ? "Career Services Policy" : "Learner Code of Conduct";
  page.drawText(`I ${studentData.name}, have read and understood the PW Skills ${policyName}.`, {
    x: 50,
    y: height - 130,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  page.drawText(`I agree to follow it and understand that violations may lead to disciplinary action.`, {
    x: 50,
    y: height - 150,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  
  page.drawText("Learner Signature:", {
    x: 50,
    y: height - 220,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Date: ${studentData.date}`, {
    x: 350,
    y: height - 220,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  
  let sigImage;
  if (signatureBase64.includes("image/png")) {
    sigImage = await pdfDoc.embedPng(signatureBase64);
  } else if (
    signatureBase64.includes("image/jpeg") ||
    signatureBase64.includes("image/jpg")
  ) {
    sigImage = await pdfDoc.embedJpg(signatureBase64);
  }

  if (sigImage) {
    
    
    const maxWidth = 150;
    const maxHeight = 60;
    
    
    const scale = Math.min(maxWidth / sigImage.width, maxHeight / sigImage.height);
    
    const finalW = sigImage.width * scale;
    const finalH = sigImage.height * scale;

    const drawX = 170;
    const drawY = height - 260; 

    page.drawImage(sigImage, {
      x: drawX,
      y: drawY,
      width: finalW,
      height: finalH,
    });
  }

  
  page.drawText(`Digitally signed by: ${verifyName}`, {
    x: 170,
    y: height - 275,
    size: 9,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  
  page.drawText(`Phone: ${studentData.phone}`, {
    x: 50,
    y: height - 300,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Batch/Course: ${studentData.batch}`, {
    x: 50,
    y: height - 320,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Centre: ${studentData.centre}`, {
    x: 50,
    y: height - 340,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  
  const pdfBase64 = await pdfDoc.saveAsBase64();
  return pdfBase64;
}
