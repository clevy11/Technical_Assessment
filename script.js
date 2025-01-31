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

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("Form submitted"); // Debug log

    try {
      // Basic validation
      const email = form.elements["email"].value;
      const phone = form.elements["phone"].value;
      const tinNumber = form.elements["tinNumber"].value;

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

      // Collect form data
      const formData = new FormData(form);
      const formObject = Object.fromEntries(formData.entries());
      console.log("Form data:", formObject); // Debug log

      // Show loading overlay
      loadingOverlay.classList.remove("hidden");

      console.log("Sending admin email...");
      const adminResponse = await emailjs.send(
        "service_5t0h6p1",
        "template_s0r60zg",
        {
          to_email: "p.touko@irembo.com",
          subject: "🔔 New RICA Import Permit Application",
          message: `
RICA Import Permit Application Details
------------------------------------

Applicant Information:
Email: ${formObject.email}
Phone: +250${formObject.phone}

Business Owner Details:
- Citizenship: ${formObject.citizenship}
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

This is an automated message from the RICA Import Permit System.`,
        }
      );

      // Log the response for debugging
      console.log(
        "Admin email status:",
        adminResponse.status,
        adminResponse.text
      );

      // Send confirmation to user
      console.log("Sending user confirmation email...");
      const userResponse = await emailjs.send(
        "service_5t0h6p1",
        "template_s0r60zg",
        {
          to_email: formObject.email,
          subject: "✅ RICA Import Permit - Application Received",
          message: `
Dear Valued Applicant,

We have successfully received your RICA Import Permit application. 

Application Summary:
------------------
Company Name: ${formObject.companyName}
TIN Number: ${formObject.tinNumber}
Business Type: ${formObject.businessType}

Product Details:
- Category: ${formObject.productCategory}
- Weight: ${formObject.weight} ${formObject.weightUnit}
- Quantity: ${formObject.quantity}

Next Steps:
1. Our team will review your application
2. You may be contacted if additional information is needed
3. The final decision will be communicated to this email address

Please save this email for your records. If you have any questions, please contact our support team.

Reference Number: RICA-${Date.now().toString(36)}

Best regards,
RICA Import Permit Team
--------------------
This is an automated message. Please do not reply to this email.`,
        }
      );

      // Log the response for debugging
      console.log("User email status:", userResponse.status, userResponse.text);

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
