// Bank Manager Dashboard JavaScript

class BankManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.applications = this.loadApplications();
        this.officers = this.loadOfficers();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserInfo();
        this.updateDashboard();
        this.renderApplicationsTable();
        this.renderOfficers();
    }

    setupEventListeners() {
        // Filters
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.renderApplicationsTable();
        });

        document.getElementById('typeFilter').addEventListener('change', () => {
            this.renderApplicationsTable();
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
        const totalPortfolio = this.calculateTotalPortfolio();
        const pendingApplications = this.applications.filter(app => app.status === 'pending').length;
        const monthlyRevenue = this.calculateMonthlyRevenue();
        const activeCustomers = this.getActiveCustomers();

        document.getElementById('totalPortfolio').textContent = `₹${totalPortfolio.toLocaleString()}`;
        document.getElementById('pendingApplications').textContent = pendingApplications;
        document.getElementById('monthlyRevenue').textContent = `₹${monthlyRevenue.toLocaleString()}`;
        document.getElementById('activeCustomers').textContent = activeCustomers;
    }

    calculateTotalPortfolio() {
        const loans = JSON.parse(localStorage.getItem('lenderLoans') || '[]');
        return loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    }

    calculateMonthlyRevenue() {
        const loans = JSON.parse(localStorage.getItem('lenderLoans') || '[]');
        return loans
            .filter(loan => loan.status === 'active')
            .reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    }

    getActiveCustomers() {
        const users = JSON.parse(localStorage.getItem('loanSystemUsers') || '[]');
        return users.filter(user => user.role === 'borrower').length;
    }

    renderApplicationsTable() {
        const tbody = document.getElementById('applicationsTableBody');
        const statusFilter = document.getElementById('statusFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        
        let filteredApplications = this.applications;
        
        if (statusFilter !== 'all') {
            filteredApplications = filteredApplications.filter(app => app.status === statusFilter);
        }
        
        if (typeFilter !== 'all') {
            filteredApplications = filteredApplications.filter(app => app.loanType === typeFilter);
        }
        
        if (filteredApplications.length === 0) {
            tbody.innerHTML = '<tr class="no-data-row"><td colspan="6">No applications found</td></tr>';
            return;
        }

        tbody.innerHTML = filteredApplications.map(app => `
            <tr>
                <td>${app.firstName} ${app.lastName}</td>
                <td><span class="loan-type-badge type-${app.loanType}">${this.formatLoanType(app.loanType)}</span></td>
                <td>₹${parseInt(app.loanAmount).toLocaleString()}</td>
                <td><span class="status-badge status-${app.status}">${app.status}</span></td>
                <td>${new Date(app.submittedAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-primary" onclick="bankManager.viewApplication('${app.id}')" style="margin-right: 5px;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-success" onclick="bankManager.approveApplication('${app.id}')" style="margin-right: 5px;">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-danger" onclick="bankManager.rejectApplication('${app.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatLoanType(type) {
        const typeNames = {
            'personal': 'Personal',
            'home': 'Home',
            'car': 'Car',
            'education': 'Education'
        };
        return typeNames[type] || type;
    }

    renderOfficers() {
        const officersGrid = document.querySelector('.officers-grid');
        
        if (this.officers.length === 0) {
            officersGrid.innerHTML = '<p class="no-data">No loan officers found</p>';
            return;
        }

        officersGrid.innerHTML = this.officers.map(officer => `
            <div class="officer-card">
                <div class="officer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="officer-info">
                    <h3>${officer.name}</h3>
                    <p>${officer.position}</p>
                    <div class="officer-stats">
                        <span>Applications: ${officer.applications}</span>
                        <span>Approval Rate: ${officer.approvalRate}%</span>
                    </div>
                </div>
                <div class="officer-actions">
                    <button class="btn btn-secondary" onclick="bankManager.viewOfficerDetails('${officer.id}')">View Details</button>
                </div>
            </div>
        `).join('');
    }

    viewApplication(appId) {
        const application = this.applications.find(app => app.id === appId);
        if (application) {
            alert(`Application Details:\nName: ${application.firstName} ${application.lastName}\nLoan Type: ${this.formatLoanType(application.loanType)}\nAmount: ₹${parseInt(application.loanAmount).toLocaleString()}\nStatus: ${application.status}`);
        }
    }

    approveApplication(appId) {
        if (confirm('Are you sure you want to approve this application?')) {
            const index = this.applications.findIndex(app => app.id === appId);
            if (index !== -1) {
                this.applications[index].status = 'approved';
                this.saveApplications();
                this.renderApplicationsTable();
                alert('Application approved successfully!');
            }
        }
    }

    rejectApplication(appId) {
        if (confirm('Are you sure you want to reject this application?')) {
            const index = this.applications.findIndex(app => app.id === appId);
            if (index !== -1) {
                this.applications[index].status = 'rejected';
                this.saveApplications();
                this.renderApplicationsTable();
                alert('Application rejected.');
            }
        }
    }

    viewOfficerDetails(officerId) {
        const officer = this.officers.find(o => o.id === officerId);
        if (officer) {
            alert(`Officer Details:\nName: ${officer.name}\nPosition: ${officer.position}\nApplications: ${officer.applications}\nApproval Rate: ${officer.approvalRate}%`);
        }
    }

    loadApplications() {
        const saved = localStorage.getItem('loanApplications');
        return saved ? JSON.parse(saved) : [];
    }

    loadOfficers() {
        const saved = localStorage.getItem('loanOfficers');
        return saved ? JSON.parse(saved) : this.getDefaultOfficers();
    }

    getDefaultOfficers() {
        return [
            {
                id: '1',
                name: 'Rajesh Kumar',
                position: 'Senior Loan Officer',
                applications: 45,
                approvalRate: 78
            },
            {
                id: '2',
                name: 'Priya Sharma',
                position: 'Loan Officer',
                applications: 32,
                approvalRate: 85
            }
        ];
    }

    saveApplications() {
        localStorage.setItem('loanApplications', JSON.stringify(this.applications));
    }
}

// Initialize the bank manager
const bankManager = new BankManager();

// Global functions for HTML onclick handlers
function logout() {
    localStorage.removeItem('loanSystemSession');
    window.location.href = 'index.html';
}


