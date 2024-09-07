import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MailIcon from '@mui/icons-material/Mail';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import '../CSS/signup.css';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const EditUser = () => {
  const API = axios.create({ baseURL: process.env.REACT_APP_BASEURL });
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize formData with user data from location state or default values
  const [formData, setFormData] = useState(location.state?.user || {
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phoneNumber: '',
  });

  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    // If user data is not passed via location state, fetch it
    if (!location.state?.user) {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await API.get(`/api/admin/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData(res.data);
        } catch (error) {
          toast.error('Error fetching user data, invalid request');
        }
      };

      fetchUser();
    }
  }, [id, location.state?.user]);

  const { firstName, lastName, email, country, phoneNumber } = formData;
  const onChange = (e) => {
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
    }
  };

  const validatePhoneNumber = (number) => {
    // Phone number must be exactly 10 digits
    const regex = /^\d{10}$/;
    return regex.test(number);
  };

  const updateUser = async () => {
    const token = localStorage.getItem('token');
    return await API.put(`/api/admin/users/${id}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Phone number must be exactly 10 digits.');
      return;
    } else {
      setPhoneError('');
    }

    toast.promise(
      updateUser(),
      {
        loading: <b>Updating user...</b>,
        success: () => {
          setTimeout(() => {
            navigate('/admin/users');
          }, 1000);
          return <b>User updated successfully</b>;
        },
        error: (error) => {
          console.error(error);
          return <b>Error updating user data</b>;
        },
      }
    );
  };

  const redirect = () => {
    navigate(`/admin/users/${location.state?.user._id}/edit-password`);
  };

  return (
    <>
      <Toaster />
      <div className="outer-container">
        <div className="inner-container">
          <h3 className="form-heading">Update User</h3>
          <form onSubmit={onSubmit} className="form">
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
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
                onChange={onChange}
                placeholder='Enter Phone Number'
                type='tel'
                className='input-field'
                required
                pattern="\d{10}"
                title="Please enter exactly 10 digits"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              <button type="submit" className="submit" style={{ width: '50%' }}>
                Update
              </button>
              <button type='button' className='submit' style={{ width: '50%' }} onClick={redirect}>
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditUser;
