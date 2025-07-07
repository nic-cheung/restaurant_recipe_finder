import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterCredentials } from '../types/auth';

const Register: React.FC = () => {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: '',
    password: '',
    name: '',
    location: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterCredentials> = {};

    if (!credentials.name) {
      newErrors.name = 'name is required';
    } else if (credentials.name.length < 2) {
      newErrors.name = 'name must be at least 2 characters';
    }

    if (!credentials.email) {
      newErrors.email = 'email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'email is invalid';
    }

    if (!credentials.password) {
      newErrors.password = 'password is required';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(credentials.password)) {
      newErrors.password = 'password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register(credentials);
      navigate('/dashboard', { replace: true });
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
    if (errors[name as keyof RegisterCredentials]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--flambé-cream)' }}>
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
            create your account
          </h2>
          <p className="mt-2 text-center text-sm flambé-body">
            or{' '}
            <Link
              to="/login"
              className="font-medium transition-colors duration-200"
              style={{ color: 'var(--flambé-ember)' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--flambé-rust)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--flambé-ember)'}
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="preference-label">
                full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                placeholder="enter your full name"
                value={credentials.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="mt-1 text-sm" style={{ color: 'var(--flambé-rust)' }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="preference-label">
                email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                placeholder="enter your email address"
                value={credentials.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm" style={{ color: 'var(--flambé-rust)' }}>
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="preference-label">
                password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`input-field ${errors.password ? 'border-red-300' : ''}`}
                placeholder="create a strong password"
                value={credentials.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm" style={{ color: 'var(--flambé-rust)' }}>
                  {errors.password}
                </p>
              )}
              <p className="mt-1 text-xs flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
                password must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="location" className="preference-label">
                location (optional)
              </label>
              <input
                id="location"
                name="location"
                type="text"
                autoComplete="address-level2"
                className="input-field"
                placeholder="e.g., san francisco, ca"
                value={credentials.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" style={{ color: 'var(--flambé-cream)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  creating account...
                </>
              ) : (
                'create account'
              )}
            </button>
          </div>
        </form>

        {/* Development-only test data button */}
        {window.location.hostname === 'localhost' && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                const testCredentials: RegisterCredentials = {
                  email: 'test@test.dev',
                  password: 'Test123!',
                  name: 'Test User',
                  location: 'San Francisco, CA'
                };
                setCredentials(testCredentials);
                setErrors({});
              }}
              className="w-full flex justify-center py-2 px-4 border border-dashed text-sm font-medium rounded-sm transition-all duration-200"
              style={{ 
                borderColor: 'var(--flambé-ember)', 
                color: 'var(--flambé-rust)', 
                backgroundColor: 'var(--flambé-fog)' 
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-fog)';
              }}
            >
              fill test data (dev only)
            </button>
            <p className="mt-1 text-xs text-center flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
              auto-fills form with test credentials for development
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register; 