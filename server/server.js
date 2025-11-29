const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage (replace with database in production)
let users = [];
let applications = [];
let loans = [];
let payments = [];

// Initialize sample data
const initializeData = () => {
  // Sample users
  const hashedPassword = bcrypt.hashSync('password123', 10);
  users = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      username: 'lender1',
      email: 'lender@example.com',
      password: hashedPassword,
      role: 'lender',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      username: 'borrower1',
      email: 'borrower@example.com',
      password: hashedPassword,
      role: 'borrower',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      username: 'analyst1',
      email: 'analyst@example.com',
      password: hashedPassword,
      role: 'financial_analyst',
      createdAt: new Date().toISOString()
    }
  ];
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Initialize data on server start
initializeData();

// ==================== AUTHENTICATION ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  });
});

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users (Admin only)
app.get('/api/users', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const userList = users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
  res.json(userList);
});

// Get user by ID
app.get('/api/users/:id', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Users can only view their own profile unless they're admin
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  });
});

// Update user (Admin or self)
app.put('/api/users/:id', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Users can only update their own profile unless they're admin
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { username, email } = req.body;
  if (username) user.username = username;
  if (email) user.email = email;

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  });
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.splice(index, 1);
  res.json({ message: 'User deleted successfully' });
});

// ==================== APPLICATION ROUTES ====================

// Create application (Borrower only)
app.post('/api/applications', authenticateToken, authorizeRoles('borrower'), (req, res) => {
  try {
    const application = {
      id: uuidv4(),
      ...req.body,
      borrowerId: req.user.id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    applications.push(application);
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all applications
app.get('/api/applications', authenticateToken, (req, res) => {
  let filteredApplications = applications;

  // Borrowers can only see their own applications
  if (req.user.role === 'borrower') {
    filteredApplications = applications.filter(a => a.borrowerId === req.user.id);
  }

  res.json(filteredApplications);
});

// Get application by ID
app.get('/api/applications/:id', authenticateToken, (req, res) => {
  const application = applications.find(a => a.id === req.params.id);
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Borrowers can only view their own applications
  if (req.user.role === 'borrower' && application.borrowerId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(application);
});

// Update application
app.put('/api/applications/:id', authenticateToken, (req, res) => {
  const application = applications.find(a => a.id === req.params.id);
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Borrowers can only update their own pending applications
  if (req.user.role === 'borrower') {
    if (application.borrowerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Can only update pending applications' });
    }
  }

  // Update application fields
  Object.keys(req.body).forEach(key => {
    if (key !== 'id' && key !== 'borrowerId' && key !== 'submittedAt') {
      application[key] = req.body[key];
    }
  });

  application.updatedAt = new Date().toISOString();

  res.json(application);
});

// Delete application
app.delete('/api/applications/:id', authenticateToken, (req, res) => {
  const index = applications.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const application = applications[index];

  // Borrowers can only delete their own pending applications
  if (req.user.role === 'borrower') {
    if (application.borrowerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending applications' });
    }
  }

  applications.splice(index, 1);
  res.json({ message: 'Application deleted successfully' });
});

// Update application status (Lender, Loan Officer, Admin only)
app.patch('/api/applications/:id/status', authenticateToken, authorizeRoles('lender', 'loan_officer', 'admin'), (req, res) => {
  const application = applications.find(a => a.id === req.params.id);
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const { status } = req.body;
  if (!['pending', 'approved', 'rejected', 'under_review'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  application.status = status;
  application.updatedAt = new Date().toISOString();

  res.json(application);
});

// ==================== LOAN ROUTES ====================

// Create loan (Lender, Admin only)
app.post('/api/loans', authenticateToken, authorizeRoles('lender', 'admin'), (req, res) => {
  try {
    const loan = {
      id: uuidv4(),
      ...req.body,
      lenderId: req.user.role === 'lender' ? req.user.id : req.body.lenderId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    loans.push(loan);
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all loans
app.get('/api/loans', authenticateToken, (req, res) => {
  let filteredLoans = loans;

  // Borrowers see loans they're associated with
  if (req.user.role === 'borrower') {
    filteredLoans = loans.filter(l => l.borrowerId === req.user.id);
  }
  // Lenders see their own loans
  else if (req.user.role === 'lender') {
    filteredLoans = loans.filter(l => l.lenderId === req.user.id);
  }

  res.json(filteredLoans);
});

// Get loan by ID
app.get('/api/loans/:id', authenticateToken, (req, res) => {
  const loan = loans.find(l => l.id === req.params.id);
  if (!loan) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  // Check access
  if (req.user.role === 'borrower' && loan.borrowerId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  if (req.user.role === 'lender' && loan.lenderId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(loan);
});

// Update loan
app.put('/api/loans/:id', authenticateToken, (req, res) => {
  const loan = loans.find(l => l.id === req.params.id);
  if (!loan) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  // Check permissions
  if (req.user.role === 'lender' && loan.lenderId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  Object.keys(req.body).forEach(key => {
    if (key !== 'id' && key !== 'createdAt') {
      loan[key] = req.body[key];
    }
  });

  loan.updatedAt = new Date().toISOString();
  res.json(loan);
});

// Delete loan
app.delete('/api/loans/:id', authenticateToken, authorizeRoles('lender', 'admin'), (req, res) => {
  const index = loans.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  const loan = loans[index];
  if (req.user.role === 'lender' && loan.lenderId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  loans.splice(index, 1);
  res.json({ message: 'Loan deleted successfully' });
});

// ==================== PAYMENT ROUTES ====================

// Create payment
app.post('/api/payments', authenticateToken, (req, res) => {
  try {
    const payment = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };

    payments.push(payment);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payments
app.get('/api/payments', authenticateToken, (req, res) => {
  let filteredPayments = payments;

  if (req.user.role === 'borrower') {
    // Get borrower's loans
    const borrowerLoans = loans.filter(l => l.borrowerId === req.user.id).map(l => l.id);
    filteredPayments = payments.filter(p => borrowerLoans.includes(p.loanId));
  } else if (req.user.role === 'lender') {
    // Get lender's loans
    const lenderLoans = loans.filter(l => l.lenderId === req.user.id).map(l => l.id);
    filteredPayments = payments.filter(p => lenderLoans.includes(p.loanId));
  }

  res.json(filteredPayments);
});

// ==================== ANALYTICS ROUTES (Financial Analyst) ====================

// Get analytics dashboard data
app.get('/api/analytics/dashboard', authenticateToken, authorizeRoles('financial_analyst', 'admin'), (req, res) => {
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const approvedApplications = applications.filter(a => a.status === 'approved').length;
  const rejectedApplications = applications.filter(a => a.status === 'rejected').length;

  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => l.status === 'active').length;
  const totalLoanAmount = loans.reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0);

  const totalPayments = payments.length;
  const totalPaymentAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  res.json({
    applications: {
      total: totalApplications,
      pending: pendingApplications,
      approved: approvedApplications,
      rejected: rejectedApplications
    },
    loans: {
      total: totalLoans,
      active: activeLoans,
      totalAmount: totalLoanAmount
    },
    payments: {
      total: totalPayments,
      totalAmount: totalPaymentAmount
    }
  });
});

// Get application statistics
app.get('/api/analytics/applications', authenticateToken, authorizeRoles('financial_analyst', 'admin'), (req, res) => {
  const stats = {
    byStatus: {},
    byLoanType: {},
    byMonth: {}
  };

  applications.forEach(app => {
    // By status
    stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;

    // By loan type
    const loanType = app.loanType || 'unknown';
    stats.byLoanType[loanType] = (stats.byLoanType[loanType] || 0) + 1;

    // By month
    const month = new Date(app.submittedAt).toISOString().substring(0, 7);
    stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
  });

  res.json(stats);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

