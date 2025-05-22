import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input, Button, message, notification } from 'antd';
import { CheckCircleFilled, WarningOutlined } from '@ant-design/icons';

const VerifyAccount = () => {
    const location = useLocation();
    const [alias, setAlias] = useState(location.state?.alias || '');
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
      
        const data = {
            username: alias,
            totpToken: codigo,
        };
      
        try {
            const verifyResponse = await axios.post('https://raulocoin.onrender.com/api/verify-totp-setup', data);
            const verifyRes = verifyResponse.data;
        
            if (verifyRes.success) {
                const userResponse = await axios.post('https://raulocoin.onrender.com/api/user-details', data);
                const userRes = userResponse.data;
        
                if (userRes.success && userRes.user) {
                  notification.success({
                    message: '¡Verificación exitosa!',
                    description: 'Tu cuenta ha sido verificada correctamente. Accediendo a tu cuenta.',
                    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
                    placement: 'top',
                    duration: 3,
                  });
                  navigate('/account', {
                    state: {
                      name: userRes.user.name,
                      username: userRes.user.username,
                      balance: userRes.user.balance,
                    },
                  });
                } else {
                  notification.error({
                    message: 'Error de acceso',
                    description: 'No se pudieron obtener los datos del usuario.',
                    icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
                    placement: 'top',
                    duration: 3,
                  });
                }
            } else {
              message.error({
                content: 'Código TOTP incorrecto. Inténtalo de nuevo.',
                duration: 3,
                style: {
                  marginTop: '20vh',
                }
              });
            }
        } catch (error) {
            notification.error({
              message: 'Error de verificación',
              description: 'Error al verificar el código TOTP. Por favor, inténtalo de nuevo.',
              icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
              placement: 'top',
              duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };      

    return (
        <div className="login-container">
        <img
            src="/assets/raulCoin.png"
            alt="raulCoin"
            className="logo-img"
        />
        <h1 className="auth-title">Verifica tu cuenta</h1>
        <p className="auth-subtitle">¡Es necesario verificar para continuar!</p>
        <form onSubmit={handleSubmit}>
            <Input
            type="text"
            placeholder="Alias"
            disabled={true}
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            required
            className="auth-input"
            />
            <Input
            type="text"
            placeholder="Código TOTP"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            className="auth-input"
            />
            <Button type="primary" htmlType="submit" className="auth-button" disabled={loading}>
            {loading ? 'Cargando...' : 'Verificar'}
            </Button>
            <p className="auth-p-end">
            <Link className="auth-link" to="/">Volver</Link>
            </p>
        </form>
        </div>
    );
};

export default VerifyAccount;