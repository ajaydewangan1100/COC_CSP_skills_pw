import { StudentData } from "@/context/FormContext";


export async function checkDuplicatePhone(phone: string, docType: string = "coc"): Promise<boolean> {
  try {
    const resp = await fetch(`/api/submit?phone=${encodeURIComponent(phone)}&docType=${docType}`);
    if (!resp.ok) return false;
    const json: { submitted?: boolean } = await resp.json();
    return json.submitted === true;
  } catch {
    
    return false;
  }
}

export interface SubmitResult {
  success: boolean;
  error?: string;
  verifiedDate?: string;
}


export async function submitFormPayload(
  payload: StudentData & { pdfBase64: string, docType?: string }
): Promise<SubmitResult> {
  try {
    const resp = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json: SubmitResult = await resp.json();

    if (!resp.ok || !json.success) {
      return {
        success: false,
        error: json.error ?? "Submission failed. Please try again.",
      };
    }

    return { success: true, verifiedDate: json.verifiedDate };
  } catch (err: unknown) {
    const msg =
      err instanceof TypeError
        ? "Network error — please check your internet connection and try again."
        : "Unexpected error. Please try again.";
    return { success: false, error: msg };
  }
}
