import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import MailIcon from '@mui/icons-material/Mail';
import '../CSS/signup.css';

const RequestResetLink = () => {
    const API = axios.create({ baseURL: process.env.REACT_APP_BASEURL });
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');

    const onChange = (e) => setEmail(e.target.value);

    const onSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);

        toast.promise(
            API.post('/api/auth/request-reset-password', { email }),
            {
                loading: 'Sending reset link...',
                success: 'Reset link sent to your email!',
                error: 'Error sending reset link. Please try again.',
            }
        ).finally(() => {
            setLoading(false);
        });
    };

    return (
        <>
            <Toaster />
            <div className="outer-container">
                <div className="inner-container">
                    <h3 className="form-heading">Reset Password</h3>
                    <form onSubmit={onSubmit} className="form">
                        <div className="input-container">
                            <MailIcon className="input-icon" />
                            <input
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="Enter your email"
                                type="email"
                                className="input-field"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="submit"
                            disabled={loading}
                        >
                            {'Generate Link'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default RequestResetLink;
