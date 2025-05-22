import './App.css';
import { ConfigProvider, App as AntdApp, message } from 'antd';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SplashScreen from './pages/SplashScreen';
import AuthPage from './pages/AuthPage';
import Totp from './pages/Totp';
import Account from './pages/Account';
import VerifyAccount from './pages/VerifyAccount';
import Transfer from './pages/Transfer';
import TransactionHistory from './pages/TransactionHistory';
import Receipt from './pages/Receipt';

function App() {
  message.config({
    top: 100,
    duration: 2,
    maxCount: 3,
  });

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#222',
          borderRadius: 5,
        },
      }}
    >
      <AntdApp>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Navigate to="/splash" replace />} />
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/totp" element={<Totp />} />
              <Route path="/account" element={<Account />} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/receipt" element={<Receipt />} />
              <Route path="/login" element={<AuthPage />} />
            </Routes>
          </div>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
