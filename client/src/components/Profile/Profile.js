import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/signup.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

const Profile = () => {
  const API = axios.create({ baseURL: process.env.REACT_APP_BASEURL });
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phoneNumber: '',
  });

  const redirect = () => {
    navigate('reset-link', {
      state: {
        email: formData.email
      }
    })
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get(`/api/auth/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Body: 'Not Admin',
        },
      });
      setFormData(res.data);
    } catch (error) {
      toast.error('Error fetching profile');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { firstName, lastName, email, country, phoneNumber } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (formData.phoneNumber.length !== 10) {
      toast.error("Mobile number should be of 10 digits.")
      return;
    }

    try {
      const token = localStorage.getItem('token');

      toast.promise(
        API.put('/api/auth/profile', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Body: 'Not Admin'
          },
        }),
        {
          loading: 'Updating profile...',
          success: 'Profile updated successfully!',
          error: 'Error updating profile',
        }
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <>
      <Toaster />
      <div className="outer-container">
        <div className="inner-container">
          <div style={{ display: "flex" }}>
            <h3>
              Update Profile
            </h3>
            <button type='submit' onClick={handleLogout} className='submit' style={{ backgroundColor: '#dc3545', color: 'white', marginLeft: 'auto', alignSelf: 'center' }}>
              Logout
            </button>
          </div>
          <form onSubmit={onSubmit} className="form">
            <div style={{ display: 'flex', flexDirection: "row", gap: "10px" }}>
              <div className='input-container'>
                <PersonIcon className='input-icon' />
                <input
                  name="firstName"
                  value={firstName}
                  onChange={onChange}
                  placeholder='Enter First Name'
                  type='text'
                  className='input-field'
                />
              </div>
              <div className='input-container'>
                <PersonIcon className='input-icon' />
                <input
                  name="lastName"
                  value={lastName}
                  onChange={onChange}
                  placeholder='Enter Last Name'
                  type='text'
                  className='input-field'
                />
              </div>
            </div>
            <div className="input-container">
              <MailIcon className="input-icon" />
              <input
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Enter Email"
                type="email"
                className="input-field"
                required
                disabled
              />
            </div>
            <div className="input-container">
              <LanguageIcon className="input-icon" />
              <select
                name="country"
                value={country}
                onChange={onChange}
                className="input-field"
                required
              >
                <option value="" disabled>
                  Select Country
                </option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
            <div className="input-container">
              <PhoneAndroidIcon className="input-icon" />
              <input
                name="phoneNumber"
                value={phoneNumber}
                onChange={onChange}
                placeholder="Enter Phone Number"
                type="number"
                className="input-field"
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              <button type="submit" className="submit" style={{ width: "50%" }} >
                Update
              </button>
              <button type='button' className='submit' style={{ width: "50%" }} onClick={redirect}>
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
