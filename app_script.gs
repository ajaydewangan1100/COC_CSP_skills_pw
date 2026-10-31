// ===================== CONFIG =====================
const SPREADSHEET_ID = "1---------------------------------jE";
const ROOT_FOLDER_ID = "1o----------------------------TO";
const DOC_SUFFIX = "COC"; // 'CSP' or 'COC' -> used in the PDF file name (Name_Phone_CSP.pdf)
const SECRET = ""; // optional: set a string here and send it as "secret" from the frontend to block random callers
const TIMEZONE = "Asia/Kolkata";
const STATUS_VALUE = "Signed";
const CREATE_MISSING_FOLDERS = true; // auto-create centre/course/batch folders if missing
const CHECK_DUPLICATE_ON_SUBMIT = true; // reject if the phone already exists in any tab
const MAKE_LINK_VIEWABLE = false; // true => anyone with link can view the PDF

// Course name -> sheet tab prefix (tab = prefix + "-" + batch number, e.g. DA-6)
const COURSE_PREFIX = {
  "data analytics with gen ai": "DA",
  "digital marketing with ai": "DM",
  "full stack development with gen ai": "FSD",
  "dsa": "DSA",
};
// ==================================================

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse(e.postData.contents);
    log_("1/7 request received", {
      name: data.name,
      phone: maskPhone_(data.phone),
      email: data.email,
      batch: data.batch,
      centre: data.centre,
      pdfBase64Length: data.pdfBase64 ? String(data.pdfBase64).length : 0,
    });

    // Optional secret check (only enforced if SECRET is set above)
    if (SECRET && data.secret !== SECRET)
      return json_({ success: false, error: "Unauthorized" });

    const required = ["name", "email", "phone", "batch", "centre", "pdfBase64"];
    for (const k of required) {
      if (!data[k])
        return json_({ success: false, error: "Missing field: " + k });
    }

    // data.batch looks like "Data Analytics with Gen AI - Batch 6"
    const m = String(data.batch)
      .trim()
      .match(/^(.*?)\s*-\s*Batch\s*(\d+)\s*$/i);
    if (!m)
      return json_({
        success: false,
        error: "Invalid batch format: " + data.batch,
      });
    data.course = m[1].trim(); // "Data Analytics with Gen AI"
    const batchNo = m[2]; // "6"

    const prefix = COURSE_PREFIX[data.course.toLowerCase()];
    if (!prefix)
      return json_({ success: false, error: "Unknown course: " + data.course });

    const sheetName = prefix + "-" + batchNo;
    log_("2/7 validated, target tab resolved", {
      course: data.course,
      batchNo: batchNo,
      sheetName: sheetName,
    });
    const sheet =
      SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
    if (!sheet)
      return json_({
        success: false,
        error: "Sheet tab not found: " + sheetName,
      });

    // Only one request writes at a time, so rows never overwrite each other
    lock.waitLock(30000);
    log_("3/7 lock acquired, sheet tab found");

    const isDup = CHECK_DUPLICATE_ON_SUBMIT && phoneExists_(data.phone);
    log_("4/7 duplicate check", {
      enabled: CHECK_DUPLICATE_ON_SUBMIT,
      duplicate: isDup,
    });
    if (isDup) {
      return json_({
        success: false,
        error: "This phone number has already submitted the document.",
      });
    }

    // 1) Save PDF to Drive
    const folder = getTargetFolder_(
      data.centre,
      data.course,
      "Batch " + batchNo,
    );
    log_("5/7 Drive folder ready", {
      path: data.centre + " / " + data.course + " / Batch " + batchNo,
      folderId: folder.getId(),
    });
    const fileName =
      safeName_(data.name) +
      "_" +
      String(data.phone).replace(/\D/g, "") +
      "_" +
      DOC_SUFFIX +
      ".pdf";
    const bytes = Utilities.base64Decode(
      String(data.pdfBase64).replace(/^data:application\/pdf;base64,/, ""),
    );
    const blob = Utilities.newBlob(bytes, "application/pdf", fileName);
    const file = folder.createFile(blob);
    if (MAKE_LINK_VIEWABLE)
      file.setSharing(
        DriveApp.Access.ANYONE_WITH_LINK,
        DriveApp.Permission.VIEW,
      );
    const pdfUrl = file.getUrl();
    log_("6/7 PDF saved to Drive", {
      fileName: fileName,
      sizeBytes: bytes.length,
      url: pdfUrl,
    });

    // 2) Append row
    const now = new Date();
    const timeStr = Utilities.formatDate(now, TIMEZONE, "dd/MM/yyyy HH:mm:ss");
    // Always IST, same as the Time column (the Next.js server may run in UTC)
    const dateStr = Utilities.formatDate(now, TIMEZONE, "dd/MM/yyyy");

    const row = [
      timeStr, // A Time
      data.name, // B Name
      data.email, // C Email
      data.phone, // D Phone No.
      data.course + " - Batch " + batchNo, // E Courses & Batches
      data.centre, // F Centre
      dateStr, // G Date
      pdfUrl, // H PDF Link
      STATUS_VALUE, // I Status
    ];

    const newRow = sheet.getLastRow() + 1;
    // keep Time and Date as plain text so Sheets doesn't reformat them
    sheet.getRange(newRow, 1).setNumberFormat("@");
    sheet.getRange(newRow, 7).setNumberFormat("@");
    sheet.getRange(newRow, 1, 1, row.length).setValues([row]);
    SpreadsheetApp.flush();
    log_("7/7 row added to sheet", { sheet: sheetName, row: newRow });

    return json_({
      success: true,
      sheet: sheetName,
      row: newRow,
      pdfUrl: pdfUrl,
    });
  } catch (err) {
    log_("ERROR", { message: String(err), stack: err && err.stack });
    return json_({ success: false, error: String(err) });
  } finally {
    try {
      lock.releaseLock();
    } catch (x) {}
  }
}

// Handy to confirm the deployment is live (open the /exec URL in a browser)
// Also answers the duplicate check:  <url>?action=check&phone=9876543210  ->  {"submitted": true/false}
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === "check") {
    log_("CHECK request", { phone: maskPhone_(p.phone) });
    try {
      return json_({ submitted: phoneExists_(p.phone) });
    } catch (err) {
      return json_({ submitted: false, status: "error", message: String(err) });
    }
  }
  return json_({ ok: true, message: "CSP endpoint running" });
}

// Looks for the phone number in column D of every sheet tab
function phoneExists_(phone) {
  const target = String(phone || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (target.length < 10) return false;
  const sheets = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets();
  for (const sh of sheets) {
    // only batch tabs like DA-6, DM-2, FSD-3 (skips Old_Data_Backup_COC_Submissions etc.)
    if (!/^[A-Za-z]+-\d+$/.test(sh.getName())) continue;
    const last = sh.getLastRow();
    if (last < 2) continue;
    const vals = sh.getRange(2, 4, last - 1, 1).getValues();
    for (const r of vals) {
      if (String(r[0]).replace(/\D/g, "").slice(-10) === target) return true;
    }
  }
  return false;
}

// ---------- logging ----------
// View logs in Apps Script editor -> Executions (left sidebar) -> click a run.
function log_(step, info) {
  console.log(
    "[" + DOC_SUFFIX + "] " + step + (info ? " " + JSON.stringify(info) : ""),
  );
}
function maskPhone_(p) {
  const s = String(p || "").replace(/\D/g, "");
  return s.length >= 4 ? s.slice(0, 2) + "******" + s.slice(-2) : s;
}

// ---------- test (run from the editor, no frontend needed) ----------
// WARNING: this writes a REAL row in the DA-6 tab and a real PDF in Drive.
// Delete the test row/file afterwards. Change the phone each run, or set
// CHECK_DUPLICATE_ON_SUBMIT = false while testing.
function testPost_() {
  const minimalPdf =
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
  const payload = {
    name: "Test Student",
    phone: "9000000001",
    email: "test@example.com",
    batch: "Data Analytics with Gen AI - Batch 6",
    centre: "Pune",
    pdfBase64: Utilities.base64Encode(minimalPdf),
  };
  const out = doPost({ postData: { contents: JSON.stringify(payload) } });
  console.log("TEST RESULT: " + out.getContent());
}

// ---------- helpers ----------
function getTargetFolder_(centre, course, batch) {
  let folder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  [centre, course, batch].forEach(function (name) {
    folder = getOrCreateChild_(folder, String(name).trim());
  });
  return folder;
}

function getOrCreateChild_(parent, name) {
  const it = parent.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  if (!CREATE_MISSING_FOLDERS) throw new Error("Folder not found: " + name);
  return parent.createFolder(name);
}

function safeName_(s) {
  return String(s)
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_");
}

function json_(obj) {
  // Normalise to the format the Next.js route expects: {status: "success"|"error", message}
  if (obj.success === true) obj.status = "success";
  if (obj.success === false) {
    obj.status = "error";
    obj.message = obj.error;
  }
  log_("RESPONSE sent", {
    status: obj.status,
    message: obj.message,
    submitted: obj.submitted,
  });
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// Run once from the editor to grant Drive + Sheets permissions
function authorize_() {
  DriveApp.getFolderById(ROOT_FOLDER_ID);
  SpreadsheetApp.openById(SPREADSHEET_ID);
}
