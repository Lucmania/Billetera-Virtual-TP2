import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate('/login');
        }, 2000);
        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className="splash-screen">
            <div className="splash-content">
                <h1 className="splash-title">RAULCOIN</h1>
                <img src="/assets/SagradaBiblia.png" alt="RaulCoin Logo" className="splash-img" />
            </div>
        </div>
    );
};

export default SplashScreen;
