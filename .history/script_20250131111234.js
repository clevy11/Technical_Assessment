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

      // First, send to administrator
      const adminResponse = await emailjs.send(
        "service_5t0h6p1",
        "template_s0r60zg",
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
        "template_s0r60zg",
        {
          to_name: formObject.email,
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

      showNotification(
        "Application submitted successfully! Check your email for confirmation.",
        true
      );
      form.reset();
    } catch (error) {
      console.error("Email sending failed:", error);
      showNotification(
        "Failed to submit application: " +
          (error.message || "Unknown error occurred"),
        false
      );
    } finally {
      loadingOverlay.classList.add("hidden");
    }
  });
});
