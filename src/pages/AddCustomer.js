import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCustomer } from '../services/api';
import './AddCustomer.css';

function AddCustomer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    sale_amount: '',
    instant_test: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---- Client-side validation ----
  function validate() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (!/^\d{10}$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = 'WhatsApp number must be exactly 10 digits';
    }

    const amount = parseFloat(formData.sale_amount);
    if (!formData.sale_amount || isNaN(amount) || amount <= 0) {
      newErrors.sale_amount = 'Sale amount must be greater than zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await addCustomer({
        name: formData.name,
        whatsapp_number: formData.whatsapp_number,
        sale_amount: parseFloat(formData.sale_amount),
        instant_test: formData.instant_test,
      });

      setSuccess(true);
      setFormData({ name: '', whatsapp_number: '', sale_amount: '', instant_test: false });

      // Auto-hide success after 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong. Please try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="add-customer-page">
      {/* Background decoration */}
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />

      {/* Top bar */}
      <nav className="top-bar">
        <div className="top-bar-brand">
          <div className="top-bar-logo">R</div>
          <span className="top-bar-name">ReputeAI</span>
        </div>
        <div className="top-bar-actions">
          <button
            className="top-bar-link"
            onClick={() => navigate('/dashboard')}
          >
            ← Dashboard
          </button>
          <button
            className="top-bar-link top-bar-link--logout"
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="add-customer-card">
        <div className="add-customer-header">
          <h1 className="add-customer-title">Add New Customer</h1>
          <p className="add-customer-subtitle">
            Enter customer details. WhatsApp review requests are dispatched automatically.
          </p>
        </div>

        {success && (
          <div className="auth-alert auth-alert--success">
            ✓ Customer added! Review request scheduled.
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="auth-alert auth-alert--error">{serverError}</div>
          )}

          {/* Customer Name */}
          <div className={`auth-field ${errors.name ? 'auth-field--error' : ''}`}>
            <label htmlFor="customer-name">Customer Name</label>
            <input
              id="customer-name"
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="auth-field-error">{errors.name}</span>
            )}
          </div>

          {/* WhatsApp Number */}
          <div
            className={`auth-field ${errors.whatsapp_number ? 'auth-field--error' : ''}`}
          >
            <label htmlFor="customer-whatsapp">WhatsApp Number</label>
            <input
              id="customer-whatsapp"
              type="text"
              name="whatsapp_number"
              placeholder="10 digit number, e.g. 9876543210"
              value={formData.whatsapp_number}
              onChange={handleChange}
              maxLength={10}
            />
            {errors.whatsapp_number && (
              <span className="auth-field-error">{errors.whatsapp_number}</span>
            )}
          </div>

          {/* Sale Amount */}
          <div
            className={`auth-field ${errors.sale_amount ? 'auth-field--error' : ''}`}
          >
            <label htmlFor="customer-amount">Sale Amount (₹)</label>
            <input
              id="customer-amount"
              type="number"
              name="sale_amount"
              placeholder="e.g. 1500"
              value={formData.sale_amount}
              onChange={handleChange}
              min="1"
              step="any"
            />
            {errors.sale_amount && (
              <span className="auth-field-error">{errors.sale_amount}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={isLoading}
            id="add-customer-submit"
          >
            {isLoading ? (
              <span className="auth-spinner" />
            ) : (
              'Add Customer & Schedule Review'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddCustomer;
