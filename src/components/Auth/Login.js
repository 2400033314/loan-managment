import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EmailVerification from './EmailVerification';
import './Login.css';

const Login = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [emailValid, setEmailValid] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      icon: 'fas fa-user-shield',
      description: 'Oversee platform operations, manage user accounts, and ensure data security',
      features: [
        'User Management',
        'System Oversight',
        'Data Security',
        'Platform Administration'
      ]
    },
    {
      id: 'lender',
      name: 'Lender',
      icon: 'fas fa-university',
      description: 'Create loan offers, track payments, and manage borrower interactions',
      features: [
        'Loan Portfolio Management',
        'Payment Tracking',
        'Risk Analysis',
        'Financial Reports'
      ]
    },
    {
      id: 'borrower',
      name: 'Borrower',
      icon: 'fas fa-user',
      description: 'Apply for loans, track payment schedules, and manage loan details',
      features: [
        'Personal Loan Tracking',
        'Payment Calculator',
        'Debt Management',
        'Payment History'
      ]
    },
    {
      id: 'financial_analyst',
      name: 'Financial Analyst',
      icon: 'fas fa-chart-line',
      description: 'Analyze loan data, assess risks, and generate financial reports',
      features: [
        'Data Analysis',
        'Risk Assessment',
        'Financial Reports',
        'Trend Analysis'
      ]
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowLogin(true);
    setShowRegister(false);
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    
    // Validate email in real-time
    if (name === 'email') {
      setEmailValid(validateEmail(value) || value === '');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(formData.username, formData.password);
    if (result.success) {
      redirectToDashboard();
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setEmailValid(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Store registration data and show email verification
    setPendingRegistration({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: selectedRole
    });
    setShowEmailVerification(true);
  };

  const handleEmailVerified = async () => {
    if (!pendingRegistration) return;

    const result = await register(
      pendingRegistration.username,
      pendingRegistration.email,
      pendingRegistration.password,
      pendingRegistration.role
    );

    if (result.success) {
      setShowEmailVerification(false);
      setPendingRegistration(null);
      redirectToDashboard();
    } else {
      setError(result.error);
      setShowEmailVerification(false);
    }
  };

  const handleVerificationCancel = () => {
    setShowEmailVerification(false);
    setPendingRegistration(null);
  };

  const redirectToDashboard = () => {
    const role = selectedRole;
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'lender':
        navigate('/lender/dashboard');
        break;
      case 'borrower':
        navigate('/borrower/dashboard');
        break;
      case 'financial_analyst':
        navigate('/analyst/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const goBack = () => {
    setShowLogin(false);
    setShowRegister(false);
    setSelectedRole(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  if (!showLogin && !showRegister) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1><i className="fas fa-calculator"></i> Loan Management System</h1>
            <p>Choose your role to continue</p>
          </div>
          
          <div className="role-selection">
            {roles.map(role => (
              <div 
                key={role.id} 
                className="role-card" 
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="role-icon">
                  <i className={role.icon}></i>
                </div>
                <h3>{role.name}</h3>
                <p>{role.description}</p>
                <div className="role-features">
                  {role.features.map((feature, idx) => (
                    <span key={idx}>
                      <i className="fas fa-check"></i> {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {showLogin && (
          <div className="login-form">
            <h2>Login as {roles.find(r => r.id === selectedRole)?.name}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={goBack}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary">Login</button>
              </div>
            </form>
            <div className="login-footer">
              <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); setShowLogin(false); }}>Register here</a></p>
            </div>
          </div>
        )}

        {showRegister && (
          <div className="register-form">
            <h2>Register as {roles.find(r => r.id === selectedRole)?.name}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="regUsername">Username</label>
                <input
                  type="text"
                  id="regUsername"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Choose a username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="regEmail">Email *</label>
                <input
                  type="email"
                  id="regEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className={formData.email && !emailValid ? 'input-error' : ''}
                />
                {formData.email && !emailValid && (
                  <span className="error-text">
                    <i className="fas fa-exclamation-circle"></i> Please enter a valid email address
                  </span>
                )}
                {formData.email && emailValid && (
                  <span className="success-text">
                    <i className="fas fa-check-circle"></i> Valid email format
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="regPassword">Password</label>
                <input
                  type="password"
                  id="regPassword"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Choose a password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your password"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={goBack}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary">Register</button>
              </div>
            </form>
            <div className="login-footer">
              <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(true); setShowRegister(false); }}>Login here</a></p>
            </div>
          </div>
        )}

        {/* Email Verification Modal */}
        {showEmailVerification && pendingRegistration && (
          <EmailVerification
            email={pendingRegistration.email}
            onVerify={handleEmailVerified}
            onCancel={handleVerificationCancel}
          />
        )}
      </div>
    </div>
  );
};

export default Login;

