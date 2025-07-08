import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError('No reset token provided');
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const result = await apiService.validateResetToken(token);
        if (result.valid) {
          setTokenValid(true);
          setUserEmail(result.email || '');
        } else {
          setTokenError(result.error || 'Invalid reset token');
          if (result.expired) {
            setTokenError('Reset link has expired. Please request a new one.');
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenError('Failed to validate reset token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.newPassword) {
      newErrors['newPassword'] = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors['newPassword'] = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors['newPassword'] = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors['confirmPassword'] = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors['confirmPassword'] = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await apiService.resetPassword(token!, formData.newPassword);
      toast.success('Password reset successful! You can now log in with your new password.');
      navigate('/login', { 
        state: { message: 'Password has been reset successfully. You can now log in with your new password.' }
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to reset password');
      if (error.message?.includes('expired')) {
        setTokenError('Reset link has expired. Please request a new one.');
        setTokenValid(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--flambé-cream)' }}>
        <div className="rounded-sm p-8 w-full max-w-md text-center" style={{ backgroundColor: 'var(--flambé-fog)', border: '1px solid var(--flambé-stone)' }}>
          <div className="animate-spin mx-auto w-12 h-12 border-4 rounded-full mb-4" style={{ borderColor: 'var(--flambé-charcoal)', borderTopColor: 'transparent' }}></div>
          <h1 className="text-xl font-bold flambé-heading" style={{ color: 'var(--flambé-charcoal)' }}>
            validating reset link...
          </h1>
          <p className="mt-2 flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            please wait while we verify your password reset link
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--flambé-cream)' }}>
        <div className="rounded-sm p-8 w-full max-w-md text-center" style={{ backgroundColor: 'var(--flambé-fog)', border: '1px solid var(--flambé-stone)' }}>
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--flambé-ash)' }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flambé-cream)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold flambé-heading" style={{ color: 'var(--flambé-charcoal)' }}>
            invalid reset link
          </h1>
          <p className="mt-2 flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            {tokenError}
          </p>
          
          <div className="mt-6 space-y-3">
            <Link
              to="/forgot-password"
              className="btn-primary w-full block text-center"
            >
              request new reset link
            </Link>
            <Link
              to="/login"
              className="btn-secondary w-full block text-center"
            >
              back to login
            </Link>
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
            reset password
          </h1>
          <p className="mt-2 flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            enter your new password for <strong>{userEmail}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium flambé-body mb-2" style={{ color: 'var(--flambé-charcoal)' }}>
              new password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="enter your new password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {passwordVisible ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors['newPassword'] && (
              <p className="mt-2 text-sm text-red-600 flambé-body">
                {errors['newPassword']}
              </p>
            )}
            <p className="mt-2 text-xs flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
              minimum 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium flambé-body mb-2" style={{ color: 'var(--flambé-charcoal)' }}>
              confirm new password
            </label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="confirm your new password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {confirmPasswordVisible ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors['confirmPassword'] && (
              <p className="mt-2 text-sm text-red-600 flambé-body">
                {errors['confirmPassword']}
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
                resetting password...
              </span>
            ) : (
              'reset password'
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

export default ResetPassword; 