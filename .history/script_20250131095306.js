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

    // Send email using EmailJS
    emailjs
      .send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        to_email: "p.touko@irembo.com",
        from_name: formObject.otherNames + " " + formObject.surname,
        applicant_email: formObject.email,
        message: JSON.stringify(formObject, null, 2),
      })
      .then(
        function (response) {
          alert(
            "Application submitted successfully! A confirmation email has been sent."
          );
        },
        function (error) {
          alert("Failed to submit application. Please try again later.");
          console.error("Email failed to send:", error);
        }
      );
  });
});
