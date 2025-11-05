// Lender Dashboard JavaScript

class LenderManager {
    constructor() {
        this.loans = this.loadLoans();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderLoansTable();
        this.setDefaultDate();
        this.updateUserInfo();
    }

    setupEventListeners() {
        // Modal
        const modal = document.getElementById('loanModal');
        const addLoanBtn = document.getElementById('addLoanBtn');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelBtn');

        addLoanBtn.addEventListener('click', () => this.openModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Form submission
        document.getElementById('loanForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLoan();
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

    openModal(loanId = null) {
        this.currentLoanId = loanId;
        const modal = document.getElementById('loanModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('loanForm');

        if (loanId) {
            const loan = this.loans.find(l => l.id === loanId);
            modalTitle.textContent = 'Edit Loan';
            document.getElementById('borrowerName').value = loan.borrowerName;
            document.getElementById('loanAmount').value = loan.loanAmount;
            document.getElementById('interestRate').value = loan.interestRate;
            document.getElementById('term').value = loan.term;
            document.getElementById('startDate').value = loan.startDate;
            document.getElementById('riskLevel').value = loan.riskLevel;
        } else {
            modalTitle.textContent = 'Add New Loan';
            form.reset();
            this.setDefaultDate();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('loanModal').style.display = 'none';
        this.currentLoanId = null;
    }

    saveLoan() {
        const formData = {
            borrowerName: document.getElementById('borrowerName').value,
            loanAmount: parseFloat(document.getElementById('loanAmount').value),
            interestRate: parseFloat(document.getElementById('interestRate').value),
            term: parseInt(document.getElementById('term').value),
            startDate: document.getElementById('startDate').value,
            riskLevel: document.getElementById('riskLevel').value
        };

        if (this.currentLoanId) {
            // Update existing loan
            const index = this.loans.findIndex(l => l.id === this.currentLoanId);
            this.loans[index] = { ...this.loans[index], ...formData };
        } else {
            // Add new loan
            const loan = {
                id: Date.now().toString(),
                ...formData,
                status: 'active',
                createdAt: new Date().toISOString(),
                monthlyPayment: this.calculateMonthlyPayment(formData.loanAmount, formData.interestRate, formData.term),
                lenderId: this.currentUser.id
            };
            this.loans.push(loan);
        }

        this.saveLoans();
        this.closeModal();
        this.updateDashboard();
        this.renderLoansTable();
    }

    deleteLoan(loanId) {
        if (confirm('Are you sure you want to delete this loan?')) {
            this.loans = this.loans.filter(l => l.id !== loanId);
            this.saveLoans();
            this.updateDashboard();
            this.renderLoansTable();
        }
    }

    toggleLoanStatus(loanId) {
        const loan = this.loans.find(l => l.id === loanId);
        loan.status = loan.status === 'active' ? 'paid' : 'active';
        this.saveLoans();
        this.updateDashboard();
        this.renderLoansTable();
    }

    calculateMonthlyPayment(principal, annualRate, termMonths) {
        const monthlyRate = annualRate / 100 / 12;
        if (monthlyRate === 0) {
            return principal / termMonths;
        }
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
               (Math.pow(1 + monthlyRate, termMonths) - 1);
    }

    updateDashboard() {
        const totalPortfolio = this.loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
        const activeLoans = this.loans.filter(loan => loan.status === 'active').length;
        const monthlyIncome = this.loans
            .filter(loan => loan.status === 'active')
            .reduce((sum, loan) => sum + loan.monthlyPayment, 0);
        const avgInterest = this.loans.length > 0 ? 
            this.loans.reduce((sum, loan) => sum + loan.interestRate, 0) / this.loans.length : 0;

        document.getElementById('totalPortfolio').textContent = `₹${totalPortfolio.toLocaleString()}`;
        document.getElementById('activeLoans').textContent = activeLoans;
        document.getElementById('monthlyIncome').textContent = `₹${monthlyIncome.toLocaleString()}`;
        document.getElementById('avgInterest').textContent = `${avgInterest.toFixed(2)}%`;

        this.renderRecentLoans();
        this.updateRiskAnalysis();
    }

    renderRecentLoans() {
        const recentLoansList = document.getElementById('recentLoansList');
        const clearBtn = document.getElementById('clearLoansBtn');
        const recentLoans = this.loans.slice(-5).reverse();

        if (recentLoans.length === 0) {
            recentLoansList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: #a0aec0; margin-bottom: 20px;"></i>
                    <h3>No Loan Applications</h3>
                    <p>You haven't received any loan applications yet. Applications will appear here when borrowers apply for loans.</p>
                </div>
            `;
            clearBtn.style.display = 'none';
            return;
        }

        clearBtn.style.display = 'block';
        recentLoansList.innerHTML = recentLoans.map(loan => `
            <div class="loan-item">
                <div class="loan-info">
                    <h4>${loan.borrowerName}</h4>
                    <p>${loan.interestRate}% • ${loan.term} months • ${loan.riskLevel} risk</p>
                </div>
                <div class="loan-amount">₹${loan.loanAmount.toLocaleString()}</div>
            </div>
        `).join('');
    }

    renderLoansTable() {
        const tbody = document.getElementById('loansTableBody');
        
        if (this.loans.length === 0) {
            tbody.innerHTML = '<tr class="no-data-row"><td colspan="8">No loans found</td></tr>';
            return;
        }

        tbody.innerHTML = this.loans.map(loan => `
            <tr>
                <td>${loan.borrowerName}</td>
                <td>₹${loan.loanAmount.toLocaleString()}</td>
                <td>${loan.interestRate}%</td>
                <td>${loan.term} months</td>
                <td>₹${loan.monthlyPayment.toFixed(2)}</td>
                <td><span class="status-badge status-${loan.status}">${loan.status}</span></td>
                <td><span class="risk-badge risk-${loan.riskLevel}">${loan.riskLevel}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="lenderManager.openModal('${loan.id}')" style="margin-right: 5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn ${loan.status === 'active' ? 'btn-secondary' : 'btn-primary'}" 
                            onclick="lenderManager.toggleLoanStatus('${loan.id}')" style="margin-right: 5px;">
                        <i class="fas fa-${loan.status === 'active' ? 'check' : 'undo'}"></i>
                    </button>
                    <button class="btn btn-danger" onclick="lenderManager.deleteLoan('${loan.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateRiskAnalysis() {
        const highRiskLoans = this.loans.filter(loan => loan.riskLevel === 'high' && loan.status === 'active');
        const riskScore = this.calculateRiskScore();
        
        document.getElementById('riskLevel').textContent = riskScore.level;
        document.getElementById('riskFill').style.width = `${riskScore.percentage}%`;
        
        const highRiskList = document.getElementById('highRiskList');
        if (highRiskLoans.length === 0) {
            highRiskList.innerHTML = '<p class="no-data">No high-risk loans</p>';
        } else {
            highRiskList.innerHTML = highRiskLoans.map(loan => `
                <div class="high-risk-item">
                    <strong>${loan.borrowerName}</strong> - ₹${loan.loanAmount.toLocaleString()}
                </div>
            `).join('');
        }
    }

    calculateRiskScore() {
        const activeLoans = this.loans.filter(loan => loan.status === 'active');
        if (activeLoans.length === 0) return { level: 'Low', percentage: 20 };

        const highRiskCount = activeLoans.filter(loan => loan.riskLevel === 'high').length;
        const mediumRiskCount = activeLoans.filter(loan => loan.riskLevel === 'medium').length;
        
        const riskPercentage = (highRiskCount * 100 + mediumRiskCount * 50) / activeLoans.length;
        
        let level = 'Low';
        if (riskPercentage > 70) level = 'High';
        else if (riskPercentage > 40) level = 'Medium';
        
        return { level, percentage: Math.min(riskPercentage, 100) };
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
    }

    loadLoans() {
        const saved = localStorage.getItem('lenderLoans');
        return saved ? JSON.parse(saved) : [];
    }

    saveLoans() {
        localStorage.setItem('lenderLoans', JSON.stringify(this.loans));
    }

    clearAllLoans() {
        this.loans = [];
        this.saveLoans();
        this.updateDashboard();
        this.renderLoansTable();
    }
}

// Initialize the lender manager
const lenderManager = new LenderManager();

// Clear any existing sample data and ensure clean state
lenderManager.clearAllLoans();

// Global functions for HTML onclick handlers
function clearAllLoans() {
    if (confirm('Are you sure you want to remove all loan applications? This action cannot be undone.')) {
        lenderManager.clearAllLoans();
        alert('All loan applications have been removed.');
    }
}
