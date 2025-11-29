import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Common/Header';
import api from '../../services/api';
import './AnalystDashboard.css';

const AnalystDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [applicationStats, setApplicationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchApplicationStats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchApplicationStats = async () => {
    try {
      const response = await api.get('/analytics/applications');
      setApplicationStats(response.data);
    } catch (err) {
      console.error('Failed to load application stats:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Header title="Financial Analyst Dashboard" user={user} />
        <div className="loading-state">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Header title="Financial Analyst Dashboard" user={user} />
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header title="Financial Analyst Dashboard" user={user} />
      
      <main className="main-content">
        {/* Overview Statistics */}
        <div className="dashboard-grid">
          <div className="stats-card analyst-card">
            <div className="stats-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="stats-content">
              <h3>Total Applications</h3>
              <p className="stats-value">{dashboardData?.applications?.total || 0}</p>
            </div>
          </div>
          
          <div className="stats-card analyst-card">
            <div className="stats-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stats-content">
              <h3>Pending</h3>
              <p className="stats-value">{dashboardData?.applications?.pending || 0}</p>
            </div>
          </div>
          
          <div className="stats-card analyst-card">
            <div className="stats-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stats-content">
              <h3>Approved</h3>
              <p className="stats-value">{dashboardData?.applications?.approved || 0}</p>
            </div>
          </div>
          
          <div className="stats-card analyst-card">
            <div className="stats-icon">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="stats-content">
              <h3>Rejected</h3>
              <p className="stats-value">{dashboardData?.applications?.rejected || 0}</p>
            </div>
          </div>
        </div>

        {/* Loan Statistics */}
        <div className="dashboard-grid" style={{ marginTop: '30px' }}>
          <div className="stats-card analyst-card">
            <div className="stats-icon">
              <i className="fas fa-hand-holding-usd"></i>
            </div>
            <div className="stats-content">
              <h3>Total Loans</h3>
              <p className="stats-value">{dashboardData?.loans?.total || 0}</p>
            </div>
          </div>
          
          <div className="stats-card analyst-card">
            <div className="stats-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stats-content">
              <h3>Active Loans</h3>
              <p className="stats-value">{dashboardData?.loans?.active || 0}</p>
            </div>
          </div>
          
          <div className="stats-card analyst-card">
            <div className="stats-icon">
              <i className="fas fa-rupee-sign"></i>
            </div>
            <div className="stats-content">
              <h3>Total Loan Amount</h3>
              <p className="stats-value">₹{(dashboardData?.loans?.totalAmount || 0).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="stats-card analyst-card">
            <div className="stats-icon">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <div className="stats-content">
              <h3>Total Payments</h3>
              <p className="stats-value">₹{(dashboardData?.payments?.totalAmount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Application Statistics by Status */}
        {applicationStats && (
          <div className="analyst-section">
            <h2><i className="fas fa-chart-pie"></i> Application Statistics</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>By Status</h3>
                <div className="stat-details">
                  {Object.entries(applicationStats.byStatus || {}).map(([status, count]) => (
                    <div key={status} className="stat-item">
                      <span className="stat-label">{status.charAt(0).toUpperCase() + status.slice(1)}:</span>
                      <span className="stat-value">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-card">
                <h3>By Loan Type</h3>
                <div className="stat-details">
                  {Object.entries(applicationStats.byLoanType || {}).map(([type, count]) => (
                    <div key={type} className="stat-item">
                      <span className="stat-label">{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
                      <span className="stat-value">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-card">
                <h3>By Month</h3>
                <div className="stat-details monthly-stats">
                  {Object.entries(applicationStats.byMonth || {})
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .slice(0, 6)
                    .map(([month, count]) => (
                      <div key={month} className="stat-item">
                        <span className="stat-label">{new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}:</span>
                        <span className="stat-value">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Analysis Section */}
        <div className="analyst-section">
          <h2><i className="fas fa-exclamation-triangle"></i> Risk Analysis</h2>
          <div className="risk-grid">
            <div className="risk-card">
              <h3>Portfolio Risk Level</h3>
              <div className="risk-meter">
                <div className="risk-level">Medium</div>
                <div className="risk-bar">
                  <div className="risk-fill" style={{ width: '60%' }}></div>
                </div>
                <p className="risk-description">
                  Current portfolio shows moderate risk levels. Monitor pending applications closely.
                </p>
              </div>
            </div>

            <div className="risk-card">
              <h3>Approval Rate</h3>
              <div className="approval-rate">
                <div className="rate-value">
                  {dashboardData?.applications?.total > 0
                    ? ((dashboardData.applications.approved / dashboardData.applications.total) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="rate-description">
                  {dashboardData?.applications?.approved || 0} approved out of {dashboardData?.applications?.total || 0} total applications
                </p>
              </div>
            </div>

            <div className="risk-card">
              <h3>Rejection Rate</h3>
              <div className="rejection-rate">
                <div className="rate-value">
                  {dashboardData?.applications?.total > 0
                    ? ((dashboardData.applications.rejected / dashboardData.applications.total) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="rate-description">
                  {dashboardData?.applications?.rejected || 0} rejected out of {dashboardData?.applications?.total || 0} total applications
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="analyst-section">
          <h2><i className="fas fa-calculator"></i> Financial Summary</h2>
          <div className="financial-summary">
            <div className="summary-card">
              <h3>Total Portfolio Value</h3>
              <p className="summary-value">₹{(dashboardData?.loans?.totalAmount || 0).toLocaleString()}</p>
              <p className="summary-label">Sum of all active loans</p>
            </div>
            
            <div className="summary-card">
              <h3>Total Payments Received</h3>
              <p className="summary-value">₹{(dashboardData?.payments?.totalAmount || 0).toLocaleString()}</p>
              <p className="summary-label">Cumulative payment amount</p>
            </div>
            
            <div className="summary-card">
              <h3>Outstanding Balance</h3>
              <p className="summary-value">
                ₹{((dashboardData?.loans?.totalAmount || 0) - (dashboardData?.payments?.totalAmount || 0)).toLocaleString()}
              </p>
              <p className="summary-label">Remaining loan balance</p>
            </div>
            
            <div className="summary-card">
              <h3>Payment Collection Rate</h3>
              <p className="summary-value">
                {dashboardData?.loans?.totalAmount > 0
                  ? (((dashboardData.payments.totalAmount / dashboardData.loans.totalAmount) * 100) || 0).toFixed(1)
                  : 0}%
              </p>
              <p className="summary-label">Percentage of loans paid</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="analyst-section">
          <h2><i className="fas fa-lightbulb"></i> Recommendations</h2>
          <div className="recommendations-list">
            <div className="recommendation-item">
              <i className="fas fa-check-circle"></i>
              <div>
                <h4>Monitor Pending Applications</h4>
                <p>You have {dashboardData?.applications?.pending || 0} pending applications requiring review.</p>
              </div>
            </div>
            
            <div className="recommendation-item">
              <i className="fas fa-chart-line"></i>
              <div>
                <h4>Track Payment Trends</h4>
                <p>Analyze payment patterns to identify potential default risks early.</p>
              </div>
            </div>
            
            <div className="recommendation-item">
              <i className="fas fa-balance-scale"></i>
              <div>
                <h4>Review Loan Distribution</h4>
                <p>Ensure loan portfolio is well-diversified across different loan types.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalystDashboard;

