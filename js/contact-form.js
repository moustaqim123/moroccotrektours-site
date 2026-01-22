/**
 * Contact Form Handler with AJAX
 * Handles form submission, validation, and user feedback
 */

// Generate CSRF token on page load
document.addEventListener('DOMContentLoaded', function () {
    generateCSRFToken();
    initializeContactForms();
});

/**
 * Generate CSRF token via AJAX
 */
function generateCSRFToken() {
    fetch('generate-csrf-token.php')
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                // Store token in all contact forms
                const forms = document.querySelectorAll('.contact-form');
                forms.forEach(form => {
                    let tokenInput = form.querySelector('input[name="csrf_token"]');
                    if (!tokenInput) {
                        tokenInput = document.createElement('input');
                        tokenInput.type = 'hidden';
                        tokenInput.name = 'csrf_token';
                        form.appendChild(tokenInput);
                    }
                    tokenInput.value = data.token;
                });
            }
        })
        .catch(error => {
            console.error('Error generating CSRF token:', error);
        });
}

/**
 * Initialize all contact forms
 */
function initializeContactForms() {
    const forms = document.querySelectorAll('.contact-form');

    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);

        // Add real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                validateField(this);
            });
        });
    });
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    // Detect language from page
    const language = document.documentElement.lang || 'en';

    // Get form data
    const formData = new FormData(form);
    formData.append('language', language);

    // Validate all fields before submission
    if (!validateForm(form)) {
        showMessage(form, 'error',
            language === 'fr'
                ? 'Veuillez corriger les erreurs dans le formulaire.'
                : 'Please correct the errors in the form.'
        );
        return;
    }

    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = language === 'fr'
        ? '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...'
        : '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        // Send form data via AJAX
        const response = await fetch('send-email.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Show success message
            showMessage(form, 'success', result.message);

            // Reset form
            form.reset();

            // Remove validation classes
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });

            // Optional: Track conversion with Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'event_category': 'Contact',
                    'event_label': 'Contact Form'
                });
            }

        } else {
            // Show error message
            showMessage(form, 'error', result.message);
        }

    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(form, 'error',
            language === 'fr'
                ? 'Une erreur s\'est produite. Veuillez réessayer.'
                : 'An error occurred. Please try again.'
        );
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;

        // Generate new CSRF token for next submission
        generateCSRFToken();
    }
}

/**
 * Validate entire form
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    const language = document.documentElement.lang || 'en';

    let isValid = true;
    let errorMessage = '';

    // Remove previous error
    removeFieldError(field);

    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = language === 'fr' ? 'Ce champ est requis.' : 'This field is required.';
    }

    // Validate email
    else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = language === 'fr' ? 'Veuillez entrer une adresse email valide.' : 'Please enter a valid email address.';
        }
    }

    // Validate name length
    else if (name === 'name' && value && value.length < 2) {
        isValid = false;
        errorMessage = language === 'fr' ? 'Le nom doit contenir au moins 2 caractères.' : 'Name must be at least 2 characters long.';
    }

    // Validate message length
    else if (name === 'message' && value && value.length < 10) {
        isValid = false;
        errorMessage = language === 'fr' ? 'Le message doit contenir au moins 10 caractères.' : 'Message must be at least 10 characters long.';
    }

    // Update field appearance
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        showFieldError(field, errorMessage);
    }

    return isValid;
}

/**
 * Show field-specific error message
 */
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;

    formGroup.appendChild(errorDiv);
}

/**
 * Remove field error message
 */
function removeFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Show form message (success or error)
 */
function showMessage(form, type, message) {
    // Remove existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.style.padding = '15px 20px';
    messageDiv.style.borderRadius = '6px';
    messageDiv.style.marginBottom = '20px';
    messageDiv.style.fontWeight = '500';
    messageDiv.style.animation = 'slideDown 0.3s ease';

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
        messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else {
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
        messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    }

    // Insert message at the top of the form
    form.insertBefore(messageDiv, form.firstChild);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-remove success message after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
    
    .form-input.is-valid,
    .form-textarea.is-valid {
        border-color: #28a745 !important;
    }
    
    .form-input.is-invalid,
    .form-textarea.is-invalid {
        border-color: #dc3545 !important;
    }
    
    .form-message i {
        margin-right: 8px;
    }
`;
document.head.appendChild(style);
