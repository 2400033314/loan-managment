import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext';
import Header from '../Common/Header';
import './BorrowerApplication.css';

const BorrowerApplication = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createApplication, updateApplication, getApplication } = useApplications();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    panNumber: '',
    loanAmount: '',
    loanTenure: '',
    purpose: '',
    employmentType: '',
    monthlyIncome: '',
    existingEMI: '0',
    companyName: '',
    workExperience: '',
    currentAddress: '',
    city: '',
    state: '',
    pincode: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  const [loanType, setLoanType] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedLoanType = localStorage.getItem('selectedLoanType');
    if (savedLoanType) {
      setLoanType(savedLoanType);
      localStorage.removeItem('selectedLoanType');
    }

    if (isEditMode) {
      loadApplication();
    }
  }, [id, isEditMode]);

  const loadApplication = async () => {
    setLoading(true);
    const result = await getApplication(id);
    if (result.success) {
      const app = result.data;
      setLoanType(app.loanType || 'personal');
      setFormData({
        firstName: app.firstName || '',
        lastName: app.lastName || '',
        email: app.email || '',
        phone: app.phone || '',
        dateOfBirth: app.dateOfBirth || '',
        panNumber: app.panNumber || '',
        loanAmount: app.loanAmount || '',
        loanTenure: app.loanTenure || '',
        purpose: app.purpose || '',
        employmentType: app.employmentType || '',
        monthlyIncome: app.monthlyIncome || '',
        existingEMI: app.existingEMI || '0',
        companyName: app.companyName || '',
        workExperience: app.workExperience || '',
        currentAddress: app.currentAddress || '',
        city: app.city || '',
        state: app.state || '',
        pincode: app.pincode || '',
        termsAccepted: app.termsAccepted || false,
        privacyAccepted: app.privacyAccepted || false
      });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'panNumber',
      'loanAmount', 'loanTenure', 'purpose', 'employmentType', 'monthlyIncome',
      'currentAddress', 'city', 'state', 'pincode'
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!formData.termsAccepted || !formData.privacyAccepted) {
      setError('Please accept the terms and conditions and privacy policy');
      return false;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.panNumber)) {
      setError('Please enter a valid PAN number');
      return false;
    }

    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const applicationData = {
      ...formData,
      loanType
    };

    let result;
    if (isEditMode) {
      result = await updateApplication(id, applicationData);
    } else {
      result = await createApplication(applicationData);
    }

    setLoading(false);

    if (result.success) {
      alert(isEditMode 
        ? 'Application updated successfully!' 
        : 'Application submitted successfully! You will receive a confirmation email shortly.'
      );
      navigate('/borrower/dashboard');
    } else {
      setError(result.error);
    }
  };

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

  const loanInfo = loanTypes[loanType] || loanTypes['personal'];

  if (loading && isEditMode) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <Header 
        title="Loan Application" 
        user={user}
        showBack={true}
        backUrl="/borrower/catalog"
      />

      <main className="main-content">
        <div className="application-container">
          <div className="application-header">
            <h2>{isEditMode ? 'Update' : 'New'} {loanInfo.name} Application</h2>
            <div className="loan-info-card">
              <h4>{loanInfo.name} Details</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Interest Rate:</span>
                  <span className="info-value">{loanInfo.rate}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Amount Range:</span>
                  <span className="info-value">{loanInfo.minAmount} - {loanInfo.maxAmount}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tenure:</span>
                  <span className="info-value">{loanInfo.tenure}</span>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="application-form">
            {/* Personal Information */}
            <div className="form-section">
              <h3><i className="fas fa-user"></i> Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="panNumber">PAN Number *</label>
                  <input
                    type="text"
                    id="panNumber"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    required
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                    placeholder="ABCDE1234F"
                  />
                </div>
              </div>
            </div>

            {/* Loan Details */}
            <div className="form-section">
              <h3><i className="fas fa-calculator"></i> Loan Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="loanAmount">Loan Amount (₹) *</label>
                  <input
                    type="number"
                    id="loanAmount"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="loanTenure">Loan Tenure (months) *</label>
                  <input
                    type="number"
                    id="loanTenure"
                    name="loanTenure"
                    value={formData.loanTenure}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="purpose">Loan Purpose *</label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Purpose</option>
                    <option value="personal">Personal Use</option>
                    <option value="home">Home Purchase</option>
                    <option value="car">Car Purchase</option>
                    <option value="education">Education</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="employmentType">Employment Type *</label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Employment</option>
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="business">Business Owner</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="form-section">
              <h3><i className="fas fa-rupee-sign"></i> Financial Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="monthlyIncome">Monthly Income (₹) *</label>
                  <input
                    type="number"
                    id="monthlyIncome"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="existingEMI">Existing EMI (₹)</label>
                  <input
                    type="number"
                    id="existingEMI"
                    name="existingEMI"
                    value={formData.existingEMI}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="workExperience">Work Experience (years)</label>
                  <input
                    type="number"
                    id="workExperience"
                    name="workExperience"
                    value={formData.workExperience}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <h3><i className="fas fa-map-marker-alt"></i> Address Information</h3>
              <div className="form-group">
                <label htmlFor="currentAddress">Current Address *</label>
                <textarea
                  id="currentAddress"
                  name="currentAddress"
                  rows="3"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{6}"
                    placeholder="123456"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="form-section">
              <div className="terms-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="checkmark"></span>
                  I agree to the Terms and Conditions *
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="privacyAccepted"
                    name="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="checkmark"></span>
                  I agree to the Privacy Policy *
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/borrower/dashboard')}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="fas fa-paper-plane"></i> {isEditMode ? 'Update' : 'Submit'} Application
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BorrowerApplication;

