import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, InputNumber, message, notification } from 'antd';
import { ArrowLeftOutlined, UserOutlined, SearchOutlined, CheckCircleFilled, WarningOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const Transfer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = location.state || {};

  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Estados para el modal TOTP
  const [showTotpModal, setShowTotpModal] = useState(false);
  const [totpToken, setTotpToken] = useState('');
  const [verifyingTotp, setVerifyingTotp] = useState(false);
  const [operationToken, setOperationToken] = useState('');
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    // Si no hay datos del usuario, redirigir al login
    if (!userData) {
      navigate('/');
    }
  }, [userData, navigate]);

  // Búsqueda de usuarios
  const searchUsers = async (value) => {
    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(`https://raulocoin.onrender.com/api/search-users?q=${value}`);
      if (response.data.success) {
        // Filtrar al usuario actual de los resultados
        const filteredUsers = response.data.users.filter(
          user => user.username !== userData.username
        );
        setSearchResults(filteredUsers);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      message.error('Error al buscar usuarios');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Manejar la búsqueda con debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Seleccionar usuario de los resultados
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(`${user.name} (@${user.username})`);
    setSearchResults([]);
  };

  // Limpiar selección de usuario
  const clearSelection = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Validar formulario
  const isFormValid = () => {
    return selectedUser &&
      amount &&
      amount > 0 &&
      amount <= userData.balance;
  };

  // Iniciar proceso de transferencia
  const handleTransfer = () => {
    if (!isFormValid()) {
      if (!selectedUser) {
        message.error('Debes seleccionar un destinatario');
      } else if (!amount || amount <= 0) {
        message.error('Debes ingresar un monto válido');
      } else if (amount > userData.balance) {
        message.error('Saldo insuficiente');
      }
      return;
    }

    setShowTotpModal(true);
    setTotpToken('');
  };

  // Verificar código TOTP
  const handleVerifyTotp = async () => {
    if (totpToken.length !== 6) {
      message.warning({
        content: 'El código debe tener 6 dígitos',
        duration: 3,
        style: {
          marginTop: '20vh',
        }
      });
      return;
    }

    setVerifyingTotp(true);
    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/verify-totp', {
        username: userData.username,
        totpToken
      });

      if (response.data.success) {
        setOperationToken(response.data.operationToken);
        setShowTotpModal(false);
        // Proceder con la transferencia
        executeTransfer(response.data.operationToken);
      } else {
        message.error({
          content: 'Código TOTP incorrecto',
          duration: 3,
          style: {
            marginTop: '20vh',
          }
        });
      }
    } catch (error) {
      console.error('Error al verificar TOTP:', error);
      notification.error({
        message: 'Error de verificación',
        description: 'Hubo un problema al verificar tu código de autenticación. Por favor, inténtalo de nuevo.',
        icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
        placement: 'top',
        duration: 3,
      });
    } finally {
      setVerifyingTotp(false);
    }
  };

  // Ejecutar transferencia
  const executeTransfer = async (opToken) => {
    setTransferring(true);
    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/transfer', {
        fromUsername: userData.username,
        toUsername: selectedUser.username,
        amount: amount,
        description: description.trim() || undefined,
        operationToken: opToken
      });

      if (response.data.success) {
        notification.success({
          message: '¡Transferencia exitosa!',
          description: `Has transferido R$ ${amount.toLocaleString()} a ${selectedUser.name} correctamente.`,
          icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
          placement: 'top',
          duration: 3,
        });
        // Navegar al comprobante
        navigate('/receipt', {
          state: {
            transfer: response.data.transfer,
            userData: {
              ...userData,
              balance: response.data.transfer.from.newBalance
            }
          }
        });
      } else {
        notification.error({
          message: 'Error en la transferencia',
          description: response.data.message || 'No se pudo completar la transferencia. Inténtalo de nuevo.',
          icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
          placement: 'top',
          duration: 3,
        });
      }
    } catch (error) {
      console.error('Error en transferencia:', error);
      if (error.response && error.response.data && error.response.data.message) {
        notification.error({
          message: 'Error en la transferencia',
          description: error.response.data.message,
          icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
          placement: 'top',
          duration: 4,
        });
      } else {
        notification.error({
          message: 'Error en la transferencia',
          description: 'Hubo un problema al procesar tu transferencia. Por favor, inténtalo de nuevo más tarde.',
          icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
          placement: 'top',
          duration: 4,
        });
      }
    } finally {
      setTransferring(false);
    }
  };

  // Volver a la cuenta
  const goBack = () => {
    navigate('/account', { state: userData });
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="transfer-container fade-slide-in">
      <div className="transfer-header">
        <ArrowLeftOutlined className="back-icon" onClick={goBack} />
        <h1 className="transfer-title">Transferir fondos</h1>
      </div>

      <div className="transfer-content">
        {/* Columna izquierda: búsqueda y descripción */}
        <div className="transfer-left">
          <div className="form-section">
            <label className="form-label">Buscar destinatario</label>
            <Input
              placeholder="Nombre o alias"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              suffix={selectedUser && (
                <Button type="text" size="small" onClick={clearSelection}>✕</Button>
              )}
              disabled={transferring}
            />
            {searchResults.length > 0 && !selectedUser && (
              <div className="search-results">
                {searchResults.map((user, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => handleUserSelect(user)}
                  >
                    <UserOutlined className="user-icon" />
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-username">@{user.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <label className="form-label">Descripción (opcional)</label>
            <TextArea
              placeholder="Ej: Pago por almuerzo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={100}
              showCount
              disabled={transferring}
            />
          </div>
        </div>

        {/* Columna derecha: monto + resumen + botón */}
        <div className="transfer-right">
          <div className="form-section">
            <label className="form-label">Monto</label>
            <InputNumber
              placeholder="0.00"
              value={amount}
              onChange={setAmount}
              min={0.01}
              max={userData.balance}
              precision={2}
              style={{ width: '100%' }}
              formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/R\$\s?|(,*)/g, '')}
              disabled={transferring}
            />
            {amount > userData.balance && (
              <span className="error-text">Saldo insuficiente</span>
            )}
          </div>

          <div className="form-section">
            <label className="form-label">Tu saldo actual</label>
            <div className="balance-box">R$ {userData.balance.toLocaleString()}</div>
          </div>

          {selectedUser && amount && (
            <div className="transfer-summary">
              <h3>Resumen</h3>
              <div className="summary-row">
                <span>Para:</span>
                <span>{selectedUser.name} (@{selectedUser.username})</span>
              </div>
              <div className="summary-row">
                <span>Monto:</span>
                <span>R$ {amount.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Nuevo saldo:</span>
                <span>R$ {(userData.balance - amount).toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button
            type="primary"
            size="large"
            block
            onClick={handleTransfer}
            loading={transferring}
            disabled={!isFormValid()}
            className="transfer-button"
          >
            {transferring ? 'Procesando...' : 'Continuar'}
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
        maskClosable={false}
      >
        <div className="totp-modal-content">
          <p className="totp-modal-subtitle">Ingresa tu código para confirmar</p>
          <Input
            type="text"
            placeholder="Código TOTP (6 dígitos)"
            value={totpToken}
            onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            style={{ marginBottom: '16px', fontSize: '18px', textAlign: 'center' }}
          />
          <Button
            type="primary"
            block
            onClick={handleVerifyTotp}
            loading={verifyingTotp}
            disabled={totpToken.length !== 6}
          >
            Confirmar transferencia
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Transfer;