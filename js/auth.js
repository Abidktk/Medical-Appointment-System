/* ==========================================================================
   MEDICARE SYSTEM - AUTHENTICATION & ROLE MANAGEMENT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    AuthManager.updateNavUI();
    AuthManager.setupNavListeners();
});

class AuthManager {
    static getCurrentUser() {
        return StorageManager.getCurrentUser();
    }

    static isLoggedIn() {
        return !!this.getCurrentUser();
    }

    static getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }

    static login(email, password) {
        const user = StorageManager.getUserByEmail(email);
        if (!user) {
            return { success: false, message: 'No account found with this email address.' };
        }
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password. Please try again.' };
        }

        // Set session
        StorageManager.setCurrentUser(user);

        // Notify welcome back
        StorageManager.addNotification({
            userId: user.id,
            title: "Welcome Back",
            message: `Hello ${user.name}, welcome back to MediCare+.`
        });

        return { success: true, user };
    }

    static register(userData) {
        const existingUser = StorageManager.getUserByEmail(userData.email);
        if (existingUser) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const newUser = StorageManager.saveUser({
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            cnic: userData.cnic || '',
            password: userData.password,
            role: userData.role || 'patient'
        });

        // Set active session
        StorageManager.setCurrentUser(newUser);

        return { success: true, user: newUser };
    }

    static logout() {
        StorageManager.setCurrentUser(null);
        if (typeof showToast === 'function') {
            showToast('Logged out successfully', 'info');
        }
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    }

    /**
     * Protect page route according to role requirement
     */
    static enforceAuth(allowedRoles = []) {
        const user = this.getCurrentUser();
        if (!user) {
            if (typeof showToast === 'function') {
                showToast('Please login to access this page.', 'warning');
            }
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
            return false;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            if (typeof showToast === 'function') {
                showToast('Access denied: Unauthorized role.', 'error');
            }
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
            return false;
        }
        return true;
    }

    /**
     * Update navigation header state based on active session
     */
    static updateNavUI() {
        const currentUser = this.getCurrentUser();
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenuDropdown = document.getElementById('userMenuDropdown');
        const navUserName = document.getElementById('navUserName');
        const navUserRole = document.getElementById('navUserRole');
        const dashboardLink = document.getElementById('dashboardNavLink');

        if (currentUser) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (registerBtn) registerBtn.classList.add('hidden');
            if (userMenuDropdown) userMenuDropdown.classList.remove('hidden');
            if (navUserName) navUserName.textContent = currentUser.name;
            if (navUserRole) {
                navUserRole.textContent = currentUser.role.toUpperCase();
                navUserRole.className = `role-badge badge-${currentUser.role}`;
            }

            if (dashboardLink) {
                dashboardLink.href = currentUser.role === 'admin' ? 'admin.html' : 'dashboard.html';
            }
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (registerBtn) registerBtn.classList.remove('hidden');
            if (userMenuDropdown) userMenuDropdown.classList.add('hidden');
            if (dashboardLink) dashboardLink.href = 'login.html';
        }
    }

    static setupNavListeners() {
        const userBadgeBtn = document.getElementById('userBadgeBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userBadgeBtn && dropdownMenu) {
            userBadgeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthManager.logout();
            });
        }
    }
}
