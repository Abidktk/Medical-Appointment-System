/* ==========================================================================
   MEDICARE SYSTEM - MAIN APPLICATION LOGIC & GLOBAL UI HELPERS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initStickyHeader();
    setMinimumBookingDate();
    initStatCounters();
    createToastContainer();
    initQuickSearchForm();
});

// Create Toast Container dynamically if not present
function createToastContainer() {
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

// Global Toast Notification Helper
function showToast(message, type = 'info', title = '') {
    createToastContainer();
    const container = document.querySelector('.toast-container');
    
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-exclamation',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    const titles = {
        success: title || 'Success',
        error: title || 'Error',
        warning: title || 'Warning',
        info: title || 'Notice'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Global Modal Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Mobile Navigation Toggle
function initMobileNav() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelector('.nav-links') || document.querySelector('.nav-menu');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu on link click or click outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

// Sticky Header Box Shadow on Scroll
function initStickyHeader() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-sm)';
        }
    });
}

// Helper to set minimum date for date inputs to today
function setMinimumBookingDate() {
    const searchDateInput = document.getElementById('searchDate');
    if (searchDateInput) {
        const today = new Date().toISOString().split('T')[0];
        searchDateInput.min = today;
    }
}

// Animate statistics counters when scrolled into view
function initStatCounters() {
    const statsSection = document.querySelector('.statistics-section');
    const counters = document.querySelectorAll('.stat-count');
    
    if (!statsSection || counters.length === 0) return;
    
    if (!('IntersectionObserver' in window)) {
        startCounterAnimation();
        return;
    }
    
    let animated = false;
    
    function startCounterAnimation() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const suffix = counter.getAttribute('data-suffix') || '';
            const useComma = counter.getAttribute('data-format') === 'comma';
            
            counter.textContent = "0" + suffix;
            
            const duration = 2000; // 2 seconds
            const startTime = performance.now();
            
            function updateCount(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                const easeProgress = progress * (2 - progress);
                const currentCount = Math.floor(target * easeProgress);
                
                if (useComma) {
                    counter.textContent = currentCount.toLocaleString() + suffix;
                } else {
                    counter.textContent = currentCount + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    if (useComma) {
                        counter.textContent = target.toLocaleString() + suffix;
                    } else {
                        counter.textContent = target + suffix;
                    }
                }
            }
            
            requestAnimationFrame(updateCount);
        });
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                startCounterAnimation();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    observer.observe(statsSection);
}

// Quick Search Form - Dynamic Doctor & Department Dropdown population
function initQuickSearchForm() {
    const deptSelect = document.getElementById('searchDepartment');
    const docSelect = document.getElementById('searchDoctorSelect');
    const form = document.getElementById('quickSearchForm');

    if (!docSelect) return;

    // Ensure storage is initialized
    if (typeof StorageManager !== 'undefined') {
        const departments = StorageManager.getDepartments();
        const doctors = StorageManager.getDoctors();

        // Populate Department dropdown if empty or standard
        if (deptSelect) {
            deptSelect.innerHTML = '<option value="">All Departments</option>';
            departments.forEach(dept => {
                const opt = document.createElement('option');
                opt.value = dept.name;
                opt.textContent = dept.name;
                deptSelect.appendChild(opt);
            });

            deptSelect.addEventListener('change', () => {
                populateDoctorDropdown(deptSelect.value);
            });
        }

        function populateDoctorDropdown(filterDept = '') {
            let filteredDoctors = doctors;
            if (filterDept) {
                const normalizedFilter = String(filterDept).trim().toLowerCase();
                filteredDoctors = doctors.filter(doc => 
                    doc.department && String(doc.department).trim().toLowerCase() === normalizedFilter
                );
            }

            docSelect.innerHTML = '<option value="">Select Doctor</option>';
            filteredDoctors.forEach(doc => {
                const opt = document.createElement('option');
                opt.value = doc.id;
                opt.textContent = `${doc.name} (${doc.department})`;
                docSelect.appendChild(opt);
            });
            
            if (filteredDoctors.length === 0) {
                docSelect.innerHTML = '<option value="">No doctors available</option>';
            }
        }

        // Initial doctor list population
        populateDoctorDropdown();

        // Form Submission redirect logic
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const selectedDoctorId = docSelect.value;
                const selectedDept = deptSelect ? deptSelect.value : '';

                if (selectedDoctorId) {
                    window.location.href = `appointment.html?doctorId=${selectedDoctorId}`;
                } else if (selectedDept) {
                    window.location.href = `doctors.html?department=${encodeURIComponent(selectedDept)}`;
                } else {
                    window.location.href = 'doctors.html';
                }
            });
        }
    }
}

