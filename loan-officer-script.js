// Loan Officer Dashboard JavaScript

class LoanOfficer {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.applications = this.loadApplications();
        this.tasks = this.loadTasks();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserInfo();
        this.updateDashboard();
        this.renderApplications();
        this.renderTasks();
    }

    setupEventListeners() {
        // Filters
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.renderApplications();
        });

        document.getElementById('priorityFilter').addEventListener('change', () => {
            this.renderApplications();
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
        const myApplications = this.applications.length;
        const approvedCount = this.applications.filter(app => app.status === 'approved').length;
        const pendingCount = this.applications.filter(app => app.status === 'pending').length;
        const approvalRate = myApplications > 0 ? Math.round((approvedCount / myApplications) * 100) : 0;

        document.getElementById('myApplications').textContent = myApplications;
        document.getElementById('approvedCount').textContent = approvedCount;
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('approvalRate').textContent = `${approvalRate}%`;
    }

    renderApplications() {
        const applicationsList = document.getElementById('applicationsList');
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        
        let filteredApplications = this.applications;
        
        if (statusFilter !== 'all') {
            filteredApplications = filteredApplications.filter(app => app.status === statusFilter);
        }
        
        if (priorityFilter !== 'all') {
            filteredApplications = filteredApplications.filter(app => app.priority === priorityFilter);
        }
        
        if (filteredApplications.length === 0) {
            applicationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: #a0aec0; margin-bottom: 20px;"></i>
                    <h3>No Applications Found</h3>
                    <p>You don't have any applications assigned to you yet.</p>
                </div>
            `;
            return;
        }

        applicationsList.innerHTML = filteredApplications.map(app => `
            <div class="application-card">
                <div class="application-header">
                    <div class="applicant-info">
                        <h3>${app.applicantName}</h3>
                        <p>${this.formatLoanType(app.loanType)} Application</p>
                    </div>
                    <div class="application-status">
                        <span class="status-badge status-${app.status}">${app.status}</span>
                        <span class="priority-badge priority-${app.priority}">${app.priority} Priority</span>
                    </div>
                </div>
                <div class="application-details">
                    <div class="detail-item">
                        <span class="detail-label">Loan Amount:</span>
                        <span class="detail-value">₹${parseInt(app.loanAmount).toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Applied Date:</span>
                        <span class="detail-value">${new Date(app.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Credit Score:</span>
                        <span class="detail-value">${app.creditScore || 'N/A'}</span>
                    </div>
                </div>
                <div class="application-actions">
                    <button class="btn btn-primary" onclick="loanOfficer.reviewApplication('${app.id}')">
                        <i class="fas fa-eye"></i> Review
                    </button>
                    <button class="btn btn-success" onclick="loanOfficer.approveApplication('${app.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger" onclick="loanOfficer.rejectApplication('${app.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderTasks() {
        const tasksList = document.querySelector('.tasks-list');
        
        if (this.tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks" style="font-size: 2rem; color: #a0aec0; margin-bottom: 15px;"></i>
                    <h3>No Tasks</h3>
                    <p>You don't have any pending tasks.</p>
                </div>
            `;
            return;
        }

        tasksList.innerHTML = this.tasks.map(task => `
            <div class="task-item">
                <div class="task-icon">
                    <i class="fas fa-${task.icon}"></i>
                </div>
                <div class="task-content">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                    <span class="task-due">Due: ${task.dueDate}</span>
                </div>
                <div class="task-actions">
                    <button class="btn btn-primary" onclick="loanOfficer.completeTask('${task.id}')">${task.actionText}</button>
                </div>
            </div>
        `).join('');
    }

    formatLoanType(type) {
        const typeNames = {
            'personal': 'Personal Loan',
            'home': 'Home Loan',
            'car': 'Car Loan',
            'education': 'Education Loan'
        };
        return typeNames[type] || type;
    }

    reviewApplication(appId) {
        const application = this.applications.find(app => app.id === appId);
        if (application) {
            alert(`Application Review:\nApplicant: ${application.applicantName}\nLoan Type: ${this.formatLoanType(application.loanType)}\nAmount: ₹${parseInt(application.loanAmount).toLocaleString()}\nStatus: ${application.status}\n\nPlease review all documents and make a decision.`);
        }
    }

    approveApplication(appId) {
        if (confirm('Are you sure you want to approve this application?')) {
            const index = this.applications.findIndex(app => app.id === appId);
            if (index !== -1) {
                this.applications[index].status = 'approved';
                this.saveApplications();
                this.updateDashboard();
                this.renderApplications();
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
                this.updateDashboard();
                this.renderApplications();
                alert('Application rejected.');
            }
        }
    }

    completeTask(taskId) {
        if (confirm('Mark this task as complete?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            alert('Task completed successfully!');
        }
    }

    loadApplications() {
        const saved = localStorage.getItem('loanApplications');
        return saved ? JSON.parse(saved) : this.getDefaultApplications();
    }

    loadTasks() {
        const saved = localStorage.getItem('loanOfficerTasks');
        return saved ? JSON.parse(saved) : this.getDefaultTasks();
    }

    getDefaultApplications() {
        return [
            {
                id: '1',
                applicantName: 'John Doe',
                loanType: 'personal',
                loanAmount: '250000',
                status: 'pending',
                priority: 'high',
                submittedAt: '2024-01-15T00:00:00.000Z',
                creditScore: 750
            },
            {
                id: '2',
                applicantName: 'Sarah Smith',
                loanType: 'home',
                loanAmount: '1500000',
                status: 'under_review',
                priority: 'medium',
                submittedAt: '2024-01-10T00:00:00.000Z',
                creditScore: 720
            }
        ];
    }

    getDefaultTasks() {
        return [
            {
                id: '1',
                title: 'Review Home Loan Application',
                description: 'Sarah Smith - ₹15,00,000',
                dueDate: 'Today',
                icon: 'file-alt',
                actionText: 'Start Review'
            },
            {
                id: '2',
                title: 'Follow up with Customer',
                description: 'Rajesh Kumar - Car Loan Inquiry',
                dueDate: 'Tomorrow',
                icon: 'phone',
                actionText: 'Mark Complete'
            }
        ];
    }

    saveApplications() {
        localStorage.setItem('loanApplications', JSON.stringify(this.applications));
    }

    saveTasks() {
        localStorage.setItem('loanOfficerTasks', JSON.stringify(this.tasks));
    }
}

// Initialize the loan officer
const loanOfficer = new LoanOfficer();

// Global functions for HTML onclick handlers
function logout() {
    localStorage.removeItem('loanSystemSession');
    window.location.href = 'index.html';
}


