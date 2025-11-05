// Borrower Dashboard JavaScript

class BorrowerManager {
    constructor() {
        this.loans = this.loadLoans();
        this.payments = this.loadPayments();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderMyLoans();
        this.updatePaymentHistory();
        this.setDefaultDate();
        this.updateUserInfo();
    }

    setupEventListeners() {
        // Calculator
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculateLoan();
        });

        // Payment filters
        document.getElementById('loanFilter').addEventListener('change', () => {
            this.updatePaymentHistory();
        });

        document.getElementById('monthFilter').addEventListener('change', () => {
            this.updatePaymentHistory();
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

        document.getElementById('monthlyPayment').textContent = `₹${monthlyPayment.toFixed(2)}`;
        document.getElementById('totalInterest').textContent = `₹${totalInterest.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `₹${totalAmount.toFixed(2)}`;

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

    updateDashboard() {
        const totalDebt = this.loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
        const monthlyPayments = this.loans
            .filter(loan => loan.status === 'active')
            .reduce((sum, loan) => sum + loan.monthlyPayment, 0);
        const activeLoans = this.loans.filter(loan => loan.status === 'active').length;
        const paidOffLoans = this.loans.filter(loan => loan.status === 'paid').length;

        document.getElementById('totalDebt').textContent = `₹${totalDebt.toLocaleString()}`;
        document.getElementById('monthlyPayments').textContent = `₹${monthlyPayments.toLocaleString()}`;
        document.getElementById('activeLoans').textContent = activeLoans;
        document.getElementById('paidOffLoans').textContent = paidOffLoans;

        this.renderMyLoans();
    }

    renderMyLoans() {
        const myLoansList = document.getElementById('myLoansList');
        const clearBtn = document.getElementById('clearLoansBtn');
        
        if (this.loans.length === 0) {
            myLoansList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-contract" style="font-size: 3rem; color: #a0aec0; margin-bottom: 20px;"></i>
                    <h3>No Loans Found</h3>
                    <p>You don't have any active loans. Browse available loans to apply for one.</p>
                    <a href="borrower-catalog.html" class="btn btn-primary">
                        <i class="fas fa-list"></i> Browse Available Loans
                    </a>
                </div>
            `;
            clearBtn.style.display = 'none';
            return;
        }

        clearBtn.style.display = 'block';
        myLoansList.innerHTML = this.loans.map(loan => `
            <div class="loan-item">
                <div class="loan-info">
                    <h4>${loan.loanName}</h4>
                    <p>${loan.interestRate}% • ${loan.term} months • ${loan.status}</p>
                    <p>Remaining: ₹${loan.remainingBalance.toLocaleString()}</p>
                </div>
                <div class="loan-amount">₹${loan.monthlyPayment.toFixed(2)}/month</div>
            </div>
        `).join('');
    }

    updatePaymentHistory() {
        const loanFilter = document.getElementById('loanFilter');
        const monthFilter = document.getElementById('monthFilter');
        
        // Update loan filter options
        const loanOptions = this.loans.map(loan => 
            `<option value="${loan.id}">${loan.loanName}</option>`
        ).join('');
        loanFilter.innerHTML = '<option value="all">All Loans</option>' + loanOptions;

        // Filter payments
        let filteredPayments = this.payments;
        
        if (loanFilter.value !== 'all') {
            filteredPayments = filteredPayments.filter(payment => payment.loanId === loanFilter.value);
        }
        
        if (monthFilter.value) {
            const filterDate = new Date(monthFilter.value);
            filteredPayments = filteredPayments.filter(payment => {
                const paymentDate = new Date(payment.date);
                return paymentDate.getMonth() === filterDate.getMonth() && 
                       paymentDate.getFullYear() === filterDate.getFullYear();
            });
        }

        this.renderPaymentTable(filteredPayments);
    }

    renderPaymentTable(payments) {
        const tbody = document.getElementById('paymentsTableBody');
        
        if (payments.length === 0) {
            tbody.innerHTML = '<tr class="no-data-row"><td colspan="5">No payments found</td></tr>';
            return;
        }

        tbody.innerHTML = payments.map(payment => {
            const loan = this.loans.find(l => l.id === payment.loanId);
            return `
                <tr>
                    <td>${new Date(payment.date).toLocaleDateString()}</td>
                    <td>${loan ? loan.loanName : 'Unknown Loan'}</td>
                    <td>₹${payment.amount.toFixed(2)}</td>
                    <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
                    <td>${payment.method}</td>
                </tr>
            `;
        }).join('');
    }

    openDebtSnowball() {
        const modal = document.getElementById('debtSnowballModal');
        modal.style.display = 'block';
        this.calculateDebtSnowball();
    }

    calculateDebtSnowball() {
        const activeLoans = this.loans.filter(loan => loan.status === 'active');
        
        if (activeLoans.length === 0) {
            document.getElementById('debtList').innerHTML = '<p class="no-data">No active loans to analyze</p>';
            return;
        }

        // Sort by balance (snowball method)
        const sortedLoans = activeLoans.sort((a, b) => a.remainingBalance - b.remainingBalance);
        
        const debtList = document.getElementById('debtList');
        debtList.innerHTML = sortedLoans.map((loan, index) => `
            <div class="debt-item">
                <h4>${loan.loanName}</h4>
                <p>Balance: ₹${loan.remainingBalance.toLocaleString()}</p>
                <p>Monthly Payment: ₹${loan.monthlyPayment.toFixed(2)}</p>
                <p>Priority: ${index + 1}</p>
            </div>
        `).join('');

        // Calculate payoff strategy
        const totalMonthlyPayments = activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
        const firstLoan = sortedLoans[0];
        const extraPayment = totalMonthlyPayments - firstLoan.monthlyPayment;
        
        document.getElementById('snowballResults').innerHTML = `
            <h4>Debt Snowball Strategy</h4>
            <p>1. Pay minimum on all loans except the first</p>
            <p>2. Put extra ₹${extraPayment.toFixed(2)}/month toward: ${firstLoan.loanName}</p>
            <p>3. Once paid off, roll that payment to the next loan</p>
        `;
    }

    viewPaymentSchedule() {
        alert('Payment schedule feature coming soon!');
    }

    openRefinancing() {
        alert('Refinancing calculator feature coming soon!');
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        // Set default date for any date inputs if needed
    }

    loadLoans() {
        const saved = localStorage.getItem('borrowerLoans');
        return saved ? JSON.parse(saved) : [];
    }

    clearAllLoans() {
        this.loans = [];
        this.saveLoans();
        this.updateDashboard();
        this.renderMyLoans();
    }

    loadPayments() {
        const saved = localStorage.getItem('borrowerPayments');
        return saved ? JSON.parse(saved) : [];
    }

    saveLoans() {
        localStorage.setItem('borrowerLoans', JSON.stringify(this.loans));
    }

    savePayments() {
        localStorage.setItem('borrowerPayments', JSON.stringify(this.payments));
    }
}

// Initialize the borrower manager
const borrowerManager = new BorrowerManager();

// Clear any existing sample data and ensure clean state
borrowerManager.clearAllLoans();
localStorage.removeItem('borrowerPayments');

// Global functions for HTML onclick handlers
function openDebtSnowball() {
    borrowerManager.openDebtSnowball();
}

function viewPaymentSchedule() {
    borrowerManager.viewPaymentSchedule();
}

function openRefinancing() {
    borrowerManager.openRefinancing();
}

function logout() {
    localStorage.removeItem('loanSystemSession');
    window.location.href = 'index.html';
}

function clearAllLoans() {
    if (confirm('Are you sure you want to remove all your loans? This action cannot be undone.')) {
        borrowerManager.clearAllLoans();
        alert('All loans have been removed from your account.');
    }
}
