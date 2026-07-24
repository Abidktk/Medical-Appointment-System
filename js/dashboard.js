/* ==========================================================================
   MEDICARE SYSTEM - DASHBOARD LOGIC (PATIENT & DOCTOR VIEWS)
   ========================================================================== */

let activeReviewAptId = null;
let currentRatingValue = 5;

document.addEventListener('DOMContentLoaded', () => {
    // Require user login for dashboard
    if (!AuthManager.enforceAuth()) return;

    initDashboard();
});

function initDashboard() {
    const user = AuthManager.getCurrentUser();
    
    // Set Sidebar User Details
    document.getElementById('dashUserName').textContent = user.name;
    document.getElementById('dashUserEmail').textContent = user.email;
    const roleBadge = document.getElementById('dashUserRoleBadge');
    roleBadge.textContent = user.role.toUpperCase();
    roleBadge.className = `role-badge badge-${user.role}`;

    // Show/Hide Role Specific Nav Tabs
    if (user.role === 'doctor') {
        document.getElementById('navTitleHeading').textContent = 'Doctor Portal';
        const docBtn = document.getElementById('docScheduleTabBtn');
        if (docBtn) docBtn.classList.remove('hidden');
        loadDoctorScheduleSettings(user);
    } else {
        document.getElementById('navTitleHeading').textContent = 'Patient Portal';
    }

    setupDashboardTabs();
    loadDashboardStats();
    loadAppointmentsTable();
    loadNotificationsTab();
    loadProfileFormData();
}

/**
 * Tab Switcher Listener
 */
function setupDashboardTabs() {
    const tabBtns = document.querySelectorAll('.dash-nav-btn[data-tab]');
    const tabSections = document.querySelectorAll('.tab-content-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabSections.forEach(s => s.classList.add('hidden'));

            btn.classList.add('active');
            const targetEl = document.getElementById(`tab-${targetTab}`);
            if (targetEl) targetEl.classList.remove('hidden');
        });
    });
}

/**
 * Calculate & Render Statistics Counter Cards
 */
function loadDashboardStats() {
    const user = AuthManager.getCurrentUser();
    const allAppointments = StorageManager.getAppointments();

    let userAppointments = [];
    if (user.role === 'doctor') {
        const doctors = StorageManager.getDoctors();
        const doctorObj = doctors.find(d => d.email.toLowerCase() === user.email.toLowerCase()) || doctors[0];
        userAppointments = allAppointments.filter(a => String(a.doctorId) === String(doctorObj.id));
    } else {
        userAppointments = allAppointments.filter(a => String(a.patientId) === String(user.id));
    }

    const total = userAppointments.length;
    const upcoming = userAppointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed').length;
    const completed = userAppointments.filter(a => a.status === 'Completed').length;
    const cancelled = userAppointments.filter(a => a.status === 'Cancelled').length;

    document.getElementById('statTotalCount').textContent = total;
    document.getElementById('statUpcomingCount').textContent = upcoming;
    document.getElementById('statCompletedCount').textContent = completed;
    document.getElementById('statCancelledCount').textContent = cancelled;
}

/**
 * Load Appointments List Table
 */
function loadAppointmentsTable() {
    const user = AuthManager.getCurrentUser();
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;

    const allAppointments = StorageManager.getAppointments();
    let appointments = [];

    if (user.role === 'doctor') {
        const doctors = StorageManager.getDoctors();
        const doctorObj = doctors.find(d => d.email.toLowerCase() === user.email.toLowerCase()) || doctors[0];
        appointments = allAppointments.filter(a => String(a.doctorId) === String(doctorObj.id));
    } else {
        appointments = allAppointments.filter(a => String(a.patientId) === String(user.id));
    }

    // Sort newest first
    appointments.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (appointments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                    No appointments found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = appointments.map(apt => {
        const statusClass = `badge-${apt.status.toLowerCase()}`;
        const isPatient = user.role === 'patient';

        let actionBtns = '';

        if (user.role === 'doctor') {
            const viewPatientBtn = `<button class="btn btn-outline btn-sm" onclick="viewPatientDetailsModal('${apt.id}')" title="View Patient Info"><i class="fa-solid fa-user-gear"></i> Details</button>`;

            if (apt.status === 'Pending') {
                actionBtns = `
                    ${viewPatientBtn}
                    <button class="btn btn-primary btn-sm" onclick="changeStatus('${apt.id}', 'Confirmed')"><i class="fa-solid fa-check"></i> Confirm</button>
                    <button class="btn btn-outline btn-sm" style="color: var(--danger-color); border-color: var(--danger-color);" onclick="changeStatus('${apt.id}', 'Cancelled')">Cancel</button>
                `;
            } else if (apt.status === 'Confirmed') {
                actionBtns = `
                    ${viewPatientBtn}
                    <button class="btn btn-primary btn-sm" onclick="changeStatus('${apt.id}', 'Completed')"><i class="fa-solid fa-circle-check"></i> Mark Complete</button>
                    <button class="btn btn-outline btn-sm" style="color: var(--danger-color); border-color: var(--danger-color);" onclick="changeStatus('${apt.id}', 'Cancelled')">Cancel</button>
                `;
            } else {
                actionBtns = `${viewPatientBtn}`;
            }
        } else {
            // Patient View
            if (apt.status === 'Pending' || apt.status === 'Confirmed') {
                actionBtns = `
                    <button class="btn btn-outline btn-sm" style="color: var(--danger-color); border-color: var(--danger-color);" onclick="confirmCancelAppointment('${apt.id}')">
                        <i class="fa-solid fa-xmark"></i> Cancel
                    </button>
                `;
            } else if (apt.status === 'Completed') {
                // Check if already reviewed
                const reviews = StorageManager.getReviews();
                const existingReview = reviews.find(r => String(r.doctorId) === String(apt.doctorId) && String(r.patientId) === String(user.id));

                if (existingReview) {
                    actionBtns = `<span style="color: var(--success-color); font-size: 0.8rem; font-weight: 600;"><i class="fa-solid fa-star"></i> Reviewed</span>`;
                } else {
                    actionBtns = `
                        <button class="btn btn-primary btn-sm" onclick="openReviewModal('${apt.id}', '${apt.doctorId}', '${apt.doctorName}')">
                            <i class="fa-solid fa-star"></i> Leave Review
                        </button>
                    `;
                }
            } else {
                actionBtns = `<span style="color: var(--text-light); font-size: 0.85rem;">Cancelled</span>`;
            }
        }

        const displayName = isPatient ? apt.doctorName : `<a href="#" onclick="viewPatientDetailsModal('${apt.id}'); return false;" style="font-weight: 600;">${apt.patientName}</a>`;

        return `
            <tr>
                <td><strong>${apt.id}</strong></td>
                <td>${displayName}</td>
                <td><span class="role-badge badge-patient">${apt.department}</span></td>
                <td>${apt.date}</td>
                <td>${apt.time}</td>
                <td><span class="status-badge ${statusClass}">${apt.status}</span></td>
                <td><div style="display: flex; gap: 6px; flex-wrap: wrap;">${actionBtns}</div></td>
            </tr>
        `;
    }).join('');
}

/**
 * Handle Status Update
 */
function changeStatus(aptId, newStatus) {
    const apt = StorageManager.updateAppointmentStatus(aptId, newStatus);
    if (apt) {
        showToast(`Appointment status updated to ${newStatus}`, 'success');
        loadDashboardStats();
        loadAppointmentsTable();
    }
}

function confirmCancelAppointment(aptId) {
    if (confirm("Are you sure you want to cancel this appointment?")) {
        changeStatus(aptId, 'Cancelled');
    }
}

/**
 * View Patient & Booking Details Modal (For Doctor)
 */
function viewPatientDetailsModal(aptId) {
    const apt = StorageManager.getAppointmentById(aptId);
    if (!apt) return;

    const modalBody = document.getElementById('patientDetailsModalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div style="background: var(--light-bg); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 12px; font-size: 0.95rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Patient Name:</span>
                <strong style="color: var(--dark-color);">${apt.patientName}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Contact Phone:</span>
                <strong style="color: var(--primary-color);">${apt.patientPhone || 'Not provided'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Patient Email:</span>
                <strong style="color: var(--dark-color);">${apt.patientEmail || 'Not provided'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Appointment ID:</span>
                <strong style="color: var(--dark-color);">${apt.id}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Scheduled Date & Time:</span>
                <strong style="color: var(--dark-color);">${apt.date} at ${apt.time}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Consultation Fee:</span>
                <strong style="color: var(--dark-color);">Rs. ${apt.fee.toLocaleString()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Current Status:</span>
                <span class="status-badge badge-${apt.status.toLowerCase()}">${apt.status}</span>
            </div>
            <div>
                <span style="color: var(--text-muted); display: block; margin-bottom: 4px;">Patient Notes / Symptoms:</span>
                <p style="background: var(--white); border: 1px solid var(--border-color); padding: 10px; border-radius: var(--radius-sm); color: var(--dark-color); font-size: 0.9rem;">
                    ${apt.notes || 'No specific symptoms noted.'}
                </p>
            </div>
        </div>
    `;

    openModal('patientDetailsModal');
}

/**
 * Review Modal Handlers
 */
function openReviewModal(aptId, doctorId, doctorName) {
    activeReviewAptId = aptId;
    document.getElementById('reviewDoctorId').value = doctorId;
    document.getElementById('reviewDoctorNameText').textContent = doctorName;
    document.getElementById('reviewText').value = '';
    setRating(5);
    openModal('reviewModal');
}

function setRating(rating) {
    currentRatingValue = rating;
    const stars = document.querySelectorAll('#starRatingContainer .star');
    stars.forEach((s, idx) => {
        if (idx < rating) s.classList.add('active');
        else s.classList.remove('active');
    });
}

function submitReview() {
    const user = AuthManager.getCurrentUser();
    const doctorId = document.getElementById('reviewDoctorId').value;
    const text = document.getElementById('reviewText').value.trim();

    if (!text) {
        showToast('Please enter your review text.', 'warning');
        return;
    }

    StorageManager.saveReview({
        doctorId: doctorId,
        patientId: user.id,
        patientName: user.name,
        rating: currentRatingValue,
        review: text
    });

    showToast('Thank you! Your review has been published.', 'success');
    closeModal('reviewModal');
    loadAppointmentsTable();
}

/**
 * Load Notifications Tab
 */
function loadNotificationsTab() {
    const user = AuthManager.getCurrentUser();
    const notifContainer = document.getElementById('notificationsList');
    const badgeEl = document.getElementById('notifCountBadge');
    if (!notifContainer) return;

    const notifs = StorageManager.getNotifications(user.id);

    if (badgeEl) {
        badgeEl.textContent = notifs.length;
        if (notifs.length === 0) badgeEl.style.display = 'none';
        else badgeEl.style.display = 'inline-block';
    }

    if (notifs.length === 0) {
        notifContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No notifications yet.</p>';
        return;
    }

    notifContainer.innerHTML = notifs.map(n => `
        <div style="padding: 16px; background: var(--white); border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; gap: 14px; align-items: flex-start;">
            <i class="fa-solid fa-bell" style="color: var(--primary-color); margin-top: 4px;"></i>
            <div style="flex: 1;">
                <strong style="color: var(--dark-color); display: block; font-size: 0.95rem;">${n.title}</strong>
                <p style="color: var(--text-main); font-size: 0.85rem; margin-top: 2px;">${n.message}</p>
                <small style="color: var(--text-light); display: block; margin-top: 6px;">${n.date}</small>
            </div>
        </div>
    `).join('');
}

/**
 * Doctor Schedule & Fee Settings Form Handler
 */
function loadDoctorScheduleSettings(user) {
    const doctors = StorageManager.getDoctors();
    const doctorObj = doctors.find(d => d.email.toLowerCase() === user.email.toLowerCase()) || doctors[0];
    if (!doctorObj) return;

    const feeInput = document.getElementById('docSettingFee');
    const timingInput = document.getElementById('docSettingTiming');
    const bioInput = document.getElementById('docSettingBio');
    const form = document.getElementById('doctorScheduleForm');

    if (feeInput) feeInput.value = doctorObj.fee || 2000;
    if (timingInput) timingInput.value = doctorObj.timing || '09:00 AM - 02:00 PM';
    if (bioInput) bioInput.value = doctorObj.bio || '';

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newFee = Number(feeInput.value);
            const newTiming = timingInput.value.trim();
            const newBio = bioInput.value.trim();

            doctorObj.fee = newFee;
            doctorObj.timing = newTiming;
            doctorObj.bio = newBio;

            StorageManager.saveDoctor(doctorObj);
            showToast('Doctor schedule and consultation fee updated successfully!', 'success');
        });
    }
}

/**
 * Load & Save Profile Settings Form
 */
function loadProfileFormData() {
    const user = AuthManager.getCurrentUser();
    if (!user) return;

    document.getElementById('profName').value = user.name || '';
    document.getElementById('profEmail').value = user.email || '';
    document.getElementById('profPhone').value = user.phone || '';
    document.getElementById('profCNIC').value = user.cnic || '';

    const profForm = document.getElementById('profileForm');
    if (profForm) {
        profForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const updatedName = document.getElementById('profName').value.trim();
            const updatedPhone = document.getElementById('profPhone').value.trim();
            const updatedCNIC = document.getElementById('profCNIC').value.trim();
            const newPassword = document.getElementById('profPassword').value;

            const updatedUser = {
                ...user,
                name: updatedName,
                phone: updatedPhone,
                cnic: updatedCNIC
            };

            if (newPassword) {
                updatedUser.password = newPassword;
            }

            StorageManager.saveUser(updatedUser);
            StorageManager.setCurrentUser(updatedUser);

            showToast('Profile updated successfully!', 'success');
            setTimeout(() => location.reload(), 800);
        });
    }
}
