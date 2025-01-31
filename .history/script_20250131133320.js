document.addEventListener("DOMContentLoaded", function () {
  // Get form elements
  const form = document.getElementById("ricaForm");
  if (!form) {
    console.error("Form not found!");
    return;
  }

  const citizenshipSelect = document.getElementById("citizenship");
  const importPurposeSelect = document.getElementById("importPurpose");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const idNumberContainer = document.getElementById("idNumberContainer");
  const passportContainer = document.getElementById("passportContainer");
  const idNumberInput = document.getElementById("idNumber");
  const passportInput = document.getElementById("passport");

  if (!loadingOverlay) {
    console.error("Loading overlay not found!");
    return;
  }

  // Helper function to show notifications
  function showNotification(message, isSuccess = true) {
    Toastify({
      text: message,
      duration: 5000,
      gravity: "top",
      position: "right",
      style: {
        background: isSuccess ? "#4CAF50" : "#F44336",
      },
    }).showToast();
  }

  // Handle import purpose selection
  if (importPurposeSelect) {
    importPurposeSelect.addEventListener("change", function () {
      const specifyPurposeContainer = document.getElementById(
        "specifyPurposeContainer"
      );
      const specifyPurposeInput = document.getElementById("specifyPurpose");

      if (
        this.value === "other" &&
        specifyPurposeContainer &&
        specifyPurposeInput
      ) {
        specifyPurposeContainer.classList.remove("hidden");
        specifyPurposeInput.required = true;
      } else if (specifyPurposeContainer && specifyPurposeInput) {
        specifyPurposeContainer.classList.add("hidden");
        specifyPurposeInput.required = false;
        specifyPurposeInput.value = "";
      }
    });
  }

  // Handle citizenship selection
  if (citizenshipSelect) {
    citizenshipSelect.addEventListener("change", function () {
      if (this.value === "rwandan") {
        idNumberContainer.classList.remove("hidden");
        passportContainer.classList.add("hidden");
        idNumberInput.required = true;
        passportInput.required = false;
        passportInput.value = "";
      } else if (this.value === "foreigner") {
        idNumberContainer.classList.add("hidden");
        passportContainer.classList.remove("hidden");
        idNumberInput.required = false;
        passportInput.required = true;
        idNumberInput.value = "";
      } else {
        idNumberContainer.classList.add("hidden");
        passportContainer.classList.add("hidden");
        idNumberInput.required = false;
        passportInput.required = false;
        idNumberInput.value = "";
        passportInput.value = "";
      }
    });
  }

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("Form submitted"); // Debug log

    try {
      // Basic validation
      const email = form.elements["email"].value;
      const phone = form.elements["phone"].value;
      const tinNumber = form.elements["tinNumber"].value;
      const citizenship = form.elements["citizenship"].value;

      if (!email) {
        showNotification("Please enter an email address", false);
        return;
      }

      if (!phone || phone.length !== 9) {
        showNotification("Please enter a valid 9-digit phone number", false);
        return;
      }

      if (!tinNumber || tinNumber.length !== 9) {
        showNotification("Please enter a valid 9-digit TIN number", false);
        return;
      }

      // Add ID validation
      if (citizenship === "rwandan") {
        const idNumber = form.elements["idNumber"].value;
        if (!idNumber || idNumber.length !== 16 || !/^\d+$/.test(idNumber)) {
          showNotification(
            "Please enter a valid 16-digit National ID number",
            false
          );
          return;
        }
      } else if (citizenship === "foreigner") {
        const passport = form.elements["passport"].value;
        if (!passport) {
          showNotification("Please enter a valid Passport number", false);
          return;
        }
      }

      // Collect form data
      const formData = new FormData(form);
      const formObject = Object.fromEntries(formData.entries());
      console.log("Form data:", formObject); // Debug log

      // Show loading overlay
      loadingOverlay.classList.remove("hidden");

      // Update the email message to include ID/Passport information
      const idInfo =
        citizenship === "rwandan"
          ? `National ID: ${formObject.idNumber}`
          : `Passport Number: ${formObject.passport}`;

      console.log("Sending admin email...");
      const adminResponse = await emailjs.send(
        "service_5t0h6p1",
        "template_s0r60zg",
        {
          subject: "New RICA Import Permit Application",
          to_email: "p.touko@irembo.com",
          reply_to: formObject.email,
          message: `
New application received from ${formObject.email}

Business Owner Details:
- Citizenship: ${formObject.citizenship}
- ${idInfo}
- Phone: +250${formObject.phone}
- Email: ${formObject.email}
- Province: ${formObject.ownerProvince}

Business Details:
- Business Type: ${formObject.businessType}
- Company Name: ${formObject.companyName}
- TIN Number: ${formObject.tinNumber}
- Registration Date: ${formObject.registrationDate}
- Business Province: ${formObject.businessProvince}

Product Information:
- Purpose of Importation: ${formObject.importPurpose}
- Product Category: ${formObject.productCategory}
- Weight: ${formObject.weight} ${formObject.weightUnit}
- Quantity: ${formObject.quantity}
- Description: ${formObject.productDescription}
`,
        }
      );
      console.log(
        "Full admin email response:",
        JSON.stringify(adminResponse, null, 2)
      );

      console.log("Sending user email...");
      const userResponse = await emailjs.send(
        "service_5t0h6p1",
        "template_s0r60zg",
        {
          subject:
            "[IMPORTANT] Your RICA Import Permit Application Confirmation",
          to_email: formObject.email,
          reply_to: "p.touko@irembo.com",
          message: `
Dear Applicant,

Thank you for submitting your RICA Import Permit application. Here are your application details:

Business Owner Details:
- Citizenship: ${formObject.citizenship}
- ${idInfo}
- Phone: +250${formObject.phone}
- Email: ${formObject.email}
- Province: ${formObject.ownerProvince}

Business Details:
- Business Type: ${formObject.businessType}
- Company Name: ${formObject.companyName}
- TIN Number: ${formObject.tinNumber}
- Registration Date: ${formObject.registrationDate}
- Business Province: ${formObject.businessProvince}

Product Information:
- Purpose of Importation: ${formObject.importPurpose}
- Product Category: ${formObject.productCategory}
- Weight: ${formObject.weight} ${formObject.weightUnit}
- Quantity: ${formObject.quantity}
- Description: ${formObject.productDescription}

Your application has been received and is being processed. We will contact you if we need any additional information.

Best regards,
RICA Import Permit Team
`,
        }
      );
      console.log(
        "Full user email response:",
        JSON.stringify(userResponse, null, 2)
      );

      console.log("Checking email status...");
      if (adminResponse.status === 200 && userResponse.status === 200) {
        showNotification(
          "Application submitted successfully! Please check your email (including spam/junk folder) for confirmation. If you don't see it, please wait a few minutes and check again.",
          true
        );

        // Show additional guidance
        alert(`Important: 
        1. Check your spam/junk folder
        2. Add noreply@emailjs.com to your contacts
        3. If you still don't see the email in 5 minutes, please try these steps:
           - Check your email address: ${formObject.email}
           - Try a different email provider (Gmail, Yahoo, etc.)
           - Contact support if the issue persists`);

        form.reset();
      } else {
        throw new Error(
          "Email sending failed with status: " +
            `Admin: ${adminResponse.status}, User: ${userResponse.status}`
        );
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      showNotification(
        `Failed to submit application: ${
          error.message || "Unknown error occurred"
        }. Please try again or contact support.`,
        false
      );
    } finally {
      loadingOverlay.classList.add("hidden");
    }
  });
});
