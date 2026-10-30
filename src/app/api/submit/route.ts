import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; 

const API_GATEWAY_URL = process.env.API_GATEWAY_URL ?? "";
const API_GATEWAY_CSP = process.env.API_GATEWAY_CSP ?? "";

export async function POST(req: NextRequest) {

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  
  
  const serverDate = new Date().toLocaleDateString("en-GB"); 
  const secureBody = { ...body, date: serverDate };
  
  const docType = (body.docType as string) || "coc";
  const targetScriptUrl = docType === "csp" ? API_GATEWAY_CSP : API_GATEWAY_URL;

  if (!targetScriptUrl) {
    return NextResponse.json(
      { success: false, error: "Server misconfiguration: missing script url." },
      { status: 500 }
    );
  }

  try {
    
    const gsResp = await fetch(targetScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(secureBody),
    });

    if (!gsResp.ok) {
      throw new Error(`Database Engine returned HTTP ${gsResp.status}`);
    }

    let gsData: Record<string, unknown> = {};
    try {
      gsData = await gsResp.json();
    } catch {
      
    }

    if (gsData?.status === "error") {
      throw new Error((gsData?.message as string) ?? "Submission rejected by server.");
    }

    
    return NextResponse.json({ success: true, verifiedDate: serverDate });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    console.error("[/api/submit] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ submitted: false });
  }

  const docType = req.nextUrl.searchParams.get("docType") || "coc";
  const targetScriptUrl = docType === "csp" ? API_GATEWAY_CSP : API_GATEWAY_URL;

  if (!targetScriptUrl) {
    return NextResponse.json({ submitted: false });
  }

  try {
    const resp = await fetch(
      `${targetScriptUrl}?action=check&phone=${encodeURIComponent(phone)}`
    );
    const json: { submitted?: boolean } = await resp.json();
    return NextResponse.json({ submitted: json.submitted === true });
  } catch {
    
    return NextResponse.json({ submitted: false });
  }
}
