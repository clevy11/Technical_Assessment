document.addEventListener("DOMContentLoaded", function () {
  // Get form elements
  const form = document.getElementById("ricaForm");
  const citizenshipSelect = document.getElementById("citizenship");
  const idNumberContainer = document.getElementById("idNumberContainer");
  const passportContainer = document.getElementById("passportContainer");
  const idNumberInput = document.getElementById("idNumber");
  const passportInput = document.getElementById("passport");
  const importPurposeSelect = document.getElementById("importPurpose");
  const specifyPurposeContainer = document.getElementById(
    "specifyPurposeContainer"
  );
  const specifyPurposeInput = document.getElementById("specifyPurpose");
  const loadingOverlay = document.getElementById("loadingOverlay");

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

  // Handle citizenship selection
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

  // Handle import purpose selection
  importPurposeSelect.addEventListener("change", function () {
    if (this.value === "other") {
      specifyPurposeContainer.classList.remove("hidden");
      specifyPurposeInput.required = true;
    } else {
      specifyPurposeContainer.classList.add("hidden");
      specifyPurposeInput.required = false;
      specifyPurposeInput.value = "";
    }
  });

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate ID number if Rwandan
    if (citizenshipSelect.value === "rwandan") {
      if (idNumberInput.value.length !== 16) {
        showNotification("ID number must be 16 digits", false);
        return;
      }
    }

    // Validate TIN number
    const tinInput = form.elements["tinNumber"];
    if (tinInput.value.length !== 9) {
      showNotification("TIN number must be 9 digits", false);
      return;
    }

    // Validate quantity
    const quantityInput = form.elements["quantity"];
    if (parseInt(quantityInput.value) <= 0) {
      showNotification("Quantity must be greater than zero", false);
      return;
    }

    // Collect form data
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    // Check if user provided an email
    if (!formObject.email) {
      showNotification(
        "Please provide an email address to receive your application details.",
        false
      );
      return;
    }

    // Show loading overlay
    loadingOverlay.classList.remove("hidden");

    try {
      // First, send to administrator
      await emailjs.send("service_5t0h6p1", "template_76l6kz9", {
        name: `${formObject.otherNames} ${formObject.surname}`,
        citizenship: formObject.citizenship,
        email: formObject.email,
        to_email: "p.touko@irembo.com",
        message: `
Business Owner Details:
- Citizenship: ${formObject.citizenship}
- Names: ${formObject.otherNames} ${formObject.surname}
- ID/Passport: ${formObject.idNumber || formObject.passport || "N/A"}
- Nationality: ${formObject.nationality}
- Phone: ${formObject.phone || "N/A"}
- District: ${formObject.ownerDistrict}

Business Details:
- Business Type: ${formObject.businessType}
- Company Name: ${formObject.companyName}
- TIN Number: ${formObject.tinNumber}
- Registration Date: ${formObject.registrationDate}
- Business District: ${formObject.businessDistrict}

Product Information:
- Purpose: ${formObject.importPurpose}
- Category: ${formObject.productCategory}
- Product Name: ${formObject.productName}
- Weight: ${formObject.weight || "N/A"} kg
- Description: ${formObject.productDescription}
- Unit: ${formObject.unitOfMeasurement}
- Quantity: ${formObject.quantity}
                `,
      });

      // Send confirmation to user
      await emailjs.send("service_5t0h6p1", "template_76l6kz9", {
        name: `${formObject.otherNames} ${formObject.surname}`,
        citizenship: formObject.citizenship,
        email: formObject.email,
        to_email: formObject.email,
        message: `
Dear ${formObject.otherNames} ${formObject.surname},

Thank you for submitting your RICA Import Permit application. Here are your application details:

Business Owner Details:
- Citizenship: ${formObject.citizenship}
- Names: ${formObject.otherNames} ${formObject.surname}
- ID/Passport: ${formObject.idNumber || formObject.passport || "N/A"}
- Nationality: ${formObject.nationality}
- Phone: ${formObject.phone || "N/A"}
- District: ${formObject.ownerDistrict}

Business Details:
- Business Type: ${formObject.businessType}
- Company Name: ${formObject.companyName}
- TIN Number: ${formObject.tinNumber}
- Registration Date: ${formObject.registrationDate}
- Business District: ${formObject.businessDistrict}

Product Information:
- Purpose: ${formObject.importPurpose}
- Category: ${formObject.productCategory}
- Product Name: ${formObject.productName}
- Weight: ${formObject.weight || "N/A"} kg
- Description: ${formObject.productDescription}
- Unit: ${formObject.unitOfMeasurement}
- Quantity: ${formObject.quantity}

Your application has been received and is being processed. We will contact you if we need any additional information.

Best regards,
RICA Import Permit Team
                `,
      });

      showNotification(
        "Application submitted successfully! Check your email for confirmation."
      );
      form.reset();
    } catch (error) {
      console.error("Failed to send email:", error);
      showNotification(
        "Failed to submit application. Please try again later.",
        false
      );
    } finally {
      loadingOverlay.classList.add("hidden");
    }
  });
});
