import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Common/Header';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, applicationsRes] = await Promise.all([
        api.get('/users'),
        api.get('/applications')
      ]);
      
      setUsers(usersRes.data);
      setApplications(applicationsRes.data);
      
      setStats({
        totalUsers: usersRes.data.length,
        totalApplications: applicationsRes.data.length,
        pendingApplications: applicationsRes.data.filter(app => app.status === 'pending').length
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Header title="Admin Dashboard" user={user} />
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header title="Admin Dashboard" user={user} />
      
      <main className="main-content">
        {error && <div className="error-message">{error}</div>}

        {/* Statistics */}
        <div className="dashboard-grid">
          <div className="stats-card admin-card">
            <div className="stats-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stats-content">
              <h3>Total Users</h3>
              <p className="stats-value">{stats.totalUsers}</p>
            </div>
          </div>
          
          <div className="stats-card admin-card">
            <div className="stats-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="stats-content">
              <h3>Total Applications</h3>
              <p className="stats-value">{stats.totalApplications}</p>
            </div>
          </div>
          
          <div className="stats-card admin-card">
            <div className="stats-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stats-content">
              <h3>Pending Applications</h3>
              <p className="stats-value">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>

        {/* Users Management */}
        <div className="admin-section">
          <div className="section-header">
            <h2><i className="fas fa-users"></i> User Management</h2>
          </div>
          
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">No users found</td>
                  </tr>
                ) : (
                  users.map(userItem => (
                    <tr key={userItem.id}>
                      <td>{userItem.username}</td>
                      <td>{userItem.email}</td>
                      <td>
                        <span className={`role-badge role-${userItem.role}`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(userItem.id)}
                          disabled={userItem.id === user.id}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Applications Overview */}
        <div className="admin-section">
          <div className="section-header">
            <h2><i className="fas fa-file-alt"></i> Applications Overview</h2>
          </div>
          
          <div className="applications-grid">
            {applications.slice(0, 10).map(app => (
              <div key={app.id} className="application-card">
                <div className="application-header">
                  <h4>{app.firstName} {app.lastName}</h4>
                  <span className={`status-badge status-${app.status}`}>
                    {app.status}
                  </span>
                </div>
                <div className="application-details">
                  <p><strong>Loan Type:</strong> {app.loanType || 'N/A'}</p>
                  <p><strong>Amount:</strong> ₹{parseFloat(app.loanAmount || 0).toLocaleString()}</p>
                  <p><strong>Submitted:</strong> {new Date(app.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

