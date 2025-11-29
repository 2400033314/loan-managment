import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Common/Header';

const BorrowerCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const loanTypes = [
    {
      id: 'personal',
      name: 'Personal Loan',
      icon: 'fas fa-wallet',
      rate: '12.5%',
      minAmount: '₹50,000',
      maxAmount: '₹5,00,000',
      tenure: '12-60 months',
      features: [
        'Quick approval',
        'Flexible repayment',
        'No collateral required',
        'Competitive interest rates'
      ]
    },
    {
      id: 'home',
      name: 'Home Loan',
      icon: 'fas fa-home',
      rate: '8.5%',
      minAmount: '₹5,00,000',
      maxAmount: '₹1,00,00,000',
      tenure: '60-300 months',
      features: [
        'Long repayment tenure',
        'Tax benefits',
        'Low interest rates',
        'Flexible EMI options'
      ]
    },
    {
      id: 'car',
      name: 'Car Loan',
      icon: 'fas fa-car',
      rate: '9.5%',
      minAmount: '₹1,00,000',
      maxAmount: '₹50,00,000',
      tenure: '12-84 months',
      features: [
        'Fast processing',
        'Competitive rates',
        'Flexible tenure',
        'Minimal documentation'
      ]
    },
    {
      id: 'education',
      name: 'Education Loan',
      icon: 'fas fa-graduation-cap',
      rate: '10.5%',
      minAmount: '₹50,000',
      maxAmount: '₹20,00,000',
      tenure: '60-180 months',
      features: [
        'Study abroad options',
        'Moratorium period',
        'Tax benefits',
        'No collateral for small amounts'
      ]
    }
  ];

  const handleApply = (loanType) => {
    localStorage.setItem('selectedLoanType', loanType);
    navigate('/borrower/application');
  };

  return (
    <div className="container">
      <Header title="Loan Catalog" user={user} showBack={true} backUrl="/borrower/dashboard" />
      
      <main className="main-content">
        <div className="section-header">
          <h2>Available Loan Products</h2>
        </div>

        <div className="loans-catalog">
          {loanTypes.map(loan => (
            <div key={loan.id} className="loan-card">
              <div className="loan-header">
                <h3>
                  <i className={loan.icon}></i> {loan.name}
                </h3>
                <span className="loan-badge">Available</span>
              </div>
              <div className="loan-details">
                <div className="rate-info">
                  <span className="rate-value">{loan.rate}</span>
                  <span className="rate-period">Annual Interest Rate</span>
                </div>
                <div className="loan-features">
                  {loan.features.map((feature, idx) => (
                    <div key={idx} className="feature">
                      <i className="fas fa-check"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Amount Range:</span>
                    <span className="info-value">{loan.minAmount} - {loan.maxAmount}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tenure:</span>
                    <span className="info-value">{loan.tenure}</span>
                  </div>
                </div>
                <div className="loan-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleApply(loan.id)}
                  >
                    <i className="fas fa-paper-plane"></i> Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BorrowerCatalog;

