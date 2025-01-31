document.addEventListener("DOMContentLoaded", function () {
  // Get form elements
  const form = document.getElementById("ricaForm");
  if (!form) {
    console.error("Form not found!");
    return;
  }

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
    console.log("Form submitted"); // Debug log

    try {
      // Basic validation
      const email = form.elements["email"].value;
      const phone = form.elements["phone"].value;
      const tinNumber = form.elements["tinNumber"].value;

      if (!email) {
        alert("Please enter an email address");
        return;
      }

      if (!phone || phone.length !== 9) {
        alert("Please enter a valid 9-digit phone number");
        return;
      }

      if (!tinNumber || tinNumber.length !== 9) {
        alert("Please enter a valid 9-digit TIN number");
        return;
      }

      // Collect form data
      const formData = new FormData(form);
      const formObject = Object.fromEntries(formData.entries());
      console.log("Form data:", formObject); // Debug log

      // Show loading overlay
      loadingOverlay.classList.remove("hidden");

      // First, send to administrator
      const adminResponse = await emailjs.send(
        "service_5t0h6p1",
        "template_76l6kz9",
        {
          to_name: "Administrator",
          from_name: formObject.email,
          to_email: "p.touko@irembo.com",
          citizenship: formObject.citizenship,
          phone: "+250" + formObject.phone,
          email: formObject.email,
          province: formObject.ownerProvince,
          business_type: formObject.businessType,
          company_name: formObject.companyName,
          tin_number: formObject.tinNumber,
          registration_date: formObject.registrationDate,
          business_province: formObject.businessProvince,
          import_purpose: formObject.importPurpose,
          product_category: formObject.productCategory,
          weight: formObject.weight,
          quantity: formObject.quantity,
          description: formObject.productDescription,
        }
      );

      console.log("Admin email sent:", adminResponse); // Debug log

      // Send to user
      const userResponse = await emailjs.send(
        "service_5t0h6p1",
        "template_76l6kz9",
        {
          to_name: "Applicant",
          from_name: "RICA Import Permit Team",
          to_email: formObject.email,
          citizenship: formObject.citizenship,
          phone: "+250" + formObject.phone,
          email: formObject.email,
          province: formObject.ownerProvince,
          business_type: formObject.businessType,
          company_name: formObject.companyName,
          tin_number: formObject.tinNumber,
          registration_date: formObject.registrationDate,
          business_province: formObject.businessProvince,
          import_purpose: formObject.importPurpose,
          product_category: formObject.productCategory,
          weight: formObject.weight,
          quantity: formObject.quantity,
          description: formObject.productDescription,
        }
      );

      console.log("User email sent:", userResponse); // Debug log

      // Show success message
      alert(
        "Application submitted successfully! Please check your email for confirmation."
      );
      form.reset();
    } catch (error) {
      console.error("Email sending failed:", error); // Debug log
      alert(
        "Failed to submit application: " +
          (error.message || "Unknown error occurred")
      );
    } finally {
      loadingOverlay.classList.add("hidden");
    }
  });
});
