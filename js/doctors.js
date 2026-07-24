/* ==========================================================================
   MEDICARE SYSTEM - DOCTORS LIST & DOCTOR PROFILE ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on Doctors Page or Profile Page
    if (document.getElementById('doctorsGrid')) {
        initDoctorsPage();
    } else if (document.getElementById('doctorProfileContainer')) {
        initDoctorProfilePage();
    }
});

/**
 * Initialize Doctors Listing Page
 */
function initDoctorsPage() {
    populateDepartmentDropdown();
    renderDoctorsList();

    // Event Listeners for Filters
    const searchInput = document.getElementById('searchDoctor');
    const departmentFilter = document.getElementById('filterDepartment');
    const experienceFilter = document.getElementById('filterExperience');
    const sortSelect = document.getElementById('sortFee');

    if (searchInput) searchInput.addEventListener('input', debounce(renderDoctorsList, 250));
    if (departmentFilter) departmentFilter.addEventListener('change', renderDoctorsList);
    if (experienceFilter) experienceFilter.addEventListener('change', renderDoctorsList);
    if (sortSelect) sortSelect.addEventListener('change', renderDoctorsList);
}

/**
 * Populate department dropdown from LocalStorage
 */
function populateDepartmentDropdown() {
    const departmentSelect = document.getElementById('filterDepartment');
    if (!departmentSelect) return;

    const departments = StorageManager.getDepartments();
    // Keep 'All Departments' as first option
    departmentSelect.innerHTML = '<option value="">All Departments</option>';
    departments.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept.name;
        opt.textContent = dept.name;
        departmentSelect.appendChild(opt);
    });

    // If query string contains department parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlDept = urlParams.get('department');
    if (urlDept) {
        departmentSelect.value = urlDept;
    }
}

/**
 * Render filtered & sorted doctor cards dynamically
 */
function renderDoctorsList() {
    const grid = document.getElementById('doctorsGrid');
    const countEl = document.getElementById('doctorsCount');
    if (!grid) return;

    // Show Skeleton loading initially
    grid.innerHTML = getSkeletonHTML(6);

    setTimeout(() => {
        let doctors = StorageManager.getDoctors();

        // Search Filter
        const searchTerm = (document.getElementById('searchDoctor')?.value || '').toLowerCase().trim();
        if (searchTerm) {
            doctors = doctors.filter(doc => 
                doc.name.toLowerCase().includes(searchTerm) ||
                doc.department.toLowerCase().includes(searchTerm) ||
                doc.degree.toLowerCase().includes(searchTerm)
            );
        }

        // Department Filter
        const selectedDept = document.getElementById('filterDepartment')?.value;
        if (selectedDept) {
            doctors = doctors.filter(doc => doc.department === selectedDept);
        }

        // Experience Filter
        const selectedExp = document.getElementById('filterExperience')?.value;
        if (selectedExp) {
            if (selectedExp === '0-5') doctors = doctors.filter(doc => doc.experience <= 5);
            else if (selectedExp === '5-10') doctors = doctors.filter(doc => doc.experience > 5 && doc.experience <= 10);
            else if (selectedExp === '10+') doctors = doctors.filter(doc => doc.experience > 10);
        }

        // Sort
        const sortVal = document.getElementById('sortFee')?.value;
        if (sortVal === 'fee-asc') {
            doctors.sort((a, b) => a.fee - b.fee);
        } else if (sortVal === 'fee-desc') {
            doctors.sort((a, b) => b.fee - a.fee);
        } else if (sortVal === 'rating-desc') {
            doctors.sort((a, b) => b.rating - a.rating);
        } else if (sortVal === 'exp-desc') {
            doctors.sort((a, b) => b.experience - a.experience);
        }

        if (countEl) {
            countEl.textContent = `${doctors.length} Doctor${doctors.length !== 1 ? 's' : ''} Found`;
        }

        if (doctors.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <i class="fa-solid fa-user-doctor" style="font-size: 3rem; color: var(--text-light); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--dark-color); margin-bottom: 8px;">No Doctors Found</h3>
                    <p style="color: var(--text-muted);">Try adjusting your search criteria or clearing filters.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = doctors.map(createDoctorCardHTML).join('');
    }, 200);
}

/**
 * Generate Doctor Card HTML String
 */
function createDoctorCardHTML(doc) {
    const daysStr = Array.isArray(doc.availability) ? doc.availability.join(', ') : doc.availability;
    return `
        <div class="doctor-card" style="background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border-color); overflow: hidden; box-shadow: var(--shadow-sm); transition: var(--transition); display: flex; flex-direction: column;">
            <div style="position: relative; height: 220px; overflow: hidden; background: #f1f5f9;">
                <img src="${doc.image}" alt="${doc.name}" style="width: 100%; height: 100%; object-fit: cover;">
                <span class="status-badge badge-confirmed" style="position: absolute; top: 12px; right: 12px;">
                    <i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> ${doc.department}
                </span>
            </div>
            <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h3 style="font-size: 1.15rem; color: var(--dark-color); font-weight: 700;">${doc.name}</h3>
                    <span style="color: var(--accent-color); font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-star"></i> ${doc.rating}
                    </span>
                </div>
                <p style="font-size: 0.85rem; color: var(--primary-color); font-weight: 600; margin-bottom: 12px;">${doc.degree}</p>
                
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px;">
                    <div><i class="fa-solid fa-briefcase" style="width: 18px; color: var(--primary-color);"></i> <strong>${doc.experience} Years</strong> Experience</div>
                    <div><i class="fa-solid fa-calendar-days" style="width: 18px; color: var(--primary-color);"></i> ${daysStr}</div>
                    <div><i class="fa-solid fa-clock" style="width: 18px; color: var(--primary-color);"></i> ${doc.timing || '09:00 AM - 02:00 PM'}</div>
                </div>

                <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <div>
                        <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Consultation Fee</span>
                        <strong style="font-size: 1.1rem; color: var(--dark-color);">Rs. ${doc.fee.toLocaleString()}</strong>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <a href="doctor-profile.html?id=${doc.id}" class="btn btn-outline btn-sm" style="padding: 8px 12px;">Profile</a>
                        <a href="appointment.html?doctorId=${doc.id}" class="btn btn-primary btn-sm" style="padding: 8px 12px;">Book</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize Doctor Profile Page
 */
function initDoctorProfilePage() {
    const container = document.getElementById('doctorProfileContainer');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('id') || '1';

    const doc = StorageManager.getDoctorById(doctorId);
    if (!doc) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <h2>Doctor Not Found</h2>
                <p>The requested doctor profile does not exist.</p>
                <a href="doctors.html" class="btn btn-primary" style="margin-top: 16px;">Back to Doctors</a>
            </div>
        `;
        return;
    }

    const reviews = StorageManager.getReviews().filter(r => String(r.doctorId) === String(doc.id));
    const daysStr = Array.isArray(doc.availability) ? doc.availability.join(', ') : doc.availability;

    container.innerHTML = `
        <div style="background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); overflow: hidden; margin-bottom: 40px;">
            <div style="display: grid; grid-template-columns: 320px 1fr; gap: 30px; padding: 30px;">
                <div style="text-align: center;">
                    <img src="${doc.image}" alt="${doc.name}" style="width: 100%; height: 320px; object-fit: cover; border-radius: var(--radius-md); box-shadow: var(--shadow-md);">
                    <a href="appointment.html?doctorId=${doc.id}" class="btn btn-primary btn-block" style="width: 100%; margin-top: 20px;">
                        <i class="fa-solid fa-calendar-check"></i> Book Appointment Now
                    </a>
                </div>

                <div>
                    <span class="role-badge badge-doctor" style="margin-bottom: 8px; display: inline-block;">${doc.department}</span>
                    <h1 style="font-size: 2rem; color: var(--dark-color); margin-bottom: 6px;">${doc.name}</h1>
                    <p style="color: var(--primary-color); font-weight: 600; font-size: 1.1rem; margin-bottom: 16px;">${doc.degree}</p>

                    <div style="display: flex; gap: 20px; margin-bottom: 24px; padding: 16px; background: var(--light-bg); border-radius: var(--radius-md);">
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Rating</span>
                            <strong style="color: var(--accent-color); font-size: 1.2rem;"><i class="fa-solid fa-star"></i> ${doc.rating} (${reviews.length} reviews)</strong>
                        </div>
                        <div style="border-left: 1px solid var(--border-color); padding-left: 20px;">
                            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Experience</span>
                            <strong style="color: var(--dark-color); font-size: 1.2rem;">${doc.experience} Years</strong>
                        </div>
                        <div style="border-left: 1px solid var(--border-color); padding-left: 20px;">
                            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Fee</span>
                            <strong style="color: var(--primary-color); font-size: 1.2rem;">Rs. ${doc.fee.toLocaleString()}</strong>
                        </div>
                    </div>

                    <h3 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--dark-color);">Biography & Overview</h3>
                    <p style="color: var(--text-main); line-height: 1.7; margin-bottom: 24px;">${doc.bio}</p>

                    <h3 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--dark-color);">Availability & Schedules</h3>
                    <div style="display: flex; gap: 20px; color: var(--text-main); font-size: 0.95rem;">
                        <div><i class="fa-solid fa-calendar-days" style="color: var(--primary-color);"></i> <strong>Days:</strong> ${daysStr}</div>
                        <div><i class="fa-solid fa-clock" style="color: var(--primary-color);"></i> <strong>Timing:</strong> ${doc.timing || '09:00 AM - 02:00 PM'}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Patient Reviews Section -->
        <div style="background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border-color); padding: 30px; box-shadow: var(--shadow-sm);">
            <h2 style="font-size: 1.4rem; color: var(--dark-color); margin-bottom: 20px;">
                <i class="fa-solid fa-comments" style="color: var(--primary-color);"></i> Patient Reviews (${reviews.length})
            </h2>

            ${reviews.length === 0 ? '<p style="color: var(--text-muted);">No reviews written yet for this doctor.</p>' : ''}

            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${reviews.map(r => `
                    <div style="padding: 16px; background: var(--light-bg); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <strong style="color: var(--dark-color);">${r.patientName}</strong>
                            <span style="color: var(--accent-color); font-weight: 700;">
                                ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                            </span>
                        </div>
                        <p style="color: var(--text-main); font-size: 0.95rem;">"${r.review}"</p>
                        <small style="color: var(--text-light); display: block; margin-top: 8px;">${r.date}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getSkeletonHTML(count = 6) {
    let cards = '';
    for (let i = 0; i < count; i++) {
        cards += `
            <div style="background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border-color); overflow: hidden; height: 380px;" class="skeleton"></div>
        `;
    }
    return cards;
}

// Simple debounce helper for live search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
