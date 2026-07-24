/* ==========================================================================
   MEDICARE SYSTEM - APPOINTMENT BOOKING ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAppointmentBookingForm();
});

let selectedTimeSlot = '10:00 AM';

function initAppointmentBookingForm() {
    const departmentSelect = document.getElementById('aptDepartment');
    const doctorSelect = document.getElementById('aptDoctor');
    const dateInput = document.getElementById('aptDate');
    const form = document.getElementById('appointmentForm');

    if (!form) return;

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.min = today;
        dateInput.value = today;
    }

    // Populate departments dropdown
    const departments = StorageManager.getDepartments();
    if (departmentSelect) {
        departmentSelect.innerHTML = '<option value="">-- Select Department --</option>';
        departments.forEach(dept => {
            const opt = document.createElement('option');
            opt.value = dept.name;
            opt.textContent = dept.name;
            departmentSelect.appendChild(opt);
        });

        departmentSelect.addEventListener('change', () => {
            populateDoctorsDropdown(departmentSelect.value);
        });
    }

    // Check URL parameters for pre-selected doctor or department
    const urlParams = new URLSearchParams(window.location.search);
    const doctorIdParam = urlParams.get('doctorId');
    
    populateDoctorsDropdown();

    if (doctorIdParam) {
        const targetDoc = StorageManager.getDoctorById(doctorIdParam);
        if (targetDoc) {
            if (departmentSelect) departmentSelect.value = targetDoc.department;
            populateDoctorsDropdown(targetDoc.department);
            if (doctorSelect) doctorSelect.value = targetDoc.id;
        }
    }

    // Pre-fill user data if logged in
    const currentUser = StorageManager.getCurrentUser();
    if (currentUser) {
        const nameInput = document.getElementById('patientName');
        const emailInput = document.getElementById('patientEmail');
        const phoneInput = document.getElementById('patientPhone');

        if (nameInput) nameInput.value = currentUser.name || '';
        if (emailInput) emailInput.value = currentUser.email || '';
        if (phoneInput) phoneInput.value = currentUser.phone || '';
    }

    // Setup Time Slot Pill Listeners
    const slotBtns = document.querySelectorAll('.slot-pill');
    slotBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            slotBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTimeSlot = btn.dataset.time;
        });
    });

    // Handle Form Submit
    form.addEventListener('submit', handleBookingSubmit);
}

function populateDoctorsDropdown(departmentFilter = '') {
    const doctorSelect = document.getElementById('aptDoctor');
    if (!doctorSelect) return;

    // Clear current options
    doctorSelect.innerHTML = '<option value="">Select a Doctor</option>';

    // Fetch and filter doctors
    const allDoctors = StorageManager.getDoctors();
    let filteredDoctors = allDoctors;
    
    if (departmentFilter) {
        const normalizedFilter = String(departmentFilter).trim().toLowerCase();
        
        console.log("DEBUG: Filtering for department:", normalizedFilter);
        console.log("DEBUG: All doctors from StorageManager:", allDoctors);
        
        filteredDoctors = allDoctors.filter(doc => {
            const docDept = doc.department ? String(doc.department).trim().toLowerCase() : 'none';
            console.log(`DEBUG: Checking doctor ${doc.name} (Department: ${docDept}) against ${normalizedFilter}`);
            return docDept === normalizedFilter;
        });
        
        console.log("DEBUG: Matching doctors found:", filteredDoctors.length);
    }

    // Populate new options
    filteredDoctors.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${doc.name} (Fee: Rs. ${doc.fee})`;
        doctorSelect.appendChild(option);
    });
    
    if (filteredDoctors.length === 0) {
        doctorSelect.innerHTML = '<option value="">No doctors available</option>';
    }
}

function handleBookingSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!FormValidator.validateForm(form)) return;

    const currentUser = StorageManager.getCurrentUser();
    if (!currentUser) {
        showToast('Please log in to complete your appointment booking.', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
        return;
    }

    const doctorId = document.getElementById('aptDoctor').value;
    const doctor = StorageManager.getDoctorById(doctorId);
    if (!doctor) {
        showToast('Please select a valid doctor.', 'error');
        return;
    }

    const date = document.getElementById('aptDate').value;
    const notes = document.getElementById('aptNotes')?.value.trim() || '';

    const newAppointment = {
        patientId: currentUser.id,
        patientName: currentUser.name,
        patientEmail: currentUser.email,
        patientPhone: currentUser.phone || document.getElementById('patientPhone').value,
        doctorId: doctor.id,
        doctorName: doctor.name,
        department: doctor.department,
        fee: doctor.fee,
        date: date,
        time: selectedTimeSlot,
        status: 'Pending',
        notes: notes
    };

    const savedApt = StorageManager.saveAppointment(newAppointment);

    // Show Confirmation Modal
    showBookingConfirmationModal(savedApt, doctor);
}

function showBookingConfirmationModal(apt, doctor) {
    const modalContent = document.getElementById('confirmationModalBody');
    if (modalContent) {
        modalContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 60px; height: 60px; background: var(--success-light); color: var(--success-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 12px;">
                    <i class="fa-solid fa-check"></i>
                </div>
                <h3 style="color: var(--dark-color); margin-bottom: 4px;">Appointment Scheduled!</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Reference ID: <strong>${apt.id}</strong></p>
            </div>

            <div style="background: var(--light-bg); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px; font-size: 0.9rem; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Doctor:</span>
                    <strong style="color: var(--dark-color);">${doctor.name}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Department:</span>
                    <strong style="color: var(--dark-color);">${doctor.department}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Date & Time:</span>
                    <strong style="color: var(--primary-color);">${apt.date} at ${apt.time}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Consultation Fee:</span>
                    <strong style="color: var(--dark-color);">Rs. ${apt.fee.toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Status:</span>
                    <span class="status-badge badge-pending">Pending</span>
                </div>
            </div>
        `;
    }

    openModal('confirmationModal');
}
