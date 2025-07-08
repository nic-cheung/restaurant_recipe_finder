import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send password reset email');
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--flambé-cream)' }}>
        <div className="rounded-sm p-8 w-full max-w-md text-center" style={{ backgroundColor: 'var(--flambé-fog)', border: '1px solid var(--flambé-stone)' }}>
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--flambé-sage)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flambé-cream)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold flambé-heading" style={{ color: 'var(--flambé-charcoal)' }}>
              check your email
            </h1>
            <p className="mt-2 flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
              if an account with <strong>{email}</strong> exists, we've sent a password reset link to your email
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-sm border-l-4" style={{ backgroundColor: 'var(--flambé-fog)', borderColor: 'var(--flambé-sage)', border: '1px solid var(--flambé-stone)' }}>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flambé-charcoal)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium flambé-body" style={{ color: 'var(--flambé-charcoal)' }}>important security notes</p>
                  <ul className="mt-1 text-xs flambé-body space-y-1" style={{ color: 'var(--flambé-ash)' }}>
                    <li>• the reset link expires in 1 hour</li>
                    <li>• check your spam folder if you don't see the email</li>
                    <li>• don't share the reset link with anyone</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsSubmitted(false)}
                className="flex-1 py-2 px-4 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                send another email
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 btn-primary text-sm"
              >
                back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--flambé-cream)' }}>
      <div className="rounded-sm p-8 w-full max-w-md" style={{ backgroundColor: 'var(--flambé-fog)', border: '1px solid var(--flambé-stone)' }}>
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--flambé-charcoal)' }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flambé-cream)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold flambé-heading" style={{ color: 'var(--flambé-charcoal)' }}>
            forgot password?
          </h1>
          <p className="mt-2 flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            no worries! enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium flambé-body mb-2" style={{ color: 'var(--flambé-charcoal)' }}>
              email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="input-field"
              placeholder="enter your email address"
              required
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 flambé-body">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                sending reset email...
              </span>
            ) : (
              'send reset email'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="flambé-body transition-colors duration-200"
            style={{ color: 'var(--flambé-ember)' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-rust)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-ember)'}
          >
            ← back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 