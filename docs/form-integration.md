# Form Integration Guide (Web3Forms + Google Sheets)

## Overview
This project uses:
- Web3Forms for email delivery of enquiries
- Google Apps Script Web App for logging enquiries to Google Sheets

Primary files:
- `contact.html`
- `js/enquiry-form.js`

## 1) Configure Web3Forms
1. Create a free account at Web3Forms.
2. Generate your `access_key`.
3. Open `contact.html`.
4. Replace:
   - `REPLACE_WITH_WEB3FORMS_ACCESS_KEY`

## 2) Create Google Sheet
Create a Google Sheet named `Website Enquiries`.

Header row (exact order):
1. `timestamp`
2. `name`
3. `phone`
4. `email`
5. `product_interest`
6. `message`
7. `page_url`
8. `source`
9. `status`

## 3) Create Apps Script Web App
1. In the Google Sheet: `Extensions` -> `Apps Script`
2. Replace script with:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || "{}");

    if (!data.name || !data.phone) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Missing required fields" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Website Enquiries");
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Sheet not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.phone || "",
      data.email || "",
      data.product_interest || "",
      data.message || "",
      data.page_url || "",
      data.source || "website",
      data.status || "new"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Deploy -> `New deployment` -> `Web app`
4. Execute as: `Me`
5. Who has access: `Anyone`
6. Copy the Web App URL.

## 4) Configure Apps Script URL in site
1. Open `js/enquiry-form.js`
2. Replace:
   - `REPLACE_WITH_GOOGLE_APPS_SCRIPT_WEB_APP_URL`

## 5) Test Checklist
1. Submit valid enquiry on `/contact`.
2. Confirm success message appears.
3. Confirm enquiry email is received.
4. Confirm row is added in `Website Enquiries` sheet.
5. Submit with missing required fields and confirm validation error.
6. Temporarily break network and confirm user sees failure message.

## Notes
- If Web3Forms succeeds but Sheets fails, the user still sees success and lead still reaches email.
- Keep keys/URLs updated if rotated.
