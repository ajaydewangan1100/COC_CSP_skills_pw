# Student Document Submission: Apps Script Backend

Google Apps Script web app that receives signed-document data from the Next.js frontend, saves the PDF to Google Drive and adds a row to a Google Sheet.

The same [app script](app_script.gs) is used for both documents. Deploy one copy per document, each with its own sheet, Drive folder and deployment URL.

| Document                     | Env var in Next.js | `DOC_SUFFIX` |
| ---------------------------- | ------------------ | ------------ |
| CSP (Career Services Policy) | `API_GATEWAY_CSP`  | `'CSP'`      |
| COC (Code of Conduct)        | `API_GATEWAY_URL`  | `'COC'`      |

Find code in this file - [app script](app_script.gs)

## How it works

1. The frontend POSTs to `/api/submit` (`route.ts`), which forwards the request to the script URL for the right `docType`.
2. The script validates the data and checks that the phone number was not used before.
3. The PDF is saved to `Root / Centre / Course / Batch N / Name_Phone_<CSP|COC>.pdf`. Missing folders are created.
4. A new row is added to the tab for that course and batch (`DA-6`, `DM-2` and so on).
5. The script returns `{status: "success"}` or `{status: "error", message}`.

## Sheet columns

`Time | Name | Email | Phone No. | Courses & Batches | Centre | Date | PDF Link | Status`

Tab name is built from the course and batch number: `DA` (Data Analytics with Gen AI), `DM` (Digital Marketing with AI), `FSD` (Full Stack Development with Gen AI), `DSA`. For example, "Data Analytics with Gen AI - Batch 6" goes to tab `DA-6`.

## Setup

1. Open the Google Sheet, then Extensions > Apps Script, and paste in `Code.gs`.
2. Edit the CONFIG block at the top:
   - `SPREADSHEET_ID`: from the sheet URL (`/d/<ID>/edit`)
   - `ROOT_FOLDER_ID`: from the root Drive folder URL (`/folders/<ID>`)
   - `DOC_SUFFIX`: `'CSP'` or `'COC'`
   - `CHECK_DUPLICATE_ON_SUBMIT`: keep `true`
3. Select `authorize_` and click Run. Accept the Drive and Sheets permissions.
4. Deploy > New deployment > Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the `/exec` URL into `.env.local`:
   ```
   API_GATEWAY_CSP=https://script.google.com/macros/s/.../exec
   API_GATEWAY_URL=https://script.google.com/macros/s/.../exec
   ```
6. Restart `npm run dev`.

After any code change, redeploy with Deploy > Manage deployments > pencil icon > Version: New version > Deploy. Saving the code does not update the live web app.

## Request format

POST body (JSON, sent as `text/plain`):

```json
{
  "name": "Student Name",
  "email": "student@gmail.com",
  "phone": "9876543210",
  "batch": "Data Analytics with Gen AI - Batch 6",
  "centre": "Pune",
  "pdfBase64": "JVBERi0xLjcK..."
}
```

Duplicate check (GET): `<url>?action=check&phone=9876543210` returns `{"submitted": true|false}`.

The centre must exactly match a Drive folder name, or a new folder is created.

## Duplicate phone numbers

The phone is checked in column D of all batch tabs (names like `DA-6`). Other tabs, such as backups, are skipped. A repeat phone is rejected with "This phone number has already submitted the document." and no row is added.

## Testing and logs

- Run `testPost_` in the editor. It writes a real row to `DA-6` and a real PDF. Delete both afterwards, and change the test phone between runs.
- Logs are in the editor under Executions. Each line starts with `[CSP]` or `[COC]`.
- A submission logs steps `1/7` to `7/7`. The last numbered line shows where a failed run stopped.
- Phone numbers are masked in logs and the PDF content is never logged.

## Troubleshooting

| Error                           | Cause and fix                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Illegal spreadsheet id or key` | `SPREADSHEET_ID` still holds the placeholder.                                                          |
| `Access denied: DriveApp`       | Run `authorize_`, set "Execute as: Me", use the `/exec` URL (not `/dev`), then redeploy a new version. |
| `Unknown course: ...`           | Add the course name to `COURSE_PREFIX`.                                                                |
| `Sheet tab not found: DA-6`     | Create the tab, or check the batch number.                                                             |
| Duplicate rows added            | Check `CHECK_DUPLICATE_ON_SUBMIT` and redeploy. See the `4/7` log line.                                |
| No logs for a frontend request  | The URL in `.env.local` points to a different project or an old deployment.                            |

## Next.js route

In `route.ts`, treat any response without `status: "success"` as an error. A non-JSON response, such as an HTML error page, should not count as a successful submission.


