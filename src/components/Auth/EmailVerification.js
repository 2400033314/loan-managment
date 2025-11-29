import React, { useState, useEffect } from 'react';
import './EmailVerification.css';

const EmailVerification = ({ email, onVerify, onResend, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Generate verification code when component mounts
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    
    // In production, send this code via email
    // For now, we'll show it (in production, remove this console.log)
    console.log('Verification code for', email, ':', code);
    alert(`Verification code sent to ${email}\nCode: ${code}\n(In production, this would be sent via email)`);

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email]);

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');

    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }

    if (verificationCode !== generatedCode) {
      setError('Invalid verification code');
      return;
    }

    onVerify();
  };

  const handleResend = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationCode('');
    setError('');
    setTimeLeft(300);
    setCanResend(false);
    
    // In production, send email here
    console.log('New verification code for', email, ':', code);
    alert(`New verification code sent to ${email}\nCode: ${code}`);
    
    if (onResend) {
      onResend(code);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="email-verification-modal">
      <div className="verification-content">
        <div className="verification-header">
          <h2><i className="fas fa-envelope"></i> Verify Your Email</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>
        
        <div className="verification-body">
          <p className="verification-info">
            We've sent a verification code to <strong>{email}</strong>
          </p>
          <p className="verification-hint">
            Please check your email and enter the 6-digit code below.
          </p>

          {error && <div className="verification-error">{error}</div>}

          <form onSubmit={handleVerify} className="verification-form">
            <div className="form-group">
              <label htmlFor="verificationCode">Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
                autoFocus
              />
            </div>

            <div className="timer-info">
              <i className="fas fa-clock"></i>
              Code expires in: <strong>{formatTime(timeLeft)}</strong>
            </div>

            <div className="verification-actions">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              {canResend && (
                <button type="button" className="btn btn-secondary" onClick={handleResend}>
                  <i className="fas fa-redo"></i> Resend Code
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-check"></i> Verify Email
              </button>
            </div>
          </form>

          <div className="verification-note">
            <p><i className="fas fa-info-circle"></i> Didn't receive the code?</p>
            <ul>
              <li>Check your spam/junk folder</li>
              <li>Make sure the email address is correct</li>
              <li>Wait a few minutes and try resending</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

