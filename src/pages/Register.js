import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerBusiness } from '../services/api';
import './Auth.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---- Client-side validation ----
  function validate() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }

    const atIndex = formData.email.indexOf('@');
    if (atIndex <= 0 || !formData.email.substring(atIndex + 1).includes('.')) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.password.length < 8 || !/\d/.test(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters and contain at least one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await registerBusiness({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('token', response.token);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong. Please try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />
      <div className="auth-bg-orb auth-bg-orb--3" />

      <div className={`auth-card ${success ? 'auth-card--success' : ''}`}>
        {/* Logo / brand */}
        <div className="auth-brand">
          <div className="auth-logo">R</div>
          <h1 className="auth-title">ReputeAI</h1>
          <p className="auth-subtitle">Create your business account</p>
        </div>

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <p>Account created! Redirecting to dashboard…</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="auth-alert auth-alert--error">{serverError}</div>
            )}

            {/* Business Name */}
            <div className={`auth-field ${errors.name ? 'auth-field--error' : ''}`}>
              <label htmlFor="register-name">Business Name</label>
              <input
                id="register-name"
                type="text"
                name="name"
                placeholder="e.g. Sunrise Café"
                value={formData.name}
                onChange={handleChange}
                autoComplete="organization"
              />
              {errors.name && <span className="auth-field-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="you@business.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && (
                <span className="auth-field-error">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Min 8 chars, include a number"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.password && (
                <span className="auth-field-error">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div
              className={`auth-field ${errors.confirmPassword ? 'auth-field--error' : ''}`}
            >
              <label htmlFor="register-confirm">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="auth-field-error">{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isLoading}
              id="register-submit"
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                'Create Account'
              )}
            </button>

            <p className="auth-footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
