import React from 'react';
import { Button, Modal, Input, message, notification } from 'antd';
import { LogoutOutlined, HistoryOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Account = () => {
  const location = useLocation();
  const { name, username, balance } = location.state || {};
  const navigate = useNavigate();
  const [totpToken, setTotpToken] = React.useState('');
  const [showTotpModal, setShowTotpModal] = React.useState(false);
  const [verifyingTotp, setVerifyingTotp] = React.useState(false);

  React.useEffect(() => {
    if (!username) navigate('/');
  }, [username, navigate]);

  const handleLogout = () => {
    message.success('¡Sesión cerrada exitosamente!');
    navigate('/');
  };

  const handleTransfer = () => {
    navigate('/transfer', { state: { userData: { name, username, balance } } });
  };

  const handleViewTransactions = () => {
    setShowTotpModal(true);
    setTotpToken('');
  };

  const handleVerifyTotp = async () => {
    if (totpToken.length !== 6) {
      return message.warning('El código debe tener 6 dígitos');
    }

    setVerifyingTotp(true);
    try {
      const response = await fetch('https://raulocoin.onrender.com/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, totpToken }),
      });

      const data = await response.json();

      if (data.success) {
        setShowTotpModal(false);
        notification.success({
          message: 'Código verificado',
          description: 'Ingresando al historial...',
          icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
        });

        navigate('/transactions', {
          state: {
            userData: { name, username, balance },
            totpToken,
          },
        });
      } else {
        message.error('Código incorrecto');
      }
    } catch {
      message.error('Error al verificar el código');
    } finally {
      setVerifyingTotp(false);
    }
  };

  return (
    <div className="account-container fade-slide-in">
      {/* Panel izquierdo */}
      <div className="account-left">
        <div className="header-row">
          <h2>Bienvenido, {name}</h2>
          <LogoutOutlined className="logout-icon" onClick={handleLogout} />
        </div>

        <div className="raulcoin-card-modern">
          <div className="card-chip" />
          <div className="card-balance">
            <span>Saldo disponible</span>
            <h2>R$ {balance?.toLocaleString()}</h2>
          </div>
          <div className="card-user">
            <span>Usuario</span>
            <p>@{username}</p>
          </div>
          <div className="card-logo">RaulCoin</div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="account-right">
        <h3>Acciones rápidas</h3>
        <div className="action-grid">
          <Button 
            type="primary" 
            size="large" 
            block 
            onClick={handleTransfer}
            className="primary-button-fixed"
          >
            Transferir fondos
          </Button>
          <Button 
            size="large" 
            block 
            icon={<HistoryOutlined />} 
            onClick={handleViewTransactions}
            className="primary-button-fixed"
          >
            Ver historial
          </Button>
        </div>
      </div>

      {/* Modal TOTP */}
      <Modal
        title="Verificación TOTP"
        open={showTotpModal}
        onCancel={() => setShowTotpModal(false)}
        footer={null}
        centered
      >
        <p>Ingresa tu código TOTP para continuar:</p>
        <Input
          maxLength={6}
          value={totpToken}
          onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
          placeholder="123456"
          style={{ textAlign: 'center', fontSize: 18, marginBottom: 20 }}
        />
        <Button
          type="primary"
          block
          onClick={handleVerifyTotp}
          loading={verifyingTotp}
          disabled={totpToken.length !== 6}
          className="primary-button-fixed"
        >
          Verificar
        </Button>
      </Modal>
    </div>
  );
};

export default Account;