import React, { useState, useEffect } from 'react';
import { List, Spin, Empty, Tabs, Badge } from 'antd';
import { ArrowLeftOutlined, ArrowUpOutlined, ArrowDownOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const { TabPane } = Tabs;

const TransactionHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, totpToken } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!userData || !totpToken) {
      navigate('/account');
      return;
    }

    fetchTransactions();
  }, [userData, totpToken, navigate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/transactions', {
        username: userData.username,
        totpToken
      });

      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      } else {
        console.error('Error fetching transactions:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/account', { state: userData });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const getTransactionIcon = (transaction) => {
    if (transaction.type === 'sent') {
      return <ArrowUpOutlined className="transaction-icon outgoing" />;
    } else if (transaction.type === 'received') {
      return <ArrowDownOutlined className="transaction-icon incoming" />;
    } else {
      return <GiftOutlined className="transaction-icon award" />;
    }
  };

  const getFilteredTransactions = () => {
    if (activeTab === 'all') {
      return transactions;
    } else if (activeTab === 'sent') {
      return transactions.filter(t => t.type === 'sent');
    } else if (activeTab === 'received') {
      return transactions.filter(t => t.type === 'received' || t.type === 'award');
    }
    return transactions;
  };

  const getSentCount = () => {
    return transactions.filter(t => t.type === 'sent').length;
  };

  const getReceivedCount = () => {
    return transactions.filter(t => t.type === 'received' || t.type === 'award').length;
  };

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <ArrowLeftOutlined className="back-icon" onClick={goBack} />
        <h1 className="transaction-title">Historial de movimientos</h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            className="transaction-tabs"
          >
            <TabPane tab={`Todas (${transactions.length})`} key="all" />
            <TabPane
              tab={
                <Badge count={getSentCount()} offset={[8, 0]}>
                  Enviadas
                </Badge>
              }
              key="sent"
            />
            <TabPane
              tab={
                <Badge count={getReceivedCount()} offset={[8, 0]}>
                  Recibidas
                </Badge>
              }
              key="received"
            />
          </Tabs>

          {getFilteredTransactions().length === 0 ? (
            <Empty
              description="No hay transacciones para mostrar"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 50 }}
            />
          ) : (
            <List
              className="transaction-list"
              itemLayout="horizontal"
              dataSource={getFilteredTransactions()}
              renderItem={(transaction) => {
                const isOutgoing = transaction.type === 'sent';
                
                // Mejorar la obtención de nombres
                const counterpartyName = isOutgoing
                  ? (transaction.toName || transaction.to?.name || transaction.toUsername || transaction.to?.username || 'Desconocido')
                  : (transaction.fromName || transaction.from?.name || transaction.fromUsername || transaction.from?.username || 'Desconocido');

                return (
                  <List.Item
                    className="transaction-item"
                    onClick={() => navigate('/receipt', { 
                      state: { 
                        transfer: transaction, 
                        userData 
                      } 
                    })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="transaction-icon-container">
                      {getTransactionIcon(transaction)}
                    </div>

                    <div className="transaction-info">
                      <div className="transaction-header">
                        <span className="transaction-name">
                          {transaction.type === 'award'
                            ? 'Premio recibido'
                            : isOutgoing
                              ? `Para: ${counterpartyName}`
                              : `De: ${counterpartyName}`}
                        </span>
                        <span
                          className={`transaction-amount ${isOutgoing ? 'outgoing' : 'incoming'
                            }`}
                        >
                          {isOutgoing ? '-' : '+'} R$ {Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </div>

                      <div className="transaction-description">
                        {transaction.description || (transaction.type === 'award' ? 'Premio' : 'Transferencia')}
                      </div>

                      <div className="transaction-date">
                        {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;