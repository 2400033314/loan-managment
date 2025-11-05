// Borrower Loan Catalog JavaScript

class CatalogManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.currentLoanType = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserInfo();
        this.setupFilters();
    }

    setupEventListeners() {
        // EMI Calculator Modal
        const modal = document.getElementById('emiModal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => this.closeEMIModal());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeEMIModal();
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

    setupFilters() {
        document.getElementById('loanTypeFilter').addEventListener('change', () => {
            this.filterLoans();
        });

        document.getElementById('amountFilter').addEventListener('change', () => {
            this.filterLoans();
        });
    }

    filterLoans() {
        const typeFilter = document.getElementById('loanTypeFilter').value;
        const amountFilter = document.getElementById('amountFilter').value;
        const loanCards = document.querySelectorAll('.loan-card');

        loanCards.forEach(card => {
            const cardType = card.dataset.type;
            let showCard = true;

            // Filter by type
            if (typeFilter !== 'all' && cardType !== typeFilter) {
                showCard = false;
            }

            // Filter by amount (simplified for demo)
            if (amountFilter !== 'all') {
                // This would need more sophisticated logic in a real implementation
                // For now, we'll just show all cards
            }

            card.style.display = showCard ? 'block' : 'none';
        });
    }

    openEMIModal(loanType) {
        this.currentLoanType = loanType;
        const modal = document.getElementById('emiModal');
        const modalTitle = document.getElementById('emiModalTitle');
        
        const loanNames = {
            'personal': 'Personal Loan',
            'home': 'Home Loan',
            'car': 'Car Loan',
            'education': 'Education Loan'
        };

        modalTitle.textContent = `${loanNames[loanType]} EMI Calculator`;
        
        // Set default values based on loan type
        const defaultRates = {
            'personal': 12.5,
            'home': 8.5,
            'car': 9.5,
            'education': 10.5
        };

        document.getElementById('emiRate').value = defaultRates[loanType];
        document.getElementById('emiAmount').value = '';
        document.getElementById('emiTenure').value = '';
        document.getElementById('emiResults').style.display = 'none';
        
        modal.style.display = 'block';
    }

    closeEMIModal() {
        document.getElementById('emiModal').style.display = 'none';
        this.currentLoanType = null;
    }

    calculateEMIResult() {
        const amount = parseFloat(document.getElementById('emiAmount').value);
        const rate = parseFloat(document.getElementById('emiRate').value);
        const tenure = parseInt(document.getElementById('emiTenure').value);

        if (!amount || !rate || !tenure) {
            alert('Please fill in all fields');
            return;
        }

        const monthlyRate = rate / 100 / 12;
        const emi = this.calculateEMI(amount, rate, tenure);
        const totalAmount = emi * tenure;
        const totalInterest = totalAmount - amount;

        document.getElementById('monthlyEMI').textContent = `₹${emi.toFixed(2)}`;
        document.getElementById('totalInterestEMI').textContent = `₹${totalInterest.toFixed(2)}`;
        document.getElementById('totalAmountEMI').textContent = `₹${totalAmount.toFixed(2)}`;
        
        document.getElementById('emiResults').style.display = 'block';
    }

    calculateEMI(principal, annualRate, termMonths) {
        const monthlyRate = annualRate / 100 / 12;
        if (monthlyRate === 0) {
            return principal / termMonths;
        }
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
               (Math.pow(1 + monthlyRate, termMonths) - 1);
    }

    applyForLoan(loanType) {
        // Store the selected loan type and redirect to application page
        localStorage.setItem('selectedLoanType', loanType);
        window.location.href = 'borrower-application.html';
    }
}

// Initialize the catalog manager
const catalogManager = new CatalogManager();

// Global functions for HTML onclick handlers
function applyForLoan(loanType) {
    catalogManager.applyForLoan(loanType);
}

function calculateEMI(loanType) {
    catalogManager.openEMIModal(loanType);
}

function calculateEMIResult() {
    catalogManager.calculateEMIResult();
}

function logout() {
    localStorage.removeItem('loanSystemSession');
    window.location.href = 'index.html';
}

