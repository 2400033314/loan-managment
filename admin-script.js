// Admin Dashboard JavaScript

class AdminManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.users = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateUserInfo();
        await this.loadUsers(); // fetch users from backend first
        this.updateDashboard();
        this.renderUsersTable();
    }

    setupEventListeners() {
        const modal = document.getElementById('userModal');
        const addUserBtn = document.getElementById('addUserBtn');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelUserBtn');

        addUserBtn.addEventListener('click', () => this.openModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        document.getElementById('userForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveUser();
        });
    }

    getCurrentUser() {
        const session = localStorage.getItem('loanSystemSession');
        if (session) {
            const sessionData = JSON.parse(session);
            const users = JSON.parse(localStorage.getItem('loanSystemUsers') || '[]');
            return users.find(u => u.id === sessionData.userId);
        }
        return null;
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userInfo').textContent = `Welcome, ${this.currentUser.username}`;
        }
    }

    updateDashboard() {
        const totalUsers = this.users.length;
        const activeLenders = this.users.filter(user => user.role === 'lender').length;
        const activeBorrowers = this.users.filter(user => user.role === 'borrower').length;
        const totalApplications = this.getTotalApplications();
        const activeSessions = this.getActiveSessions();

        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeLenders').textContent = activeLenders;
        document.getElementById('activeBorrowers').textContent = activeBorrowers;
        document.getElementById('totalApplications').textContent = totalApplications;
        document.getElementById('activeSessions').textContent = activeSessions;
    }

    getTotalApplications() {
        const applications = localStorage.getItem('loanApplications');
        return applications ? JSON.parse(applications).length : 0;
    }

    getActiveSessions() {
        const sessions = localStorage.getItem('loanSystemSession');
        return sessions ? 1 : 0;
    }

    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');

        if (!this.users || this.users.length === 0) {
            tbody.innerHTML = '<tr class="no-data-row"><td colspan="6">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${this.formatRole(user.role)}</span></td>
                <td><span class="status-badge status-active">Active</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-secondary" onclick="adminManager.editUser('${user._id}')" style="margin-right: 5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="adminManager.deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatRole(role) {
        const roleNames = {
            'admin': 'Admin',
            'bank_manager': 'Bank Manager',
            'loan_officer': 'Loan Officer',
            'lender': 'Lender',
            'borrower': 'Borrower'
        };
        return roleNames[role] || role;
    }

    openModal(userId = null) {
        this.currentUserId = userId;
        const modal = document.getElementById('userModal');
        const modalTitle = document.querySelector('#userModal h3');
        const form = document.getElementById('userForm');

        if (userId) {
            const user = this.users.find(u => u._id === userId);
            modalTitle.textContent = 'Edit User';
            document.getElementById('newUsername').value = user.username;
            document.getElementById('newEmail').value = user.email;
            document.getElementById('newPassword').value = '';
            document.getElementById('newRole').value = user.role;
        } else {
            modalTitle.textContent = 'Add New User';
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('userModal').style.display = 'none';
        this.currentUserId = null;
    }

    // ✅ Add or update user via backend
    async saveUser() {
        const formData = {
            username: document.getElementById('newUsername').value,
            email: document.getElementById('newEmail').value,
            password: document.getElementById('newPassword').value,
            role: document.getElementById('newRole').value,
        };

        if (this.currentUserId) {
            // Update user
            await fetch(`http://localhost:5000/api/users/${this.currentUserId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
        } else {
            // Create new user
            await fetch("http://localhost:5000/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
        }

        await this.loadUsers();
        this.closeModal();
        this.updateDashboard();
    }

    editUser(userId) {
        this.openModal(userId);
    }

    // ✅ Delete from backend
    async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            await fetch(`http://localhost:5000/api/users/${userId}`, { method: "DELETE" });
            await this.loadUsers();
            this.updateDashboard();
        }
    }

    // ✅ Load users from backend
    async loadUsers() {
        try {
            const res = await fetch("http://localhost:5000/api/users");
            this.users = await res.json();
            this.renderUsersTable();
        } catch (error) {
            console.error("Error loading users:", error);
        }
    }
}

// Initialize the admin manager
const adminManager = new AdminManager();

function logout() {
    localStorage.removeItem('loanSystemSession');
    window.location.href = 'index.html';
}
