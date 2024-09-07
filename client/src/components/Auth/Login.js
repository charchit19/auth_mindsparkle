import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CSS/signup.css';
import MailIcon from '@mui/icons-material/Mail';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { toast, Toaster } from 'react-hot-toast';

const Login = () => {
    const API = axios.create({ baseURL: process.env.REACT_APP_BASEURL });
    const navigate = useNavigate();
    const [isUserVerified, setIsUserVerified] = useState(true)

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [visible, setVisible] = useState(false);

    const { email, password } = formData;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleVisibility = () => setVisible(!visible);

    const redirect = () => {
        navigate('/profile/reset-link', {
            state: {
                email: email
            }
        })
    }

    const redirectTo = (destination) => {
        const routes = {
            register: '/register',
            profile: '/profile',
        };

        navigate(routes[destination]);
    };

    const verifyMail = async () => {
        const sendMail = async () => {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const res = await API.post('/api/auth/resend-verification-email', { email }, config);
            return res.data.message;
        };

        toast.promise(
            sendMail(),
            {
                loading: <b>Sending mail...</b>,
                success: (data) => <b>{data}</b>,
                error: <b>Error occurred during sending mail</b>,
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginUser = async () => {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const res = await API.post('/api/auth/login', formData, config);
            localStorage.setItem('token', res.data.token);

            return res;
        };

        toast.promise(
            loginUser(),
            {
                loading: <b>Verifying credentials...</b>,
                success: (res) => {
                    setTimeout(() => {
                        if (res.data.isAdmin) {
                            navigate('/admin/users');
                        } else {
                            navigate('/profile');
                        }
                    }, 1000);
                    return <b>Login successful</b>;
                },
                error: (error) => {
                    const errorMessage = error.response?.data?.message || "An error occurred";
                    if (error.response?.data?.message == "Please verify your email first") {
                        setIsUserVerified(false)
                    }
                    return <b>{errorMessage}</b>;
                },
            }
        );
    };




    return (
        <>
            <Toaster />
            <div className='outer-container'>
                <div className='inner-container'>
                    <h3 className='form-heading'>Login</h3>
                    <form onSubmit={handleSubmit} className='form'>
                        <div className='input-container'>
                            <MailIcon className='input-icon' />
                            <input
                                name="email"
                                value={email}
                                onChange={handleChange}
                                placeholder='Enter Email'
                                type='email'
                                className='input-field'
                            />
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
                            />
                            {visible ? (
                                <VisibilityOffIcon className='visible-icon' onClick={handleVisibility} />
                            ) : (
                                <VisibilityIcon className='visible-icon' onClick={handleVisibility} />
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                            <button type="submit" className='submit' style={{ width: "38%" }}>Submit</button>
                            <button type='button' className='submit' style={{ width: "62%" }} onClick={redirect}>
                                Forgot Password ?
                            </button>
                        </div>
                        <div className='link-container'>
                            <span>New User? <span onClick={() => redirectTo("register")} className='link'>Register now</span></span>
                            <br />
                            {isUserVerified === false && <button type='button' onClick={verifyMail} className='submit' style={{ marginTop: "10px" }}>Verify Email</button>}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
