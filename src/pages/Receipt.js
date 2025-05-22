import React from 'react';
import { Button, Divider, Input, Modal, message, notification } from 'antd';
import {
  CheckCircleFilled,
  ArrowDownOutlined,
  ArrowUpOutlined,
  GiftOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Receipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transfer, userData } = location.state || {};
  
  // Estados para el modal TOTP
  const [showTotpModal, setShowTotpModal] = React.useState(false);
  const [totpToken, setTotpToken] = React.useState('');
  const [verifyingTotp, setVerifyingTotp] = React.useState(false);

  if (!transfer) {
    navigate('/account');
    return null;
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const handleBackToHome = () => {
    navigate('/account', { state: userData });
  };

  const handleBackToHistory = () => {
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
        body: JSON.stringify({ username: userData.username, totpToken }),
      });

      const data = await response.json();

      if (data.success) {
        setShowTotpModal(false);
        notification.success({
          message: 'Código verificado',
          description: 'Volviendo al historial...',
          icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
        });

        navigate('/transactions', {
          state: {
            userData,
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

  // Determinar tipo y dirección
  const isAward = transfer.type === 'award';
  const isSent = transfer.type === 'sent';
  const isReceived = transfer.type === 'received';

  const getTitle = () => {
    if (isAward) return '¡Premio recibido!';
    if (isSent) return '¡Transferencia enviada!';
    if (isReceived) return '¡Transferencia recibida!';
    return 'Transacción';
  };

  const getIcon = () => {
    if (isAward) return <GiftOutlined className="success-icon" />;
    if (isSent) return <ArrowUpOutlined className="success-icon" />;
    if (isReceived) return <ArrowDownOutlined className="success-icon" />;
    return <CheckCircleFilled className="success-icon" />;
  };

  const getAmountPrefix = () => {
    if (isSent) return '-';
    if (isReceived || isAward) return '+';
    return '';
  };

  const getParticipantInfo = () => {
    if (isAward) return null;

    // Datos mejorados para mostrar nombres correctos
    const fromName = transfer?.fromName || transfer?.from?.name || "Desconocido";
    const fromUsername = transfer?.fromUsername || transfer?.from?.username || "desconocido";
    const toName = transfer?.toName || transfer?.to?.name || "Desconocido";
    const toUsername = transfer?.toUsername || transfer?.to?.username || "desconocido";

    return (
      <>
        {isSent && (
          <>
            <div className="receipt-detail-row">
              <span className="label">De:</span>
              <span>{fromName} (@{fromUsername})</span>
            </div>
            <div className="receipt-detail-row">
              <span className="label">Para:</span>
              <span>{toName} (@{toUsername})</span>
            </div>
          </>
        )}

        {isReceived && (
          <div className="receipt-detail-row">
            <span className="label">De:</span>
            <span>{fromName} (@{fromUsername})</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="receipt-wrapper">
      <div className="receipt-card">
        <div className="receipt-status">
          {getIcon()}
          <h2 className="receipt-title">{getTitle()}</h2>
        </div>

        <div className="receipt-amount">
          <span className="receipt-label">Monto</span>
          <h1 className="receipt-value">
            {getAmountPrefix()} R$ {Math.abs(transfer.amount).toLocaleString()}
          </h1>
        </div>

        <Divider />

        <div className="receipt-details">
          {getParticipantInfo()}

          {transfer.description && (
            <div className="receipt-detail-row">
              <span className="label">Descripción:</span>
              <span>{transfer.description}</span>
            </div>
          )}

          <div className="receipt-detail-row">
            <span className="label">Fecha y hora:</span>
            <span>{formatDate(transfer.createdAt || transfer.timestamp)}</span>
          </div>
        </div>

        <div className="receipt-actions">
          <Button 
            onClick={handleBackToHome} 
            className="primary-button-fixed"
            size="large"
            style={{ marginBottom: '12px' }}
          >
            <HomeOutlined /> Volver al inicio
          </Button>
          
          <Button 
            onClick={handleBackToHistory} 
            className="secondary-button-fixed"
            size="large"
          >
            <HistoryOutlined /> Ver historial
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
        <p>Ingresa tu código TOTP para acceder al historial:</p>
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

export default Receipt;