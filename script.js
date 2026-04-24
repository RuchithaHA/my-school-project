/**
 * Sanitizes text input by removing angle brackets and trimming whitespace.
 * @param {string} value - Untrusted string value.
 * @returns {string} Sanitized string.
 */
function sanitizeText(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim();
}

/**
 * Validates the join form fields and returns any field-level errors.
 * @param {{name:string,email:string,phone:string,fitnessGoal:string,plan:string}} data - User form values.
 * @returns {{name:string,email:string,phone:string,fitnessGoal:string,plan:string}} Validation errors by field.
 */
function validateJoinData(data) {
  var errors = { name: "", email: "", phone: "", fitnessGoal: "", plan: "" };
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;

  if (!data.name || data.name.length < 2) {
    errors.name = "Please enter your name (at least 2 characters).";
  }
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.phone || !phoneRegex.test(data.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!data.fitnessGoal || data.fitnessGoal.length < 8) {
    errors.fitnessGoal = "Please enter your fitness goal (at least 8 characters).";
  }
  if (!data.plan) {
    errors.plan = "Please select a preferred plan.";
  }

  return errors;
}

/**
 * Toggles mobile navigation visibility and updates ARIA state.
 */
function toggleMobileMenu() {
  var menuToggle = document.getElementById("menuToggle");
  var siteNav = document.getElementById("siteNav");
  if (!menuToggle || !siteNav) {
    return;
  }

  var isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", isExpanded ? "false" : "true");
  siteNav.classList.toggle("nav-open");
}

/**
 * Closes mobile navigation after clicking any nav link.
 */
function closeMenuOnNavigate() {
  var menuToggle = document.getElementById("menuToggle");
  var siteNav = document.getElementById("siteNav");
  if (!menuToggle || !siteNav) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("nav-open");
}

/**
 * Clears field and form-level status messages in the join form.
 */
function clearFormMessages() {
  var errorIds = ["nameError", "emailError", "phoneError", "fitnessGoalError", "planError"];
  errorIds.forEach(function (errorId) {
    var errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = "";
    }
  });

  var formStatus = document.getElementById("formStatus");
  if (formStatus) {
    formStatus.textContent = "";
    formStatus.className = "form-status";
  }
}

/**
 * Renders validation errors and returns whether the form is valid.
 * @param {{name:string,email:string,message:string}} errors - Error messages for each field.
 * @returns {boolean} True when all fields are valid.
 */
function displayValidationErrors(errors) {
  var hasError = false;

  Object.keys(errors).forEach(function (fieldName) {
    var fieldError = errors[fieldName];
    var errorElement = document.getElementById(fieldName + "Error");
    if (errorElement) {
      errorElement.textContent = fieldError;
    }
    if (fieldError) {
      hasError = true;
    }
  });

  return !hasError;
}

/**
 * Handles join form submit with validation and user feedback.
 * @param {SubmitEvent} event - Join form submit event.
 */
function handleJoinSubmit(event) {
  event.preventDefault();
  clearFormMessages();

  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var phoneInput = document.getElementById("phone");
  var fitnessGoalInput = document.getElementById("fitnessGoal");
  var planInput = document.getElementById("plan");
  var formStatus = document.getElementById("formStatus");

  if (!nameInput || !emailInput || !phoneInput || !fitnessGoalInput || !planInput || !formStatus) {
    return;
  }

  try {
    var payload = {
      name: sanitizeText(nameInput.value),
      email: sanitizeText(emailInput.value).toLowerCase(),
      phone: sanitizeText(phoneInput.value),
      fitnessGoal: sanitizeText(fitnessGoalInput.value),
      plan: sanitizeText(planInput.value)
    };

    var errors = validateJoinData(payload);
    var isValid = displayValidationErrors(errors);
    if (!isValid) {
      formStatus.className = "form-status error";
      formStatus.textContent = "Please fix the highlighted fields.";
      return;
    }

    formStatus.className = "form-status success";
    formStatus.textContent = "Join request sent successfully. Our team will contact you shortly.";
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
    fitnessGoalInput.value = "";
    planInput.value = "";
  } catch (error) {
    formStatus.className = "form-status error";
    formStatus.textContent = "Something went wrong while processing your request. Please try again.";
  }
}

/**
 * Attaches all navigation and form event handlers.
 */
function attachEventListeners() {
  var menuToggle = document.getElementById("menuToggle");
  var siteNav = document.getElementById("siteNav");
  var joinForm = document.getElementById("joinForm");

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMobileMenu);
  }

  if (siteNav) {
    siteNav.addEventListener("click", function (event) {
      var target = event.target;
      if (target instanceof HTMLElement && target.tagName === "A") {
        closeMenuOnNavigate();
      }
    });
  }

  if (joinForm) {
    joinForm.addEventListener("submit", handleJoinSubmit);
  }
}

/**
 * Initializes page behavior once the DOM is loaded.
 */
function initializeLandingPage() {
  attachEventListeners();
}

document.addEventListener("DOMContentLoaded", initializeLandingPage);
