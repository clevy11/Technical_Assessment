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
          <div style="color: #333;">
              <p style="font-size: 16px;">A new import permit application has been submitted.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1a56db; margin-top: 0;">Business Owner Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 8px 0;"><strong>Citizenship:</strong></td>
                          <td>${formObject.citizenship}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                          <td>+250${formObject.phone}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Email:</strong></td>
                          <td>${formObject.email}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Province:</strong></td>
                          <td>${formObject.ownerProvince}</td>
                      </tr>
                  </table>
              </div>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1a56db; margin-top: 0;">Business Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 8px 0;"><strong>Business Type:</strong></td>
                          <td>${formObject.businessType}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Company Name:</strong></td>
                          <td>${formObject.companyName}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>TIN Number:</strong></td>
                          <td>${formObject.tinNumber}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Registration Date:</strong></td>
                          <td>${formObject.registrationDate}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Business Province:</strong></td>
                          <td>${formObject.businessProvince}</td>
                      </tr>
                  </table>
              </div>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1a56db; margin-top: 0;">Product Information</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 8px 0;"><strong>Purpose:</strong></td>
                          <td>${formObject.importPurpose}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Category:</strong></td>
                          <td>${formObject.productCategory}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Weight:</strong></td>
                          <td>${formObject.weight} ${formObject.weightUnit}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                          <td>${formObject.quantity}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Description:</strong></td>
                          <td>${formObject.productDescription}</td>
                      </tr>
                  </table>
              </div>
          </div>`,
          template_params: {
            email_service: "gmail",
            email_type: "notification",
            priority: "normal",
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
<div style="color: #333;">
    <p style="font-size: 16px; color: #1a56db;">Dear ${
      formObject.email.split("@")[0]
    },</p>
    
    <p>Thank you for submitting your RICA Import Permit application. Your application has been received and is being processed.</p>
    
    <p>Here are your application details:</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1a56db; margin-top: 0;">Business Owner Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0;"><strong>Citizenship:</strong></td>
                <td>${formObject.citizenship}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                <td>+250${formObject.phone}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Email:</strong></td>
                <td>${formObject.email}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Province:</strong></td>
                <td>${formObject.ownerProvince}</td>
            </tr>
        </table>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1a56db; margin-top: 0;">Business Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0;"><strong>Business Type:</strong></td>
                <td>${formObject.businessType}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Company Name:</strong></td>
                <td>${formObject.companyName}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>TIN Number:</strong></td>
                <td>${formObject.tinNumber}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Registration Date:</strong></td>
                <td>${formObject.registrationDate}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Business Province:</strong></td>
                <td>${formObject.businessProvince}</td>
            </tr>
        </table>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1a56db; margin-top: 0;">Product Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0;"><strong>Purpose:</strong></td>
                <td>${formObject.importPurpose}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Category:</strong></td>
                <td>${formObject.productCategory}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Weight:</strong></td>
                <td>${formObject.weight} ${formObject.weightUnit}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                <td>${formObject.quantity}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Description:</strong></td>
                <td>${formObject.productDescription}</td>
            </tr>
        </table>
    </div>

    <p style="margin-top: 20px;">We will contact you if we need any additional information.</p>
    
    <p style="margin-top: 20px;">Best regards,<br>RICA Import Permit Team</p>
</div>`,
          template_params: {
            email_service: "gmail",
            email_type: "confirmation",
            priority: "normal",
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
