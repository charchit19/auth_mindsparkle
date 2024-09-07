import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h1>Welcome to MERN Auth</h1>
            <Link
                to="/register"
                style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}
            >
                Register{" "}
            </Link>
            |
            <Link
                to="/login"
                style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}
            >
                {" "}Login
            </Link>
        </div>
    );
};

export default Home;
