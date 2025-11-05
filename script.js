// Loan Management System JavaScript

class LoanManager {
    constructor() {
        this.loans = this.loadLoans();
        this.currentLoanId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderLoansTable();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showSection(e.target.dataset.section);
            });
        });

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

        // Calculator
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculateLoan();
        });

        document.getElementById('saveAsLoanBtn').addEventListener('click', () => {
            this.saveCalculatedLoan();
        });
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Show section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Update content based on section
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        } else if (sectionName === 'loans') {
            this.renderLoansTable();
        } else if (sectionName === 'reports') {
            this.updateReports();
        }
    }

    // Loan Management Methods
    openModal(loanId = null) {
        this.currentLoanId = loanId;
        const modal = document.getElementById('loanModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('loanForm');

        if (loanId) {
            const loan = this.loans.find(l => l.id === loanId);
            modalTitle.textContent = 'Edit Loan';
            document.getElementById('loanName').value = loan.name;
            document.getElementById('principal').value = loan.principal;
            document.getElementById('interestRate').value = loan.interestRate;
            document.getElementById('term').value = loan.term;
            document.getElementById('startDate').value = loan.startDate;
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
            name: document.getElementById('loanName').value,
            principal: parseFloat(document.getElementById('principal').value),
            interestRate: parseFloat(document.getElementById('interestRate').value),
            term: parseInt(document.getElementById('term').value),
            startDate: document.getElementById('startDate').value
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
                monthlyPayment: this.calculateMonthlyPayment(formData.principal, formData.interestRate, formData.term)
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

    // Calculator Methods
    calculateLoan() {
        const principal = parseFloat(document.getElementById('calcPrincipal').value);
        const rate = parseFloat(document.getElementById('calcRate').value);
        const term = parseInt(document.getElementById('calcTerm').value);

        if (!principal || !rate || !term) {
            alert('Please fill in all fields');
            return;
        }

        const monthlyRate = rate / 100 / 12;
        const monthlyPayment = this.calculateMonthlyPayment(principal, rate, term);
        const totalAmount = monthlyPayment * term;
        const totalInterest = totalAmount - principal;

        document.getElementById('monthlyPayment').textContent = `$${monthlyPayment.toFixed(2)}`;
        document.getElementById('totalInterest').textContent = `$${totalInterest.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;

        document.getElementById('calculationResults').style.display = 'block';
    }

    calculateMonthlyPayment(principal, annualRate, termMonths) {
        const monthlyRate = annualRate / 100 / 12;
        if (monthlyRate === 0) {
            return principal / termMonths;
        }
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
               (Math.pow(1 + monthlyRate, termMonths) - 1);
    }

    saveCalculatedLoan() {
        const principal = parseFloat(document.getElementById('calcPrincipal').value);
        const rate = parseFloat(document.getElementById('calcRate').value);
        const term = parseInt(document.getElementById('calcTerm').value);
        const name = prompt('Enter a name for this loan:') || 'Calculated Loan';

        const loan = {
            id: Date.now().toString(),
            name: name,
            principal: principal,
            interestRate: rate,
            term: term,
            startDate: new Date().toISOString().split('T')[0],
            status: 'active',
            createdAt: new Date().toISOString(),
            monthlyPayment: this.calculateMonthlyPayment(principal, rate, term)
        };

        this.loans.push(loan);
        this.saveLoans();
        this.updateDashboard();
        this.renderLoansTable();
        
        // Clear calculator
        document.getElementById('calcPrincipal').value = '';
        document.getElementById('calcRate').value = '';
        document.getElementById('calcTerm').value = '';
        document.getElementById('calculationResults').style.display = 'none';
        
        alert('Loan saved successfully!');
    }

    // Dashboard Methods
    updateDashboard() {
        const totalLoans = this.loans.reduce((sum, loan) => sum + loan.principal, 0);
        const activeLoans = this.loans.filter(loan => loan.status === 'active').length;
        const paidOffLoans = this.loans.filter(loan => loan.status === 'paid').length;
        const avgInterest = this.loans.length > 0 ? 
            this.loans.reduce((sum, loan) => sum + loan.interestRate, 0) / this.loans.length : 0;

        document.getElementById('totalLoans').textContent = `$${totalLoans.toLocaleString()}`;
        document.getElementById('activeLoans').textContent = activeLoans;
        document.getElementById('paidOffLoans').textContent = paidOffLoans;
        document.getElementById('avgInterest').textContent = `${avgInterest.toFixed(2)}%`;

        this.renderRecentLoans();
    }

    renderRecentLoans() {
        const recentLoansList = document.getElementById('recentLoansList');
        const recentLoans = this.loans.slice(-5).reverse();

        if (recentLoans.length === 0) {
            recentLoansList.innerHTML = '<p class="no-data">No loans added yet</p>';
            return;
        }

        recentLoansList.innerHTML = recentLoans.map(loan => `
            <div class="loan-item">
                <div class="loan-info">
                    <h4>${loan.name}</h4>
                    <p>${loan.interestRate}% • ${loan.term} months</p>
                </div>
                <div class="loan-amount">$${loan.principal.toLocaleString()}</div>
            </div>
        `).join('');
    }

    // Table Methods
    renderLoansTable() {
        const tbody = document.getElementById('loansTableBody');
        
        if (this.loans.length === 0) {
            tbody.innerHTML = '<tr class="no-data-row"><td colspan="7">No loans found</td></tr>';
            return;
        }

        tbody.innerHTML = this.loans.map(loan => `
            <tr>
                <td>${loan.name}</td>
                <td>$${loan.principal.toLocaleString()}</td>
                <td>${loan.interestRate}%</td>
                <td>${loan.term} months</td>
                <td>$${loan.monthlyPayment.toFixed(2)}</td>
                <td><span class="status-badge status-${loan.status}">${loan.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="loanManager.openModal('${loan.id}')" style="margin-right: 5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn ${loan.status === 'active' ? 'btn-secondary' : 'btn-primary'}" 
                            onclick="loanManager.toggleLoanStatus('${loan.id}')" style="margin-right: 5px;">
                        <i class="fas fa-${loan.status === 'active' ? 'check' : 'undo'}"></i>
                    </button>
                    <button class="btn btn-danger" onclick="loanManager.deleteLoan('${loan.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Reports Methods
    updateReports() {
        this.renderLoanDistribution();
        this.renderPaymentSchedule();
    }

    renderLoanDistribution() {
        const canvas = document.getElementById('loanDistributionChart');
        const ctx = canvas.getContext('2d');
        
        // Simple pie chart implementation
        const activeLoans = this.loans.filter(loan => loan.status === 'active');
        const paidLoans = this.loans.filter(loan => loan.status === 'paid');
        
        if (activeLoans.length === 0 && paidLoans.length === 0) {
            canvas.style.display = 'none';
            return;
        }

        canvas.style.display = 'block';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw simple chart
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        if (activeLoans.length > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI * (activeLoans.length / this.loans.length));
            ctx.fillStyle = '#667eea';
            ctx.fill();
        }
        
        if (paidLoans.length > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 2 * Math.PI * (activeLoans.length / this.loans.length), 2 * Math.PI);
            ctx.fillStyle = '#48bb78';
            ctx.fill();
        }
        
        // Add labels
        ctx.fillStyle = '#4a5568';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Active: ${activeLoans.length}`, centerX, centerY - 10);
        ctx.fillText(`Paid: ${paidLoans.length}`, centerX, centerY + 10);
    }

    renderPaymentSchedule() {
        const scheduleContainer = document.getElementById('paymentSchedule');
        const activeLoans = this.loans.filter(loan => loan.status === 'active');
        
        if (activeLoans.length === 0) {
            scheduleContainer.innerHTML = '<p class="no-data">No active loans to display</p>';
            return;
        }

        scheduleContainer.innerHTML = activeLoans.map(loan => {
            const startDate = new Date(loan.startDate);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + loan.term);
            
            return `
                <div class="schedule-item">
                    <div>
                        <strong>${loan.name}</strong>
                        <div style="font-size: 0.9rem; color: #718096;">
                            ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; color: #667eea;">$${loan.monthlyPayment.toFixed(2)}/month</div>
                        <div style="font-size: 0.9rem; color: #718096;">${loan.term} payments</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Utility Methods
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
    }

    loadLoans() {
        const saved = localStorage.getItem('loanManagerLoans');
        return saved ? JSON.parse(saved) : [];
    }

    saveLoans() {
        localStorage.setItem('loanManagerLoans', JSON.stringify(this.loans));
    }
}

// Initialize the application
const loanManager = new LoanManager();

// Add some sample data if no loans exist
if (loanManager.loans.length === 0) {
    const sampleLoans = [
        {
            id: '1',
            name: 'Car Loan',
            principal: 25000,
            interestRate: 4.5,
            term: 60,
            startDate: '2024-01-01',
            status: 'active',
            createdAt: '2024-01-01T00:00:00.000Z',
            monthlyPayment: 465.75
        },
        {
            id: '2',
            name: 'Personal Loan',
            principal: 10000,
            interestRate: 6.8,
            term: 36,
            startDate: '2023-06-01',
            status: 'paid',
            createdAt: '2023-06-01T00:00:00.000Z',
            monthlyPayment: 308.10
        }
    ];
    
    loanManager.loans = sampleLoans;
    loanManager.saveLoans();
    loanManager.updateDashboard();
    loanManager.renderLoansTable();
}

