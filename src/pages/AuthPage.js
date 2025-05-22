import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loginAlias, setLoginAlias] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerAlias, setRegisterAlias] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://raulocoin.onrender.com/api/user-details', {
        username: loginAlias,
        totpToken: loginCode,
      });

      if (res.data.success && res.data.user) {
        message.success('¡Inicio de sesión exitoso!');
        navigate('/account', {
          state: {
            name: res.data.user.name,
            username: res.data.user.username,
            balance: res.data.user.balance,
          },
        });
      } else {
        message.error('Credenciales incorrectas');
      }
    } catch (error) {
      if (
        error.response?.status === 403 &&
        error.response.data.message.includes("verificación TOTP")
      ) {
        navigate('/verify-account', { state: { alias: loginAlias } });
      } else {
        message.error('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://raulocoin.onrender.com/api/register', {
        name: registerName,
        username: registerAlias,
        email: registerEmail,
      });

      if (res.data.success) {
        message.success('¡Registro exitoso!');
        navigate('/totp', { state: res.data.totpSetup });
      } else {
        message.error('Error en el registro');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-slide-in">
      <div className="auth-left">
        <img src="/assets/raulCoin.png" alt="raulcoin logo" style={{ width: 80, marginBottom: 20 }} />
        <h1>RaulCoin</h1>
        <p>Tu billetera moderna, rápida y segura.</p>
      </div>

      <div className="auth-right">
        <div className="auth-form-transition">
          <div className={`form-content ${isRegistering ? 'slide-left' : 'slide-right'}`}>
            {!isRegistering ? (
              <>
                <h2 className="auth-title">Iniciar sesión</h2>
                <form onSubmit={handleLogin}>
                  <Input
                    placeholder="Alias"
                    value={loginAlias}
                    onChange={(e) => setLoginAlias(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <Input
                    placeholder="Código TOTP"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <Button htmlType="submit" className="auth-button" loading={loading} block>
                    Ingresar
                  </Button>
                </form>
                <p className="auth-p-end">
                  ¿No tenés cuenta?{' '}
                  <span className="auth-link" onClick={() => setIsRegistering(true)}>
                    Registrarme
                  </span>
                </p>
              </>
            ) : (
              <>
                <h2 className="auth-title">Crear cuenta</h2>
                <form onSubmit={handleRegister}>
                  <Input
                    placeholder="Nombre completo"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <Input
                    placeholder="Correo electrónico"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <Input
                    placeholder="Alias"
                    value={registerAlias}
                    onChange={(e) => setRegisterAlias(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <Button htmlType="submit" className="auth-button" loading={loading} block>
                    Registrarme
                  </Button>
                </form>
                <p className="auth-p-end">
                  ¿Ya tenés cuenta?{' '}
                  <span className="auth-link" onClick={() => setIsRegistering(false)}>
                    Iniciar sesión
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
