import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStats, getCustomers, cancelCustomer } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState({
    total_customers_this_month: 0,
    pending: 0,
    sent: 0,
    cancelled: 0,
    total_sale_amount_this_month: 0,
    average_sale_amount: 0,
  });
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [cancellingId, setCancellingId] = useState(null);

  // Load business details from localStorage
  useEffect(() => {
    const storedBusiness = localStorage.getItem('business');
    if (storedBusiness) {
      try {
        setBusiness(JSON.parse(storedBusiness));
      } catch (e) {
        console.error('Failed to parse business info from storage');
      }
    }
  }, []);

  // Fetch dashboard stats & customer list
  const fetchData = useCallback(async () => {
    try {
      setError('');
      const [statsData, customersData] = await Promise.all([
        getStats(),
        getCustomers(),
      ]);

      setStats(statsData);
      setCustomers(customersData.customers || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();

    // Refresh dashboard stats every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle request cancellation
  async function handleCancel(customerId) {
    if (!window.confirm('Are you sure you want to cancel this review request?')) return;

    setCancellingId(customerId);
    setActionMessage({ type: '', text: '' });

    try {
      const res = await cancelCustomer(customerId);
      setActionMessage({ type: 'success', text: res.message || 'Request cancelled' });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel request';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setCancellingId(null);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <div className="dashboard-page">
      {/* Background Orbs */}
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />

      {/* Header Bar */}
      <header className="dash-header">
        <div className="dash-brand">
          <div className="dash-logo">R</div>
          <div>
            <h1 className="dash-title">ReputeAI</h1>
            <span className="dash-subtitle">Review Request Automation</span>
          </div>
        </div>

        <div className="dash-user">
          <span className="dash-business-name">
            {business?.name ? `🏢 ${business.name}` : 'My Business'}
          </span>
          <Link to="/add-customer" className="dash-add-btn">
            + Add Customer
          </Link>
          <button onClick={handleLogout} className="dash-logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dash-content">
        {/* Banner Alert */}
        {actionMessage.text && (
          <div className={`dash-alert dash-alert--${actionMessage.type}`}>
            {actionMessage.text}
          </div>
        )}

        {error && <div className="dash-alert dash-alert--error">{error}</div>}

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon--purple">👥</div>
            <div className="stat-info">
              <span className="stat-label">Total Customers (This Month)</span>
              <span className="stat-value">{stats.total_customers_this_month}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon--orange">⏳</div>
            <div className="stat-info">
              <span className="stat-label">Pending Requests</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon--green">✅</div>
            <div className="stat-info">
              <span className="stat-label">Sent Requests</span>
              <span className="stat-value">{stats.sent}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon--red">🚫</div>
            <div className="stat-info">
              <span className="stat-label">Cancelled Requests</span>
              <span className="stat-value">{stats.cancelled}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon--blue">💰</div>
            <div className="stat-info">
              <span className="stat-label">Total Sales (This Month)</span>
              <span className="stat-value">
                ₹{Number(stats.total_sale_amount_this_month).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon--cyan">📊</div>
            <div className="stat-info">
              <span className="stat-label">Average Sale</span>
              <span className="stat-value">
                ₹{Number(stats.average_sale_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </section>

        {/* Customers Table Section */}
        <section className="table-section">
          <div className="table-header">
            <div>
              <h2 className="table-title">Customer Review Requests</h2>
              <p className="table-desc">
                WhatsApp review requests are automatically dispatched 2 hours after addition.
              </p>
            </div>

            <button onClick={fetchData} className="table-refresh-btn" title="Refresh data">
              🔄 Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="dash-loading">
              <div className="auth-spinner" />
              <p>Loading customers & statistics...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="table-empty">
              <p>No customers added yet.</p>
              <Link to="/add-customer" className="dash-add-btn" style={{ marginTop: 12 }}>
                Add First Customer
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>WhatsApp Number</th>
                    <th>Sale Amount</th>
                    <th>Status</th>
                    <th>Scheduled For</th>
                    <th>Sent / Cancelled At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust) => (
                    <tr key={cust.id}>
                      <td className="font-semibold">{cust.name}</td>
                      <td>{cust.whatsapp_number}</td>
                      <td>₹{Number(cust.sale_amount).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`status-badge status-badge--${cust.status}`}>
                          {cust.status === 'pending' && '⏳ Pending'}
                          {cust.status === 'sent' && '✅ Sent'}
                          {cust.status === 'cancelled' && '🚫 Cancelled'}
                        </span>
                      </td>
                      <td>{new Date(cust.scheduled_time).toLocaleString()}</td>
                      <td>
                        {cust.sent_at
                          ? new Date(cust.sent_at).toLocaleString()
                          : cust.cancelled_at
                          ? new Date(cust.cancelled_at).toLocaleString()
                          : '—'}
                      </td>
                      <td>
                        {cust.status === 'pending' ? (
                          <button
                            className="btn-cancel"
                            disabled={cancellingId === cust.id}
                            onClick={() => handleCancel(cust.id)}
                          >
                            {cancellingId === cust.id ? 'Cancelling...' : 'Cancel Request'}
                          </button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
