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
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate ID number if Rwandan
    if (citizenshipSelect.value === "rwandan") {
      if (idNumberInput.value.length !== 16) {
        alert("ID number must be 16 digits");
        return;
      }
    }

    // Validate TIN number
    const tinInput = form.elements["tinNumber"];
    if (tinInput.value.length !== 9) {
      alert("TIN number must be 9 digits");
      return;
    }

    // Validate quantity
    const quantityInput = form.elements["quantity"];
    if (parseInt(quantityInput.value) <= 0) {
      alert("Quantity must be greater than zero");
      return;
    }

    // Collect form data
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    // Check if user provided an email
    if (!formObject.email) {
      alert(
        "Please provide an email address to receive your application details."
      );
      return;
    }

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = "Submitting...";

    // First, send to administrator
    emailjs
      .send("service_5t0h6p1", "template_76l6kz9", {
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
      })
      .then(function (response) {
        console.log("Admin email sent successfully:", response);
        // After successful admin email, send confirmation to user
        return emailjs.send("service_5t0h6p1", "template_76l6kz9", {
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
      })
      .then(
        function (response) {
          console.log("User email sent successfully:", response);
          alert(
            "Application submitted successfully! A confirmation email has been sent to your email address."
          );
          form.reset(); // Reset the form after successful submission
        },
        function (error) {
          console.error("Failed to send email:", error);
          alert(
            "Error: " +
              (error.text ||
                "Failed to submit application. Please try again later.")
          );
        }
      )
      .finally(() => {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      });
  });
});
