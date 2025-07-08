import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types/auth';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(credentials);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is already handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img 
              src="/logo.svg" 
              alt="flambé" 
              className="h-40 sm:h-48 w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl flambé-heading">
            sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm flambé-body">
            or{' '}
            <Link
              to="/register"
              className="font-medium transition-colors duration-200"
              style={{ color: 'var(--flambé-ember)' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--flambé-charcoal)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--flambé-ember)'}
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`input-field rounded-t-sm rounded-b-none ${
                  errors.email ? 'border-red-300' : ''
                }`}
                placeholder="email address"
                value={credentials.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm" style={{ color: 'var(--flambé-rust)' }}>{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`input-field rounded-b-sm rounded-t-none ${
                  errors.password ? 'border-red-300' : ''
                }`}
                placeholder="password"
                value={credentials.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm" style={{ color: 'var(--flambé-rust)' }}>{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex justify-center py-3 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  signing in...
                </>
              ) : (
                'sign in'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--flambé-ember)' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--flambé-rust)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--flambé-ember)'}
            >
              forgot your password?
            </Link>
          </div>
        </form>

        {/* Development-only test data button */}
        {window.location.hostname === 'localhost' && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                const testCredentials: LoginCredentials = {
                  email: 'test.user@example.com',
                  password: 'TestPass123!'
                };
                setCredentials(testCredentials);
                setErrors({});
              }}
              className="w-full flex justify-center py-2 px-4 border border-dashed text-sm font-medium rounded-sm transition-all duration-200"
              style={{ 
                borderColor: 'var(--flambé-sage)', 
                color: 'var(--flambé-forest)', 
                backgroundColor: 'var(--flambé-fog)' 
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-fog)';
              }}
                          >
                fill test login (dev only)
              </button>
            <p className="mt-1 text-xs text-gray-500 text-center">
              auto-fills with test login credentials for development
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login; 