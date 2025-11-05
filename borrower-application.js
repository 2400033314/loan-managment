// Borrower Loan Application JavaScript

class ApplicationManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.selectedLoanType = this.getSelectedLoanType();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserInfo();
        this.setupLoanTypeInfo();
        this.loadDraft();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('loanApplicationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitApplication();
        });

        // Modal controls
        const termsModal = document.getElementById('termsModal');
        const privacyModal = document.getElementById('privacyModal');
        
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === termsModal) termsModal.style.display = 'none';
            if (e.target === privacyModal) privacyModal.style.display = 'none';
        });

        // Auto-save on input change
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', () => {
                this.saveDraft();
            });
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

    getSelectedLoanType() {
        return localStorage.getItem('selectedLoanType') || 'personal';
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userInfo').textContent = `Welcome, ${this.currentUser.username}`;
        }
    }

    setupLoanTypeInfo() {
        const loanTypes = {
            'personal': {
                name: 'Personal Loan',
                rate: '12.5%',
                minAmount: '₹50,000',
                maxAmount: '₹5,00,000',
                tenure: '12-60 months'
            },
            'home': {
                name: 'Home Loan',
                rate: '8.5%',
                minAmount: '₹5,00,000',
                maxAmount: '₹1,00,00,000',
                tenure: '60-300 months'
            },
            'car': {
                name: 'Car Loan',
                rate: '9.5%',
                minAmount: '₹1,00,000',
                maxAmount: '₹50,00,000',
                tenure: '12-84 months'
            },
            'education': {
                name: 'Education Loan',
                rate: '10.5%',
                minAmount: '₹50,000',
                maxAmount: '₹20,00,000',
                tenure: '60-180 months'
            }
        };

        const loanInfo = loanTypes[this.selectedLoanType];
        document.getElementById('applicationTitle').textContent = `${loanInfo.name} Application`;
        
        document.getElementById('loanTypeInfo').innerHTML = `
            <div class="loan-info-card">
                <h4>${loanInfo.name} Details</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Interest Rate:</span>
                        <span class="info-value">${loanInfo.rate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Amount Range:</span>
                        <span class="info-value">${loanInfo.minAmount} - ${loanInfo.maxAmount}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tenure:</span>
                        <span class="info-value">${loanInfo.tenure}</span>
                    </div>
                </div>
            </div>
        `;
    }

    saveDraft() {
        const formData = this.getFormData();
        localStorage.setItem('loanApplicationDraft', JSON.stringify(formData));
    }

    loadDraft() {
        const draft = localStorage.getItem('loanApplicationDraft');
        if (draft) {
            const formData = JSON.parse(draft);
            this.populateForm(formData);
        }
    }

    getFormData() {
        return {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            panNumber: document.getElementById('panNumber').value,
            loanAmount: document.getElementById('loanAmount').value,
            loanTenure: document.getElementById('loanTenure').value,
            purpose: document.getElementById('purpose').value,
            employmentType: document.getElementById('employmentType').value,
            monthlyIncome: document.getElementById('monthlyIncome').value,
            existingEMI: document.getElementById('existingEMI').value,
            companyName: document.getElementById('companyName').value,
            workExperience: document.getElementById('workExperience').value,
            currentAddress: document.getElementById('currentAddress').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value,
            termsAccepted: document.getElementById('termsAccepted').checked,
            privacyAccepted: document.getElementById('privacyAccepted').checked
        };
    }

    populateForm(formData) {
        Object.keys(formData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = formData[key];
                } else {
                    element.value = formData[key];
                }
            }
        });
    }

    submitApplication() {
        const formData = this.getFormData();
        
        // Validate required fields
        if (!this.validateForm(formData)) {
            return;
        }

        // Create application
        const application = {
            id: Date.now().toString(),
            loanType: this.selectedLoanType,
            ...formData,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            borrowerId: this.currentUser.id
        };

        // Save application
        this.saveApplication(application);
        
        // Clear draft
        localStorage.removeItem('loanApplicationDraft');
        
        // Show success message
        alert('Application submitted successfully! You will receive a confirmation email shortly.');
        
        // Redirect to dashboard
        window.location.href = 'borrower-dashboard.html';
    }

    validateForm(formData) {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'panNumber',
            'loanAmount', 'loanTenure', 'purpose', 'employmentType', 'monthlyIncome',
            'currentAddress', 'city', 'state', 'pincode'
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }

        if (!formData.termsAccepted || !formData.privacyAccepted) {
            alert('Please accept the terms and conditions and privacy policy');
            return false;
        }

        // Validate PAN format
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(formData.panNumber)) {
            alert('Please enter a valid PAN number');
            return false;
        }

        // Validate pincode
        const pincodeRegex = /^[0-9]{6}$/;
        if (!pincodeRegex.test(formData.pincode)) {
            alert('Please enter a valid 6-digit pincode');
            return false;
        }

        return true;
    }

    saveApplication(application) {
        const applications = this.getApplications();
        applications.push(application);
        localStorage.setItem('loanApplications', JSON.stringify(applications));
    }

    getApplications() {
        const saved = localStorage.getItem('loanApplications');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize the application manager
const applicationManager = new ApplicationManager();

// Global functions for HTML onclick handlers
function saveDraft() {
    applicationManager.saveDraft();
    alert('Draft saved successfully!');
}

function showTerms() {
    document.getElementById('termsModal').style.display = 'block';
}

function showPrivacy() {
    document.getElementById('privacyModal').style.display = 'block';
}

function logout() {
    localStorage.removeItem('loanSystemSession');
    window.location.href = 'index.html';
}


