import React, { useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import '../CSS/signup.css';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const API = axios.create({ baseURL: process.env.REACT_APP_BASEURL });
  const { token } = useParams(); // Get the reset token from URL
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [visibility, setVisibility] = useState({
    newPasswordVisible: false,
    confirmPasswordVisible: false,
  });

  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength) {
      setPasswordError('Password must be at least 8 characters long');
    } else if (!hasNumber.test(password)) {
      setPasswordError('Password must contain at least one numeric character');
    } else if (!hasSpecialChar.test(password)) {
      setPasswordError('Password must contain at least one special character');
    } else {
      setPasswordError('');
    }
  };

  const { newPassword, confirmPassword } = passwordData;
  const { newPasswordVisible, confirmPasswordVisible } = visibility;

  const onChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });

    if (name === 'newPassword') {
      validatePassword(value);
    }
  };

  const handleVisibility = (field) => {
    setVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    const resetPasswordPromise = API.post('/api/auth/reset-password', { token, password: newPassword });

    toast.promise(
      resetPasswordPromise,
      {
        loading: 'Resetting password...',
        success: 'Password reset successfully',
        error: 'Error resetting password',
      }
    );

    try {
      await resetPasswordPromise;
      navigate('/login');
    } catch (error) {
      console.error(error); // Log the error for debugging
    }
  };

  return (
    <>
      <Toaster />
      <div className="outer-container">
        <div className="inner-container">
          <h3 className="form-heading">Reset Password</h3>
          <form onSubmit={onSubmit} className="form">
            {/* New Password */}
            <div className="input-container">
              <LockIcon className="input-icon" />
              <input
                name="newPassword"
                value={newPassword}
                onChange={onChange}
                placeholder="Enter New Password"
                type={newPasswordVisible ? 'text' : 'password'}
                className="input-field"
                required
              />
              {newPasswordVisible ? (
                <VisibilityOffIcon className="visible-icon" onClick={() => handleVisibility('newPasswordVisible')} />
              ) : (
                <VisibilityIcon className="visible-icon" onClick={() => handleVisibility('newPasswordVisible')} />
              )}
            </div>

            {passwordError && <p className='password-error'>{passwordError}</p>}

            {/* Confirm New Password */}
            <div className="input-container">
              <LockIcon className="input-icon" />
              <input
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Confirm New Password"
                type={confirmPasswordVisible ? 'text' : 'password'}
                className="input-field"
                required
              />
              {confirmPasswordVisible ? (
                <VisibilityOffIcon className="visible-icon" onClick={() => handleVisibility('confirmPasswordVisible')} />
              ) : (
                <VisibilityIcon className="visible-icon" onClick={() => handleVisibility('confirmPasswordVisible')} />
              )}
            </div>

            <button type="submit" className="submit">
              Reset
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
