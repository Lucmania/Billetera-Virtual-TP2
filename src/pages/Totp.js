import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';

const Totp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const totpSetup = location.state;

  if (!totpSetup) {
    message.warning('No hay configuración TOTP. Regístrate primero.');
    navigate('/');
    return null;
  }

  return (
    <div className="login-container">
        <img
            src={"/assets/raulCoin.png"}
            alt={"raulCoin"}
            className='logo-img'
        />
        <h1 className='auth-title'>Autenticación</h1>
        <p className='auth-subtitle'>Escanea este código QR con tu aplicación de autenticación</p>

        <img className='qr-img' src={totpSetup.qrCodeUrl} alt="TOTP QR Code" style={{ maxWidth: 300 }} />

        <p
            className="auth-code"
            onClick={() => navigator.clipboard.writeText(totpSetup.manualSetupCode)}
            title="Haz clic para copiar"
        >
            {totpSetup.manualSetupCode}
        </p>


        <Button type="primary" className='auth-button' onClick={() => navigate('/')}>
            Ingresar
        </Button>
    </div>
  );
};

export default Totp;
