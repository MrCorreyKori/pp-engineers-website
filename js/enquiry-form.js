const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const APPS_SCRIPT_ENDPOINT = "REPLACE_WITH_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
const SOURCE_LABEL = "ppengineers-contact-page";

function setStatus(statusEl, type, message) {
  statusEl.className = "form-status is-" + type;
  statusEl.textContent = message;
}

function isValidPhone(phone) {
  return /^[0-9+\-\s()]{8,20}$/.test(phone.trim());
}

function normalizePayload(form) {
  return {
    timestamp: new Date().toISOString(),
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    product_interest: form.product_interest.value.trim(),
    message: form.message.value.trim(),
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    source: SOURCE_LABEL,
    status: "new"
  };
}

function submitToWeb3Forms(form, payload) {
  const formData = new FormData();
  formData.append("access_key", form.access_key.value);
  formData.append("subject", form.subject.value);
  formData.append("from_name", form.from_name.value);
  formData.append("name", payload.name);
  formData.append("phone", payload.phone);
  formData.append("email", payload.email);
  formData.append("product_interest", payload.product_interest);
  formData.append("message", payload.message);
  formData.append("page_url", payload.page_url);
  formData.append("submitted_at", payload.timestamp);
  formData.append("user_agent", payload.user_agent);
  formData.append("botcheck", form.botcheck.checked ? "1" : "");
  return fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    body: formData
  });
}

function submitToGoogleSheets(payload) {
  if (!APPS_SCRIPT_ENDPOINT || APPS_SCRIPT_ENDPOINT.includes("REPLACE_WITH_")) {
    return Promise.resolve({ skipped: true });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  return fetch(APPS_SCRIPT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    signal: controller.signal
  })
    .finally(() => clearTimeout(timeout));
}

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("enquiryForm");
  const submitBtn = document.getElementById("enquirySubmitBtn");
  const statusEl = document.getElementById("enquiryStatus");

  if (!form || !submitBtn || !statusEl) {
    return;
  }

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const productInterest = form.product_interest.value.trim();

    if (!name || !phone || !productInterest) {
      setStatus(statusEl, "error", "Please fill Name, Phone Number, and Product Interest.");
      return;
    }

    if (!isValidPhone(phone)) {
      setStatus(statusEl, "error", "Please enter a valid phone number.");
      return;
    }

    if (!form.access_key.value || form.access_key.value.includes("REPLACE_WITH_")) {
      setStatus(statusEl, "error", "Form is not configured yet. Please add Web3Forms access key.");
      return;
    }

    submitBtn.disabled = true;
    setStatus(statusEl, "loading", "Submitting your enquiry...");

    const payload = normalizePayload(form);

    try {
      const response = await submitToWeb3Forms(form, payload);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit enquiry.");
      }

      setStatus(statusEl, "success", "Enquiry submitted successfully. Our team will contact you soon.");
      form.reset();

      submitToGoogleSheets(payload).catch(function(error) {
        console.warn("Google Sheets sync failed:", error);
      });
    } catch (error) {
      setStatus(statusEl, "error", "Submission failed. Please try again in a moment.");
      console.error("Enquiry submission error:", error);
    } finally {
      submitBtn.disabled = false;
    }
  });
});
