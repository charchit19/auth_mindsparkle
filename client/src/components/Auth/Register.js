import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CSS/signup.css';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ReCAPTCHA from 'react-google-recaptcha';
import toast, { Toaster } from 'react-hot-toast';

const API = axios.create({ baseURL: process.env.REACT_APP_BASEURL });

const Register = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [captchaToken, setCaptchaToken] = useState(null);
  const [visible, setVisible] = useState(false);
  const [captchaDone, setCaptchaDone] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState(''); // New state for phone errors
  const [loading, setLoading] = useState(false);

  const captchaKey = process.env.REACT_APP_CAPTCHA_KEY;

  const { firstName, lastName, email, country, phoneNumber, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the field is phoneNumber, restrict input to digits only and max 10 characters
    if (name === 'phoneNumber') {
      // Remove any non-digit characters
      const sanitizedValue = value.replace(/\D/g, '');

      // Limit to 10 digits
      if (sanitizedValue.length <= 10) {
        setFormData({ ...formData, [name]: sanitizedValue });

        // Validate phone number
        if (sanitizedValue.length === 10) {
          setPhoneError('');
        } else {
          setPhoneError('Phone number must be exactly 10 digits');
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });

      // If the field is password, validate it
      if (name === 'password') {
        validatePassword(value);
      }
    }
  };

  const handleVisibility = () => setVisible(!visible);

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

  const onChange = (token) => {
    setCaptchaToken(token);
    setCaptchaDone(true);
  };

  const resetCaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setCaptchaToken(null);
      setCaptchaDone(false);
    }
  };

  const redirect = () => {
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number before submission
    if (phoneNumber.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA');
      return;
    }

    setLoading(true);

    try {
      await toast.promise(
        API.post('/api/auth/register', { ...formData, captchaToken }, { headers: { 'Content-Type': 'application/json' } }),
        {
          loading: 'Registering...',
          success: () => {
            setTimeout(() => redirect(), 2000);
            return <b>Successfully Registered</b>;
          },
          error: (error) => {
            if (error.response && error.response.status === 400) {
              return <b>{error.response.data.message || 'Error occurred during registration.'}</b>;
            }
            return <b>Error occurred during registration.</b>;
          },
        }
      );
    } catch (error) {
      console.error('Unexpected Error:', error);
    } finally {
      setLoading(false);
      resetCaptcha();
    }
  };

  return (
    <>
      <Toaster />
      <div className='outer-container'>
        <div className='inner-container'>
          <h3 className='form-heading'>Register</h3>
          <form onSubmit={handleSubmit} className='form'>
            <div style={{ display: 'flex', flexDirection: "row", gap: "10px" }}>
              <div className='input-container'>
                <PersonIcon className='input-icon' />
                <input
                  name="firstName"
                  value={firstName}
                  onChange={handleChange}
                  placeholder='Enter First Name'
                  type='text'
                  className='input-field'
                  required
                />
              </div>
              <div className='input-container'>
                <PersonIcon className='input-icon' />
                <input
                  name="lastName"
                  value={lastName}
                  onChange={handleChange}
                  placeholder='Enter Last Name'
                  type='text'
                  className='input-field'
                  required
                />
              </div>
            </div>
            <div className='input-container'>
              <MailIcon className='input-icon' />
              <input
                name="email"
                value={email}
                onChange={handleChange}
                placeholder='Enter Email'
                type='email'
                className='input-field'
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: "row", gap: "10px" }}>
              <div className='input-container'>
                <LanguageIcon className='input-icon' />
                <select
                  name="country"
                  value={country}
                  onChange={handleChange}
                  className='input-field'
                  required
                >
                  <option value="" disabled>Select Country</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              <div className='input-container'>
                <PhoneAndroidIcon className='input-icon' />
                <input
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={handleChange}
                  placeholder='Enter Phone Number'
                  type='tel'
                  className='input-field'
                  required
                  pattern="\d{10}"
                  title="Please enter exactly 10 digits"
                />
              </div>
            </div>
            <div className='input-container'>
              <LockIcon className='input-icon' />
              <input
                name="password"
                value={password}
                onChange={handleChange}
                placeholder='Enter Password'
                type={visible ? 'text' : 'password'}
                className='input-field'
                required
              />
              {visible ? (
                <VisibilityOffIcon className='visible-icon' onClick={handleVisibility} />
              ) : (
                <VisibilityIcon className='visible-icon' onClick={handleVisibility} />
              )}
            </div>
            {passwordError && <p className='password-error'>{passwordError}</p>}
            <div className='input-container'>
              <LockIcon className='input-icon' />
              <input
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder='Confirm Password'
                type='password'
                className='input-field'
                required
              />
            </div>
            <div className='recaptcha-container'>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={captchaKey}
                onChange={onChange}
              />
            </div>

            <button
              type="submit"
              className='submit'
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Submit'}
            </button>
            <div className='link-container'>
              <span>Existing User? <span onClick={redirect} className='link'>Log in now</span></span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
