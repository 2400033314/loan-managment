// Authentication System for Loan Management System

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // Role selection
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectRole(card.onclick.toString().match(/'([^']+)'/)[1]);
            });
        });

        // Form submissions
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerAuthForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    selectRole(role) {
        this.currentRole = role;
        document.getElementById('loginTitle').textContent = `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
        document.getElementById('registerTitle').textContent = `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
        document.getElementById('loginForm').style.display = 'block';
        document.querySelector('.role-selection').style.display = 'none';
    }

    showLogin() {
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    }

    showRegister() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }

    goBack() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.querySelector('.role-selection').style.display = 'grid';
        this.currentRole = null;
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Check if user exists
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.role === this.currentRole);

        if (!user) {
            alert('User not found. Please register first.');
            return;
        }

        if (user.password !== password) {
            alert('Invalid password');
            return;
        }

        // Login successful
        this.currentUser = user;
        this.saveSession();
        this.redirectToDashboard();
    }

    handleRegister() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        // Check if user already exists
        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            alert('Username already exists');
            return;
        }

        if (users.find(u => u.email === email)) {
            alert('Email already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username: username,
            email: email,
            password: password,
            role: this.currentRole,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('loanSystemUsers', JSON.stringify(users));

        // Auto login after registration
        this.currentUser = newUser;
        this.saveSession();
        this.redirectToDashboard();
    }

    redirectToDashboard() {
        const role = this.currentUser.role;
        
        switch (role) {
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'bank_manager':
                window.location.href = 'bank-manager-dashboard.html';
                break;
            case 'loan_officer':
                window.location.href = 'loan-officer-dashboard.html';
                break;
            case 'lender':
                window.location.href = 'lender-dashboard.html';
                break;
            case 'borrower':
                window.location.href = 'borrower-dashboard.html';
                break;
            default:
                alert('Unknown user role. Please contact administrator.');
                break;
        }
    }

    checkExistingSession() {
        const session = localStorage.getItem('loanSystemSession');
        if (session) {
            const sessionData = JSON.parse(session);
            const users = this.getUsers();
            const user = users.find(u => u.id === sessionData.userId);
            
            if (user) {
                this.currentUser = user;
                this.currentRole = user.role;
                this.redirectToDashboard();
            }
        }
    }

    getUsers() {
        const users = localStorage.getItem('loanSystemUsers');
        return users ? JSON.parse(users) : [];
    }

    saveSession() {
        const session = {
            userId: this.currentUser.id,
            role: this.currentRole,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('loanSystemSession', JSON.stringify(session));
    }

    logout() {
        localStorage.removeItem('loanSystemSession');
        window.location.href = 'index.html';
    }
}

// Global functions for HTML onclick handlers
function selectRole(role) {
    authManager.selectRole(role);
}

function showLogin() {
    authManager.showLogin();
}

function showRegister() {
    authManager.showRegister();
}

function goBack() {
    authManager.goBack();
}

function logout() {
    authManager.logout();
}

// Initialize authentication manager
const authManager = new AuthManager();

// Add some sample users for demonstration
if (authManager.getUsers().length === 0) {
    const sampleUsers = [
        {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            username: 'bank_manager',
            email: 'manager@example.com',
            password: 'password123',
            role: 'bank_manager',
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            username: 'loan_officer',
            email: 'officer@example.com',
            password: 'password123',
            role: 'loan_officer',
            createdAt: new Date().toISOString()
        },
        {
            id: '4',
            username: 'lender1',
            email: 'lender@example.com',
            password: 'password123',
            role: 'lender',
            createdAt: new Date().toISOString()
        },
        {
            id: '5',
            username: 'borrower1',
            email: 'borrower@example.com',
            password: 'password123',
            role: 'borrower',
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('loanSystemUsers', JSON.stringify(sampleUsers));
}
