import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext';
import Header from '../Common/Header';
import api from '../../services/api';

const BorrowerDashboard = () => {
  const { user } = useAuth();
  const { applications } = useApplications();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalDebt: 0,
    monthlyPayments: 0,
    activeLoans: 0,
    paidOffLoans: 0
  });

  useEffect(() => {
    fetchLoans();
    fetchPayments();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [loans]);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      setLoans(response.data);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const calculateStats = () => {
    const totalDebt = loans.reduce((sum, loan) => sum + (parseFloat(loan.remainingBalance) || 0), 0);
    const monthlyPayments = loans
      .filter(loan => loan.status === 'active')
      .reduce((sum, loan) => sum + (parseFloat(loan.monthlyPayment) || 0), 0);
    const activeLoans = loans.filter(loan => loan.status === 'active').length;
    const paidOffLoans = loans.filter(loan => loan.status === 'paid').length;

    setStats({ totalDebt, monthlyPayments, activeLoans, paidOffLoans });
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');

  return (
    <div className="container">
      <Header title="My Loans Dashboard" user={user} />
      
      <main className="main-content">
        <div className="dashboard-grid">
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-rupee-sign"></i>
            </div>
            <div className="stats-content">
              <h3>Total Debt</h3>
              <p className="stats-value">₹{stats.totalDebt.toLocaleString()}</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="stats-content">
              <h3>Monthly Payments</h3>
              <p className="stats-value">₹{stats.monthlyPayments.toLocaleString()}</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stats-content">
              <h3>Loans Active</h3>
              <p className="stats-value">{stats.activeLoans}</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stats-content">
              <h3>Paid Off</h3>
              <p className="stats-value">{stats.paidOffLoans}</p>
            </div>
          </div>
        </div>

        <div className="recent-loans">
          <div className="section-header">
            <h2>My Applications</h2>
            <Link to="/borrower/catalog" className="btn btn-primary">
              <i className="fas fa-plus"></i> New Application
            </Link>
          </div>
          
          {applications.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-file-contract" style={{fontSize: '3rem', color: '#a0aec0', marginBottom: '20px'}}></i>
              <h3>No Applications Found</h3>
              <p>You don't have any loan applications. Browse available loans to apply for one.</p>
              <Link to="/borrower/catalog" className="btn btn-primary">
                <i className="fas fa-list"></i> Browse Available Loans
              </Link>
            </div>
          ) : (
            <div className="loans-list">
              {applications.map(app => (
                <div key={app.id} className="loan-item">
                  <div className="loan-info">
                    <h4>{app.loanType ? app.loanType.charAt(0).toUpperCase() + app.loanType.slice(1) : 'Loan'} Application</h4>
                    <p>Amount: ₹{parseFloat(app.loanAmount || 0).toLocaleString()} • Status: <span className={`status-badge status-${app.status}`}>{app.status}</span></p>
                    <p>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="loan-actions">
                    {app.status === 'pending' && (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(`/borrower/application/${app.id}/edit`)}
                      >
                        <i className="fas fa-edit"></i> Update
                      </button>
                    )}
                    <button 
                      className="btn btn-secondary"
                      onClick={() => navigate(`/borrower/application/${app.id}`)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BorrowerDashboard;

