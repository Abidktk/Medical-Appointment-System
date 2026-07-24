/* ==========================================================================
   MEDICARE SYSTEM - ADMIN CONTROL PANEL ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Require ADMIN role for admin page
    if (!AuthManager.enforceAuth(['admin'])) return;

    initAdminPanel();
});

function initAdminPanel() {
    setupAdminTabListeners();
    loadAdminMetrics();
    renderAdminDoctorsTable();
    renderAdminPatientsTable();
    renderAdminAppointmentsTable();
    renderAdminDepartmentsTable();
    renderAdminMessagesTable();
    populateAdminDepartmentOptions();
}

/**
 * Tab Navigation Handler
 */
function setupAdminTabListeners() {
    const tabBtns = document.querySelectorAll('.admin-nav-btn[data-tab]');
    const tabSections = document.querySelectorAll('.admin-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabSections.forEach(s => s.classList.add('hidden'));

            btn.classList.add('active');
            const targetEl = document.getElementById(`admin-tab-${target}`);
            if (targetEl) targetEl.classList.remove('hidden');
        });
    });
}

/**
 * Load System Overview KPI Metrics
 */
function loadAdminMetrics() {
    const doctors = StorageManager.getDoctors();
    const users = StorageManager.getUsers();
    const patients = users.filter(u => u.role === 'patient');
    const appointments = StorageManager.getAppointments();

    const totalRevenue = appointments
        .filter(a => a.status === 'Completed')
        .reduce((sum, a) => sum + (Number(a.fee) || 0), 0);

    document.getElementById('admTotalPatients').textContent = patients.length;
    document.getElementById('admTotalDoctors').textContent = doctors.length;
    document.getElementById('admTotalAppointments').textContent = appointments.length;
    document.getElementById('admTotalRevenue').textContent = `Rs. ${totalRevenue.toLocaleString()}`;
}

/**
 * Render Doctors Management Table
 */
function renderAdminDoctorsTable() {
    const tbody = document.getElementById('adminDoctorsTableBody');
    if (!tbody) return;

    const doctors = StorageManager.getDoctors();

    if (doctors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No doctors found.</td></tr>';
        return;
    }

    tbody.innerHTML = doctors.map(doc => `
        <tr>
            <td><strong>#${doc.id}</strong></td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${doc.image}" alt="${doc.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                    <strong>${doc.name}</strong>
                </div>
            </td>
            <td><span class="role-badge badge-doctor">${doc.department}</span></td>
            <td>${doc.experience} Yrs</td>
            <td>Rs. ${doc.fee.toLocaleString()}</td>
            <td><i class="fa-solid fa-star" style="color: var(--accent-color);"></i> ${doc.rating}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editDoctorModal('${doc.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-outline btn-sm" style="color: var(--danger-color); border-color: var(--danger-color);" onclick="deleteDoctor('${doc.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openAddDoctorModal() {
    document.getElementById('docModalTitle').textContent = 'Add New Doctor';
    document.getElementById('docId').value = '';
    document.getElementById('docName').value = '';
    document.getElementById('docDegree').value = '';
    document.getElementById('docExperience').value = '5';
    document.getElementById('docFee').value = '1500';
    document.getElementById('docImage').value = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600';
    document.getElementById('docBio').value = '';
    openModal('doctorModal');
}

function editDoctorModal(id) {
    const doc = StorageManager.getDoctorById(id);
    if (!doc) return;

    document.getElementById('docModalTitle').textContent = 'Edit Doctor Profile';
    document.getElementById('docId').value = doc.id;
    document.getElementById('docName').value = doc.name;
    document.getElementById('docDepartment').value = doc.department;
    document.getElementById('docDegree').value = doc.degree;
    document.getElementById('docExperience').value = doc.experience;
    document.getElementById('docFee').value = doc.fee;
    document.getElementById('docImage').value = doc.image;
    document.getElementById('docBio').value = doc.bio || '';
    openModal('doctorModal');
}

function saveDoctorFromModal() {
    const id = document.getElementById('docId').value;
    const name = document.getElementById('docName').value.trim();
    const department = document.getElementById('docDepartment').value;
    const degree = document.getElementById('docDegree').value.trim();
    const experience = Number(document.getElementById('docExperience').value);
    const fee = Number(document.getElementById('docFee').value);
    const image = document.getElementById('docImage').value.trim();
    const bio = document.getElementById('docBio').value.trim();

    if (!name || !department || !degree || !fee) {
        showToast('Please fill all required doctor details.', 'warning');
        return;
    }

    StorageManager.saveDoctor({
        id: id || undefined,
        name,
        department,
        degree,
        experience,
        fee,
        rating: 4.8,
        reviewsCount: 10,
        image: image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
        availability: ["Monday", "Wednesday", "Friday"],
        timing: "09:00 AM - 02:00 PM",
        bio
    });

    showToast(`Doctor ${name} saved successfully!`, 'success');
    closeModal('doctorModal');
    renderAdminDoctorsTable();
    loadAdminMetrics();
}

function deleteDoctor(id) {
    if (confirm("Are you sure you want to delete this doctor?")) {
        StorageManager.deleteDoctor(id);
        showToast("Doctor removed successfully.", "info");
        renderAdminDoctorsTable();
        loadAdminMetrics();
    }
}

/**
 * Render Patients Table
 */
function renderAdminPatientsTable() {
    const tbody = document.getElementById('adminPatientsTableBody');
    if (!tbody) return;

    const patients = StorageManager.getUsers().filter(u => u.role === 'patient');

    tbody.innerHTML = patients.map(p => `
        <tr>
            <td><strong>#${p.id}</strong></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.email}</td>
            <td>${p.phone || 'N/A'}</td>
            <td>${p.cnic || 'N/A'}</td>
            <td>${p.createdAt || '2026-01-01'}</td>
        </tr>
    `).join('');
}

/**
 * Render Appointments Table with Admin Override Controls
 */
function renderAdminAppointmentsTable() {
    const tbody = document.getElementById('adminAppointmentsTableBody');
    if (!tbody) return;

    const appointments = StorageManager.getAppointments();

    tbody.innerHTML = appointments.map(apt => `
        <tr>
            <td><strong>${apt.id}</strong></td>
            <td>${apt.patientName}</td>
            <td>${apt.doctorName}</td>
            <td>${apt.department}</td>
            <td>${apt.date} ${apt.time}</td>
            <td><span class="status-badge badge-${apt.status.toLowerCase()}">${apt.status}</span></td>
            <td>
                <select class="form-control" style="padding: 4px 8px; font-size: 0.8rem;" onchange="updateAppointmentStatusAdmin('${apt.id}', this.value)">
                    <option value="Pending" ${apt.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Confirmed" ${apt.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Completed" ${apt.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${apt.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function updateAppointmentStatusAdmin(id, status) {
    StorageManager.updateAppointmentStatus(id, status);
    showToast(`Appointment ${id} changed to ${status}`, 'success');
    renderAdminAppointmentsTable();
    loadAdminMetrics();
}

/**
 * Render Departments Table & Add Department
 */
function renderAdminDepartmentsTable() {
    const tbody = document.getElementById('adminDepartmentsTableBody');
    if (!tbody) return;

    const departments = StorageManager.getDepartments();
    const doctors = StorageManager.getDoctors();

    tbody.innerHTML = departments.map(d => {
        const docCount = doctors.filter(doc => doc.department === d.name).length;
        return `
            <tr>
                <td><strong>#${d.id}</strong></td>
                <td><i class="fa-solid ${d.icon || 'fa-stethoscope'}" style="color: var(--primary-color);"></i> <strong>${d.name}</strong></td>
                <td>${d.description || 'Medical department'}</td>
                <td>${docCount} Specialist(s)</td>
                <td>
                    <button class="btn btn-outline btn-sm" style="color: var(--danger-color); border-color: var(--danger-color);" onclick="deleteDepartment('${d.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddDepartmentModal() {
    document.getElementById('deptName').value = '';
    document.getElementById('deptIcon').value = 'fa-heart-pulse';
    document.getElementById('deptDesc').value = '';
    openModal('deptModal');
}

function saveDepartmentFromModal() {
    const name = document.getElementById('deptName').value.trim();
    const icon = document.getElementById('deptIcon').value.trim();
    const description = document.getElementById('deptDesc').value.trim();

    if (!name) {
        showToast('Department name is required.', 'warning');
        return;
    }

    StorageManager.saveDepartment({ name, icon, description });
    showToast(`Department ${name} added!`, 'success');
    closeModal('deptModal');
    renderAdminDepartmentsTable();
    populateAdminDepartmentOptions();
}

function deleteDepartment(id) {
    if (confirm("Are you sure you want to remove this department?")) {
        StorageManager.deleteDepartment(id);
        showToast("Department deleted.", "info");
        renderAdminDepartmentsTable();
        populateAdminDepartmentOptions();
    }
}

/**
 * Render Contact Form Messages Submitted by Visitors
 */
function renderAdminMessagesTable() {
    const tbody = document.getElementById('adminMessagesTableBody');
    if (!tbody) return;

    const messages = StorageManager.getMessages();

    if (messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No messages received.</td></tr>';
        return;
    }

    tbody.innerHTML = messages.map(m => `
        <tr>
            <td><strong>${m.date}</strong></td>
            <td><strong>${m.name}</strong></td>
            <td>${m.email}</td>
            <td>${m.subject}</td>
            <td><p style="font-size: 0.85rem; max-width: 250px;">"${m.message}"</p></td>
        </tr>
    `).join('');
}

function populateAdminDepartmentOptions() {
    const docDeptSelect = document.getElementById('docDepartment');
    if (!docDeptSelect) return;

    const departments = StorageManager.getDepartments();
    docDeptSelect.innerHTML = departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
}
