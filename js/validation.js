/* ==========================================================================
   MEDICARE SYSTEM - FORM VALIDATION & UI FEEDBACK UTILITIES
   ========================================================================== */

class FormValidator {
    /**
     * Validate an email address format
     */
    static isValidEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * Validate phone number (allows standard national/international formats)
     */
    static isValidPhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(String(phone).trim());
    }

    /**
     * Validate CNIC number format (13 digits or formatted XXXXX-XXXXXXX-X)
     */
    static isValidCNIC(cnic) {
        if (!cnic) return true; // Optional field if empty unless explicitly required
        const re = /^\d{5}-?\d{7}-?\d{1}$/;
        return re.test(String(cnic).trim());
    }

    /**
     * Check password strength
     * returns { valid: boolean, score: number, message: string }
     */
    static checkPasswordStrength(password) {
        if (!password) {
            return { valid: false, score: 0, message: "Password is required" };
        }
        if (password.length < 6) {
            return { valid: false, score: 1, message: "Must be at least 6 characters" };
        }
        let score = 1;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        let message = "Weak";
        if (score >= 4) message = "Strong";
        else if (score >= 3) message = "Moderate";

        return { valid: true, score, message };
    }

    /**
     * Display an inline field error message
     */
    static showError(inputElement, message) {
        const parent = inputElement.closest('.form-group') || inputElement.parentElement;
        inputElement.classList.add('is-invalid');
        inputElement.classList.remove('is-valid');
        
        let errorEl = parent.querySelector('.invalid-feedback');
        if (!errorEl) {
            errorEl = document.createElement('small');
            errorEl.className = 'invalid-feedback';
            parent.appendChild(errorEl);
        }
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    /**
     * Clear field error message
     */
    static clearError(inputElement) {
        const parent = inputElement.closest('.form-group') || inputElement.parentElement;
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
        
        const errorEl = parent.querySelector('.invalid-feedback');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    /**
     * Validate an entire form automatically based on HTML5 rules & custom rules
     */
    static validateForm(formElement) {
        let isValid = true;
        const inputs = formElement.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            const value = input.value.trim();
            const type = input.getAttribute('type');

            // Required field check
            if (input.hasAttribute('required') && !value) {
                this.showError(input, `${input.dataset.label || 'This field'} is required.`);
                isValid = false;
                return;
            }

            // Email check
            if (type === 'email' && value) {
                if (!this.isValidEmail(value)) {
                    this.showError(input, 'Please enter a valid email address.');
                    isValid = false;
                    return;
                }
            }

            // Phone check
            if (type === 'tel' && value) {
                if (!this.isValidPhone(value)) {
                    this.showError(input, 'Please enter a valid phone number.');
                    isValid = false;
                    return;
                }
            }

            // Password minlength
            if (type === 'password' && value) {
                if (value.length < 6) {
                    this.showError(input, 'Password must be at least 6 characters long.');
                    isValid = false;
                    return;
                }
            }

            this.clearError(input);
        });

        return isValid;
    }
}
