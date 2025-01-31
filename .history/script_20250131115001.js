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
          from_name: "RICA Import Permit System",
          to_name: "Administrator",
          to_email: "p.touko@irembo.com",
          reply_to: formObject.email,
          subject: "New RICA Import Permit Application",
          message: `
<div style="font-family: Arial, sans-serif;">
    <h3>Business Owner Details:</h3>
    <ul>
        <li>Citizenship: ${formObject.citizenship}</li>
        <li>Phone: +250${formObject.phone}</li>
        <li>Email: ${formObject.email}</li>
        <li>Province: ${formObject.ownerProvince}</li>
    </ul>

    <h3>Business Details:</h3>
    <ul>
        <li>Business Type: ${formObject.businessType}</li>
        <li>Company Name: ${formObject.companyName}</li>
        <li>TIN Number: ${formObject.tinNumber}</li>
        <li>Registration Date: ${formObject.registrationDate}</li>
        <li>Business Province: ${formObject.businessProvince}</li>
    </ul>

    <h3>Product Information:</h3>
    <ul>
        <li>Purpose of Importation: ${formObject.importPurpose}</li>
        <li>Product Category: ${formObject.productCategory}</li>
        <li>Weight: ${formObject.weight} ${formObject.weightUnit}</li>
        <li>Quantity: ${formObject.quantity}</li>
        <li>Description: ${formObject.productDescription}</li>
    </ul>
</div>`,
          template_params: {
            email_service: "gmail",
            email_type: "notification",
            priority: "high",
          },
        }
      );
      console.log("Admin email sent successfully:", adminResponse);

      console.log("Sending user email...");
      const userResponse = await emailjs.send(
        "service_5t0h6p1",
        "template_s0r60zg",
        {
          from_name: "RICA Import Permit System",
          to_name: formObject.email.split("@")[0],
          to_email: formObject.email,
          reply_to: "p.touko@irembo.com",
          subject: "Your RICA Import Permit Application Confirmation",
          message: `
<div style="font-family: Arial, sans-serif;">
    <h3>Business Owner Details:</h3>
    <ul>
        <li>Citizenship: ${formObject.citizenship}</li>
        <li>Phone: +250${formObject.phone}</li>
        <li>Email: ${formObject.email}</li>
        <li>Province: ${formObject.ownerProvince}</li>
    </ul>

    <h3>Business Details:</h3>
    <ul>
        <li>Business Type: ${formObject.businessType}</li>
        <li>Company Name: ${formObject.companyName}</li>
        <li>TIN Number: ${formObject.tinNumber}</li>
        <li>Registration Date: ${formObject.registrationDate}</li>
        <li>Business Province: ${formObject.businessProvince}</li>
    </ul>

    <h3>Product Information:</h3>
    <ul>
        <li>Purpose of Importation: ${formObject.importPurpose}</li>
        <li>Product Category: ${formObject.productCategory}</li>
        <li>Weight: ${formObject.weight} ${formObject.weightUnit}</li>
        <li>Quantity: ${formObject.quantity}</li>
        <li>Description: ${formObject.productDescription}</li>
    </ul>
</div>

Dear ${formObject.email.split("@")[0]},

Thank you for submitting your RICA Import Permit application. Here are your application details:

Your application has been received and is being processed. We will contact you if we need any additional information.

Best regards,
RICA Import Permit Team
`,
          template_params: {
            email_service: "gmail",
            email_type: "confirmation",
            priority: "high",
          },
        }
      );
      console.log("User email sent successfully:", userResponse);

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
