// Lender Interest Rate Management JavaScript

class RateManager {
    constructor() {
        this.rates = this.loadRates();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserInfo();
        this.renderRates();
    }

    setupEventListeners() {
        // Modal
        const modal = document.getElementById('rateModal');
        const addRateBtn = document.getElementById('addRateBtn');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelRateBtn');

        addRateBtn.addEventListener('click', () => this.openModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Form submission
        document.getElementById('rateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRate();
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

    openModal(rateType = null) {
        this.currentRateType = rateType;
        const modal = document.getElementById('rateModal');
        const modalTitle = document.getElementById('rateModalTitle');
        const form = document.getElementById('rateForm');

        if (rateType) {
            const rate = this.rates.find(r => r.type === rateType);
            modalTitle.textContent = `Edit ${rate.name} Rate`;
            document.getElementById('loanType').value = rateType;
            document.getElementById('interestRate').value = rate.rate;
            document.getElementById('minAmount').value = rate.minAmount;
            document.getElementById('maxAmount').value = rate.maxAmount;
            document.getElementById('minTenure').value = rate.minTenure;
            document.getElementById('maxTenure').value = rate.maxTenure;
        } else {
            modalTitle.textContent = 'Add New Rate';
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('rateModal').style.display = 'none';
        this.currentRateType = null;
    }

    saveRate() {
        const formData = {
            type: document.getElementById('loanType').value,
            rate: parseFloat(document.getElementById('interestRate').value),
            minAmount: parseInt(document.getElementById('minAmount').value),
            maxAmount: parseInt(document.getElementById('maxAmount').value),
            minTenure: parseInt(document.getElementById('minTenure').value),
            maxTenure: parseInt(document.getElementById('maxTenure').value)
        };

        const rateNames = {
            'personal': 'Personal Loans',
            'home': 'Home Loans',
            'car': 'Car Loans',
            'education': 'Education Loans'
        };

        if (this.currentRateType) {
            // Update existing rate
            const index = this.rates.findIndex(r => r.type === this.currentRateType);
            this.rates[index] = { ...this.rates[index], ...formData };
        } else {
            // Add new rate
            const newRate = {
                id: Date.now().toString(),
                name: rateNames[formData.type],
                ...formData,
                createdAt: new Date().toISOString(),
                lenderId: this.currentUser.id
            };
            this.rates.push(newRate);
        }

        this.saveRates();
        this.closeModal();
        this.renderRates();
        this.addToHistory(formData);
    }

    addToHistory(rateData) {
        const history = this.loadHistory();
        const historyEntry = {
            id: Date.now().toString(),
            loanType: rateData.type,
            newRate: rateData.rate,
            changeDate: new Date().toISOString(),
            changedBy: this.currentUser.username
        };
        
        history.unshift(historyEntry);
        localStorage.setItem('rateHistory', JSON.stringify(history));
        this.renderHistory();
    }

    renderRates() {
        const rateTypes = ['personal', 'home', 'car', 'education'];
        
        rateTypes.forEach(type => {
            const rate = this.rates.find(r => r.type === type);
            if (rate) {
                document.getElementById(`${type}Rate`).textContent = `${rate.rate}%`;
            }
        });
    }

    renderHistory() {
        const history = this.loadHistory();
        const tbody = document.getElementById('rateHistoryBody');
        
        if (history.length === 0) {
            tbody.innerHTML = '<tr class="no-data-row"><td colspan="5">No rate changes found</td></tr>';
            return;
        }

        tbody.innerHTML = history.map(entry => `
            <tr>
                <td>${entry.loanType}</td>
                <td>${entry.previousRate || 'N/A'}%</td>
                <td>${entry.newRate}%</td>
                <td>${new Date(entry.changeDate).toLocaleDateString()}</td>
                <td>${entry.changedBy}</td>
            </tr>
        `).join('');
    }

    loadRates() {
        const saved = localStorage.getItem('lenderRates');
        return saved ? JSON.parse(saved) : this.getDefaultRates();
    }

    getDefaultRates() {
        return [
            {
                id: '1',
                type: 'personal',
                name: 'Personal Loans',
                rate: 12.5,
                minAmount: 50000,
                maxAmount: 500000,
                minTenure: 12,
                maxTenure: 60,
                createdAt: new Date().toISOString(),
                lenderId: this.currentUser?.id || '1'
            },
            {
                id: '2',
                type: 'home',
                name: 'Home Loans',
                rate: 8.5,
                minAmount: 500000,
                maxAmount: 10000000,
                minTenure: 60,
                maxTenure: 300,
                createdAt: new Date().toISOString(),
                lenderId: this.currentUser?.id || '1'
            },
            {
                id: '3',
                type: 'car',
                name: 'Car Loans',
                rate: 9.5,
                minAmount: 100000,
                maxAmount: 5000000,
                minTenure: 12,
                maxTenure: 84,
                createdAt: new Date().toISOString(),
                lenderId: this.currentUser?.id || '1'
            },
            {
                id: '4',
                type: 'education',
                name: 'Education Loans',
                rate: 10.5,
                minAmount: 50000,
                maxAmount: 2000000,
                minTenure: 60,
                maxTenure: 180,
                createdAt: new Date().toISOString(),
                lenderId: this.currentUser?.id || '1'
            }
        ];
    }

    loadHistory() {
        const saved = localStorage.getItem('rateHistory');
        return saved ? JSON.parse(saved) : [];
    }

    saveRates() {
        localStorage.setItem('lenderRates', JSON.stringify(this.rates));
    }
}

// Initialize the rate manager
const rateManager = new RateManager();

// Global functions for HTML onclick handlers
function editRate(rateType) {
    rateManager.openModal(rateType);
}

function logout() {
    localStorage.removeItem('loanSystemSession');
    window.location.href = 'index.html';
}

