import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ title, user, showBack = false, backUrl = '/' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1><i className="fas fa-calculator"></i> {title}</h1>
        <div className="header-actions">
          {showBack && (
            <button className="btn btn-secondary" onClick={() => navigate(backUrl)}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
          )}
          <span className="user-info">Welcome, {user?.username}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

